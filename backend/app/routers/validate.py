"""Lab validation router — checks if student implementations work."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/validate", tags=["validate"])

# Maps each lab to its layers and the service function + minimal test args.
# Conceptual layers (no function to call) are marked with None.
LAB_LAYERS: dict[str, list[dict]] = {
    "01": [
        {
            "layer": 1,
            "name": "Chat Completion",
            "call": ("app.services.openai_service", "chat_completion"),
            "args": ([{"role": "user", "content": "Hi"}],),
            "kwargs": {},
        },
        {
            "layer": 2,
            "name": "Parameter Tuning",
            "conceptual": True,
        },
        {
            "layer": 3,
            "name": "DALL-E Image Generation",
            "call": ("app.services.openai_service", "generate_image"),
            "args": ("A blue circle",),
            "kwargs": {},
        },
    ],
    "02": [
        {
            "layer": 1,
            "name": "Create Search Index",
            "conceptual": True,
        },
        {
            "layer": 2,
            "name": "Upload Documents",
            "call": ("app.services.search_service", "upload_document"),
            "args": ("test_validate.txt", "validation test content"),
            "kwargs": {},
        },
        {
            "layer": 3,
            "name": "Basic Search",
            "call": ("app.services.search_service", "search_documents"),
            "args": ("test",),
            "kwargs": {},
        },
        {
            "layer": 4,
            "name": "Chunking Strategy",
            "conceptual": True,
        },
        {
            "layer": 5,
            "name": "Vector Search",
            "conceptual": True,
        },
        {
            "layer": 6,
            "name": "Grounded Chat (RAG)",
            "conceptual": True,
        },
    ],
    "03": [
        {
            "layer": 1,
            "name": "Index Management",
            "conceptual": True,
        },
        {
            "layer": 2,
            "name": "Data Sources and Indexers",
            "conceptual": True,
        },
        {
            "layer": 3,
            "name": "AI Enrichment Skillsets",
            "conceptual": True,
        },
        {
            "layer": 4,
            "name": "Advanced Query Syntax",
            "conceptual": True,
        },
    ],
    "04": [
        {
            "layer": 1,
            "name": "Image Analysis",
            "call": ("app.services.vision_service", "analyze_image"),
            "args": (b"fake-image-bytes",),
            "kwargs": {},
        },
        {
            "layer": 2,
            "name": "Object Detection",
            "conceptual": True,
        },
        {
            "layer": 3,
            "name": "OCR with Read API",
            "call": ("app.services.vision_service", "ocr_image"),
            "args": (b"fake-image-bytes",),
            "kwargs": {},
        },
    ],
    "05": [
        {
            "layer": 1,
            "name": "Sentiment Analysis",
            "call": ("app.services.language_service", "analyze_text"),
            "args": ("Test sentence.",),
            "kwargs": {"analysis_type": "sentiment"},
        },
        {
            "layer": 2,
            "name": "NLP Features",
            "conceptual": True,
        },
        {
            "layer": 3,
            "name": "Translation",
            "call": ("app.services.language_service", "translate_text"),
            "args": ("Hello", "en", "es"),
            "kwargs": {},
        },
        {
            "layer": 4,
            "name": "Speech Services",
            "call": ("app.services.language_service", "speech_to_text"),
            "args": (b"fake-audio",),
            "kwargs": {},
        },
    ],
    "06": [
        {
            "layer": 1,
            "name": "System Instructions + Tool Calls",
            "call": ("app.services.openai_service", "chat_with_tools"),
            "args": ([{"role": "user", "content": "Hi"}], "You are a test agent.", ["web_search"]),
            "kwargs": {},
        },
        {
            "layer": 2,
            "name": "Simulated Tool Parsing",
            "conceptual": True,
        },
        {
            "layer": 3,
            "name": "Grounding Concepts",
            "conceptual": True,
        },
    ],
    "07": [
        {
            "layer": 1,
            "name": "Content Safety Analysis",
            "call": ("app.services.safety_service", "analyze_text"),
            "args": ("Test sentence.",),
            "kwargs": {},
        },
        {
            "layer": 2,
            "name": "Severity Levels",
            "conceptual": True,
        },
        {
            "layer": 3,
            "name": "Prompt Shield",
            "call": ("app.services.safety_service", "check_prompt"),
            "args": ("Test prompt.",),
            "kwargs": {},
        },
    ],
}


def _validate_layer(layer_def: dict) -> dict:
    """Validate a single layer. Returns a result dict."""
    if layer_def.get("conceptual"):
        return {
            "layer": layer_def["layer"],
            "name": layer_def["name"],
            "status": "conceptual",
            "message": "Conceptual layer — no code to validate.",
        }

    module_path, func_name = layer_def["call"]
    try:
        import importlib

        module = importlib.import_module(module_path)
        func = getattr(module, func_name)
        func(*layer_def["args"], **layer_def["kwargs"])
        return {
            "layer": layer_def["layer"],
            "name": layer_def["name"],
            "status": "pass",
            "message": "Function executed successfully.",
        }
    except NotImplementedError:
        return {
            "layer": layer_def["layer"],
            "name": layer_def["name"],
            "status": "not_implemented",
            "message": "Stub — not yet implemented.",
        }
    except RuntimeError as exc:
        if "not configured" in str(exc).lower():
            return {
                "layer": layer_def["layer"],
                "name": layer_def["name"],
                "status": "implemented",
                "message": "Code is implemented but Azure credentials are not configured.",
            }
        return {
            "layer": layer_def["layer"],
            "name": layer_def["name"],
            "status": "error",
            "message": "Unexpected error occurred.",
        }
    except Exception as exc:
        return {
            "layer": layer_def["layer"],
            "name": layer_def["name"],
            "status": "error",
            "message": "Unexpected error occurred.",
        }


@router.get("/{lab}")
async def validate_lab(lab: str):
    """Validate all layers for a given lab (e.g., /api/validate/01)."""
    if lab not in LAB_LAYERS:
        return {"lab": lab, "error": "Unknown lab identifier."}

    results = [_validate_layer(layer_def) for layer_def in LAB_LAYERS[lab]]
    return {"lab": lab, "layers": results}


@router.get("")
async def validate_all():
    """Validate all labs at once."""
    all_results = {}
    for lab_id in sorted(LAB_LAYERS.keys()):
        results = [_validate_layer(layer_def) for layer_def in LAB_LAYERS[lab_id]]
        all_results[lab_id] = results
    return {"labs": all_results}
