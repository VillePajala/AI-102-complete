"""Mock data for demo mode — realistic responses without Azure API calls.

When DEMO_MODE=true in .env, service functions return these mocks instead of
calling Azure. This lets students explore the app UI and understand the
expected response shapes before setting up Azure resources.
"""


def mock_chat_completion() -> str:
    return (
        "This is a demo response from GPT. In production, this would be a "
        "real Azure OpenAI chat completion. The model would consider your "
        "message history, system instructions, and parameters like "
        "temperature and max_tokens to generate a contextual reply."
    )


def mock_generate_image() -> str:
    return "https://placehold.co/1024x1024/2563eb/ffffff?text=DALL-E+Demo+Image"


def mock_chat_with_tools() -> dict:
    return {
        "message": (
            "This is a demo agent response. In production, the agent would "
            "follow its system instructions and use the configured tools to "
            "answer your question."
        ),
        "tool_calls": [
            {
                "tool": "web_search",
                "input": "demo search query",
                "output": "Demo result: This is a simulated tool call.",
            }
        ],
    }


def mock_analyze_image() -> dict:
    return {
        "caption": "A sample image showing a city skyline at sunset",
        "description": "city, skyline, sunset, buildings, clouds, urban",
        "tags": ["city", "skyline", "sunset", "building", "cloud", "sky"],
        "objects": [
            {
                "name": "building",
                "confidence": 0.95,
                "boundingBox": {"x": 100, "y": 200, "w": 300, "h": 400},
            },
            {
                "name": "cloud",
                "confidence": 0.88,
                "boundingBox": {"x": 50, "y": 10, "w": 500, "h": 150},
            },
        ],
    }


def mock_ocr_image() -> dict:
    return {
        "text": [
            "DEMO OCR OUTPUT",
            "This is a simulated OCR result.",
            "In production, the Azure Read API would",
            "extract actual text from your image.",
            "Line 5: It handles printed and handwritten text.",
        ]
    }


def mock_analyze_text() -> dict:
    return {
        "sentiment": {
            "label": "positive",
            "scores": {"positive": 0.89, "neutral": 0.08, "negative": 0.03},
        },
        "keyPhrases": ["demo mode", "Azure AI services", "text analytics"],
        "entities": [
            {"text": "Azure", "category": "Organization", "confidence": 0.95},
            {"text": "AI-102", "category": "Other", "confidence": 0.87},
        ],
        "piiEntities": [
            {"text": "john@example.com", "category": "Email"},
        ],
        "language": {"name": "English", "iso": "en", "confidence": 0.99},
    }


def mock_translate_text() -> str:
    return "[Demo] Translated text would appear here."


def mock_speech_to_text() -> str:
    return "This is a demo transcription of the audio you uploaded."


def mock_text_to_speech() -> str:
    return "data:audio/mp3;base64,DEMO_AUDIO_DATA"


def mock_upload_document() -> None:
    return None


def mock_search_documents() -> list[dict]:
    return [
        {
            "content": (
                "Azure AI Search is a cloud search service that gives "
                "developers APIs and tools for building rich search "
                "experiences over private, heterogeneous content."
            ),
            "score": 8.5,
            "source": "demo-document.txt",
            "highlights": ["<em>Azure AI Search</em> is a cloud search service"],
            "metadata": {
                "title": "demo-document.txt",
                "source": "demo-document.txt",
            },
        },
        {
            "content": (
                "Retrieval-Augmented Generation (RAG) combines search with "
                "generative AI to ground responses in your own data."
            ),
            "score": 6.2,
            "source": "rag-overview.txt",
            "metadata": {
                "title": "rag-overview.txt",
                "source": "rag-overview.txt",
            },
        },
    ]


def mock_safety_analyze_text() -> dict:
    return {
        "categories": [
            {"name": "Hate", "severity": 0, "label": "Safe"},
            {"name": "SelfHarm", "severity": 0, "label": "Safe"},
            {"name": "Sexual", "severity": 0, "label": "Safe"},
            {"name": "Violence", "severity": 0, "label": "Safe"},
        ]
    }


def mock_check_prompt() -> dict:
    return {"flagged": False}


def mock_analyze_document(model_id: str = "prebuilt-invoice") -> dict:
    return {
        "model_id": model_id,
        "pages": [{"page_number": 1, "width": 8.5, "height": 11, "unit": "inch"}],
        "tables": [
            {
                "row_count": 3,
                "column_count": 3,
                "cells": [
                    {"row": 0, "column": 0, "content": "Item"},
                    {"row": 0, "column": 1, "content": "Quantity"},
                    {"row": 0, "column": 2, "content": "Price"},
                    {"row": 1, "column": 0, "content": "Widget A"},
                    {"row": 1, "column": 1, "content": "10"},
                    {"row": 1, "column": 2, "content": "$50.00"},
                    {"row": 2, "column": 0, "content": "Widget B"},
                    {"row": 2, "column": 1, "content": "5"},
                    {"row": 2, "column": 2, "content": "$75.00"},
                ],
            }
        ],
        "fields": {
            "VendorName": {"value": "Contoso Ltd.", "confidence": 0.95},
            "InvoiceDate": {"value": "2024-01-15", "confidence": 0.92},
            "InvoiceTotal": {"value": "$875.00", "confidence": 0.98},
            "CustomerName": {"value": "Northwind Traders", "confidence": 0.90},
        },
    }
