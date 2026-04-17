"""fastapi应用入口，启动铺子就这个文件"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.resume import router as resume_router
from app.api.key import router as key_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.info("%s v%s 启动", settings.APP_NAME, settings.APP_VERSION)
    yield
    logging.info("应用关闭")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI 赋能的智能简历分析系统 —— 自动解析简历、提取关键信息、岗位匹配评分",
        lifespan=lifespan,
    )

    # 跨域先全开
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册路由
    app.include_router(resume_router)
    app.include_router(key_router)

    @app.get("/", tags=["健康检查"])
    async def health():
        return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
