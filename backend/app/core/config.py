"""配置文件，所有环境变量都在这"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # 基础配置
    APP_NAME: str = "AI 赋能的智能简历分析系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # 跨域，开发的时候先全开着
    CORS_ORIGINS: list[str] = ["*"]

    # 上传文件大小限制
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB 应该够用了

    # AI 模型配置，OpenAI 格式兼容，默认用deepseek(以下API KEY是测试用的，正式部署请换成你自己的)
    AI_API_KEY: str = "sk-c0de4e5b8afd48df915b0bc4438350a6"
    AI_BASE_URL: str = "https://api.deepseek.com/v1"
    AI_MODEL: str = "deepseek-chat"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
