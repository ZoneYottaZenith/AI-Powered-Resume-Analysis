"""pdf解析相关的，解析、清洗都在这，不存文件了"""

import hashlib
import io
import re

import pdfplumber


def generate_resume_id(content: bytes) -> str:
    """用文件内容的sha256生成id，同一份文件会得到同一个id，天然去重"""
    digest = hashlib.sha256(content).hexdigest()[:16]
    return f"resume_{digest}"


def extract_text_from_pdf(content: bytes) -> tuple[str, int]:
    """直接从内存里的pdf字节读文字，不落盘，返回 (文本, 页数)"""
    pages_text = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
    raw_text = "\n\n".join(pages_text)
    return raw_text, page_count


def clean_text(text: str) -> str:
    """清洗文本，去掉乱七八糟的字符"""
    # 多余的空行压缩一下
    text = re.sub(r"\n{3,}", "\n\n", text)
    # 每行前后的空格去掉
    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(lines)
    # 不可见字符去掉
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # 连续空格合并
    text = re.sub(r" {2,}", " ", text)
    return text.strip()
