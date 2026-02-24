# Azure AI Search service — implement following docs/labs/02-rag.md and docs/labs/03-knowledge-mining.md
# Quickstart: https://learn.microsoft.com/en-us/azure/search/search-get-started-text

from app.config import settings

# === LAYER 1: Document Upload (Lab 02, Layer 2) ===

### YOUR CODE STARTS HERE ###

# Step 1: Import SearchClient and AzureKeyCredential

### YOUR CODE ENDS HERE ###


def upload_document(filename, content):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a SearchClient using settings.AZURE_SEARCH_ENDPOINT,
    #         settings.AZURE_SEARCH_KEY, and settings.AZURE_SEARCH_INDEX
    # Step 2: Create a document dict with id, content, source, title fields
    # Step 3: Call client.upload_documents(documents=[doc])

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/02-rag.md — Layer 2")


# === LAYER 2: Search Query (Lab 02, Layer 3) ===


def search_documents(query):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a SearchClient using settings.AZURE_SEARCH_ENDPOINT,
    #         settings.AZURE_SEARCH_KEY, and settings.AZURE_SEARCH_INDEX
    # Step 2: Call client.search(search_text=query, top=10, highlight_fields="content")
    # Step 3: Loop over results, build list of dicts with content, score, source, highlights
    # Step 4: Return the list

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/02-rag.md — Layer 3")
