from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Ignore unrelated keys that may live in .env (e.g. GEMINI_API_KEY).
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ANTHROPIC_API_KEY: str
    OPENAI_API_KEY: str | None = None
    
settings = Settings()
