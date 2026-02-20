"""Azure Content Safety service — stub for guided lab implementation.

Students implement this file layer by layer following docs/labs/07-responsible-ai.md.
The router (safety.py) calls these functions — signatures must not change.
"""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


# === LAYER 1: Content Safety Analysis (Lab 07, Layer 1) ===
# TODO: Create a ContentSafetyClient and call analyze_text
# SDK: azure-ai-contentsafety
# Docs: https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-text
# See docs/labs/07-responsible-ai.md — Layer 1


def analyze_text(text: str) -> dict:
    """Analyze text for harmful content across safety categories.

    Called by: safety.router /api/safety/analyze-text
    Returns: Dict with "categories" list, each having name, severity (0-6), and label.
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_safety_analyze_text

        return mock_safety_analyze_text()
    raise NotImplementedError(
        "See docs/labs/07-responsible-ai.md — Layer 1. "
        "Hint: from azure.ai.contentsafety import ContentSafetyClient"
    )


# === LAYER 2: Severity Interpretation (Lab 07, Layer 2) ===
# Layer 2 is about understanding severity levels and building the label mapping.
# No new function — you enhance analyze_text with proper severity-to-label conversion.


# === LAYER 3: Prompt Shield (Lab 07, Layer 3) ===
# TODO: Use Content Safety to detect prompt injection / jailbreak attempts
# See docs/labs/07-responsible-ai.md — Layer 3


def check_prompt(prompt: str) -> dict:
    """Check if a prompt contains injection or jailbreak attempts.

    Called by: safety.router /api/safety/check-prompt
    Returns: Dict with "flagged" (bool) and optionally "reason" (str).
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_check_prompt

        return mock_check_prompt()
    raise NotImplementedError(
        "See docs/labs/07-responsible-ai.md — Layer 3. "
        "Hint: reuse _get_client() and AnalyzeTextOptions, then check severity > 2"
    )
