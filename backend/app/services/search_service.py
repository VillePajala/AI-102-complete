"""Azure AI Search service — stub for guided lab implementation.

Students implement this file layer by layer following docs/labs/02-rag.md and docs/labs/03-knowledge-mining.md.
The routers (search.py, generative.py) call these functions — signatures must not change.
"""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


# === LAYER 1: Document Upload (Lab 02, Layer 2) ===
# TODO: Create a SearchClient and upload documents to the search index
# SDK: azure-search-documents
# Docs: https://learn.microsoft.com/en-us/azure/search/search-get-started-text
# See docs/labs/02-rag.md — Layer 2


def upload_document(filename: str, content: str) -> None:
    """Upload a document to the Azure AI Search index.

    Called by: search.router /api/search/upload
    Args:
        filename: Name of the document file.
        content: Text content of the document.
    """
    raise NotImplementedError(
        "See docs/labs/02-rag.md — Layer 2. "
        "Hint: from azure.search.documents import SearchClient"
    )


# === LAYER 2: Search Query (Lab 02, Layer 3) ===
# TODO: Create a SearchClient and call client.search with text queries
# See docs/labs/02-rag.md — Layer 3


def search_documents(query: str) -> list[dict]:
    """Search the Azure AI Search index and return matching documents.

    Called by: search.router /api/search/query AND generative.router (for RAG)
    Args:
        query: The search query string.
    Returns: List of dicts with keys: content, score, source, highlights, metadata.
    """
    raise NotImplementedError(
        "See docs/labs/02-rag.md — Layer 3. "
        "Hint: client.search(search_text=query, top=10, highlight_fields='content')"
    )
