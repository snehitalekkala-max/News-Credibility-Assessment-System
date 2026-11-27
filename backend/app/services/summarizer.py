from dataclasses import dataclass
import nltk
import re


@dataclass
class SummaryResult:
    summary: str
    bullet_points: list
    word_count: int
    reading_time_seconds: int


def summarize_article(text: str):

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    try:
        sentences = nltk.sent_tokenize(text)
    except Exception:
        sentences = re.split(r'(?<=[.!?])\s+', text)

    # Remove very short and very long noisy sentences
    cleaned = []

    for s in sentences:

        s = s.strip()

        if 40 < len(s) < 250:
            cleaned.append(s)

    summary = " ".join(cleaned[:3])

    bullets = cleaned[:5]

    word_count = len(text.split())

    reading_time = max(1, word_count // 200)

    return SummaryResult(
        summary=summary,
        bullet_points=bullets,
        word_count=word_count,
        reading_time_seconds=reading_time * 60,
    )