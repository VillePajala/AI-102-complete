"""Azure Document Intelligence service — stub for guided lab implementation.

Students implement this file following the pattern of other services.
The router (documents.py) calls these functions — signatures must not change.
"""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


# === LAYER 1: Prebuilt Invoice Model ===
# TODO: Create a DocumentAnalysisClient and call begin_analyze_document
# SDK: azure-ai-formrecognizer
# Docs: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/quickstarts/get-started-sdks-rest-api


def analyze_document(document_bytes: bytes, model_id: str = "prebuilt-invoice") -> dict:
    """Analyze a document using a prebuilt or custom model.

    Called by: documents.router /api/documents/analyze
    Returns: Dict with keys like "fields", "tables", "pages".
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_analyze_document

        return mock_analyze_document(model_id)
    raise NotImplementedError(
        "See docs for Document Intelligence implementation. "
        "Hint: from azure.ai.formrecognizer import DocumentAnalysisClient"
    )
