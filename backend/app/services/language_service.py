"""Azure Language & Speech services — stub for guided lab implementation.

Students implement this file layer by layer following docs/labs/05-language.md.
The router (language.py) calls these functions — signatures must not change.
"""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


# === LAYER 1: Sentiment Analysis (Lab 05, Layer 1) ===
# TODO: Create a TextAnalyticsClient and call analyze_sentiment, extract_key_phrases,
#       recognize_entities, recognize_pii_entities, detect_language
# SDK: azure-ai-textanalytics
# Docs: https://learn.microsoft.com/en-us/azure/ai-services/language-service/sentiment-opinion-mining/quickstart
# See docs/labs/05-language.md — Layer 1


def analyze_text(text: str, analysis_type: str = "all") -> dict:
    """Analyze text for sentiment, key phrases, entities, PII, and language.

    Called by: language.router /api/language/analyze
    Args:
        text: The text to analyze.
        analysis_type: One of "all", "sentiment", "keyPhrases", "entities", "pii", "language".
    Returns: Dict with results for the requested analysis type(s).
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_analyze_text

        return mock_analyze_text()
    raise NotImplementedError(
        "See docs/labs/05-language.md — Layer 1. "
        "Hint: from azure.ai.textanalytics import TextAnalyticsClient"
    )


# === LAYER 2: NLP Features (Lab 05, Layer 2) ===
# Layer 2 extends analyze_text to handle entities, PII, and language detection.
# No new function — you add more analysis types to your Layer 1 implementation.


# === LAYER 3: Translation (Lab 05, Layer 3) ===
# TODO: Call the Azure Translator REST API using httpx
# API: https://api.cognitive.microsofttranslator.com/translate
# See docs/labs/05-language.md — Layer 3


def translate_text(text: str, source: str, target: str) -> str:
    """Translate text between languages using the Translator REST API.

    Called by: language.router /api/language/translate
    Args:
        text: The text to translate.
        source: Source language code (or "auto" for auto-detection).
        target: Target language code (e.g. "es", "fr", "de").
    Returns: The translated text string.
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_translate_text

        return mock_translate_text()
    raise NotImplementedError(
        "See docs/labs/05-language.md — Layer 3. "
        "Hint: import httpx — REST API call to api.cognitive.microsofttranslator.com"
    )


# === LAYER 4: Speech Services (Lab 05, Layer 4) ===
# TODO: Call the Azure Speech REST APIs for STT and TTS
# STT endpoint: https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1
# TTS endpoint: https://{region}.tts.speech.microsoft.com/cognitiveservices/v1
# See docs/labs/05-language.md — Layer 4


def speech_to_text(audio_bytes: bytes) -> str:
    """Convert speech audio to text using the Speech REST API.

    Called by: language.router /api/language/speech-to-text
    Args:
        audio_bytes: WAV audio file contents.
    Returns: The recognized text string.
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_speech_to_text

        return mock_speech_to_text()
    raise NotImplementedError(
        "See docs/labs/05-language.md — Layer 4. "
        "Hint: import httpx — POST audio/wav to {region}.stt.speech.microsoft.com"
    )


def text_to_speech(text: str) -> str:
    """Convert text to speech audio using the Speech REST API.

    Called by: language.router /api/language/text-to-speech
    Args:
        text: The text to synthesize.
    Returns: Base64 data URL string (data:audio/mp3;base64,...).
    """
    if settings.DEMO_MODE:
        from app.services.mock_data import mock_text_to_speech

        return mock_text_to_speech()
    raise NotImplementedError(
        "See docs/labs/05-language.md — Layer 4. "
        "Hint: import httpx, base64 — POST SSML to {region}.tts.speech.microsoft.com"
    )
