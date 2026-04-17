"""岗位匹配评分，简历和岗位需求对比得分"""

import json
import logging

from openai import AsyncOpenAI

from app.core.config import get_settings
from app.models.schemas import ResumeData, MatchScore

logger = logging.getLogger(__name__)

MATCH_PROMPT = """你是一个专业的招聘匹配评估助手。请根据以下简历信息和岗位需求，进行匹配分析并评分。

**简历结构化信息：**
- 姓名：{name}
- 技能：{skills}
- 工作年限：{work_years}
- 学历：{education}
- 项目经历：{projects}
- 求职意向：{position}

**简历原文（供参考，如结构化信息有遗漏可从此处补充）：**
{raw_text}

**岗位需求描述：**
{job_description}

**请严格按以下 JSON 格式输出评分结果：**
{{
  "overall_score": <0-100 综合匹配度>,
  "skill_match": <0-100 技能匹配率>,
  "experience_match": <0-100 工作经验相关性>,
  "education_match": <0-100 学历匹配度>,
  "ai_comment": "【技能匹配】<分析技能重合情况，指出亮点与缺口>\n【经验评估】<分析工作年限和项目经历与岗位的契合程度>\n【学历情况】<说明学历是否满足要求>\n【综合建议】<给候选人的针对性建议>",
  "matched_keywords": ["匹配到的技能/关键词"],
  "missing_keywords": ["岗位要求但简历缺失的关键词"]
}}

**评分规则：**
1. skill_match：简历技能与岗位需求的重合度
2. experience_match：根据岗位性质差异化评估（见下方第 6 条）
3. education_match：学历是否满足岗位要求；"在读"不等同于"已获得该学位"，若岗位明确要求已毕业或已取得学位，在读生应在此维度扣分
4. overall_score：加权综合，技能 50%、经验 30%、学历 20%
5. 仅输出 JSON
6. 岗位性质识别与 experience_match 评估规则（优先级最高，必须执行）：
   - 【实习岗】：岗位描述含"实习""见习""intern"等词时，候选人"在校生"身份是加分项；此时 experience_match 重点看项目经历、实习经历、课程实践、竞赛经历，不因 work_years 为 0 而扣分；学历维度重点看专业方向，在读生可视作满足条件
   - 【应届生岗】：岗位描述含"应届""应届毕业生""fresh grad"等词时，核心判断是"候选人能否在当年或次年校招季正式入职"：大四在读或当年内毕业者满分；大三视情况部分匹配；大二及以下距毕业超过 1 年，入职时间不符，experience_match 和 education_match 应体现此约束，不能因为"无工作经验=应届生"而打满分
   - 【经验岗/社招岗】：岗位要求 N 年工作经验时，work_years 和实际工作经历权重最高；在校期间的项目/课程经历只能作为加分项，不可等同于正式工作经验；在校生若无实习经历则 experience_match 应明显低于有经验候选人
"""


async def match_resume_to_job(resume_data: ResumeData, job_description: str) -> MatchScore:
    """让ai来对比简历和岗位的匹配度。打分"""
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.AI_API_KEY, base_url=settings.AI_BASE_URL, timeout=60.0)

    bg = resume_data.background
    try:
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "你是专业的招聘匹配评估助手，只输出合法 JSON。"},
                {
                    "role": "user",
                    "content": MATCH_PROMPT.format(
                        name=resume_data.basic_info.name or "未知",
                        skills=", ".join(resume_data.skills) if resume_data.skills else "未提取到",
                        work_years=bg.work_years or "未知",
                        education=bg.education or "未知",
                        projects="; ".join(bg.projects) if bg.projects else "未提取到",
                        position=resume_data.job_intent.position or "未知",
                        raw_text=resume_data.raw_text if resume_data.raw_text else "无",
                        job_description=job_description[:3000],
                    ),
                },
            ],
            temperature=0.2,
        )

        raw = response.choices[0].message.content

        # 和上面一样处理一下markdown代码块
        json_str = raw.strip()
        if json_str.startswith("```"):
            lines = json_str.split("\n")
            json_str = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        data = json.loads(json_str)

        return MatchScore(
            overall_score=float(data.get("overall_score", 0)),
            skill_match=float(data.get("skill_match", 0)),
            experience_match=float(data.get("experience_match", 0)),
            education_match=float(data.get("education_match", 0)),
            ai_comment=data.get("ai_comment", ""),
            matched_keywords=data.get("matched_keywords", []),
            missing_keywords=data.get("missing_keywords", []),
        )
    except Exception as e:
        logger.error("匹配评分失败了: %s", e)
        return MatchScore(
            overall_score=0,
            skill_match=0,
            experience_match=0,
            education_match=0,
            ai_comment=f"评分服务挂了: {e}",
        )
