import re
from dataclasses import dataclass

@dataclass
class BiasResult:
    detected: bool
    bias_types: list[str]
    score: float
    explanation: str
    flagged_phrases: list[str]


_POLITICAL_BIAS_TERMS = {
    "left", "right", "liberal", "conservative",
    "socialist", "fascist", "communist",
    "capitalist", "radical", "extremist",
    "woke", "patriot", "globalist",
    "nationalist", "progressive"
}

_EMOTIONAL_BIAS_TERMS = {
    "outrage", "disgusting", "shocking",
    "horrifying", "terrifying",
    "appalling", "catastrophic",
    "bombshell", "explosive"
}

_FRAMING_PATTERNS = [
    (r"\b(always|never|everyone|nobody)\b", "Absolute Language"),
    (r"\b(deep state|globalists?)\b", "Conspiracy Framing"),
]


def detect_bias(text: str):

    lowered = text.lower()

    words = set(re.findall(r"\b\w+\b", lowered))

    bias_types = []
    flagged = []
    score = 0

    political = words & _POLITICAL_BIAS_TERMS

    if political:
        bias_types.append("Political")
        flagged.extend(list(political))
        score += min(len(political) * 8, 30)

    emotional = words & _EMOTIONAL_BIAS_TERMS

    if emotional:
        bias_types.append("Emotional")
        flagged.extend(list(emotional))
        score += min(len(emotional) * 7, 25)

    for pattern, label in _FRAMING_PATTERNS:

        if re.search(pattern, lowered):

            bias_types.append(label)

            score += 10

    score = min(score, 100)

    return BiasResult(

        detected=score >= 15,

        bias_types=list(set(bias_types)),

        score=score,

        explanation="Bias analysis completed.",

        flagged_phrases=list(set(flagged))

    )