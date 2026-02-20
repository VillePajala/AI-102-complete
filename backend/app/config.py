from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = ""
    AZURE_OPENAI_DALLE_DEPLOYMENT: str = "dall-e-3"
    AZURE_OPENAI_API_VERSION: str = "2024-06-01"

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


settings = Settings()
