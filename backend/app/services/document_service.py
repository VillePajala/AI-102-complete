# Azure Document Intelligence service — implement following the lab guide
# Quickstart: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/quickstarts/get-started-sdks-rest-api

from app.config import settings

# === LAYER 1: Prebuilt Invoice Model ===

### YOUR CODE STARTS HERE ###

# Step 1: Import DocumentAnalysisClient and AzureKeyCredential

### YOUR CODE ENDS HERE ###


def analyze_document(document_bytes, model_id="prebuilt-invoice"):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a DocumentAnalysisClient using settings.AZURE_AI_SERVICES_ENDPOINT
    #         and settings.AZURE_AI_SERVICES_KEY
    # Step 2: Call client.begin_analyze_document(model_id, document_bytes)
    # Step 3: Get the result with .result()
    # Step 4: Return dict with "fields", "tables", "pages"

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs for Document Intelligence implementation")
