import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ClickbaitResult:
    is_clickbait: bool
    score: float
    signals: list[str]
    explanation: str


_CLICKBAIT_PHRASES = [
    "you won't believe",
    "shocking truth",
    "what happened next",
    "one weird trick",
    "secret revealed",
    "going viral",
    "must see",
    "breaking news",
    "exclusive",
    "bombshell",
    "leaked",
    "exposed",
]

_CLICKBAIT_PATTERNS = [
    (r"\b\d+\s+(things|reasons|ways|facts|tricks|tips)\b", "Listicle"),
    (r"!{2,}", "Multiple Exclamation Marks"),
    (r"\b(BREAKING|URGENT|ALERT|WARNING)\b", "Alert Words"),
]


def detect_clickbait(text: str, title: Optional[str] = None):

    content = (title or "") + " " + text[:500]

    lowered = content.lower()

    score = 0
    signals = []

    for phrase in _CLICKBAIT_PHRASES:

        if phrase in lowered:

            signals.append(f'Phrase: "{phrase}"')

            score += 12

    for pattern, label in _CLICKBAIT_PATTERNS:

        if re.search(pattern, content, re.IGNORECASE):

            signals.append(label)

            score += 10

    caps = len(re.findall(r"\b[A-Z]{4,}\b", content))

    if caps > 2:

        signals.append("Too many ALL CAPS words")

        score += caps * 5

    score = min(score, 100)

    return ClickbaitResult(

        is_clickbait=score >= 25,

        score=score,

        signals=signals,

        explanation="Clickbait analysis completed."

    )