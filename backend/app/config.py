import logging

from pydantic import model_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Demo mode — return mock data without calling Azure
    DEMO_MODE: bool = False

    # CORS origins (comma-separated, e.g. "http://localhost:3000,https://myapp.com")
    CORS_ORIGINS: str = ""

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = ""
    AZURE_OPENAI_DALLE_DEPLOYMENT: str = "dall-e-3"
    AZURE_OPENAI_API_VERSION: str = "2024-10-21"

    # Azure AI Services (Computer Vision, etc.)
    AZURE_AI_SERVICES_ENDPOINT: str = ""
    AZURE_AI_SERVICES_KEY: str = ""

    # Azure AI Search
    AZURE_SEARCH_ENDPOINT: str = ""
    AZURE_SEARCH_KEY: str = ""
    AZURE_SEARCH_INDEX: str = "ai102-index"

    # Azure Document Intelligence
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: str = ""
    AZURE_DOCUMENT_INTELLIGENCE_KEY: str = ""

    # Azure Speech
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = ""

    # Azure Translator
    AZURE_TRANSLATOR_KEY: str = ""
    AZURE_TRANSLATOR_REGION: str = ""

    # Azure Content Safety
    AZURE_CONTENT_SAFETY_ENDPOINT: str = ""
    AZURE_CONTENT_SAFETY_KEY: str = ""

    class Config:
        env_file = ".env"

    @model_validator(mode="after")
    def _warn_missing_credentials(self) -> "Settings":
        if self.DEMO_MODE:
            return self
        missing = []
        if not self.AZURE_OPENAI_ENDPOINT or not self.AZURE_OPENAI_KEY:
            missing.append("AZURE_OPENAI_ENDPOINT/KEY")
        if not self.AZURE_AI_SERVICES_ENDPOINT or not self.AZURE_AI_SERVICES_KEY:
            missing.append("AZURE_AI_SERVICES_ENDPOINT/KEY")
        if missing:
            logger.warning(
                "DEMO_MODE is off but credentials missing: %s. "
                "Set DEMO_MODE=true or provide credentials.",
                ", ".join(missing),
            )
        return self


settings = Settings()
