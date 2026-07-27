from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME="Scientific Collaboration Network Analyzer"
    VERSION="1.0.0"
settings=Settings()