"""简历相关的api路由都在这"""

import logging

from fastapi import APIRouter, File, UploadFile, HTTPException

from app.models.schemas import ResumeUploadResponse, MatchRequest, MatchResponse
from app.services.pdf_parser import generate_resume_id, extract_text_from_pdf, clean_text
from app.services.ai_extractor import extract_resume_info
from app.services.matcher import match_resume_to_job
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/resume", tags=["简历分析"])

# 内存缓存，服务器会话期间用；前端localStorage负责跨会话持久化
_resume_store: dict[str, dict] = {}  # resume_id -> {data, page_count, text_length}


@router.post("/upload", response_model=ResumeUploadResponse, summary="上传并解析简历")
async def upload_resume(file: UploadFile = File(..., description="PDF 格式简历文件")):
    """
    上传pdf简历，自动完成解析和ai提取
    pdf不落盘，全程在内存里走；历史记录由前端localStorage持久化
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="只支持pdf格式")

    content = await file.read()
    settings = get_settings()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"文件太大了 (限制{settings.MAX_FILE_SIZE // 1024 // 1024}MB)")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="文件是空的")

    resume_id = generate_resume_id(content)

    # 内存里有就直接返回，同一会话内避免重复调ai
    if resume_id in _resume_store:
        cached = _resume_store[resume_id]
        return ResumeUploadResponse(
            resume_id=resume_id,
            filename=file.filename,
            page_count=cached["page_count"],
            text_length=cached["text_length"],
            resume_data=cached["data"],
        )

    # 从内存bytes里解析pdf，不写磁盘
    try:
        raw_text, page_count = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"pdf解析失败: {e}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="pdf里没有提取到文字内容")

    cleaned_text = clean_text(raw_text)
    resume_data = await extract_resume_info(cleaned_text)

    _resume_store[resume_id] = {
        "data": resume_data,
        "page_count": page_count,
        "text_length": len(cleaned_text),
    }

    return ResumeUploadResponse(
        resume_id=resume_id,
        filename=file.filename,
        page_count=page_count,
        text_length=len(cleaned_text),
        resume_data=resume_data,
    )


@router.post("/match", response_model=MatchResponse, summary="简历与岗位匹配评分")
async def match_resume(req: MatchRequest):
    """
    拿岗位描述去和已解析的简历对比得分
    优先用前端传来的resume_data（从localStorage加载历史时），其次从内存里找
    """
    resume_data = req.resume_data
    if not resume_data:
        cached = _resume_store.get(req.resume_id)
        resume_data = cached["data"] if cached else None

    if not resume_data:
        raise HTTPException(status_code=404, detail="简历没找到，请重新上传")

    # 顺便补进内存，方便本次会话内后续操作
    if req.resume_id not in _resume_store:
        _resume_store[req.resume_id] = {
            "data": resume_data,
            "page_count": 0,
            "text_length": len(resume_data.raw_text),
        }

    match_score = await match_resume_to_job(resume_data, req.job_description)

    return MatchResponse(
        resume_id=req.resume_id,
        job_description=req.job_description,
        resume_data=resume_data,
        match_score=match_score,
    )
