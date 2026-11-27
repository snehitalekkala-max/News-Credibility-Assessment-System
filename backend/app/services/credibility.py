"""
Credibility scoring engine.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.config import TRUST_LEVELS


LABEL_BASE_SCORES = {
    "Real News": 85,
    "Fake News": 30,
}

RISK_TERMS = {
    "shocking",
    "secret",
    "miracle",
    "cure",
    "hoax",
    "conspiracy",
    "exposed",
    "unbelievable",
    "urgent",
    "forward",
    "viral",
    "guaranteed",
}

TRUST_TERMS = {
    "official",
    "verified",
    "audited",
    "published",
    "study",
    "report",
    "data",
    "evidence",
    "confirmed",
    "research",
    "peer reviewed",
}


@dataclass
class CredibilityAssessment:
    score: int
    trust_level: str
    reasons: list


def trust_level(score: int) -> str:
    for low, high, label in TRUST_LEVELS:
        if low <= score <= high:
            return label
    return "Unknown"


def determine_credibility(text: str, prediction: dict) -> CredibilityAssessment:
    """
    Calculates a credibility score using the ML prediction.
    """

    lowered = text.lower()

    label = prediction.get("prediction", "Fake News")
    confidence = prediction.get("confidence", 50)

    base = LABEL_BASE_SCORES.get(label, 50)

    confidence_adjustment = (confidence - 50) * 0.25

    score = base + confidence_adjustment

    reasons = [
        f"Model predicted {label} with {confidence:.2f}% confidence."
    ]

    risk_hits = sorted(
        term for term in RISK_TERMS
        if term in lowered
    )

    trust_hits = sorted(
        term for term in TRUST_TERMS
        if term in lowered
    )

    score -= min(len(risk_hits) * 4, 18)
    score += min(len(trust_hits) * 3, 15)

    if risk_hits:
        reasons.append(
            "Risk language detected: "
            + ", ".join(risk_hits[:5])
        )

    if trust_hits:
        reasons.append(
            "Evidence-oriented language detected: "
            + ", ".join(trust_hits[:5])
        )

    if len(text.split()) < 60:
        score -= 6
        reasons.append(
            "Short article length reduces assessment reliability."
        )

    if re.search(r"!{2,}|\?{2,}", text):
        score -= 5
        reasons.append(
            "Sensational punctuation detected."
        )

    final_score = max(0, min(100, round(score)))

    return CredibilityAssessment(
        score=final_score,
        trust_level=trust_level(final_score),
        reasons=reasons,
    )