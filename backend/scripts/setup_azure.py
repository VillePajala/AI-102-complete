#!/usr/bin/env python3
"""Automated Azure resource setup for AI-102 Command Center.

Creates all required Azure resources using the Azure CLI (`az`) and
populates backend/.env with the connection strings.

Usage:
    python backend/scripts/setup_azure.py
    python backend/scripts/setup_azure.py --resource-group rg-ai102 --region eastus
    python backend/scripts/setup_azure.py --prefix myprefix --region swedencentral

Requirements:
    - Azure CLI installed and logged in (`az login`)
    - An active Azure subscription
    - No extra Python dependencies (uses stdlib only)

Resources created:
    1. Resource Group
    2. Azure OpenAI (+ gpt-4o-mini and dall-e-3 deployments)
    3. Azure AI Services (multi-service: Vision, Language, Speech)
    4. Azure AI Search (Free tier)
    5. Azure Content Safety (Free tier)
"""

import argparse
import json
import os
import pathlib
import subprocess
import sys
import time

BACKEND_DIR = pathlib.Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def run_az(args: list[str], check: bool = True) -> dict | list | str:
    """Run an `az` command and return parsed JSON output."""
    cmd = ["az"] + args + ["--output", "json"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if check and result.returncode != 0:
        stderr = result.stderr.strip()
        # Treat "already exists" as success
        if "already exists" in stderr.lower() or "conflict" in stderr.lower():
            print(f"  (already exists, skipping)")
            return {}
        print(f"ERROR: {' '.join(cmd)}", file=sys.stderr)
        print(stderr, file=sys.stderr)
        sys.exit(1)
    if not result.stdout.strip():
        return {}
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return result.stdout.strip()


def wait_for_deployment(resource_group: str, account_name: str, deployment_name: str, timeout: int = 120) -> None:
    """Poll until a cognitive services deployment succeeds."""
    for _ in range(timeout // 5):
        try:
            result = run_az([
                "cognitiveservices", "account", "deployment", "show",
                "--resource-group", resource_group,
                "--name", account_name,
                "--deployment-name", deployment_name,
            ], check=False)
            if isinstance(result, dict):
                state = result.get("properties", {}).get("provisioningState", "")
                if state.lower() == "succeeded":
                    return
        except Exception:
            pass
        time.sleep(5)
    print(f"  Warning: deployment {deployment_name} did not reach 'Succeeded' within {timeout}s")


# ---------------------------------------------------------------------------
# Resource creation functions
# ---------------------------------------------------------------------------

def create_resource_group(name: str, region: str) -> None:
    print(f"\n1/5  Resource Group: {name}")
    run_az(["group", "create", "--name", name, "--location", region])
    print(f"  Created in {region}")


def create_openai(resource_group: str, name: str, region: str) -> dict:
    print(f"\n2/5  Azure OpenAI: {name}")
    run_az([
        "cognitiveservices", "account", "create",
        "--resource-group", resource_group,
        "--name", name,
        "--kind", "OpenAI",
        "--sku", "S0",
        "--location", region,
        "--yes",
    ])

    # Deploy gpt-4o-mini
    print("  Deploying gpt-4o-mini...")
    run_az([
        "cognitiveservices", "account", "deployment", "create",
        "--resource-group", resource_group,
        "--name", name,
        "--deployment-name", "gpt-4o-mini",
        "--model-name", "gpt-4o-mini",
        "--model-version", "2024-07-18",
        "--model-format", "OpenAI",
        "--sku-capacity", "10",
        "--sku-name", "GlobalStandard",
    ])
    wait_for_deployment(resource_group, name, "gpt-4o-mini")

    # Deploy dall-e-3
    print("  Deploying dall-e-3...")
    run_az([
        "cognitiveservices", "account", "deployment", "create",
        "--resource-group", resource_group,
        "--name", name,
        "--deployment-name", "dall-e-3",
        "--model-name", "dall-e-3",
        "--model-version", "3.0",
        "--model-format", "OpenAI",
        "--sku-capacity", "1",
        "--sku-name", "Standard",
    ])
    wait_for_deployment(resource_group, name, "dall-e-3")

    # Get keys
    keys = run_az([
        "cognitiveservices", "account", "keys", "list",
        "--resource-group", resource_group,
        "--name", name,
    ])
    endpoint_info = run_az([
        "cognitiveservices", "account", "show",
        "--resource-group", resource_group,
        "--name", name,
    ])
    endpoint = endpoint_info.get("properties", {}).get("endpoint", "") if isinstance(endpoint_info, dict) else ""
    key = keys.get("key1", "") if isinstance(keys, dict) else ""
    print(f"  Endpoint: {endpoint}")
    return {"endpoint": endpoint, "key": key}


def create_ai_services(resource_group: str, name: str, region: str) -> dict:
    print(f"\n3/5  Azure AI Services (multi-service): {name}")
    run_az([
        "cognitiveservices", "account", "create",
        "--resource-group", resource_group,
        "--name", name,
        "--kind", "CognitiveServices",
        "--sku", "S0",
        "--location", region,
        "--yes",
    ])
    keys = run_az([
        "cognitiveservices", "account", "keys", "list",
        "--resource-group", resource_group,
        "--name", name,
    ])
    endpoint_info = run_az([
        "cognitiveservices", "account", "show",
        "--resource-group", resource_group,
        "--name", name,
    ])
    endpoint = endpoint_info.get("properties", {}).get("endpoint", "") if isinstance(endpoint_info, dict) else ""
    key = keys.get("key1", "") if isinstance(keys, dict) else ""
    print(f"  Endpoint: {endpoint}")
    return {"endpoint": endpoint, "key": key, "region": region}


def create_search(resource_group: str, name: str, region: str) -> dict:
    print(f"\n4/5  Azure AI Search (Free tier): {name}")
    run_az([
        "search", "service", "create",
        "--resource-group", resource_group,
        "--name", name,
        "--sku", "free",
        "--location", region,
    ])
    keys = run_az([
        "search", "admin-key", "show",
        "--resource-group", resource_group,
        "--service-name", name,
    ])
    key = keys.get("primaryKey", "") if isinstance(keys, dict) else ""
    endpoint = f"https://{name}.search.windows.net/"
    print(f"  Endpoint: {endpoint}")
    return {"endpoint": endpoint, "key": key}


def create_content_safety(resource_group: str, name: str, region: str) -> dict:
    print(f"\n5/5  Azure Content Safety (Free tier): {name}")
    run_az([
        "cognitiveservices", "account", "create",
        "--resource-group", resource_group,
        "--name", name,
        "--kind", "ContentSafety",
        "--sku", "F0",
        "--location", region,
        "--yes",
    ])
    keys = run_az([
        "cognitiveservices", "account", "keys", "list",
        "--resource-group", resource_group,
        "--name", name,
    ])
    endpoint_info = run_az([
        "cognitiveservices", "account", "show",
        "--resource-group", resource_group,
        "--name", name,
    ])
    endpoint = endpoint_info.get("properties", {}).get("endpoint", "") if isinstance(endpoint_info, dict) else ""
    key = keys.get("key1", "") if isinstance(keys, dict) else ""
    print(f"  Endpoint: {endpoint}")
    return {"endpoint": endpoint, "key": key}


# ---------------------------------------------------------------------------
# .env generation
# ---------------------------------------------------------------------------

def write_env(
    openai: dict,
    ai_services: dict,
    search: dict,
    content_safety: dict,
) -> None:
    """Write or update backend/.env with all connection strings."""
    lines = [
        "# ============================================================",
        "# AI-102 Command Center — Auto-generated by setup_azure.py",
        "# ============================================================",
        "",
        "DEMO_MODE=false",
        "",
        "# --- Azure OpenAI ---",
        f"AZURE_OPENAI_ENDPOINT={openai['endpoint']}",
        f"AZURE_OPENAI_KEY={openai['key']}",
        "AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini",
        "AZURE_OPENAI_DALLE_DEPLOYMENT=dall-e-3",
        "AZURE_OPENAI_API_VERSION=2024-10-21",
        "",
        "# --- Azure AI Search ---",
        f"AZURE_SEARCH_ENDPOINT={search['endpoint']}",
        f"AZURE_SEARCH_KEY={search['key']}",
        "AZURE_SEARCH_INDEX=ai102-index",
        "",
        "# --- Azure AI Services (Vision, Language, Speech) ---",
        f"AZURE_AI_SERVICES_ENDPOINT={ai_services['endpoint']}",
        f"AZURE_AI_SERVICES_KEY={ai_services['key']}",
        "",
        "# --- Translator (uses AI Services key) ---",
        "AZURE_TRANSLATOR_KEY=",
        f"AZURE_TRANSLATOR_REGION={ai_services['region']}",
        "",
        "# --- Speech (uses AI Services key) ---",
        f"AZURE_SPEECH_KEY={ai_services['key']}",
        f"AZURE_SPEECH_REGION={ai_services['region']}",
        "",
        "# --- Document Intelligence (optional) ---",
        "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=",
        "AZURE_DOCUMENT_INTELLIGENCE_KEY=",
        "",
        "# --- Content Safety ---",
        f"AZURE_CONTENT_SAFETY_ENDPOINT={content_safety['endpoint']}",
        f"AZURE_CONTENT_SAFETY_KEY={content_safety['key']}",
        "",
    ]

    if ENV_FILE.exists():
        backup = ENV_FILE.with_suffix(".env.bak")
        ENV_FILE.rename(backup)
        print(f"\n  Backed up existing .env to {backup.name}")

    ENV_FILE.write_text("\n".join(lines))
    print(f"  Wrote {ENV_FILE}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create Azure resources for AI-102 Command Center labs.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python backend/scripts/setup_azure.py\n"
            "  python backend/scripts/setup_azure.py --prefix ai102-jane --region swedencentral\n"
            "  python backend/scripts/setup_azure.py --resource-group rg-existing --region eastus\n"
        ),
    )
    parser.add_argument(
        "--resource-group", default="rg-ai102-labs",
        help="Resource group name (default: rg-ai102-labs)",
    )
    parser.add_argument(
        "--region", default="swedencentral",
        help="Azure region (default: swedencentral — supports OpenAI + DALL-E)",
    )
    parser.add_argument(
        "--prefix", default="ai102",
        help="Prefix for resource names (default: ai102)",
    )
    args = parser.parse_args()

    rg = args.resource_group
    region = args.region
    prefix = args.prefix

    print("=" * 60)
    print("AI-102 Command Center — Azure Resource Setup")
    print("=" * 60)
    print(f"Resource group: {rg}")
    print(f"Region:         {region}")
    print(f"Prefix:         {prefix}")
    print(f"Env file:       {ENV_FILE}")

    # Check az CLI is available and logged in
    try:
        account = run_az(["account", "show"])
        if isinstance(account, dict):
            sub_name = account.get("name", "unknown")
            print(f"Subscription:   {sub_name}")
    except FileNotFoundError:
        print("ERROR: Azure CLI (az) not found. Install it: https://aka.ms/installazurecli", file=sys.stderr)
        sys.exit(1)

    create_resource_group(rg, region)
    openai = create_openai(rg, f"{prefix}-openai", region)
    ai_services = create_ai_services(rg, f"{prefix}-ai-services", region)
    search = create_search(rg, f"{prefix}-search", region)
    content_safety = create_content_safety(rg, f"{prefix}-content-safety", region)

    write_env(openai, ai_services, search, content_safety)

    print("\n" + "=" * 60)
    print("Setup complete!")
    print("=" * 60)
    print(f"\nYour backend/.env has been populated with all connection strings.")
    print("Start the backend with:")
    print("  cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000")
    print("\nTo delete all resources when done:")
    print(f"  az group delete --name {rg} --yes --no-wait")


if __name__ == "__main__":
    main()
