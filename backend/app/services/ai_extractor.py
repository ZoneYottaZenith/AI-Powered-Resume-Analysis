"""ai提取服务，调llm从简历文本里抽结构化信息出来"""

import json
import logging
import traceback

from openai import AsyncOpenAI

from app.core.config import get_settings
from app.models.schemas import ResumeData, BasicInfo, JobIntent, BackgroundInfo

logger = logging.getLogger(__name__)

EXTRACT_PROMPT = """你是一个专业的简历信息提取助手。请从以下简历文本中提取结构化信息，严格以 JSON 格式输出。

要求提取的字段和精确的 JSON 结构：
```json
{{
  "basic_info": {{
    "name": "姓名",
    "phone": "电话号码",
    "email": "邮箱地址",
    "address": "所在地址"
  }},
  "job_intent": {{
    "position": "求职意向",
    "expected_salary": "期望薪资"
  }},
  "background": {{
    "work_years": "工作年限",
    "education": "学历背景",
    "projects": ["项目经历简述1", "项目经历简述2"]
  }},
  "skills": ["技能1", "技能2", "技能3"]
}}
```

规则：
1. 无法确定的字段填 null
2. phone 格式保留原始格式
3. skills 只提取具体技能名称，如 "Python"、"Docker"、"React" 等
4. projects 每项简述不超过 50 字
5. 仅输出上述格式的 JSON，不要额外解释

简历文本：
{resume_text}
"""


async def extract_resume_info(text: str) -> ResumeData:
    """调ai模型提取简历信息，失败了就返回空的"""
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.AI_API_KEY, base_url=settings.AI_BASE_URL, timeout=60.0)

    logger.info("开始 AI 提取，文本长度: %d，模型: %s，API: %s", len(text), settings.AI_MODEL, settings.AI_BASE_URL)

    try:
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "你是专业的简历解析助手。请严格按照用户要求的 JSON 格式输出结果。"},
                {"role": "user", "content": EXTRACT_PROMPT.format(resume_text=text[:8000])},
            ],
            temperature=0.1,
        )

        raw = response.choices[0].message.content
        logger.info("AI 原始响应: %s", raw[:500])

        # 尝试从响应中抽 json，有时候模型会用markdown代码块包住..
        json_str = raw.strip()
        if json_str.startswith("```"):
            # 去掉markdown代码块
            lines = json_str.split("\n")
            json_str = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        data = json.loads(json_str)
        logger.info("AI 解析字段: %s", list(data.keys()))

        return ResumeData(
            basic_info=BasicInfo(**(data.get("basic_info") or {})),
            job_intent=JobIntent(**(data.get("job_intent") or {})),
            background=BackgroundInfo(**(data.get("background") or {})),
            skills=data.get("skills") or [],
            raw_text=text,
        )
    except Exception as e:
        logger.error("ai提取失败了: %s\n%s", e, traceback.format_exc())
        # 降级处理，返回只有原始文本的结果
        return ResumeData(raw_text=text)
