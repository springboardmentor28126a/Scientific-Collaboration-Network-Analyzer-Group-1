import os
from pydantic import Field, AnyUrl, validator
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Core settings
    DATABASE_URL: str = Field(default='sqlite:///./test.db', env='DATABASE_URL')
    SECRET_KEY: str = Field(default='mysecretkey', env='SECRET_KEY')
    ALGORITHM: str = Field(default='HS256', env='ALGORITHM')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env='ACCESS_TOKEN_EXPIRE_MINUTES')

    # File upload settings
    UPLOAD_DIRECTORY: str = Field(default='uploads', env='UPLOAD_DIRECTORY')
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, env='MAX_UPLOAD_SIZE_MB')
    ALLOWED_ORIGINS: List[str] = Field(default=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'], env='ALLOWED_ORIGINS')

    # Security
    @validator('ALLOWED_ORIGINS', pre=True)
    def split_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
        env_file_encoding = 'utf-8'
        case_sensitive = False

settings = Settings()
