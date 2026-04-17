"""API Key 管理路由，查看和更新大模型的key"""

import logging
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/key", tags=["Key管理"])

# .env文件在backend目录下（backend/app/api/key.py往上三级就是backend/）
_ENV_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    ".env",
)


def _mask_key(key: str) -> str:
    """把key打码，只露头尾各4位"""
    if not key or len(key) <= 10:
        return "**"
    return f"{key[:7]}****{key[-4:]}"


def _write_env(key_name: str, value: str) -> None:
    """往.env文件写入或更新一个配置项"""
    if os.path.exists(_ENV_FILE):
        with open(_ENV_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        pattern = rf"^{re.escape(key_name)}=.*$"
        if re.search(pattern, content, re.MULTILINE):
            content = re.sub(pattern, f"{key_name}={value}", content, flags=re.MULTILINE)
        else:
            content = content.rstrip("\n") + f"\n{key_name}={value}\n"
    else:
        content = f"{key_name}={value}\n"

    with open(_ENV_FILE, "w", encoding="utf-8") as f:
        f.write(content)


@router.get("", summary="查看当前API Key（打码）")
async def get_key():
    """返回当前使用的key信息，key做了打码处理"""
    s = get_settings()
    has_key = bool(s.AI_API_KEY and s.AI_API_KEY.strip())
    return {
        "has_key": has_key,
        "masked_key": _mask_key(s.AI_API_KEY) if has_key else "未设置",
        "base_url": s.AI_BASE_URL,
        "model": s.AI_MODEL,
    }


class UpdateKeyRequest(BaseModel):
    api_key: str


@router.post("", summary="更新API Key，立即生效")
async def update_key(req: UpdateKeyRequest):
    """写入新key到.env，清除缓存，下一次ai请求就用新key了"""
    new_key = req.api_key.strip()
    if not new_key:
        raise HTTPException(status_code=400, detail="key不能为空")

    try:
        _write_env("AI_API_KEY", new_key)
        # 清缓存，下次get_settings()会重新读.env
        get_settings.cache_clear()
        logger.info("API Key 已更新")
    except Exception as e:
        logger.error("写入.env失败: %s", e)
        raise HTTPException(status_code=500, detail=f"保存失败: {e}")

    # 验证一下是否读到了新key
    s = get_settings()
    return {
        "success": True,
        "masked_key": _mask_key(s.AI_API_KEY),
    }


@router.delete("", summary="清除当前API Key")
async def delete_key():
    """将AI_API_KEY设置为空字符串，下次ai请求会失败直到重新配置"""
    try:
        _write_env("AI_API_KEY", "")
        get_settings.cache_clear()
        logger.info("API Key 已清除")
    except Exception as e:
        logger.error("清除失败: %s", e)
        raise HTTPException(status_code=500, detail=f"清除失败: {e}")
    return {"success": True}
