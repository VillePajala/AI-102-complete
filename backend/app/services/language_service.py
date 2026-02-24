# Azure Language & Speech services — implement following docs/labs/05-language.md
# Quickstart: https://learn.microsoft.com/en-us/azure/ai-services/language-service/sentiment-opinion-mining/quickstart

from app.config import settings

# === LAYER 1: Sentiment Analysis (Lab 05, Layer 1) ===

### YOUR CODE STARTS HERE ###

# Step 1: Import TextAnalyticsClient and AzureKeyCredential

### YOUR CODE ENDS HERE ###


def analyze_text(text, analysis_type="all"):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a TextAnalyticsClient using settings.AZURE_AI_SERVICES_ENDPOINT
    #         and settings.AZURE_AI_SERVICES_KEY
    # Step 2: Based on analysis_type, call the appropriate method:
    #         "sentiment" → client.analyze_sentiment()
    #         "keyPhrases" → client.extract_key_phrases()
    #         "entities" → client.recognize_entities()
    #         "pii" → client.recognize_pii_entities()
    #         "language" → client.detect_language()
    #         "all" → call all of the above
    # Step 3: Return dict with results

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/05-language.md — Layer 1")


# === LAYER 2: NLP Features (Lab 05, Layer 2) ===
# No new function — add entities, PII, language detection to Layer 1.


# === LAYER 3: Translation (Lab 05, Layer 3) ===


def translate_text(text, source, target):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Import httpx
    # Step 2: POST to https://api.cognitive.microsofttranslator.com/translate
    # Step 3: Pass settings.AZURE_AI_SERVICES_KEY in Ocp-Apim-Subscription-Key header
    # Step 4: Return the translated text string

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/05-language.md — Layer 3")


# === LAYER 4: Speech Services (Lab 05, Layer 4) ===


def speech_to_text(audio_bytes):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Import httpx
    # Step 2: POST audio/wav to {region}.stt.speech.microsoft.com
    # Step 3: Return the recognized text string

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/05-language.md — Layer 4")


def text_to_speech(text):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Import httpx, base64
    # Step 2: POST SSML to {region}.tts.speech.microsoft.com
    # Step 3: Return base64 data URL string (data:audio/mp3;base64,...)

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/05-language.md — Layer 4")
