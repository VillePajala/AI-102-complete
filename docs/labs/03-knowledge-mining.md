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

## Overview

Knowledge mining is the process of extracting structured information from unstructured data at scale using Azure AI Search. While Lab 02 focused on getting documents in and searching them, this lab covers the broader Azure AI Search feature set that the AI-102 exam tests heavily:

- Programmatic index management
- Indexers and data sources for automated ingestion
- AI enrichment skillsets that extract entities, key phrases, and more during indexing
- Advanced query syntax including filters, facets, and scoring profiles

This lab is more conceptual than Lab 02. The exam tests your understanding of these features and when to use them, not just your ability to write SDK code.

## Prerequisites

- **Lab 02 (RAG Engine) completed** — you need a working `search_service.py` with `search_documents()` and `upload_document()`
- **Same Azure AI Search resource** from Lab 02

## Azure Setup

No new Azure resources needed. You will use the same Azure AI Search resource from Lab 02.

For Layer 3 (AI Enrichment), if you want to follow along with a hands-on exercise in the portal, you will also need:
- An **Azure Blob Storage** account with a container holding sample documents (PDFs, images, or Office files)
- An **Azure AI Services** multi-service resource (for built-in cognitive skills)

These are optional. The concepts can be learned from the lab content alone.

---

## Layer 1: Index Management

- [ ] Review `SearchIndexClient` vs `SearchClient` concepts
- [ ] Understand field types, analyzers, and scoring profiles
- [ ] (Optional) Create a second index programmatically

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

def create_index(index_name: str) -> None:
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

## Layer 2: Data Sources and Indexers

- [ ] Review indexer pipeline concepts (data source → indexer → skillset → index)
- [ ] Understand change detection policies
- [ ] (Optional) Set up an indexer via Import data wizard
- [ ] Answer self-check questions

### What You Will Learn

- How indexers automate document ingestion from data sources
- Supported data source types
- Indexer scheduling and change detection
- The indexer execution pipeline

### Concepts

In Lab 02, you uploaded documents manually using `client.upload_documents()`. In production, you use **indexers** to automatically pull data from external data sources into your search index.

**The indexer pipeline:**

```
Data Source  -->  Indexer  -->  (Skillset)  -->  Search Index
                                                     |
                                                     v
                                              Knowledge Store
                                              (optional)
```

**Supported data sources:**

| Data Source | Connector | Common Use Case |
|-------------|-----------|-----------------|
| Azure Blob Storage | Built-in | PDFs, images, Office files |
| Azure SQL Database | Built-in | Structured data from SQL tables |
| Azure Cosmos DB | Built-in | JSON documents |
| Azure Table Storage | Built-in | Key-value structured data |
| Azure Data Lake Storage Gen2 | Built-in | Large-scale file storage |
| SharePoint Online | Built-in (preview) | Enterprise documents |

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

### Exam Tips

- **Indexers are the standard way to populate indexes** in production. Manual upload via `upload_documents()` is for small-scale or programmatic scenarios.
- **The "Import data" wizard** in the portal creates a data source, indexer, and optionally a skillset all at once. Know that these are three separate resources even though the wizard bundles them.
- **Field mappings support mapping functions:** `base64Encode`, `base64Decode`, `extractTokenAtPosition`, `jsonArrayToStringCollection`, `urlEncode`, `urlDecode`. The exam may ask which function to use for generating a valid document key from a URL or path.
- **Indexer limits vary by tier:** Free tier allows max 3 indexers, once-per-day schedule only. Standard tier allows more frequent schedules.
- **Reset an indexer** to force a full re-crawl (ignoring change detection). This is useful after schema changes.

---

## Layer 3: AI Enrichment with Skillsets

- [ ] Review built-in cognitive skills and their inputs/outputs
- [ ] Understand skillset context and chaining
- [ ] Review custom skills (WebApiSkill) schema
- [ ] Answer self-check questions

### What You Will Learn

- What skillsets are and how they fit in the indexer pipeline
- Built-in cognitive skills provided by Azure AI Services
- Custom skills via Azure Functions
- Knowledge store projections

### Concepts

A **skillset** is a collection of AI processing steps (called **skills**) that are executed during indexing. The indexer sends each document through the skillset before writing it to the index. This lets you extract structured information from unstructured content.

**The enrichment pipeline:**

```
Raw Document (PDF/image/text)
    |
    v
[Cracking]          -- Extract text and images from the document
    |
    v
[Skill 1: OCR]     -- Extract text from images
    |
    v
[Skill 2: Merge]   -- Merge OCR text with extracted text
    |
    v
[Skill 3: Entity]  -- Extract entities (people, places, organizations)
    |
    v
[Skill 4: KeyPhrase] -- Extract key phrases
    |
    v
[Output Field Mappings] -- Map enriched fields to index fields
    |
    v
Search Index + Knowledge Store
```

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

### Exam Tips

- **OCR + Merge is a classic exam combo.** For scanned documents, you always need both. OCR extracts text from images; Merge combines it with any existing text.
- **Skills cost money.** Each skill invocation against Azure AI Services is billed. The exam may ask about cost optimization (e.g., only process documents that need it).
- **Custom skills must conform to the Web API skill schema.** The request body must have `values` array with `recordId`, `data`. The response must match the same structure. The exam may show incorrect schemas.
- **Knowledge store is for analytics, not search.** It projects data to storage for tools like Power BI. It does not affect the search index.
- **Incremental enrichment** caches skill outputs so unchanged documents are not re-processed. This saves cost and time. Enabled via `cache` property on the indexer.

---

## Layer 4: Advanced Query Syntax

- [ ] Add `filter_expr` and `facets` parameters to `search_documents()`
- [ ] Review simple vs full Lucene query syntax
- [ ] Review OData filter expressions
- [ ] Answer self-check questions

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

### Implementation

Enhance `search_documents()` to support optional filters and facets. This is a small modification to the existing function.

<details>
<summary>Hint: Updated function signature</summary>

```python
def search_documents(
    query: str,
    filter_expr: str | None = None,
    facets: list[str] | None = None,
) -> list[dict]:
```

Then pass these to `client.search()`:

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

<details>
<summary>Full Solution</summary>

```python
def search_documents(
    query: str,
    filter_expr: str | None = None,
    facets: list[str] | None = None,
) -> list[dict]:
    client = _get_search_client()
    results = client.search(
        search_text=query,
        filter=filter_expr,
        facets=facets,
        top=10,
        include_total_count=True,
        highlight_fields="content",
    )
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
    return items
```

This is the same function from Lab 02 Layer 3, with two additional optional parameters passed through to `client.search()`.

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

- [x] How to create and update indexes programmatically with `SearchIndexClient`
- [x] The role of indexers, data sources, and field mappings in automated ingestion
- [x] How AI enrichment skillsets process documents during indexing
- [x] Built-in cognitive skills and when to use each one
- [x] Custom skills via Web API and the required request/response schema
- [x] Knowledge store projections for downstream analytics
- [x] Simple and full Lucene query syntax
- [x] OData filter expressions and faceted navigation
- [x] Scoring profiles and how they affect result ranking

**Key exam preparation:** This lab covers some of the most frequently tested AI-102 topics. Focus on:

1. The indexer pipeline: data source -> indexer -> skillset -> index (+ knowledge store)
2. Choosing the right built-in skill for a scenario
3. OData filter syntax
4. The difference between simple and full Lucene query syntax

<details><summary>Complete search_service.py (after Lab 03 — same as Lab 02, this lab is conceptual)</summary>

Lab 03 is primarily conceptual. The service file is the same as after Lab 02. If you enhanced `search_documents()` with filter or facet support in Layer 4, your version may differ.

```python
import logging

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

from app.config import settings

logger = logging.getLogger(__name__)


def _get_search_client() -> SearchClient:
    if not settings.AZURE_SEARCH_ENDPOINT or not settings.AZURE_SEARCH_KEY:
        raise RuntimeError(
            "Azure AI Search not configured. "
            "Set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY."
        )
    return SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=settings.AZURE_SEARCH_INDEX,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )


def upload_document(filename: str, content: str) -> None:
    client = _get_search_client()
    doc = {
        "id": filename.replace(" ", "_").replace(".", "_"),
        "content": content,
        "source": filename,
        "title": filename,
    }
    client.upload_documents(documents=[doc])


def search_documents(query: str) -> list[dict]:
    client = _get_search_client()
    results = client.search(
        search_text=query,
        top=10,
        include_total_count=True,
        highlight_fields="content",
    )
    items = []
    for result in results:
        item: dict = {
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
    return items
```

</details>

## Next Lab

Continue to **[Lab 04: Vision Lab](04-vision.md)** to implement computer vision with Azure AI Vision — image analysis, object detection, and OCR. Lab 04 is independent of Labs 01-03, so you can start it at any time.
