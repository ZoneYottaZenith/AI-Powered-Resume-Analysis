"""数据模型，各种请求响应的结构都在这定义"""

from pydantic import BaseModel, Field


class BasicInfo(BaseModel):
    """基本信息，姓名电话邮箱地址"""
    name: str | None = Field(None, description="姓名")
    phone: str | None = Field(None, description="电话")
    email: str | None = Field(None, description="邮箱")
    address: str | None = Field(None, description="地址")


class JobIntent(BaseModel):
    """求职意向之类的"""
    position: str | None = Field(None, description="求职意向")
    expected_salary: str | None = Field(None, description="期望薪资")


class BackgroundInfo(BaseModel):
    """背景信息，工作年限学历项目这些"""
    work_years: str | None = Field(None, description="工作年限")
    education: str | None = Field(None, description="学历背景")
    projects: list[str] = Field(default_factory=list, description="项目经历")


class ResumeData(BaseModel):
    """简历解析后的全部数据"""
    basic_info: BasicInfo = Field(default_factory=BasicInfo)
    job_intent: JobIntent = Field(default_factory=JobIntent)
    background: BackgroundInfo = Field(default_factory=BackgroundInfo)
    skills: list[str] = Field(default_factory=list, description="技能列表")
    raw_text: str = Field("", description="原始文本")


class ResumeUploadResponse(BaseModel):
    """上传接口的返回"""
    resume_id: str
    filename: str
    page_count: int
    text_length: int
    resume_data: ResumeData


class MatchRequest(BaseModel):
    """匹配请求的参数"""
    resume_id: str = Field(..., description="简历 ID")
    job_description: str = Field(..., description="岗位需求描述", min_length=5)
    resume_data: "ResumeData | None" = Field(None, description="简历数据（从localStorage加载历史时前端传来，后端无需查内存）")


class MatchScore(BaseModel):
    """匹配评分结果，四个维度"""
    overall_score: float = Field(..., description="综合匹配度 0-100")
    skill_match: float = Field(..., description="技能匹配率 0-100")
    experience_match: float = Field(..., description="经验相关性 0-100")
    education_match: float = Field(..., description="学历匹配度 0-100")
    ai_comment: str = Field("", description="AI 评语")
    matched_keywords: list[str] = Field(default_factory=list, description="匹配到的关键词")
    missing_keywords: list[str] = Field(default_factory=list, description="缺失的关键词")


class MatchResponse(BaseModel):
    """匹配接口的完整返回"""
    resume_id: str
    job_description: str
    resume_data: ResumeData
    match_score: MatchScore
