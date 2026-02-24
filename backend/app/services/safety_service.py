# Azure Content Safety service — implement following docs/labs/07-responsible-ai.md
# Quickstart: https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-text

from app.config import settings

# === LAYER 1: Content Safety Analysis (Lab 07, Layer 1) ===

### YOUR CODE STARTS HERE ###

# Step 1: Import ContentSafetyClient and AzureKeyCredential

### YOUR CODE ENDS HERE ###


def analyze_text(text):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a ContentSafetyClient using settings.AZURE_AI_SERVICES_ENDPOINT
    #         and settings.AZURE_AI_SERVICES_KEY
    # Step 2: Create AnalyzeTextOptions with the text
    # Step 3: Call client.analyze_text(options)
    # Step 4: Return dict with "categories" list (name, severity, label)

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/07-responsible-ai.md — Layer 1")


# === LAYER 2: Severity Interpretation (Lab 07, Layer 2) ===
# No new function — enhance analyze_text with severity-to-label conversion.


# === LAYER 3: Prompt Shield (Lab 07, Layer 3) ===


def check_prompt(prompt):
    ### YOUR CODE STARTS HERE ###

    # Step 1: Create a ContentSafetyClient
    # Step 2: Analyze the prompt text for harmful content
    # Step 3: Return dict with "flagged" (bool) and optionally "reason" (str)

    ### YOUR CODE ENDS HERE ###

    raise NotImplementedError("See docs/labs/07-responsible-ai.md — Layer 3")
