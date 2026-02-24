# Lab 03: Knowledge Mining

> **Exam domain:** D6 — Implement knowledge mining and document intelligence solutions (15-20%)
> **Service file:** `backend/app/services/search_service.py` (extends Lab 02)
> **Estimated time:** 60-90 minutes
> **Estimated Azure cost:** $0 — reuses the Azure AI Search resource from Lab 02 (no new resources needed). Optional AI enrichment exercises may incur small costs (< $0.50) if you attach an Azure AI Services resource to a skillset.

**Difficulty:** Intermediate | **Layers:** 4 | **Prerequisites:** Lab 02 (RAG Engine)

> **How to approach this lab**
>
> This lab is primarily conceptual — it teaches Azure AI Search features that
> the exam tests heavily (indexers, skillsets, query syntax). Focus on
> understanding the concept tables and answering the self-check questions.
> The optional hands-on exercises in the portal are valuable but not required.

<!-- section:overview -->
## Overview

Knowledge mining is the process of extracting structured information from unstructured data at scale using Azure AI Search. While Lab 02 focused on getting documents in and searching them, this lab covers the broader Azure AI Search feature set that the AI-102 exam tests heavily:

- Programmatic index management
- Indexers and data sources for automated ingestion
- AI enrichment skillsets that extract entities, key phrases, and more during indexing
- Advanced query syntax including filters, facets, and scoring profiles

This lab is more conceptual than Lab 02. The exam tests your understanding of these features and when to use them, not just your ability to write SDK code.

<!-- section:prerequisites -->
## Prerequisites

- **Lab 02 (RAG Engine) completed** — you need a working `search_service.py` with `search_documents()` and `upload_document()`
- **Same Azure AI Search resource** from Lab 02

<!-- section:setup -->
## Azure Setup

No new Azure resources needed. You will use the same Azure AI Search resource from Lab 02.

For Layer 3 (AI Enrichment), if you want to follow along with a hands-on exercise in the portal, you will also need:
- An **Azure Blob Storage** account with a container holding sample documents (PDFs, images, or Office files)
- An **Azure AI Services** multi-service resource (for built-in cognitive skills)

These are optional. The concepts can be learned from the lab content alone.

---

<!-- section:layer:1 -->
## Layer 1: Index Management

- Review `SearchIndexClient` vs `SearchClient` concepts
- Understand field types, analyzers, and scoring profiles
- (Optional) Create a second index programmatically

### What You Will Learn

- How to create and update search indexes programmatically using `SearchIndexClient`
- Field types, analyzers, and scoring profiles
- When to use the portal vs. code for index management

### Concepts

In Lab 02 you created your index manually in the Azure portal. In production and on the exam, you need to understand programmatic index management using `SearchIndexClient`.

**SearchClient vs. SearchIndexClient:**

| Class | Purpose | Operations |
|-------|---------|-----------|
| `SearchClient` | Document operations within an index | search, upload, delete, merge documents |
| `SearchIndexClient` | Index management (schema-level) | create, update, delete, list indexes |

<checkpoint id="l1-review-clients"></checkpoint>

**Creating an index programmatically:**

```python
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
)

index_client = SearchIndexClient(
    endpoint=settings.AZURE_SEARCH_ENDPOINT,
    credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
)

fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True),
    SearchableField(name="content", type=SearchFieldDataType.String),
    SimpleField(name="source", type=SearchFieldDataType.String, filterable=True),
    SearchableField(name="title", type=SearchFieldDataType.String, filterable=True),
    SimpleField(name="category", type=SearchFieldDataType.String,
                filterable=True, facetable=True),
]

index = SearchIndex(name="ai102-index", fields=fields)
index_client.create_or_update_index(index)
```

**Key field model classes:**

| Class | Use Case |
|-------|----------|
| `SimpleField` | Non-searchable fields (IDs, flags, dates). Can be filterable, sortable, facetable. |
| `SearchableField` | Full-text searchable fields. Automatically sets `searchable=True`. |
| `ComplexField` | Nested objects (e.g., address with street, city, zip). |

**Analyzers** control how text is processed during indexing and querying:

| Analyzer | When to Use |
|----------|-------------|
| `en.lucene` | English text (stemming, stop words) |
| `en.microsoft` | English text with Microsoft NLP (better for some scenarios) |
| `keyword` | Exact match only (no tokenization) |
| `standard.lucene` | Language-agnostic tokenization |
| Custom analyzer | When you need specific tokenizers/filters |

**Scoring profiles** let you boost certain fields or documents based on criteria:

```python
from azure.search.documents.indexes.models import ScoringProfile, TextWeights

scoring = ScoringProfile(
    name="boost-title",
    text_weights=TextWeights(weights={"title": 3.0, "content": 1.0}),
)
index = SearchIndex(
    name="ai102-index",
    fields=fields,
    scoring_profiles=[scoring],
    default_scoring_profile="boost-title",
)
```

<checkpoint id="l1-understand-fields"></checkpoint>

### Implementation

Review the code examples above and understand:

1. The difference between `SearchClient` and `SearchIndexClient`
2. When to use `SimpleField` vs. `SearchableField`
3. How analyzers affect search behavior
4. How scoring profiles influence result ranking

If you want hands-on practice, try creating a second index programmatically:

<details>
<summary>Hint: Create an index from code</summary>

You can add a utility function to `search_service.py` or run this as a standalone script:

```python
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchableField,
    SearchFieldDataType,
    SimpleField,
)
from app.config import settings

def create_index(index_name):
    client = SearchIndexClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SimpleField(name="source", type=SearchFieldDataType.String,
                    filterable=True, retrievable=True),
        SearchableField(name="title", type=SearchFieldDataType.String,
                        filterable=True),
        SimpleField(name="category", type=SearchFieldDataType.String,
                    filterable=True, facetable=True),
    ]
    index = SearchIndex(name=index_name, fields=fields)
    client.create_or_update_index(index)
```

</details>

<checkpoint id="l1-optional-index"></checkpoint>

### Test It

- If you created a second index, verify it appears in the Azure portal under your Search resource > Indexes
- Try listing all indexes programmatically: `index_client.list_index_names()`

<details>
<summary>Full Solution</summary>

No required code changes to `search_service.py`. This layer builds understanding of index management concepts that the exam tests. If you created the utility function from the hint, keep it for reference but it is not called by any router.

</details>

### Exam Tips

- **`create_or_update_index()`** is the safe method — it creates if new, updates if existing. The exam may ask about idempotent index operations.
- **You cannot change a field's type after creation.** To change a field type, you must delete and recreate the index (losing all documents). The exam tests this constraint.
- **Analyzer assignment is also immutable** once the index has documents. You must clear the index or recreate it to change analyzers.
- **Scoring profiles do NOT change which documents match** — they only change the ranking order of matched results.
- **`SearchIndexClient` requires an admin key.** Query keys can only be used with `SearchClient` for read-only operations.

---

<!-- section:layer:2 -->
## Layer 2: Data Sources and Indexers

- Review indexer pipeline concepts (data source → indexer → skillset → index)
- Understand change detection policies
- (Optional) Set up an indexer via Import data wizard
- Answer self-check questions

### What You Will Learn

- How indexers automate document ingestion from data sources
- Supported data source types
- Indexer scheduling and change detection
- The indexer execution pipeline

### Concepts

In Lab 02, you uploaded documents manually using `client.upload_documents()`. In production, you use **indexers** to automatically pull data from external data sources into your search index.

**The indexer pipeline:**

<img src="/labs/diagrams/indexer-pipeline.svg" alt="Indexer pipeline: Data Source → Indexer → Skillset (optional) → Search Index → Knowledge Store (optional)" />

**Supported data sources:**

| Data Source | Connector | Common Use Case |
|-------------|-----------|-----------------|
| Azure Blob Storage | Built-in | PDFs, images, Office files |
| Azure SQL Database | Built-in | Structured data from SQL tables |
| Azure Cosmos DB | Built-in | JSON documents |
| Azure Table Storage | Built-in | Key-value structured data |
| Azure Data Lake Storage Gen2 | Built-in | Large-scale file storage |
| SharePoint Online | Built-in (preview) | Enterprise documents |

<checkpoint id="l2-review-pipeline"></checkpoint>

**Creating a data source and indexer in the portal:**

1. Go to your Search resource > **Data sources** > **Add data source**
2. Select the type (e.g., Azure Blob Storage)
3. Provide the connection string and container name
4. Go to **Indexers** > **Add indexer**
5. Select the data source and target index
6. Configure field mappings (which source fields map to which index fields)
7. Set a schedule (once, hourly, daily, etc.)

**Indexer scheduling:**

```json
{
  "schedule": {
    "interval": "PT2H",     // Run every 2 hours (ISO 8601 duration)
    "startTime": "2024-01-01T00:00:00Z"
  }
}
```

**Change detection** determines which documents need re-indexing:

| Policy | How It Works | Supported By |
|--------|-------------|-------------|
| **High Water Mark** | Tracks a timestamp or version column; only re-indexes rows where the value increased | SQL, Cosmos DB |
| **SQL Integrated** | Uses SQL change tracking | Azure SQL only |
| **ETag-based** | Tracks blob ETags; re-indexes changed blobs | Blob Storage |
| **Soft Delete** | Marks documents as deleted instead of removing them; indexer removes from index | All sources (via policy) |

**Field mappings** connect source fields to index fields when names don't match:

```json
{
  "fieldMappings": [
    { "sourceFieldName": "blob_name", "targetFieldName": "title" },
    { "sourceFieldName": "metadata_storage_path", "targetFieldName": "id",
      "mappingFunction": { "name": "base64Encode" } }
  ]
}
```

<checkpoint id="l2-change-detection"></checkpoint>

### Implementation

This layer is primarily portal-based and conceptual. If you have an Azure Blob Storage account with sample documents, try setting up an indexer in the portal:

1. Upload a few `.txt` or `.pdf` files to a blob container
2. In your Search resource, use **Import data** wizard:
   - Data source: Azure Blob Storage
   - Point to your container
   - Target index: your `ai102-index` (or create a new one)
   - Skip the "Add cognitive skills" step for now (that is Layer 3)
   - Create the indexer
3. Run the indexer and verify documents appear in the index

<checkpoint id="l2-optional-wizard"></checkpoint>

<details>
<summary>Hint: What if I don't have Blob Storage?</summary>

You can still learn the concepts without creating a blob storage account. The exam tests your understanding of:

- Which data sources are supported
- How to configure field mappings
- How change detection works
- How to set indexer schedules

Focus on the concept tables above. The portal walkthrough is optional enrichment.

</details>

### Test It

If you created an indexer:
- Check the indexer execution status in the portal (Search resource > Indexers)
- Verify documents were added to the target index
- Search for content from the imported documents

If you did not create an indexer, answer these self-check questions:

1. You have a SQL database that updates rows with a `lastModified` timestamp. Which change detection policy should you use?
2. Your blob container has 10,000 documents and you need them indexed every 6 hours. How do you configure this?
3. A source field is named `file_path` but your index field is named `source`. How do you connect them?

<details>
<summary>Answers</summary>

1. **High Water Mark** policy, using `lastModified` as the high water mark column.
2. Create a data source pointing to the container, create an indexer with `schedule.interval` set to `PT6H`, and run it. Change detection via ETags handles incremental updates.
3. Use a **field mapping**: `{ "sourceFieldName": "file_path", "targetFieldName": "source" }`.

</details>

<checkpoint id="l2-questions"></checkpoint>

### Exam Tips

- **Indexers are the standard way to populate indexes** in production. Manual upload via `upload_documents()` is for small-scale or programmatic scenarios.
- **The "Import data" wizard** in the portal creates a data source, indexer, and optionally a skillset all at once. Know that these are three separate resources even though the wizard bundles them.
- **Field mappings support mapping functions:** `base64Encode`, `base64Decode`, `extractTokenAtPosition`, `jsonArrayToStringCollection`, `urlEncode`, `urlDecode`. The exam may ask which function to use for generating a valid document key from a URL or path.
- **Indexer limits vary by tier:** Free tier allows max 3 indexers, once-per-day schedule only. Standard tier allows more frequent schedules.
- **Reset an indexer** to force a full re-crawl (ignoring change detection). This is useful after schema changes.

---

<!-- section:layer:3 -->
## Layer 3: AI Enrichment with Skillsets

- Review built-in cognitive skills and their inputs/outputs
- Understand skillset context and chaining
- Review custom skills (WebApiSkill) schema
- Answer self-check questions

### What You Will Learn

- What skillsets are and how they fit in the indexer pipeline
- Built-in cognitive skills provided by Azure AI Services
- Custom skills via Azure Functions
- Knowledge store projections

### Concepts

A **skillset** is a collection of AI processing steps (called **skills**) that are executed during indexing. The indexer sends each document through the skillset before writing it to the index. This lets you extract structured information from unstructured content.

**The enrichment pipeline:**

<img src="/labs/diagrams/enrichment-pipeline.svg" alt="Enrichment pipeline: Raw Document → Cracking → OCR → Merge → Entity Recognition → Key Phrases → Search Index + Knowledge Store" />

**Built-in cognitive skills:**

| Skill | Input | Output | Use Case |
|-------|-------|--------|----------|
| **OCR** | Image | Text | Extract text from scanned documents |
| **Image Analysis** | Image | Tags, captions | Describe image content |
| **Entity Recognition** | Text | Entities | Extract people, places, orgs, dates |
| **Key Phrase Extraction** | Text | Key phrases | Identify main topics |
| **Language Detection** | Text | Language code | Determine document language |
| **Sentiment Analysis** | Text | Sentiment score | Determine positive/negative tone |
| **Text Translation** | Text | Translated text | Translate to target language |
| **PII Detection** | Text | PII entities | Find personal information |
| **Text Split** | Text | Chunks | Split large documents into pages |
| **Merge** | Text + text | Merged text | Combine OCR output with document text |

<checkpoint id="l3-review-skills"></checkpoint>

**Skillset definition (JSON structure):**

```json
{
  "name": "my-skillset",
  "description": "Extract entities and key phrases",
  "skills": [
    {
      "@odata.type": "#Microsoft.Skills.Text.V3.EntityRecognitionSkill",
      "name": "entity-skill",
      "context": "/document",
      "inputs": [
        { "name": "text", "source": "/document/content" }
      ],
      "outputs": [
        { "name": "persons", "targetName": "people" },
        { "name": "organizations", "targetName": "orgs" }
      ]
    },
    {
      "@odata.type": "#Microsoft.Skills.Text.KeyPhraseExtractionSkill",
      "name": "keyphrase-skill",
      "context": "/document",
      "inputs": [
        { "name": "text", "source": "/document/content" }
      ],
      "outputs": [
        { "name": "keyPhrases", "targetName": "keyphrases" }
      ]
    }
  ],
  "cognitiveServices": {
    "@odata.type": "#Microsoft.Azure.Search.CognitiveServicesByKey",
    "key": "your-cognitive-services-key"
  }
}
```

**Key concepts:**

- **Context** (`/document`, `/document/pages/*`): Determines the scope at which the skill runs. `/document` means once per document; `/document/pages/*` means once per page/chunk.
- **Inputs and outputs:** Each skill declares what data it needs and what it produces. Outputs from one skill can be inputs to another (pipeline chaining).
- **Output field mappings:** Map enriched fields to index fields (separate from the regular field mappings on the indexer).

<checkpoint id="l3-context-chaining"></checkpoint>

**Custom skills** let you call your own code (typically an Azure Function) as part of the enrichment pipeline:

```json
{
  "@odata.type": "#Microsoft.Skills.Custom.WebApiSkill",
  "name": "my-custom-skill",
  "uri": "https://my-function.azurewebsites.net/api/enrich",
  "context": "/document",
  "inputs": [
    { "name": "text", "source": "/document/content" }
  ],
  "outputs": [
    { "name": "customField", "targetName": "enrichedData" }
  ]
}
```

The custom skill must accept and return a specific JSON schema (the exam may show you an Azure Function and ask you to identify what is wrong with the schema).

**Knowledge store** is an optional output from skillsets that projects enriched data into Azure Storage for downstream analytics:

| Projection Type | Storage | Use Case |
|-----------------|---------|----------|
| Table projections | Azure Table Storage | Structured entities for Power BI |
| Object projections | Azure Blob Storage | JSON documents |
| File projections | Azure Blob Storage | Normalized images extracted from documents |

<checkpoint id="l3-custom-skills"></checkpoint>

### Implementation

This layer is conceptual. Review the skillset concepts above and make sure you understand:

1. How skills chain together via inputs/outputs
2. The difference between built-in skills and custom skills
3. What the `context` property controls
4. What knowledge store projections are for

If you want hands-on practice, try the **Import data** wizard with the "Add cognitive skills" step enabled:

1. In your Search resource, click **Import data**
2. Connect to a data source with PDFs or images
3. On the "Add cognitive skills" page, attach an Azure AI Services resource
4. Enable skills: OCR, Entity Recognition, Key Phrase Extraction
5. Complete the wizard and run the indexer
6. Search the index — you should see extracted entities and key phrases as fields

<details>
<summary>Hint: What the exam expects</summary>

The exam will show you skillset JSON definitions and ask you to:
- Identify which skill type to use for a scenario
- Fix incorrect input/output mappings
- Choose the correct context for a skill
- Explain what a knowledge store projection does

Practice reading the JSON structures above. The conceptual understanding matters more than writing the code from memory.

</details>

### Test It

Answer these self-check questions:

1. You have scanned PDF invoices (images inside PDFs). Which skills do you need to extract text?
2. A skillset extracts key phrases at `/document` context. You want per-page key phrases instead. What do you change?
3. You need to call a custom ML model during indexing. What skill type do you use?
4. You want to export extracted entities to Power BI for analysis. What do you configure?

<details>
<summary>Answers</summary>

1. **OCR skill** to extract text from images, then **Merge skill** to combine OCR text with any native text in the PDF. This is a common exam pattern.
2. Change `context` to `/document/pages/*` and update the input source to `/document/pages/*/content`. The skill then runs once per page.
3. **WebApiSkill** (custom skill) pointing to your Azure Function or web endpoint.
4. **Knowledge store** with **table projections** — this stores structured entities in Azure Table Storage, which Power BI can connect to directly.

</details>

<checkpoint id="l3-questions"></checkpoint>

### Exam Tips

- **OCR + Merge is a classic exam combo.** For scanned documents, you always need both. OCR extracts text from images; Merge combines it with any existing text.
- **Skills cost money.** Each skill invocation against Azure AI Services is billed. The exam may ask about cost optimization (e.g., only process documents that need it).
- **Custom skills must conform to the Web API skill schema.** The request body must have `values` array with `recordId`, `data`. The response must match the same structure. The exam may show incorrect schemas.
- **Knowledge store is for analytics, not search.** It projects data to storage for tools like Power BI. It does not affect the search index.
- **Incremental enrichment** caches skill outputs so unchanged documents are not re-processed. This saves cost and time. Enabled via `cache` property on the indexer.

---

<!-- section:layer:4 -->
## Layer 4: Advanced Query Syntax

- Add `filter_expr` and `facets` parameters to `search_documents()`
- Review simple vs full Lucene query syntax
- Review OData filter expressions
- Answer self-check questions

### What You Will Learn

- Lucene query syntax for complex queries
- OData filter expressions
- Faceted navigation
- How to enhance `search_documents()` to support filters and facets

### Concepts

Azure AI Search supports two query syntaxes:

| Syntax | Parameter | Features |
|--------|-----------|----------|
| **Simple** (default) | `query_type="simple"` | Basic keywords, `+` (must include), `-` (exclude), `\|` (OR), `"..."` (phrase), `*` (prefix) |
| **Full Lucene** | `query_type="full"` | All simple features plus regex, fuzzy (`~`), proximity (`"word1 word2"~5`), boosting (`^`), field-scoped (`title:azure`) |

**Simple syntax examples:**

| Query | Matches |
|-------|---------|
| `azure openai` | Documents containing "azure" OR "openai" |
| `+azure +openai` | Documents containing "azure" AND "openai" |
| `"azure openai"` | Documents containing the exact phrase "azure openai" |
| `azure -openai` | Documents containing "azure" but NOT "openai" |
| `az*` | Documents with words starting with "az" |

**Full Lucene syntax examples:**

| Query | Matches |
|-------|---------|
| `title:azure` | "azure" specifically in the title field |
| `azure~1` | Fuzzy match — "azure", "azurr", "azue" (edit distance 1) |
| `"machine learning"~3` | "machine" and "learning" within 3 words of each other |
| `azure^4 cloud` | "azure" boosted 4x relative to "cloud" |
| `/[a-z]{3}102/` | Regex: 3 lowercase letters followed by "102" |

<checkpoint id="l4-lucene"></checkpoint>

**OData filter expressions** restrict which documents are considered:

```python
results = client.search(
    search_text="azure",
    filter="category eq 'tutorial' and source ne 'draft.txt'",
)
```

Common OData operators:

| Operator | Example | Meaning |
|----------|---------|---------|
| `eq` | `category eq 'news'` | Equals |
| `ne` | `status ne 'draft'` | Not equals |
| `gt`, `ge`, `lt`, `le` | `score gt 0.8` | Comparison |
| `and`, `or`, `not` | `category eq 'A' and status eq 'active'` | Logical |
| `search.in()` | `search.in(category, 'A,B,C', ',')` | Value in list |
| `geo.distance()` | `geo.distance(location, geography'POINT(-73.9 40.7)') lt 10` | Geographic |

**Facets** return aggregated counts for field values, enabling faceted navigation (like filters on an e-commerce site):

```python
results = client.search(
    search_text="azure",
    facets=["category", "source"],
)
# Access facets:
for facet in results.get_facets().get("category", []):
    print(f"{facet['value']}: {facet['count']}")
    # e.g., "tutorial: 15", "reference: 8", "blog: 3"
```

<checkpoint id="l4-odata"></checkpoint>

### Implementation

Enhance `search_documents()` to support optional filters and facets. This is a small modification to the existing function.

<details>
<summary>Hint: Updated function signature</summary>

```python
def search_documents(query, filter_expr=None, facets=None):
```

Your implementation code goes inside the `### YOUR CODE STARTS HERE ###` / `### YOUR CODE ENDS HERE ###` markers. Pass the new parameters to `client.search()`:

```python
results = client.search(
    search_text=query,
    filter=filter_expr,
    facets=facets,
    top=10,
    include_total_count=True,
    highlight_fields="content",
)
```

Note: Adding optional parameters with defaults does not break existing callers (the routers). The RAG path in `generative.py` calls `search_documents(last_user_msg)` which will continue to work because `filter_expr` and `facets` default to `None`.

</details>

<checkpoint id="l4-add-filter-facets"></checkpoint>

### Test It

Test filters via the Swagger UI (`http://localhost:8000/docs`):

1. Upload several documents with different filenames
2. Search with a filter: In Swagger, the router currently does not expose filter parameters, so test by temporarily modifying the router or calling the service directly in a Python shell:

```python
# In a Python shell (from the backend directory):
from app.services.search_service import search_documents
results = search_documents("azure", filter_expr="source eq 'notes.txt'")
print(results)
```

Self-check questions for advanced queries:

1. You want to find documents where "machine" and "learning" appear within 5 words of each other. What query do you write?
2. You want only documents in the "tutorial" category. Where do you specify this?
3. You want to show users how many documents exist per category. What feature do you use?

<details>
<summary>Answers</summary>

1. `"machine learning"~5` with `query_type="full"` (proximity search in full Lucene syntax).
2. In the `filter` parameter: `filter="category eq 'tutorial'"`. Filters are applied before scoring.
3. **Facets.** Add `facets=["category"]` to the search call and read the facet results.

</details>

<checkpoint id="l4-questions"></checkpoint>

<details>
<summary>Full Solution</summary>

```python
def search_documents(query, filter_expr=None, facets=None):

    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a SearchClient
    from azure.search.documents import SearchClient
    from azure.core.credentials import AzureKeyCredential
    client = SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=settings.AZURE_SEARCH_INDEX,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )

    # Step 2: Call client.search() with filter, facets, top=10, highlight_fields="content"
    results = client.search(
        search_text=query,
        filter=filter_expr,
        facets=facets,
        top=10,
        include_total_count=True,
        highlight_fields="content",
    )

    # Step 3: Loop over results, build list of dicts with content, score, source, highlights
    items = []
    for result in results:
        item = {
            "content": result.get("content", ""),
            "score": result.get("@search.score", 0.0),
        }
        if result.get("source"):
            item["source"] = result["source"]
        highlights = result.get("@search.highlights", {})
        if highlights and "content" in highlights:
            item["highlights"] = highlights["content"]
        metadata = {}
        for key in ("title", "category", "source"):
            if result.get(key):
                metadata[key] = result[key]
        if metadata:
            item["metadata"] = metadata
        items.append(item)

    # Step 4: Return the list
    return items

    ### YOUR CODE ENDS HERE ###
```

This is the same function from Lab 02 Layer 3, with two additional optional parameters (`filter_expr`, `facets`) passed through to `client.search()`. Note the function signature has no type annotations (matching the service file pattern), and the `### YOUR CODE ###` markers are included.

</details>

### Exam Tips

- **Know both query syntaxes.** The exam presents query scenarios and asks which syntax to use. Fuzzy, proximity, and field-scoped queries require full Lucene.
- **Filters are applied BEFORE scoring.** This means filtered-out documents do not affect BM25 scores. The exam may ask about the order of operations.
- **Facets require the field to be `facetable`.** If you try to facet on a non-facetable field, you get an error. The exam may present an index schema and ask why facets are not working.
- **`search.in()` is more efficient than chaining `or` clauses** for large value lists. The exam may ask about query performance.
- **`$count=true`** in the REST API (or `include_total_count=True` in the SDK) returns the total number of matching documents. Useful for pagination and UI display.
- **Scoring profiles vs. filters:** Filters remove documents from results. Scoring profiles change the ranking order but don't remove anything. The exam tests this distinction.

---

## Checkpoint

At this point you should understand:

- How to create and update indexes programmatically with `SearchIndexClient`
- The role of indexers, data sources, and field mappings in automated ingestion
- How AI enrichment skillsets process documents during indexing
- Built-in cognitive skills and when to use each one
- Custom skills via Web API and the required request/response schema
- Knowledge store projections for downstream analytics
- Simple and full Lucene query syntax
- OData filter expressions and faceted navigation
- Scoring profiles and how they affect result ranking

**Key exam preparation:** This lab covers some of the most frequently tested AI-102 topics. Focus on:

1. The indexer pipeline: data source -> indexer -> skillset -> index (+ knowledge store)
2. Choosing the right built-in skill for a scenario
3. OData filter syntax
4. The difference between simple and full Lucene query syntax

<details><summary>Complete search_service.py (after Lab 03 — with filter/facet support from Layer 4)</summary>

Lab 03 is primarily conceptual. The service file below shows `search_documents()` enhanced with optional `filter_expr` and `facets` parameters from Layer 4. The file follows the project pattern: no type annotations and `### YOUR CODE ###` markers with code filled in. Demo mode is handled centrally in `main.py` — service files have zero demo-related code.

```python
# Azure AI Search service — implement following docs/labs/02-rag.md and docs/labs/03-knowledge-mining.md
# Quickstart: https://learn.microsoft.com/en-us/azure/search/search-get-started-text

from app.config import settings


# === LAYER 1: Document Upload (Lab 02, Layer 2) ===

### YOUR CODE STARTS HERE ###

# (No shared setup needed — each function creates its own client inline)

### YOUR CODE ENDS HERE ###


def upload_document(filename, content):

    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a SearchClient
    from azure.search.documents import SearchClient
    from azure.core.credentials import AzureKeyCredential
    client = SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=settings.AZURE_SEARCH_INDEX,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )

    # Step 2: Create a document dict with id, content, source, title fields
    doc = {
        "id": filename.replace(" ", "_").replace(".", "_"),
        "content": content,
        "source": filename,
        "title": filename,
    }

    # Step 3: Call client.upload_documents(documents=[doc])
    client.upload_documents(documents=[doc])

    ### YOUR CODE ENDS HERE ###


# === LAYER 2: Search Query (Lab 02, Layer 3) ===
# Enhanced with filter/facet support in Lab 03, Layer 4


def search_documents(query, filter_expr=None, facets=None):

    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a SearchClient
    from azure.search.documents import SearchClient
    from azure.core.credentials import AzureKeyCredential
    client = SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=settings.AZURE_SEARCH_INDEX,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )

    # Step 2: Call client.search() with filter, facets, top=10, highlight_fields="content"
    results = client.search(
        search_text=query,
        filter=filter_expr,
        facets=facets,
        top=10,
        include_total_count=True,
        highlight_fields="content",
    )

    # Step 3: Loop over results, build list of dicts with content, score, source, highlights
    items = []
    for result in results:
        item = {
            "content": result.get("content", ""),
            "score": result.get("@search.score", 0.0),
        }
        if result.get("source"):
            item["source"] = result["source"]
        highlights = result.get("@search.highlights", {})
        if highlights and "content" in highlights:
            item["highlights"] = highlights["content"]
        metadata = {}
        for key in ("title", "category", "source"):
            if result.get(key):
                metadata[key] = result[key]
        if metadata:
            item["metadata"] = metadata
        items.append(item)

    # Step 4: Return the list
    return items

    ### YOUR CODE ENDS HERE ###
```

</details>

<!-- section:layer:5 -->
## Layer 5: Knowledge Store Projections

- Deep-dive into knowledge store projection types
- Understand the Shaper skill for reshaping enrichment output
- Review projection groups and cross-referencing with `generatedKeyName`
- Answer self-check questions

### What You Will Learn

- The three projection types (table, object, file) and when to use each
- How to define a `knowledgeStore` property in a skillset definition
- How the Shaper skill reshapes enrichment tree output for projections
- How projection groups share a common generated key for cross-referencing

> **Exam objective:** Plan and manage an Azure AI solution > Implement knowledge mining solutions > Define projections for a knowledge store

### Concepts

In Layer 3 you learned that a knowledge store is an optional output from a skillset that projects enriched data into Azure Storage. This layer goes deeper into projection types, the JSON schema, and the Shaper skill that connects them.

**Three projection types:**

| Projection Type | Target Storage | Format | Best For |
|-----------------|---------------|--------|----------|
| **Table projections** | Azure Table Storage | Rows and columns | Power BI dashboards, structured analytics, cross-referencing entities |
| **Object projections** | Azure Blob Storage | JSON files | Custom downstream processing, data science pipelines, archiving enriched documents |
| **File projections** | Azure Blob Storage | Binary files | Normalized images extracted during document cracking (e.g., images pulled from PDFs) |

Each projection type serves a different analytics need. You can use all three in the same skillset definition — they are not mutually exclusive.

<checkpoint id="l5-projection-types"></checkpoint>

**Knowledge store definition in a skillset:**

The `knowledgeStore` property is defined at the top level of a skillset, alongside the `skills` array. Here is a complete example showing all three projection types:

```json
{
  "name": "my-skillset",
  "skills": [ "... (skills omitted for brevity)" ],
  "knowledgeStore": {
    "storageConnectionString": "DefaultEndpointsProtocol=https;AccountName=mystorageacct;...",
    "projections": [
      {
        "tables": [
          {
            "tableName": "EntitiesTable",
            "generatedKeyName": "EntityKey",
            "source": "/document/shapedEntities"
          },
          {
            "tableName": "KeyPhrasesTable",
            "generatedKeyName": "PhraseKey",
            "source": "/document/shapedPhrases"
          }
        ],
        "objects": [
          {
            "storageContainer": "enriched-docs",
            "generatedKeyName": "ObjectKey",
            "source": "/document/shapedOutput"
          }
        ],
        "files": [
          {
            "storageContainer": "normalized-images",
            "generatedKeyName": "FileKey",
            "source": "/document/normalized_images/*"
          }
        ]
      }
    ]
  }
}
```

**Key properties:**

- `storageConnectionString` — connection string to the Azure Storage account that receives the projections.
- `projections` — an array of **projection groups**. Each group is an object with optional `tables`, `objects`, and `files` arrays.
- `source` — a path in the enrichment tree pointing to the data to project. This is typically the output of a Shaper skill.

**The Shaper skill (`#Microsoft.Skills.Util.ShaperSkill`):**

The enrichment tree produced by skills is a nested structure. Projections often need a different shape — for example, a flat row for a table projection. The Shaper skill reshapes enrichment tree nodes into the structure that projections expect.

```json
{
  "@odata.type": "#Microsoft.Skills.Util.ShaperSkill",
  "name": "shape-entities",
  "context": "/document",
  "inputs": [
    { "name": "docId", "source": "/document/id" },
    { "name": "docTitle", "source": "/document/title" },
    {
      "name": "entities",
      "sourceContext": "/document/content/persons/*",
      "inputs": [
        { "name": "personName", "source": "/document/content/persons/*" }
      ]
    }
  ],
  "outputs": [
    { "name": "output", "targetName": "shapedEntities" }
  ]
}
```

> **Note:** Paths shown (e.g., `/document/content/persons/*`) are illustrative. Adjust paths based on your specific skill configuration and context settings. The actual enrichment tree paths depend on which skills precede the Shaper and what `context` and `targetName` values they use.

Key Shaper skill concepts:

- **`inputs`** — defines the shape of the output object. Each input becomes a property in the output.
- **`sourceContext`** — used for nested inputs when you need to iterate over a collection (e.g., all persons extracted from a document). The nested `inputs` are evaluated relative to the `sourceContext` path.
- **`outputs`** — the reshaped data is written to the enrichment tree at the specified `targetName`. Projections reference this output via the `source` property.

<checkpoint id="l5-shaper-skill"></checkpoint>

**Projection groups and `generatedKeyName`:**

All projections within the same group (the same object in the `projections` array) share a common `generatedKeyName`. This auto-generated key lets you cross-reference rows across tables within the same group — for example, linking an entity row in `EntitiesTable` back to its parent document row in a `DocumentsTable`.

| Concept | Description |
|---------|-------------|
| **Projection group** | One entry in the `projections` array containing `tables`, `objects`, and/or `files` |
| **`generatedKeyName`** | Auto-generated unique key added to each projected row/object; shared across the group |
| **Cross-referencing** | Use the generated key to join tables in Power BI or link objects to their source table rows |
| **Multiple groups** | Separate groups produce separate key spaces — they cannot cross-reference each other |

When you need related projections that reference each other (e.g., a documents table and a key-phrases-per-document table), put them in the **same** projection group. When you need independent projections, use **separate** groups.

<checkpoint id="l5-storage-output"></checkpoint>

### Test It

Answer these self-check questions:

1. You need to export extracted entities to Power BI for cross-tabulation with document metadata. Which projection type do you use, and why?
2. Your skillset extracts key phrases as a nested array per document. Projections require a flat structure. Which skill do you use to reshape the data?
3. You have two table projections — `DocumentsTable` and `EntitiesTable`. You need to join them in Power BI. How do you ensure they share a common key?

<details>
<summary>Answers</summary>

1. **Table projections** — Power BI connects directly to Azure Table Storage. Table projections produce structured rows that Power BI can query and cross-tabulate. Object projections produce JSON blobs, which are harder for Power BI to consume.
2. **Shaper skill** (`#Microsoft.Skills.Util.ShaperSkill`). It reshapes the nested enrichment tree output into the flat structure that table projections require. Use `sourceContext` for iterating over the nested array.
3. Place both table projections in the **same projection group** (the same object in the `projections` array). They will share a common `generatedKeyName` that acts as a foreign key for joining in Power BI.

</details>

### Exam Tips

- **Know all three projection types and their target storage.** The exam may describe a scenario (e.g., "export to Power BI") and ask which projection type to use. Tables = Power BI, Objects = custom JSON processing, Files = binary images.
- **The Shaper skill is required when projection shape differs from enrichment tree shape.** If the exam shows a projection that fails, check whether a Shaper skill is missing.
- **`sourceContext` is for nested/collection inputs in the Shaper skill.** Without it, you cannot iterate over arrays in the enrichment tree.
- **Projection groups determine cross-referencing scope.** The exam may ask how to join two tables — the answer is always "same projection group."
- **Knowledge store requires a storage connection string** on the skillset. If projections are not appearing, verify the connection string is correct and the storage account is accessible.

---

<!-- section:layer:6 -->
## Layer 6: Custom Skills & Azure Functions

- Understand the full WebApiSkill request/response JSON contract
- Review an Azure Function implementation for a custom skill
- Distinguish `fieldMappings` from `outputFieldMappings` on the indexer
- Understand error handling in custom skills
- Answer self-check questions

### What You Will Learn

- The exact JSON schema that a WebApiSkill endpoint must accept and return
- How to implement an Azure Function (Python) that serves as a custom skill
- The difference between `fieldMappings` and `outputFieldMappings` on the indexer
- How partial failures and error reporting work in the custom skill contract

> **Exam objective:** Implement knowledge mining solutions > Implement a custom skill for Azure AI Search

### Concepts

Layer 3 introduced the `WebApiSkill` as the mechanism for calling your own code during enrichment. This layer covers the full implementation: the request/response contract, an Azure Function example, and how to wire the skill output into your search index.

**WebApiSkill request/response contract:**

The indexer sends a POST request to your skill endpoint. The request body and expected response body must follow a strict schema. The exam frequently tests whether you can identify errors in this schema.

**Request body (sent by the indexer to your endpoint):**

```json
{
  "values": [
    {
      "recordId": "1",
      "data": {
        "text": "Azure AI services provide cloud-based AI capabilities.",
        "languageCode": "en"
      }
    },
    {
      "recordId": "2",
      "data": {
        "text": "Les services Azure AI offrent des capacites cloud.",
        "languageCode": "fr"
      }
    }
  ]
}
```

**Expected response body (returned by your endpoint):**

```json
{
  "values": [
    {
      "recordId": "1",
      "data": {
        "category": "technology",
        "confidence": 0.95
      },
      "errors": [],
      "warnings": []
    },
    {
      "recordId": "2",
      "data": {
        "category": "technology",
        "confidence": 0.87
      },
      "errors": [],
      "warnings": []
    }
  ]
}
```

**Contract rules:**

| Rule | Detail |
|------|--------|
| `values` array | Both request and response must have a top-level `values` array |
| `recordId` | Each record has a unique `recordId`. The response `recordId` must match the request `recordId`. |
| `data` object | Request `data` contains the inputs defined in the skill. Response `data` contains the outputs. |
| `errors` array | Per-record errors. If non-empty, that record's enrichment fails but other records continue. |
| `warnings` array | Per-record warnings. Logged but do not cause failure. |
| HTTP status | Must return `200 OK` even if individual records have errors (errors are per-record, not per-request). |

<checkpoint id="l6-webapi-schema"></checkpoint>

**Azure Function implementation (Python, illustrative):**

This example shows a Python Azure Function that classifies text into categories. It demonstrates the required request/response contract:

```python
import azure.functions as func
import json
import logging

app = func.FunctionApp()

@app.route(route="classify", auth_level=func.AuthLevel.FUNCTION)
def classify_text(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Custom skill: classify_text invoked")

    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"values": []}),
            status_code=200,
            mimetype="application/json",
        )

    results = []
    for record in body.get("values", []):
        record_id = record["recordId"]
        text = record["data"].get("text", "")

        try:
            # --- Your custom logic here ---
            category = "technology" if "azure" in text.lower() else "general"
            confidence = 0.9
            # --- End custom logic ---

            results.append({
                "recordId": record_id,
                "data": {
                    "category": category,
                    "confidence": confidence,
                },
                "errors": [],
                "warnings": [],
            })
        except Exception as e:
            results.append({
                "recordId": record_id,
                "data": {},
                "errors": [{"message": f"Error processing record: {str(e)}"}],
                "warnings": [],
            })

    return func.HttpResponse(
        json.dumps({"values": results}),
        status_code=200,
        mimetype="application/json",
    )
```

Key implementation points:

- Always return HTTP `200` — even when individual records fail. Per-record errors go in the `errors` array.
- Always echo back the same `recordId` from the request.
- The `data` object in the response must contain the fields declared in the skill's `outputs` array.
- Use `auth_level=func.AuthLevel.FUNCTION` so the indexer can authenticate via a function key in the URL.

<checkpoint id="l6-function-impl"></checkpoint>

**`fieldMappings` vs `outputFieldMappings` on the indexer:**

These two properties are both defined on the **indexer** (not on the skillset), but they serve different purposes. The exam tests this distinction frequently.

| Property | Defined On | Purpose | When It Runs |
|----------|-----------|---------|-------------|
| `fieldMappings` | Indexer | Maps **source data fields** to **index fields** | Before the skillset runs |
| `outputFieldMappings` | Indexer | Maps **skillset enrichment outputs** to **index fields** | After the skillset runs |

```json
{
  "name": "my-indexer",
  "dataSourceName": "my-blob-source",
  "targetIndexName": "my-index",
  "skillsetName": "my-skillset",
  "fieldMappings": [
    {
      "sourceFieldName": "metadata_storage_path",
      "targetFieldName": "id",
      "mappingFunction": { "name": "base64Encode" }
    },
    {
      "sourceFieldName": "metadata_storage_name",
      "targetFieldName": "title"
    }
  ],
  "outputFieldMappings": [
    {
      "sourceFieldName": "/document/content/persons",
      "targetFieldName": "people"
    },
    {
      "sourceFieldName": "/document/content/keyphrases",
      "targetFieldName": "keyPhrases"
    }
  ]
}
```

> **Note:** The enrichment tree paths in `outputFieldMappings` (e.g., `/document/content/persons`) are illustrative. Actual paths depend on your skill configuration, particularly the `context` and `targetName` values set on each skill. Use a debug session to inspect your enrichment tree and verify the correct paths.

- `fieldMappings` sources are actual fields from the data source (blob metadata, SQL columns, etc.).
- `outputFieldMappings` sources are paths in the enrichment tree created by skills (e.g., `/document/content/persons`).

**Error handling in custom skills:**

| Scenario | Behavior |
|----------|----------|
| `errors` array is non-empty for a record | That record's enrichment output is discarded. The document may still be indexed without the enriched field. Other records in the batch are unaffected. |
| `warnings` array is non-empty for a record | The warning is logged in the indexer execution history. The record is processed normally. |
| HTTP status 5xx from the endpoint | The entire batch fails. The indexer retries according to its retry policy. |
| `recordId` mismatch (response ID differs from request ID) | The indexer cannot match the response to the correct document. The record fails. |
| Missing `data` object in response | The record fails — the indexer expects a `data` object for each record. |

<checkpoint id="l6-skill-integration"></checkpoint>

### Test It

Answer these self-check questions:

1. The indexer sends a batch to your custom skill endpoint. One record causes an exception in your code. Should you return HTTP 500?
2. Your custom skill outputs a field called `sentiment`, but it does not appear in the search index after indexing. What is the most likely cause?
3. A WebApiSkill response contains `"recordId": "3"` but the request had `"recordId": "2"`. What happens?

<details>
<summary>Answers</summary>

1. **No.** Return HTTP `200` and include the error in that record's `errors` array. HTTP 5xx causes the entire batch to fail and triggers retries. Per-record errors allow other records in the batch to succeed.
2. **Missing `outputFieldMapping`.** The skill writes `sentiment` to the enrichment tree, but without an `outputFieldMapping` on the indexer, the enriched value is not mapped to an index field. Add `{ "sourceFieldName": "/document/sentiment", "targetFieldName": "sentiment" }` to `outputFieldMappings`.
3. **The record fails.** The indexer cannot match the response record to the request document because the `recordId` values do not match. Always echo back the exact `recordId` from the request.

</details>

### Exam Tips

- **The WebApiSkill contract is heavily tested.** Memorize the structure: `values` array, `recordId`, `data`, `errors`, `warnings`. The exam may show a response with a missing field and ask what is wrong.
- **Always return HTTP 200 from a custom skill**, even for errors. Per-record errors go in the `errors` array. Returning 4xx/5xx fails the entire batch.
- **`fieldMappings` = before skillset, `outputFieldMappings` = after skillset.** If an enriched field is missing from the index, the first thing to check is `outputFieldMappings`.
- **Custom skill endpoints must be HTTPS** in production. The indexer will not call HTTP endpoints unless you are using a private endpoint or debug configuration.
- **Function keys in the URL** are the typical authentication mechanism. The skill definition's `uri` includes the function key as a query parameter: `https://myapp.azurewebsites.net/api/classify?code=<function-key>`.

---

<!-- section:layer:7 -->
## Layer 7: Incremental Enrichment & Debugging

- Understand incremental enrichment and the indexer cache
- Learn to use debug sessions in the Azure portal
- Review common field mapping pitfalls and their fixes
- Distinguish reset indexer from reset skills
- Answer self-check questions

### What You Will Learn

- How incremental enrichment (enrichment caching) reduces cost and processing time
- How to configure the `cache` property on an indexer
- How to use debug sessions to step through enrichment pipelines
- Common field mapping mistakes and how to diagnose them
- When to reset an indexer vs. reset skills

> **Exam objective:** Implement knowledge mining solutions > Manage indexer execution and debug enrichment pipelines

### Concepts

Layers 1-6 covered building the pipeline: indexes, indexers, skillsets, projections, and custom skills. This layer focuses on operating the pipeline in production — caching, debugging, and troubleshooting.

**Incremental enrichment (enrichment caching):**

By default, every time an indexer runs, it re-executes all skills for every document. This is expensive when you have thousands of documents and multiple cognitive skills. Incremental enrichment caches skill outputs so that only changed documents or changed skill definitions trigger re-processing.

How it works:

1. On first run, the indexer executes all skills and stores each skill's output in a cache (an Azure Storage account you provide).
2. On subsequent runs, the indexer checks whether each document has changed (via change detection) and whether the skill definition has changed.
3. If neither has changed, the cached output is used instead of re-executing the skill.
4. If the document changed, all skills re-run for that document. If a skill definition changed, that skill (and downstream skills) re-run for all documents.

**JSON configuration for the indexer `cache` property:**

```json
{
  "name": "my-indexer",
  "dataSourceName": "my-blob-source",
  "targetIndexName": "my-index",
  "skillsetName": "my-skillset",
  "cache": {
    "storageConnectionString": "DefaultEndpointsProtocol=https;AccountName=mycacheacct;...",
    "enableReprocessing": true
  },
  "parameters": {
    "configuration": {
      "dataToExtract": "contentAndMetadata",
      "imageAction": "generateNormalizedImages"
    }
  }
}
```

| Property | Description |
|----------|-------------|
| `cache.storageConnectionString` | Connection string to the Azure Storage account used for caching. **Required** — incremental enrichment does not work without it. |
| `cache.enableReprocessing` | When `true` (default), the indexer uses the cache. Set to `false` to temporarily disable caching without removing the configuration. |

> **Note:** Enrichment caching is currently a **preview feature** and requires a preview API version (e.g., `2025-11-01-preview`). Preview features may change before general availability.

<checkpoint id="l7-incremental"></checkpoint>

**Debug sessions in the Azure portal:**

When a skillset produces unexpected results — missing fields, wrong values, or errors — debug sessions let you step through the enrichment pipeline document by document.

**How to start a debug session:**

1. In the Azure portal, navigate to your Search resource.
2. Click **Debug sessions** in the left menu.
3. Click **Add debug session**.
4. Select the indexer whose skillset you want to debug.
5. Provide a storage connection string (for temporary session data).
6. Optionally specify a single document URI to debug (otherwise it picks the first document).
7. Click **Run** to execute the pipeline in debug mode.

**What you can inspect during a debug session:**

| Inspection Point | What It Shows |
|-----------------|---------------|
| **Skill inputs** | The exact data passed into each skill — verify the `source` paths are correct |
| **Skill outputs** | The data produced by each skill — verify values are as expected |
| **Enrichment tree** | The full document enrichment tree at each step — see how data accumulates |
| **Errors and warnings** | Per-skill errors that may be hidden in normal indexer status |
| **Field mappings** | How source fields and enrichment outputs map to index fields |

Debug sessions are read-only — they do not modify your index or cached data. You can safely re-run them as many times as needed.

<checkpoint id="l7-debug-sessions"></checkpoint>

**Common field mapping pitfalls:**

| Problem | Cause | Fix |
|---------|-------|-----|
| Enriched field not appearing in index | Missing `outputFieldMapping` on the indexer | Add an `outputFieldMapping` that maps the enrichment tree path (e.g., `/document/persons`) to the target index field |
| Source field not appearing in index | Missing `fieldMapping` on the indexer | Add a `fieldMapping` from the source field name to the target index field, or ensure the names match exactly |
| Field appears but is always empty | Wrong `source` path in the skill input | Use a debug session to verify the enrichment tree paths; fix the `source` to point to the correct node |
| Skill output is an array but index field is a string | Type mismatch between skill output and index field | Change the index field type to `Collection(Edm.String)`, or add a skill that flattens the array |
| `base64Encode` not applied to document key | Missing `mappingFunction` in field mapping | Add `"mappingFunction": { "name": "base64Encode" }` to the field mapping for the key field |
| Enriched field works for some documents but not others | Skill `context` is wrong — runs at `/document` but data is at `/document/pages/*` | Change the skill `context` to match the granularity of the data |

<checkpoint id="l7-field-mappings"></checkpoint>

**Reset indexer vs. reset skills:**

When troubleshooting or recovering from errors, you have two reset options. They are related but serve different purposes:

| Action | What It Does | When to Use |
|--------|-------------|-------------|
| **Reset indexer** | Clears the indexer's high-water mark (change tracking state), forcing a full re-crawl from the data source. All documents are re-fetched and re-indexed. **For indexers with a skillset and enrichment caching enabled, resetting the indexer also implicitly resets the skillset** (clears the enrichment cache). | After data source schema changes, after deleting and recreating the index, when change detection is not picking up modified documents, or when you need a clean re-crawl and full re-enrichment. |
| **Reset skills** | Clears the enrichment cache, forcing all skills to re-execute for all documents on the next indexer run. Does **not** reset the indexer's change tracking — only documents that pass change detection are re-enriched. | After changing a skill definition when you want to force re-enrichment without re-crawling the data source, or when cached results appear stale or incorrect. |

**Important:** These are **not** independent operations. Reset Indexer is the broader operation — it encompasses Reset Skills (when a skillset and cache are configured). Reset Skills is the narrower operation — it only affects the enrichment cache without triggering a full re-crawl. Use Reset Skills when you only need to re-run enrichment; use Reset Indexer when you need both a full re-crawl and re-enrichment.

**How to reset in the portal:**

1. Navigate to your Search resource > **Indexers** > select the indexer.
2. Click **Reset** (for full indexer reset) or **Reset Skills** (for cache-only reset).
3. Run the indexer again to apply the reset.

### Test It

Answer these self-check questions:

1. You modify an Entity Recognition skill to also extract locations (in addition to persons). You want the new output to appear for all existing documents. Which reset do you perform?
2. You notice that a recently modified blob was not re-indexed on the last indexer run. You suspect the change detection missed it. What do you do?
3. Your skillset extracts key phrases, but the `keyPhrases` field in the index is always empty. The skill definition looks correct. Where do you look next?
4. You are developing a new skillset and want to verify that each skill receives the correct input. What Azure portal feature do you use?

<details>
<summary>Answers</summary>

1. **No manual reset is needed.** When you modify a skill definition (e.g., adding entity categories), the incremental enrichment system automatically detects the change and re-runs the modified skill and its downstream dependencies on the next indexer run. You only need to manually Reset Skills when the indexer *cannot* detect a change — such as when you modify the code behind a custom skill's endpoint URL without changing the skill definition itself.
2. **Reset the indexer.** This clears change tracking and forces a full re-crawl from the data source. On the next run, all documents (including the modified blob) will be re-fetched and re-indexed.
3. **Check `outputFieldMappings` on the indexer.** The skill may be producing key phrases correctly in the enrichment tree, but without an `outputFieldMapping` from `/document/content/keyphrases` to the `keyPhrases` index field, the data is not written to the index. Use a debug session to verify the skill output exists in the enrichment tree.
4. **Debug sessions.** Create a debug session for your indexer, run it against a sample document, and inspect the inputs and outputs at each skill step. This shows you exactly what data each skill receives and produces.

</details>

<checkpoint id="l7-questions"></checkpoint>

### Exam Tips

- **Incremental enrichment requires a storage connection string on the indexer's `cache` property.** Without it, caching is not enabled. The exam may present a scenario where "all documents are re-processed every run" and ask how to fix it.
- **Reset Indexer is the broader reset; Reset Skills is the narrower one.** Reset Indexer forces a full re-crawl AND (when a skillset with caching is configured) implicitly resets skills. Reset Skills only clears the enrichment cache without triggering a re-crawl. The exam may describe a scenario and ask which reset to perform. Remember: reset indexer = re-crawl + re-enrich, reset skills = re-enrich only.
- **Debug sessions are the primary tool for skillset troubleshooting.** If the exam asks how to diagnose why an enriched field is missing or incorrect, the answer is almost always "use a debug session."
- **`outputFieldMappings` is the most common cause of missing enriched fields.** If a skill produces output but it does not appear in the index, the mapping is missing or has the wrong source path.
- **Enrichment cache invalidation is automatic** when you change a skill definition (parameters, inputs, outputs). You do not need to manually reset skills after editing a skillset. However, **external changes** (e.g., modifying the code behind a custom skill's endpoint URL without changing the skill definition) are *not* detected — use Reset Skills for those cases.
- **Debug sessions require a storage account** for temporary data. This is separate from the enrichment cache storage account (though you can use the same one).

---

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** You have scanned PDF invoices stored in Azure Blob Storage. You need to extract text from the images within these PDFs during indexing. Which combination of skillset skills should you use?

A) Entity Recognition + Key Phrase Extraction
B) OCR + Merge
C) Text Split + Sentiment Analysis
D) Language Detection + Translation

<details><summary>Answer</summary>

**B) OCR + Merge** — OCR extracts text from images embedded in the PDFs. Merge combines the OCR output with any native text already in the document. This is a classic exam combination for processing scanned documents.

</details>

**Q2.** You need to call a custom machine learning model during the Azure AI Search indexer enrichment pipeline. Which skill type should you use?

A) `#Microsoft.Skills.Text.EntityRecognitionSkill`
B) `#Microsoft.Skills.Custom.WebApiSkill`
C) `#Microsoft.Skills.Text.KeyPhraseExtractionSkill`
D) `#Microsoft.Skills.Vision.OcrSkill`

<details><summary>Answer</summary>

**B) `#Microsoft.Skills.Custom.WebApiSkill`** — The WebApiSkill calls an external HTTP endpoint (typically an Azure Function) with the document data. Your custom ML model runs behind that endpoint. All the other options are built-in cognitive skills.

</details>

**Q3.** A search query uses `"machine learning"~5` with `query_type="full"`. What does this query do?

A) Searches for documents containing exactly "machine learning"
B) Searches for "machine" and "learning" within 5 words of each other
C) Searches for fuzzy matches of "machine learning" with edit distance 5
D) Boosts "machine learning" results by a factor of 5

<details><summary>Answer</summary>

**B) Searches for "machine" and "learning" within 5 words of each other** — This is proximity search in full Lucene query syntax. The `~5` after a quoted phrase means the words must appear within 5 positions of each other. Fuzzy search uses `~` on a single term (e.g., `machin~1`). Boosting uses `^` (e.g., `azure^4`).

</details>

**Q4.** You want to display category counts alongside search results (e.g., "Tutorial: 15, Reference: 8"). Which Azure AI Search feature should you use?

A) Scoring profiles
B) Facets
C) Filters
D) Highlighters

<details><summary>Answer</summary>

**B) Facets** — Faceted navigation returns aggregated counts for field values. The field must be marked as `facetable`. Scoring profiles change ranking order. Filters remove documents from results. Highlighters show matching text snippets.

</details>

**Q5.** You need to export entities extracted during AI enrichment to Power BI for analysis. What should you configure?

A) Output field mappings to the search index
B) A knowledge store with table projections
C) A custom WebApiSkill
D) A semantic configuration

<details><summary>Answer</summary>

**B) A knowledge store with table projections** — Knowledge store table projections write structured data to Azure Table Storage, which Power BI can connect to directly. Output field mappings send data to the search index (not to Power BI). The knowledge store is specifically designed for downstream analytics.

</details>

## Next Lab

Continue to **[Lab 04: Vision Lab](04-vision.md)** to implement computer vision with Azure AI Vision — image analysis, object detection, and OCR. Lab 04 is independent of Labs 01-03, so you can start it at any time.
