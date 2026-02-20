# Lab 02: RAG Engine

> **Exam domains:** D2 — Implement generative AI solutions (15-20%) + D6 — Knowledge mining (15-20%)
> **Service file:** `backend/app/services/search_service.py`
> **Estimated time:** 90-120 minutes
> **Estimated Azure cost:** $0 if using the **Free (F)** tier for Azure AI Search. The Free tier allows 3 indexes and 50 MB storage — plenty for this lab. Azure OpenAI costs from Lab 01 apply for the RAG chat in Layer 6 (a few cents).

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

## Azure Setup

- [ ] Create Azure AI Search resource
- [ ] Create search index (`ai102-index`) in portal
- [ ] Configure `backend/.env` with search endpoint and key
- [ ] Restart backend server

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

---

## Layer 1: Create a Search Index (Azure Portal)

- [ ] Create index with required fields in Azure Portal
- [ ] Verify index exists with 0 documents

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

### Test It

Verify the index exists:
- In the portal, go to your Search resource > Indexes
- You should see `ai102-index` with 0 documents

You can also test via the backend Swagger UI at `http://localhost:8000/docs` — the `/api/search/query` endpoint should return a `503` error about "not configured" (if your .env is not set) or `500` with `NotImplementedError` (if your .env IS set but the code is not yet implemented). Both are expected at this stage.

### Exam Tips

- **Know the field types:** `Edm.String`, `Edm.Int32`, `Edm.Double`, `Edm.Boolean`, `Edm.DateTimeOffset`, `Collection(Edm.String)`, `Edm.GeographyPoint`
- **Know which attributes to set:** The exam often asks which attribute to enable for a given scenario (e.g., "you need to filter by category" = filterable)
- **Key field must be `Edm.String`** and there is exactly one per index

---

## Layer 2: Upload Documents

- [ ] Add SDK imports to `search_service.py`
- [ ] Implement `_get_search_client()` helper
- [ ] Implement `upload_document()` function
- [ ] Test upload via frontend or Swagger UI

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

<details>
<summary>Hint: upload_document()</summary>

Think about:
- What fields does your index expect? (`id`, `content`, `source`, `title`)
- The `id` field cannot contain spaces or dots — sanitize the filename
- Use `client.upload_documents(documents=[doc])` to upload

</details>

### Test It

1. Start the backend: `cd backend && uvicorn app.main:app --reload --port 8000`
2. Go to `http://localhost:3000/search` (the Knowledge Mining page in the frontend)
3. Upload a `.txt` file using the upload feature
4. Check the Azure portal: go to your Search resource > Indexes > `ai102-index` — the document count should increase
5. Alternatively, test via Swagger UI at `http://localhost:8000/docs` — use the `/api/search/upload` endpoint

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

## Layer 3: Basic Search

- [ ] Implement `search_documents()` function
- [ ] Test search via frontend or Swagger UI

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

## Layer 4: Chunking Strategy

- [ ] Add `_chunk_text()` helper function
- [ ] Enhance `upload_document()` with chunking logic
- [ ] Test with a large document

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

### Test It

1. Create a longer text file (at least 2000+ characters) with multiple topics
2. Upload it via the frontend
3. Check the Azure portal — you should see multiple documents (one per chunk) instead of one
4. Search for a specific topic — you should get back just the relevant chunk(s), not the entire document

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

## Layer 5: Vector Search (Conceptual)

- [ ] Review vector search concepts
- [ ] Answer self-check questions

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

### Exam Tips

- **Know the three search modes:** keyword (full-text), vector, and hybrid. The exam often asks which to use for a given scenario.
- **Dimensions must match** between the embedding model and the vector field configuration.
- **Reciprocal Rank Fusion (RRF)** is how Azure AI Search merges keyword and vector results in hybrid mode. You don't need to know the math, but know the name and purpose.
- **Semantic ranking requires the Semantic plan** (Standard tier or higher, not Free). It is a re-ranker, not a search mode.
- **Embedding models in Azure OpenAI:** `text-embedding-ada-002` (1536 dims), `text-embedding-3-small` (1536), `text-embedding-3-large` (3072). Know that these are separate from chat/completion models.

---

## Layer 6: Grounded Chat (RAG)

- [ ] Verify RAG toggle works on `/generative` page
- [ ] Test grounded response with uploaded documents
- [ ] Test unrelated question — model should say context is insufficient

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
4. Ask a question that relates to your uploaded documents
5. The response should reference information from your documents
6. Ask a question about something NOT in your documents — the model should indicate that the context doesn't contain relevant information
7. Check the response for source citations

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

- [x] An Azure AI Search resource with an index (`ai102-index`)
- [x] `_get_search_client()` helper returning a configured `SearchClient`
- [x] `upload_document()` uploading documents (with chunking for large files)
- [x] `search_documents()` returning results with content, scores, highlights, and metadata
- [x] Working RAG: chat responses grounded in your uploaded documents
- [x] Understanding of vector search and hybrid search concepts

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

## Next Lab

Continue to **[Lab 03: Knowledge Mining](03-knowledge-mining.md)** to learn about index management, indexers, AI enrichment skillsets, and advanced query syntax — all key AI-102 exam topics that build on the search foundation you just created.
