# Lab 02: RAG Engine

> **Exam domains:** D2 — Implement generative AI solutions (15-20%) + D6 — Knowledge mining (15-20%)
> **Service file:** `backend/app/services/search_service.py`
> **Estimated time:** 90-120 minutes
> **Estimated Azure cost:** $0 if using the **Free (F)** tier for Azure AI Search. The Free tier allows 3 indexes and 50 MB storage — plenty for this lab. Azure OpenAI costs from Lab 01 apply for the RAG chat in Layer 6 (a few cents).

**Difficulty:** Intermediate | **Layers:** 6 | **Prerequisites:** Lab 01 (GenAI Lab)

> **How to approach this lab**
>
> This lab has both coding layers and conceptual layers. For coding layers,
> try implementing each function yourself before looking at the hints.
> For conceptual layers, focus on understanding the concepts and answering
> the self-check questions — these topics appear frequently on the exam.

<!-- section:overview -->
## Overview

Retrieval-Augmented Generation (RAG) is a pattern that grounds LLM responses in your own data. Instead of relying solely on the model's training data, you retrieve relevant documents from a search index and inject them into the prompt as context. The model then generates an answer based on that context.

In this lab you will:

1. Create an Azure AI Search resource and index
2. Implement document upload to the search index
3. Implement search queries against the index
4. Understand document chunking strategies
5. Learn about vector search and hybrid retrieval
6. Wire search results into the chat completion flow (RAG)

By the end, you will have a working RAG pipeline: upload documents, search them, and ask the chatbot questions that are answered using your documents as context.

<!-- section:prerequisites -->
## Prerequisites

- **Lab 01 (GenAI Lab) completed** — you need a working `chat_completion()` in `openai_service.py`
- **Azure subscription** with permissions to create resources
- **Backend running** with `pip install -r requirements.txt` (includes `azure-search-documents`)

**Config variables you will set in `backend/.env`:**

| Variable | Example | Description |
|----------|---------|-------------|
| `AZURE_SEARCH_ENDPOINT` | `https://my-search.search.windows.net/` | Your Azure AI Search endpoint |
| `AZURE_SEARCH_KEY` | `abc123...` | Admin key for the search service |
| `AZURE_SEARCH_INDEX` | `ai102-index` | Name of your search index (default works) |

<!-- section:setup -->
## Azure Setup

- Create Azure AI Search resource
- Create search index (`ai102-index`) in portal
- Configure `backend/.env` with search endpoint and key
- Restart backend server

1. Go to the [Azure Portal](https://portal.azure.com)
2. Create a resource > search for **"Azure AI Search"**
3. Select **Create**:
   - **Resource group:** Use an existing one or create a new one
   - **Service name:** Choose a unique name (this becomes part of the endpoint URL)
   - **Location:** Choose a region near you
   - **Pricing tier:** **Free (F)** is fine for this lab (limited to 3 indexes, 50 MB storage)
4. After deployment, go to the resource and note:
   - **Url** (the endpoint) from the Overview page
   - **Primary admin key** from Settings > Keys

<checkpoint id="setup-search-resource"></checkpoint>

Add these to your `backend/.env`:
```
AZURE_SEARCH_ENDPOINT=https://your-search-name.search.windows.net/
AZURE_SEARCH_KEY=your-primary-admin-key
AZURE_SEARCH_INDEX=ai102-index
```

**Where to find each value:**

| Variable | Where to Find It |
|----------|-----------------|
| `AZURE_SEARCH_ENDPOINT` | Azure Portal → your AI Search resource → **Overview** → **Url** |
| `AZURE_SEARCH_KEY` | Azure Portal → your AI Search resource → **Settings** → **Keys** → **Primary admin key** |
| `AZURE_SEARCH_INDEX` | You choose this name when creating the index in Layer 1 (default: `ai102-index`) |

<checkpoint id="setup-env-search"></checkpoint>

<checkpoint id="setup-restart-backend"></checkpoint>

---

<!-- section:layer:1 -->
## Layer 1: Create a Search Index (Azure Portal)

- Create index with required fields in Azure Portal
- Verify index exists with 0 documents

### What You Will Learn

- What a search index is and how fields are defined
- How to create an index in the Azure portal
- The difference between searchable, filterable, and retrievable field attributes

### Concepts

A **search index** is like a database table optimized for full-text search. Each index has:

- **Fields** with a name, type, and attributes (searchable, filterable, sortable, facetable, retrievable)
- A **key field** that uniquely identifies each document
- **Analyzers** that control how text is tokenized and normalized during indexing and search

Field attributes determine what you can do with each field:

| Attribute | What It Means |
|-----------|--------------|
| **Searchable** | Included in full-text search queries |
| **Filterable** | Can be used in OData `$filter` expressions |
| **Sortable** | Can be used to sort results |
| **Facetable** | Can be used for faceted navigation (category counts) |
| **Retrievable** | Returned in search results |

### Implementation

No code to write yet. Create the index in the Azure portal:

1. Open your Azure AI Search resource
2. Go to **Indexes** > **Add index**
3. Add these fields:

| Field Name | Type | Key | Searchable | Filterable | Retrievable |
|-----------|------|-----|------------|------------|-------------|
| `id` | `Edm.String` | Yes | No | No | Yes |
| `content` | `Edm.String` | No | Yes | No | Yes |
| `source` | `Edm.String` | No | No | Yes | Yes |
| `title` | `Edm.String` | No | Yes | Yes | Yes |
| `category` | `Edm.String` | No | No | Yes | Yes |

4. Name the index `ai102-index` (or match whatever you set in `AZURE_SEARCH_INDEX`)
5. Click **Create**

<checkpoint id="l1-create-index"></checkpoint>

### Test It

Verify the index exists:
- In the portal, go to your Search resource > Indexes
- You should see `ai102-index` with 0 documents

You can also test via the backend Swagger UI at `http://localhost:8000/docs` — the `/api/search/query` endpoint should return a `503` error about "not configured" (if your .env is not set) or `500` with `NotImplementedError` (if your .env IS set but the code is not yet implemented). Both are expected at this stage.

<checkpoint id="l1-verify-index"></checkpoint>

### Exam Tips

- **Know the field types:** `Edm.String`, `Edm.Int32`, `Edm.Double`, `Edm.Boolean`, `Edm.DateTimeOffset`, `Collection(Edm.String)`, `Edm.GeographyPoint`
- **Know which attributes to set:** The exam often asks which attribute to enable for a given scenario (e.g., "you need to filter by category" = filterable)
- **Key field must be `Edm.String`** and there is exactly one per index

---

<!-- section:layer:2 -->
## Layer 2: Upload Documents

- Add SDK imports to `search_service.py`
- Implement `_get_search_client()` helper
- Implement `upload_document()` function
- Test upload via frontend or Swagger UI

### What You Will Learn

- How to use `SearchClient` from the `azure-search-documents` SDK
- How to upload documents to a search index programmatically
- How document IDs work in Azure AI Search

### Concepts

The `SearchClient` class is your main interface for reading/writing documents in a search index. To upload documents, you:

1. Create a `SearchClient` with your endpoint, index name, and credential
2. Build document dicts that match your index schema (each must include the key field)
3. Call `client.upload_documents()` to push them to the index

Document IDs (`id` field) must be unique within the index. If you upload a document with an ID that already exists, it replaces the existing document.

### Implementation

Open `backend/app/services/search_service.py`. You need to:

1. Create a helper function `_get_search_client()` that returns a `SearchClient`
2. Implement `upload_document()` to create a document dict and upload it

Start by adding the imports at the top of the file:
```python
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
```

<checkpoint id="l2-imports"></checkpoint>

Then implement the helper and the upload function.

<details>
<summary>Hint: _get_search_client()</summary>

```python
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
```

</details>

<checkpoint id="l2-get-client"></checkpoint>

<details>
<summary>Hint: upload_document()</summary>

Think about:
- What fields does your index expect? (`id`, `content`, `source`, `title`)
- The `id` field cannot contain spaces or dots — sanitize the filename
- Use `client.upload_documents(documents=[doc])` to upload

</details>

<checkpoint id="l2-upload"></checkpoint>

### Test It

1. Start the backend: `cd backend && uvicorn app.main:app --reload --port 8000`
2. Go to `http://localhost:3000/search` (the Knowledge Mining page in the frontend)
3. Upload a `.txt` file using the upload feature
4. Check the Azure portal: go to your Search resource > Indexes > `ai102-index` — the document count should increase
5. Alternatively, test via Swagger UI at `http://localhost:8000/docs` — use the `/api/search/upload` endpoint

<checkpoint id="l2-test"></checkpoint>

<details>
<summary>Full Solution</summary>

```python
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient


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
```

</details>

### Exam Tips

- **upload_documents vs merge_documents vs merge_or_upload_documents:** `upload` creates or fully replaces. `merge` updates only specified fields (fails if document doesn't exist). `merge_or_upload` creates if new, merges if existing. The exam tests this distinction.
- **Batch size limit:** A single batch can contain up to 1000 documents or 16 MB total.
- **The key field value must be a string** — even if your source data uses integers, convert them.

---

<!-- section:layer:3 -->
## Layer 3: Basic Search

- Implement `search_documents()` function
- Test search via frontend or Swagger UI

### What You Will Learn

- How to execute full-text search queries using `SearchClient`
- How to parse search results including scores and highlights
- What `@search.score` and `@search.highlights` contain

### Concepts

Full-text search in Azure AI Search uses the **BM25 ranking algorithm** by default. When you call `client.search()`, the service:

1. **Analyzes** your query text (tokenization, lowercasing, etc.)
2. **Matches** tokens against the searchable fields in the index
3. **Ranks** results by relevance (BM25 score)
4. **Returns** matching documents with metadata

Key parameters for `client.search()`:

| Parameter | Purpose |
|-----------|---------|
| `search_text` | The query string |
| `top` | Maximum number of results to return |
| `include_total_count` | Include total matching document count in response |
| `highlight_fields` | Which fields to return highlighted snippets for |
| `filter` | OData filter expression (used in Layer 4 of Lab 03) |
| `select` | Which fields to return (default: all retrievable) |

### Implementation

Implement `search_documents()` in `search_service.py`. The function should:

1. Get a `SearchClient` using your helper
2. Call `client.search()` with the query
3. Iterate over results and build a list of dicts

Each result dict should contain:
- `content` — the document content
- `score` — the search relevance score
- `source` — the source filename (if present)
- `highlights` — highlighted content snippets (if present)
- `metadata` — a dict of title, category, source (if present)

<checkpoint id="l3-search"></checkpoint>

<details>
<summary>Hint: Accessing result fields</summary>

Search results are dict-like objects. Use `.get()` to safely access fields:
```python
result.get("content", "")          # Regular field
result.get("@search.score", 0.0)   # Score (note the @ prefix)
result.get("@search.highlights")   # Highlights dict (may be None)
```

Highlights are returned as a dict where keys are field names and values are lists of highlighted snippets:
```python
highlights = result.get("@search.highlights", {})
if highlights and "content" in highlights:
    # highlights["content"] is a list of strings with <em> tags
```

</details>

### Test It

1. Make sure you have at least one document uploaded (from Layer 2)
2. Go to `http://localhost:3000/search`
3. Enter a search query that matches content in your uploaded document
4. You should see search results with content, scores, and highlighted matches
5. Also test via Swagger: POST to `/api/search/query` with `{"query": "your search term"}`

<checkpoint id="l3-test"></checkpoint>

<details>
<summary>Full Solution</summary>

```python
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

</details>

### Exam Tips

- **BM25 is the default ranking algorithm** for full-text search. It considers term frequency, inverse document frequency, and field length.
- **Highlights use `<em>` tags** by default. You can customize with `highlight_pre_tag` and `highlight_post_tag`.
- **`top` defaults to 50** if not specified. Maximum is 1000.
- **`include_total_count=True`** adds a `count` property to the response — useful for pagination. The exam may ask how to get total result count.

---

<!-- section:layer:4 -->
## Layer 4: Chunking Strategy

- Add `_chunk_text()` helper function
- Enhance `upload_document()` with chunking logic
- Test with a large document

### What You Will Learn

- Why large documents need to be chunked before indexing
- Common chunking strategies and their tradeoffs
- How to implement basic chunking in the upload flow

### Concepts

Search indexes work best with **focused, reasonably-sized chunks** of text rather than entire documents. A 50-page PDF indexed as a single document creates two problems:

1. **Search precision drops** — the BM25 score applies to the whole document, so a single keyword match in a long document gets a low score
2. **RAG context is wasteful** — you end up injecting thousands of irrelevant tokens into the LLM prompt

**Common chunking strategies:**

| Strategy | How It Works | Pros | Cons |
|----------|-------------|------|------|
| **Fixed-size** | Split every N characters (e.g., 1000) with overlap | Simple, predictable size | May split mid-sentence |
| **Sentence-based** | Split on sentence boundaries | Preserves meaning | Uneven chunk sizes |
| **Paragraph-based** | Split on blank lines / paragraph markers | Natural boundaries | Some paragraphs are very long |
| **Semantic** | Use embeddings to find topic boundaries | Best relevance | Most complex, requires model calls |

**Overlap** is important: include some text from the end of one chunk at the start of the next. This ensures that if a relevant passage spans a chunk boundary, at least one chunk contains the full passage. Typical overlap is 10-20% of chunk size.

### Implementation

Enhance `upload_document()` to split large documents into chunks. A simple fixed-size approach:

<checkpoint id="l4-chunk-helper"></checkpoint>

<details>
<summary>Hint: Chunking logic</summary>

```python
def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks
```

Then in `upload_document()`, check if the content is large and chunk it:

```python
if len(content) > 1000:
    chunks = _chunk_text(content)
    docs = []
    for i, chunk in enumerate(chunks):
        docs.append({
            "id": f"{sanitized_name}_chunk_{i}",
            "content": chunk,
            "source": filename,
            "title": f"{filename} (part {i + 1})",
        })
    client.upload_documents(documents=docs)
else:
    # Upload as single document (existing code)
```

</details>

<checkpoint id="l4-chunking-logic"></checkpoint>

### Test It

1. Create a longer text file (at least 2000+ characters) with multiple topics
2. Upload it via the frontend
3. Check the Azure portal — you should see multiple documents (one per chunk) instead of one
4. Search for a specific topic — you should get back just the relevant chunk(s), not the entire document

<checkpoint id="l4-test"></checkpoint>

<details>
<summary>Full Solution</summary>

```python
def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def upload_document(filename: str, content: str) -> None:
    client = _get_search_client()
    sanitized = filename.replace(" ", "_").replace(".", "_")

    if len(content) > 1000:
        chunks = _chunk_text(content)
        docs = []
        for i, chunk in enumerate(chunks):
            docs.append({
                "id": f"{sanitized}_chunk_{i}",
                "content": chunk,
                "source": filename,
                "title": f"{filename} (part {i + 1})",
            })
        client.upload_documents(documents=docs)
    else:
        doc = {
            "id": sanitized,
            "content": content,
            "source": filename,
            "title": filename,
        }
        client.upload_documents(documents=[doc])
```

</details>

### Exam Tips

- **The exam tests chunking concepts, not specific code.** Know the tradeoffs of different strategies.
- **Overlap prevents information loss** at chunk boundaries. The exam may present a scenario where a relevant answer spans two chunks and ask how to fix it.
- **Azure AI Search has a built-in "split skill"** in skillsets (covered in Lab 03) that can chunk documents automatically during indexer processing. Know that this exists as an alternative to manual chunking.
- **Chunk size affects RAG quality:** too small = missing context, too large = noise in the prompt.

---

<!-- section:layer:5 -->
## Layer 5: Vector Search (Conceptual)

- Review vector search concepts
- Answer self-check questions

### What You Will Learn

- What vector embeddings are and how they differ from keyword search
- How to configure vector fields in a search index
- What hybrid search is and when to use it

### Concepts

**Keyword search** (what you implemented in Layer 3) matches exact terms. If a user searches for "car" but your document says "automobile," keyword search misses it.

**Vector search** solves this by converting text into **embeddings** — dense numerical vectors that capture semantic meaning. "Car" and "automobile" produce similar vectors, so vector search finds the match.

**How it works:**

1. At **index time:** Each document chunk is converted to a vector using an embedding model (e.g., `text-embedding-ada-002` from Azure OpenAI) and stored in a vector field
2. At **query time:** The search query is also converted to a vector using the same model
3. The search service finds documents whose vectors are **closest** to the query vector (using cosine similarity, dot product, or Euclidean distance)

**Adding a vector field to your index:**

In the Azure portal (or programmatically), you would add a field like:

```json
{
  "name": "contentVector",
  "type": "Collection(Edm.Single)",
  "dimensions": 1536,
  "vectorSearchProfile": "my-vector-profile"
}
```

The `dimensions` must match your embedding model's output (1536 for `text-embedding-ada-002`, 3072 for `text-embedding-3-large`).

**Hybrid search** combines keyword search AND vector search in a single query, then fuses the rankings using **Reciprocal Rank Fusion (RRF)**. This gives you the best of both worlds: exact term matching plus semantic understanding.

```python
# Conceptual example — hybrid search query
from azure.search.documents.models import VectorizedQuery

results = client.search(
    search_text="car maintenance tips",          # keyword part
    vector_queries=[
        VectorizedQuery(
            vector=embedding,                     # vector part
            k_nearest_neighbors=10,
            fields="contentVector",
        )
    ],
)
```

**Semantic ranking** is an additional re-ranking step that uses a Microsoft-hosted model to re-score the top results for better relevance. It is an add-on to keyword or hybrid search, not a replacement.

### Implementation

This layer is conceptual. Review the concepts above and make sure you understand:

1. The difference between keyword search, vector search, and hybrid search
2. What an embedding model does and why dimensions matter
3. How Reciprocal Rank Fusion combines rankings
4. When you would choose each approach

<checkpoint id="l5-review"></checkpoint>

If you want to experiment, you can:
- Deploy a `text-embedding-ada-002` model in your Azure OpenAI resource
- Add a vector field to your index in the portal
- Modify `upload_document()` to generate embeddings and store them
- Modify `search_documents()` to include a `VectorizedQuery`

But this is optional for the lab. The exam tests conceptual understanding.

### Test It

No code test for this layer. Instead, answer these self-check questions:

1. A document contains the word "automobile" but a user searches for "car." Which search type(s) would find it?
2. Your embedding model outputs 1536-dimension vectors. What happens if your index field is configured for 3072 dimensions?
3. You want the best possible relevance for a RAG system. Which search approach do you choose?

<details>
<summary>Answers</summary>

1. **Vector search** and **hybrid search** would find it (semantic similarity). Keyword search would miss it unless an analyzer produces overlapping tokens.
2. It fails — the dimensions must match exactly between the model and the index field.
3. **Hybrid search with semantic ranking** — combines keyword precision, vector semantic matching, and ML-based re-ranking.

</details>

<checkpoint id="l5-questions"></checkpoint>

### Exam Tips

- **Know the three search modes:** keyword (full-text), vector, and hybrid. The exam often asks which to use for a given scenario.
- **Dimensions must match** between the embedding model and the vector field configuration.
- **Reciprocal Rank Fusion (RRF)** is how Azure AI Search merges keyword and vector results in hybrid mode. You don't need to know the math, but know the name and purpose.
- **Semantic ranking** is available on all tiers (Free includes 1,000 queries/month). It is a re-ranker, not a search mode. For production, the Standard billing plan is recommended.
- **Embedding models in Azure OpenAI:** `text-embedding-ada-002` (1536 dims), `text-embedding-3-small` (1536), `text-embedding-3-large` (3072). Know that these are separate from chat/completion models.

---

<!-- section:layer:6 -->
## Layer 6: Grounded Chat (RAG)

- Verify RAG toggle works on `/generative` page
- Test grounded response with uploaded documents
- Test unrelated question — model should say context is insufficient

### What You Will Learn

- How the RAG pattern works end-to-end
- How the router wires search results into the chat prompt
- How to test and evaluate grounded responses

### Concepts

The RAG pattern has three steps:

1. **Retrieve** — Search your index for documents relevant to the user's question
2. **Augment** — Inject the retrieved documents into the prompt as context
3. **Generate** — Send the augmented prompt to the LLM and get a grounded response

In this project, the RAG wiring is already done in `backend/app/routers/generative.py`. When the frontend sends a chat request with `use_rag: true`, the router:

1. Extracts the last user message
2. Calls `search_service.search_documents()` with that message
3. Takes the top 5 results and joins their content
4. Prepends a system message with the context
5. Passes the augmented messages to `openai_service.chat_completion()`
6. Returns the response along with source references

Here is the relevant router code (already implemented, no changes needed):

```python
if req.use_rag:
    last_user_msg = ""
    for msg in reversed(req.messages):
        if msg.get("role") == "user":
            last_user_msg = msg.get("content", "")
            break

    if last_user_msg:
        search_results = search_service.search_documents(last_user_msg)
        context_parts = []
        sources = []
        for r in search_results[:5]:
            context_parts.append(r.get("content", ""))
            if r.get("source"):
                sources.append(r["source"])

        if context_parts:
            context = "\n\n".join(context_parts)
            system_msg = {
                "role": "system",
                "content": (
                    "Answer the user's question using the following context "
                    "from their documents. If the context doesn't contain "
                    "relevant information, say so.\n\n"
                    f"Context:\n{context}"
                ),
            }
            req.messages = [system_msg, *req.messages]
```

### Implementation

No new service code needed. Your `search_documents()` from Layer 3 and `chat_completion()` from Lab 01 provide everything the router needs.

Review the router code above and make sure you understand:

- Why the system message tells the model to say when context is insufficient (reduces hallucination)
- Why only the top 5 results are used (token budget management)
- Why sources are tracked separately (for citation in the response)

### Test It

1. Make sure you have documents uploaded (from Layer 2 or Layer 4)
2. Go to `http://localhost:3000/generative` (the GenAI Lab page)
3. Enable the **RAG toggle** (this sets `use_rag: true` in the request)

<checkpoint id="l6-rag-toggle"></checkpoint>

4. Ask a question that relates to your uploaded documents
5. The response should reference information from your documents

<checkpoint id="l6-test-grounded"></checkpoint>

6. Ask a question about something NOT in your documents — the model should indicate that the context doesn't contain relevant information
7. Check the response for source citations

<checkpoint id="l6-test-unrelated"></checkpoint>

**Compare with and without RAG:**
- Without RAG: the model answers from its training data (may hallucinate or give generic answers)
- With RAG: the model answers from your documents (grounded, specific, with sources)

<details>
<summary>Full Solution</summary>

No code changes needed for this layer. The solution is the combination of:

1. `search_service.search_documents()` — from Layer 3
2. `openai_service.chat_completion()` — from Lab 01
3. The RAG wiring in `generative.py` router — already implemented

If everything from previous layers works, RAG works.

</details>

### Exam Tips

- **RAG reduces hallucination** by grounding responses in retrieved documents. The exam asks about this pattern frequently.
- **The system message is critical** — it instructs the model to use the provided context and admit when it doesn't know. Without it, the model may ignore the context or mix in training data.
- **Token budget management:** You cannot inject unlimited context. The exam may ask what happens when context exceeds the model's context window, or how to handle it (truncation, summarization, selecting fewer results).
- **Grounding vs. fine-tuning:** RAG (grounding) is for dynamic, frequently-changing data. Fine-tuning is for teaching the model a new style or domain. The exam tests when to use each approach.
- **Citation and attribution:** In production RAG systems, you should return source references so users can verify the information. This is both a UX best practice and an exam topic.

---

## Checkpoint

At this point you should have:

- An Azure AI Search resource with an index (`ai102-index`)
- `_get_search_client()` helper returning a configured `SearchClient`
- `upload_document()` uploading documents (with chunking for large files)
- `search_documents()` returning results with content, scores, highlights, and metadata
- Working RAG: chat responses grounded in your uploaded documents
- Understanding of vector search and hybrid search concepts

**Verify** by running through this sequence:
1. Upload a document about a specific topic via `/search`
2. Search for that topic via `/search` — results appear
3. Go to `/generative`, enable RAG, ask about the topic — grounded answer with sources
4. Ask about something unrelated — model says the context doesn't cover it

<details><summary>Complete search_service.py (after Lab 02)</summary>

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

<!-- section:layer:7 -->
## Layer 7: Semantic Ranking

- Configure a semantic configuration on the search index
- Update `search_documents()` to use semantic ranking
- Extract reranker scores and captions from results
- Compare keyword-only vs semantic results side by side

### What You Will Learn

- How semantic ranking improves relevance beyond BM25 keyword scoring
- How to configure semantic ranking in the Azure portal and programmatically
- How to extract captions and answers from semantically ranked results

> *Exam objective: "Configure semantic ranking"*

> **Note:** Semantic ranking is available on **all tiers including Free** (with a free plan of 1,000 queries/month). For production workloads, the Standard billing plan is recommended.

### Concepts

**Semantic ranking** is a Microsoft-hosted transformer-based re-ranker that sits on top of keyword (or hybrid) search results. It does NOT replace full-text search — it re-scores the top results using deep language understanding.

How it works:

1. You run a normal keyword search (BM25) and get back, say, 50 results
2. The semantic ranker takes the top 50 and re-reads each result using a pre-trained transformer model
3. It re-ranks them based on how well the document actually answers the query
4. It optionally extracts **captions** (the most relevant passage) and **answers** (a direct answer span)

**Requirements:**

| Requirement | Detail |
|-------------|--------|
| **Pricing tier** | Available on all tiers (Free tier includes 1,000 semantic queries/month; Standard billing plan recommended for production) |
| **Semantic configuration** | Must define which fields the ranker should read |
| **Max reranked** | The ranker processes up to 50 initial results by default |

A **semantic configuration** tells the ranker which fields to use for re-ranking:

- **Title field** — the document title (weighted highest)
- **Content fields** — the main text fields to analyze (up to 10)
- **Keyword fields** — fields with short values like tags or categories

**Portal configuration:**

1. Open your search index in the Azure portal
2. Go to **Semantic configurations** (under the index settings)
3. Click **Add semantic configuration**
4. Name it `my-semantic-config`
5. Set **Title field** to `title`
6. Add `content` as a **Content field**
7. Save the configuration

**Programmatic configuration (JSON):**

```json
{
  "name": "my-semantic-config",
  "prioritizedFields": {
    "titleField": { "fieldName": "title" },
    "prioritizedContentFields": [
      { "fieldName": "content" }
    ],
    "prioritizedKeywordsFields": []
  }
}
```

<checkpoint id="l7-semantic-config"></checkpoint>

### Implementation

Update `search_documents()` in `search_service.py` to support an optional `use_semantic` parameter. When enabled, the search should use `query_type="semantic"` and specify the semantic configuration name.

You need to:

1. Add a `use_semantic: bool = False` parameter to `search_documents()`
2. When `use_semantic` is `True`, pass `query_type="semantic"` and `semantic_configuration_name="my-semantic-config"` to `client.search()`
3. Extract `@search.rerankerScore` and `@search.captions` from each result

<details>
<summary>Hint: Semantic search parameters</summary>

```python
def search_documents(query: str, use_semantic: bool = False) -> list[dict]:
    client = _get_search_client()

    search_kwargs = {
        "search_text": query,
        "top": 10,
        "include_total_count": True,
        "highlight_fields": "content",
    }

    if use_semantic:
        search_kwargs["query_type"] = "semantic"
        search_kwargs["semantic_configuration_name"] = "my-semantic-config"
        search_kwargs["query_caption"] = "extractive"

    results = client.search(**search_kwargs)

    items = []
    for result in results:
        item = {
            "content": result.get("content", ""),
            "score": result.get("@search.score", 0.0),
        }
        # Add semantic-specific fields when available
        if use_semantic:
            item["reranker_score"] = result.get("@search.rerankerScore", 0.0)
            captions = result.get("@search.captions")
            if captions:
                item["captions"] = [
                    {"text": c.text, "highlights": c.highlights}
                    for c in captions
                ]
        # ... rest of existing field extraction ...
        items.append(item)
    return items
```

</details>

<checkpoint id="l7-semantic-query"></checkpoint>

### Test It

Compare keyword-only and semantic results to see the difference:

1. Upload several documents with varied content (at least 3-5 documents)
2. Run a keyword-only search: call `search_documents("your query")` (or use Swagger UI)
3. Run a semantic search: call `search_documents("your query", use_semantic=True)`
4. Compare the ordering — semantic ranking often promotes results that better answer the question, even if they have fewer exact keyword matches

**What to look for:**

- `@search.score` (BM25) stays the same, but `@search.rerankerScore` provides a new ranking signal (0-4 scale)
- Captions show the most relevant passage from each result, saving you from reading the whole document
- Results with high keyword scores but low semantic relevance get pushed down

<checkpoint id="l7-compare"></checkpoint>

<details>
<summary>Full Solution</summary>

```python
def search_documents(query: str, use_semantic: bool = False) -> list[dict]:
    client = _get_search_client()

    search_kwargs = {
        "search_text": query,
        "top": 10,
        "include_total_count": True,
        "highlight_fields": "content",
    }

    if use_semantic:
        search_kwargs["query_type"] = "semantic"
        search_kwargs["semantic_configuration_name"] = "my-semantic-config"
        search_kwargs["query_caption"] = "extractive"

    results = client.search(**search_kwargs)
    items = []
    for result in results:
        item: dict = {
            "content": result.get("content", ""),
            "score": result.get("@search.score", 0.0),
        }
        if use_semantic:
            item["reranker_score"] = result.get("@search.rerankerScore", 0.0)
            captions = result.get("@search.captions")
            if captions:
                item["captions"] = [
                    {"text": c.text, "highlights": c.highlights}
                    for c in captions
                ]
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

### Exam Tips

- **Semantic ranking is a re-ranker, not a search mode.** It processes the top BM25 results, it does not perform its own retrieval. The exam may present it as an alternative to keyword search — it is not.
- **Know the tier availability:** Semantic ranking is available on all tiers (including Free with 1,000 queries/month). The exam may test whether you know the free plan exists and its limitations.
- **Captions vs answers:** Captions extract the most relevant passage. Answers attempt to extract a direct answer span. Both are optional features enabled via `query_caption` and `query_answer` parameters.
- **Reranker score range is 0--4.** BM25 scores are unbounded positive numbers (not normalized to a fixed range). Higher is better for both.
- **Semantic configuration is required** — you must define which fields the ranker reads. Without it, semantic queries fail.

---

<!-- section:layer:8 -->
## Layer 8: Vector Search with Embeddings

- Deploy an embedding model in Azure OpenAI
- Implement `get_embedding()` function
- Add a vector field and vector search configuration to the index schema
- Modify `upload_document()` to store embeddings
- Implement vector search with `VectorizedQuery`

### What You Will Learn

- How to generate text embeddings using Azure OpenAI
- How to define vector fields and vector search profiles in an index schema
- How to upload documents with embedding vectors
- How to execute vector-only search queries

> *Exam objective: "Implement Azure AI Search vector search solution"*

### Concepts

This layer turns the conceptual overview from Layer 5 into working code. You will wire together an embedding model, vector-enabled index schema, and vector search queries.

**Embedding model deployment:**

Deploy `text-embedding-3-small` (1536 dimensions, recommended) or `text-embedding-ada-002` (1536 dimensions, legacy) in your Azure OpenAI resource. Use the Azure portal:

> **Note:** While `text-embedding-ada-002` remains available (no retirement scheduled before April 2027), `text-embedding-3-small` is recommended for new deployments as it offers better performance and supports configurable dimensions.

1. Go to your Azure OpenAI resource > **Model deployments** > **Manage Deployments**
2. Click **Create new deployment**
3. Select `text-embedding-3-small` (preferred) or `text-embedding-ada-002`
4. Name the deployment (e.g., `text-embedding-3-small`) — note this name for your `.env`

Add to `backend/.env`:
```
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
```

> **Important:** You must also add the `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` field to the `Settings` class in `backend/app/config.py`:
> ```python
> AZURE_OPENAI_EMBEDDING_DEPLOYMENT: str = ""
> ```

**Vector field schema:**

A vector field requires:

| Property | Purpose | Example |
|----------|---------|---------|
| `type` | Must be `Collection(Edm.Single)` | Fixed for vector fields |
| `vector_search_dimensions` | Must match model output | `1536` for ada-002 |
| `vector_search_profile_name` | Links to a vector search profile | `"my-vector-profile"` |

**Vector search configuration** has three components:

1. **Algorithm configuration** — defines the approximate nearest neighbor (ANN) algorithm (HNSW or exhaustive KNN)
2. **Vector search profile** — links an algorithm to a field
3. **Vector field** — the actual field in the index schema

### Implementation

You need to implement four things in sequence.

**Step 1: Implement `get_embedding()`**

Create a function in `search_service.py` (or a new helper) that calls the Azure OpenAI embedding endpoint:

<details>
<summary>Hint: get_embedding() skeleton</summary>

```python
from openai import AzureOpenAI

def get_embedding(text: str) -> list[float]:
    """Generate an embedding vector for the given text."""
    client = AzureOpenAI(
        api_key=settings.AZURE_OPENAI_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    )
    response = client.embeddings.create(
        input=text,
        model=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
    )
    return response.data[0].embedding
```

</details>

<checkpoint id="l8-embed-func"></checkpoint>

**Step 2: Add vector field to index schema**

You need to recreate (or update) your index with vector search support. Use the `SearchIndexClient` to define the schema programmatically:

<details>
<summary>Hint: Vector index schema</summary>

```python
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
)

def create_vector_index() -> None:
    """Create or update the search index with vector field support."""
    index_client = SearchIndexClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SimpleField(
            name="source", type=SearchFieldDataType.String,
            filterable=True, retrievable=True,
        ),
        SearchableField(
            name="title", type=SearchFieldDataType.String,
            filterable=True,
        ),
        SimpleField(
            name="category", type=SearchFieldDataType.String,
            filterable=True, retrievable=True,
        ),
        SearchField(
            name="contentVector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="my-vector-profile",
        ),
    ]

    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(name="my-hnsw"),
        ],
        profiles=[
            VectorSearchProfile(
                name="my-vector-profile",
                algorithm_configuration_name="my-hnsw",
            ),
        ],
    )

    index = SearchIndex(
        name=settings.AZURE_SEARCH_INDEX,
        fields=fields,
        vector_search=vector_search,
    )
    index_client.create_or_update_index(index)
```

</details>

<checkpoint id="l8-vector-field"></checkpoint>

**Step 3: Modify `upload_document()` to store embeddings**

When uploading a document (or chunk), call `get_embedding()` on the content and include the vector in the document dict:

<details>
<summary>Hint: Upload with embeddings</summary>

```python
def upload_document(filename: str, content: str) -> None:
    client = _get_search_client()
    sanitized = filename.replace(" ", "_").replace(".", "_")

    if len(content) > 1000:
        chunks = _chunk_text(content)
        docs = []
        for i, chunk in enumerate(chunks):
            docs.append({
                "id": f"{sanitized}_chunk_{i}",
                "content": chunk,
                "contentVector": get_embedding(chunk),  # NEW
                "source": filename,
                "title": f"{filename} (part {i + 1})",
            })
        client.upload_documents(documents=docs)
    else:
        doc = {
            "id": sanitized,
            "content": content,
            "contentVector": get_embedding(content),  # NEW
            "source": filename,
            "title": filename,
        }
        client.upload_documents(documents=[doc])
```

</details>

<checkpoint id="l8-vector-upload"></checkpoint>

**Step 4: Implement vector search**

Add a `use_vector` parameter to `search_documents()` and construct a `VectorizedQuery`:

<details>
<summary>Hint: Vector search query</summary>

```python
from azure.search.documents.models import VectorizedQuery

def search_documents(
    query: str,
    use_semantic: bool = False,
    use_vector: bool = False,
) -> list[dict]:
    client = _get_search_client()

    search_kwargs = {
        "search_text": query,
        "top": 10,
        "include_total_count": True,
        "highlight_fields": "content",
    }

    if use_vector:
        query_vector = get_embedding(query)
        search_kwargs["vector_queries"] = [
            VectorizedQuery(
                vector=query_vector,
                k_nearest_neighbors=10,
                fields="contentVector",
            )
        ]
        # For vector-only search, clear search_text (hybrid keeps both)
        if not use_semantic:
            search_kwargs["search_text"] = None

    # ... semantic and result processing as before ...
```

</details>

<checkpoint id="l8-vector-query"></checkpoint>

### Test It

1. Run `create_vector_index()` once to update your index schema. You can run it from the backend directory:
   ```bash
   cd backend && python -c "from app.services.search_service import create_vector_index; create_vector_index()"
   ```
2. Re-upload your documents — they now include embeddings
3. Test vector search: call `search_documents("your query", use_vector=True)`
4. Search for a synonym of a word in your documents (e.g., "automobile" when documents say "car") — vector search should find matches that keyword search misses
5. Check the Azure portal: your index should now show the `contentVector` field with data

<details>
<summary>Full Solution</summary>

```python
from openai import AzureOpenAI
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
)

from app.config import settings


def get_embedding(text: str) -> list[float]:
    """Generate an embedding vector for the given text."""
    client = AzureOpenAI(
        api_key=settings.AZURE_OPENAI_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    )
    response = client.embeddings.create(
        input=text,
        model=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
    )
    return response.data[0].embedding


def create_vector_index() -> None:
    """Create or update the search index with vector support."""
    index_client = SearchIndexClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_KEY),
    )

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SimpleField(
            name="source", type=SearchFieldDataType.String,
            filterable=True, retrievable=True,
        ),
        SearchableField(
            name="title", type=SearchFieldDataType.String,
            filterable=True,
        ),
        SimpleField(
            name="category", type=SearchFieldDataType.String,
            filterable=True, retrievable=True,
        ),
        SearchField(
            name="contentVector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="my-vector-profile",
        ),
    ]

    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(name="my-hnsw"),
        ],
        profiles=[
            VectorSearchProfile(
                name="my-vector-profile",
                algorithm_configuration_name="my-hnsw",
            ),
        ],
    )

    index = SearchIndex(
        name=settings.AZURE_SEARCH_INDEX,
        fields=fields,
        vector_search=vector_search,
    )
    index_client.create_or_update_index(index)


def upload_document(filename: str, content: str) -> None:
    client = _get_search_client()
    sanitized = filename.replace(" ", "_").replace(".", "_")

    if len(content) > 1000:
        chunks = _chunk_text(content)
        docs = []
        for i, chunk in enumerate(chunks):
            docs.append({
                "id": f"{sanitized}_chunk_{i}",
                "content": chunk,
                "contentVector": get_embedding(chunk),
                "source": filename,
                "title": f"{filename} (part {i + 1})",
            })
        client.upload_documents(documents=docs)
    else:
        doc = {
            "id": sanitized,
            "content": content,
            "contentVector": get_embedding(content),
            "source": filename,
            "title": filename,
        }
        client.upload_documents(documents=[doc])


def search_documents(
    query: str,
    use_semantic: bool = False,
    use_vector: bool = False,
) -> list[dict]:
    client = _get_search_client()

    search_kwargs = {
        "search_text": query,
        "top": 10,
        "include_total_count": True,
        "highlight_fields": "content",
    }

    if use_vector:
        query_vector = get_embedding(query)
        search_kwargs["vector_queries"] = [
            VectorizedQuery(
                vector=query_vector,
                k_nearest_neighbors=10,
                fields="contentVector",
            )
        ]
        # For vector-only search, clear search_text (hybrid keeps both)
        if not use_semantic:
            search_kwargs["search_text"] = None

    if use_semantic:
        search_kwargs["query_type"] = "semantic"
        search_kwargs["semantic_configuration_name"] = "my-semantic-config"
        search_kwargs["query_caption"] = "extractive"
        # Semantic ranking needs search_text — keep it set even with vectors

    results = client.search(**search_kwargs)
    items = []
    for result in results:
        item: dict = {
            "content": result.get("content", ""),
            "score": result.get("@search.score", 0.0),
        }
        if use_semantic:
            item["reranker_score"] = result.get("@search.rerankerScore", 0.0)
            captions = result.get("@search.captions")
            if captions:
                item["captions"] = [
                    {"text": c.text, "highlights": c.highlights}
                    for c in captions
                ]
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

### Exam Tips

- **Know the embedding models:** `text-embedding-ada-002` (1536 dims), `text-embedding-3-small` (1536), `text-embedding-3-large` (3072). The exam asks which model to use and what dimension values to configure.
- **HNSW vs exhaustive KNN:** HNSW (Hierarchical Navigable Small World) is approximate but fast. Exhaustive KNN is exact but slow. HNSW is the default and recommended choice for production.
- **Vector field type is always `Collection(Edm.Single)`** — this stores a list of 32-bit floats.
- **The same embedding model must be used at index time and query time.** Mixing models produces meaningless similarity scores.
- **`k_nearest_neighbors`** controls how many results the vector search returns. This is separate from `top` which controls the final result count.
- **Vector search does not support highlighting** — there are no token matches to highlight. If you need highlights, use hybrid search (keyword + vector).

---

<!-- section:layer:9 -->
## Layer 9: Hybrid Search & Reranking Strategies

- Understand how hybrid search combines keyword and vector retrieval
- Learn how Reciprocal Rank Fusion (RRF) merges ranked lists
- Understand cross-encoder reranking and when to use it
- Compare search strategies for different RAG scenarios

### What You Will Learn

- How hybrid search runs keyword and vector queries simultaneously
- How RRF scoring works and why it is effective
- What cross-encoder reranking adds beyond RRF
- Which search strategy to choose for a given production scenario

> *Exam objective: "Implement a retrieval-augmented generation (RAG) solution"*

### Concepts

This layer is the capstone of the RAG search stack. You have built keyword search (Layer 3), semantic ranking (Layer 7), and vector search (Layer 8). Now you will understand how they combine in production.

**Hybrid Search**

Hybrid search runs **keyword search and vector search simultaneously** in a single query. Azure AI Search executes both searches in parallel, then merges the two ranked result lists into one using a fusion algorithm.

```python
# Hybrid search: both search_text AND vector_queries are provided
results = client.search(
    search_text="car maintenance schedule",        # keyword leg
    vector_queries=[
        VectorizedQuery(
            vector=get_embedding("car maintenance schedule"),  # vector leg
            k_nearest_neighbors=50,
            fields="contentVector",
        )
    ],
    top=10,
)
```

When `search_text` is provided AND `vector_queries` is provided, Azure AI Search runs both legs and fuses them. This is hybrid search — no special flag needed.

<checkpoint id="l9-hybrid-concept"></checkpoint>

**Reciprocal Rank Fusion (RRF)**

RRF is the algorithm Azure AI Search uses to merge the keyword and vector result lists. The concept is straightforward:

For each document that appears in either list, RRF computes a fused score:

```
RRF_score(doc) = sum over each list L:  1 / (k + rank_in_L)
```

Where `k` is a constant (default 60 in Azure AI Search) and `rank_in_L` is the document's position in that list (1-based). If a document does not appear in a list, it contributes 0 from that list.

**Worked example:**

| Document | Keyword Rank | Vector Rank | RRF Score |
|----------|-------------|-------------|-----------|
| Doc A | 1 | 5 | 1/(60+1) + 1/(60+5) = 0.0164 + 0.0154 = **0.0318** |
| Doc B | 10 | 1 | 1/(60+10) + 1/(60+1) = 0.0143 + 0.0164 = **0.0307** |
| Doc C | 2 | not found | 1/(60+2) + 0 = **0.0161** |
| Doc D | not found | 2 | 0 + 1/(60+2) = **0.0161** |

Final ranking: Doc A > Doc B > Doc C = Doc D.

**Why RRF works well:**

- It does not require the two score scales to be comparable (BM25 scores and vector cosine similarities are very different scales)
- Documents that rank well in **both** lists get boosted to the top
- It is simple, parameter-free (aside from k), and robust across domains

<checkpoint id="l9-rrf"></checkpoint>

**Cross-Encoder Reranking**

A **cross-encoder** is a transformer model that takes a (query, document) pair as input and produces a single relevance score. Unlike bi-encoder embeddings (where query and document are encoded separately), a cross-encoder reads both together, allowing it to capture fine-grained interactions.

In Azure AI Search, **semantic ranking** (Layer 7) functions as a cross-encoder reranker. It re-scores the top results from the initial retrieval (keyword, vector, or hybrid) using a Microsoft-hosted transformer.

**The full reranking pipeline for maximum relevance:**

```
User query
    |
    v
[Stage 1: Hybrid Search]  -- keyword + vector, fused via RRF
    |  (top 50 results)
    v
[Stage 2: Semantic Ranking]  -- cross-encoder re-scores top 50
    |  (reranked top 50)
    v
[Stage 3: Return top 10]  -- with captions and answers
```

This three-stage pipeline — hybrid retrieval, RRF fusion, semantic reranking — is the recommended approach for production RAG systems that need the best possible relevance.

**When to skip stages:**

- **Low-latency requirement:** Skip semantic ranking (it adds ~100-200ms latency)
- **Budget-constrained:** Free tier allows 1,000 semantic queries/month; beyond that, use hybrid without it
- **Exact-match critical:** Rely more on keyword leg (e.g., product SKU lookup)
- **Synonym-heavy domain:** Rely more on vector leg (e.g., medical terminology)

<checkpoint id="l9-reranker"></checkpoint>

**Search Strategy Decision Matrix**

| Scenario | Recommended Approach | Why |
|----------|---------------------|-----|
| Simple FAQ lookup with exact terms | Keyword only | Users search with exact terms from the FAQ |
| Semantic search over diverse content | Vector only | Captures meaning across varied vocabulary |
| General-purpose RAG pipeline | Hybrid (keyword + vector) | Best recall — covers both exact and semantic matches |
| High-stakes RAG (medical, legal) | Hybrid + semantic ranking | Maximum relevance; worth the latency |
| Real-time autocomplete | Keyword with prefix matching | Lowest latency, exact prefix matching needed |
| Multilingual document search | Vector only or hybrid | Embeddings capture cross-language similarity |

**Azure AI Search Search Modes Comparison**

| Mode | `search_text` | `vector_queries` | `query_type` | Fusion |
|------|---------------|-------------------|--------------|--------|
| Keyword only | set | omitted | `"simple"` or `"full"` | N/A |
| Vector only | `None` | set | N/A | N/A |
| Hybrid | set | set | `"simple"` or `"full"` | RRF |
| Hybrid + semantic | set | set | `"semantic"` | RRF + semantic reranking |
| Keyword + semantic | set | omitted | `"semantic"` | Semantic reranking only |

### Self-Check Questions

Test your understanding of hybrid search and reranking:

**Q1.** You run a hybrid search. Document X ranks #3 in the keyword list and #8 in the vector list. Document Y ranks #15 in the keyword list and #1 in the vector list. Using RRF with k=60, which document gets a higher fused score?

**Q2.** A developer sets `search_text="azure compute"` and also provides a `VectorizedQuery` but sets `query_type="semantic"`. What happens? How many stages of processing does this query go through?

**Q3.** Your RAG system returns irrelevant results when users ask questions with domain-specific jargon that does not appear in the documents. The documents use plain language equivalents. Which search leg (keyword or vector) is most likely to fix this, and why?

**Q4.** You are building a RAG system on the Azure AI Search Free tier. A colleague asks whether they can use semantic ranking. What do you tell them about availability and limitations?

<details>
<summary>Answers</summary>

**A1.** Doc X gets the higher score (0.0306 vs 0.0297):
- Doc X: 1/(60+3) + 1/(60+8) = 0.0159 + 0.0147 = **0.0306**
- Doc Y: 1/(60+15) + 1/(60+1) = 0.0133 + 0.0164 = **0.0297**

The strong keyword ranking (#3) combined with decent vector ranking (#8) beats a weak keyword ranking (#15) even with top vector ranking (#1). This illustrates how RRF rewards documents that perform well across both lists.

**A2.** This triggers the full three-stage pipeline: (1) keyword search produces BM25 results, (2) vector search produces nearest-neighbor results, (3) RRF fuses the two lists, (4) semantic ranking re-scores the top fused results using a cross-encoder. The query goes through three processing stages: hybrid retrieval, RRF fusion, and semantic reranking.

**A3.** The **vector leg** is most likely to fix this. Embedding models capture semantic similarity, so domain jargon and its plain-language equivalent will produce similar vectors. Keyword search requires exact token overlap and would miss these matches.

**A4.** Semantic ranking is available on the Free tier (with a 1,000 queries/month free plan), so you can use it for development and testing. For production workloads, you should use the Standard billing plan. Additionally, hybrid search (keyword + vector) with RRF fusion provides strong relevance even without semantic ranking and is available on all tiers with no query limits.

</details>

<checkpoint id="l9-questions"></checkpoint>

### Exam Tips

- **Know the three-stage pipeline:** hybrid retrieval -> RRF fusion -> semantic reranking. The exam tests understanding of this flow.
- **RRF does not require comparable score scales.** This is a key advantage over simple score averaging. The exam may ask why RRF is used instead of combining raw scores.
- **Hybrid search is triggered automatically** when both `search_text` and `vector_queries` are provided. There is no separate "hybrid mode" parameter.
- **Semantic ranking is additive** — it works on top of keyword, vector, or hybrid results. Setting `query_type="semantic"` enables it on whatever retrieval method you are using.
- **For the exam, "best relevance" almost always means hybrid + semantic ranking.** If a question asks how to maximize search quality for a RAG pipeline, this is the answer.
- **Know the tier details:** Semantic ranking is available on all tiers. Free tier includes 1,000 semantic queries/month; Standard billing plan is recommended for production.

---

<!-- section:exam-tips -->
## Exam Quiz

Test your understanding with these AI-102 style questions.

**Q1.** You need to upload a batch of 500 documents to an Azure AI Search index. A document with ID "doc-42" already exists in the index and you want to update only its `title` field without affecting other fields. Which method should you use?

A) `upload_documents()`
B) `merge_documents()`
C) `merge_or_upload_documents()`
D) `delete_documents()`

<details><summary>Answer</summary>

**B) `merge_documents()`** — Merge updates only the specified fields on an existing document. `upload_documents()` would replace the entire document. `merge_or_upload_documents()` would also work but `merge_documents()` is the most precise choice when you know the document exists.

</details>

**Q2.** A user searches for "car maintenance" but relevant documents use the word "automobile" instead. Which search approach would find these documents?

A) Full-text keyword search only
B) Full-text keyword search with an `en.lucene` analyzer
C) Vector search using embeddings
D) OData filter expressions

<details><summary>Answer</summary>

**C) Vector search using embeddings** — Vector search captures semantic similarity, so "car" and "automobile" would have similar embeddings. Keyword search (even with an English analyzer) would not match different words. Hybrid search (keyword + vector) would also work. Filters do not perform semantic matching.

</details>

**Q3.** You are building a RAG pipeline. The model sometimes ignores the retrieved context and answers from its training data. What is the most effective solution?

A) Increase the `temperature` parameter
B) Add a system message instructing the model to use only the provided context
C) Use a larger model with more parameters
D) Increase the number of retrieved documents to 100

<details><summary>Answer</summary>

**B) Add a system message instructing the model to use only the provided context** — A well-crafted system message that tells the model to answer only from the provided context and say when it doesn't know is the standard approach to reduce hallucination in RAG. Increasing temperature increases randomness. More documents may exceed the context window.

</details>

**Q4.** Your search index has a `content` field of type `Edm.String` with `searchable=true`. You want to also enable filtering by a `category` field. What attribute must the `category` field have?

A) `searchable`
B) `filterable`
C) `sortable`
D) `facetable`

<details><summary>Answer</summary>

**B) `filterable`** — To use a field in OData `$filter` expressions, it must be marked as `filterable`. `searchable` enables full-text search, `sortable` enables sorting, and `facetable` enables faceted navigation (category counts).

</details>

## Next Lab

Continue to **[Lab 03: Knowledge Mining](03-knowledge-mining.md)** to learn about index management, indexers, AI enrichment skillsets, and advanced query syntax — all key AI-102 exam topics that build on the search foundation you just created.
