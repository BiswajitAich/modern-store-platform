from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    HOST: str = "0.0.0.0"
    PORT: int = 8001

    EMBEDDING_PROVIDER: str
    EMBEDDING_MODEL: str

settings = Settings()
