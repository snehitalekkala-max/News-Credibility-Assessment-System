import os
import re
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were",
    "to", "of", "in", "on", "at", "for", "from",
    "and", "or", "but", "with", "by", "as", "it",
    "this", "that", "these", "those", "has", "have",
    "had", "be", "been", "being", "will", "would",
    "could", "should", "into", "about", "after",
    "before", "during", "through", "over", "under",
    "show", "shows", "showed", "video", "image",
    "photo", "footage", "viral", "claim", "claims"
}

NEGATION_WORDS = {
    "not",
    "never",
    "no",
    "didn't",
    "didnt",
    "doesn't",
    "doesnt",
    "wasn't",
    "wasnt",
    "weren't",
    "werent",
    "false",
    "fake"
}

OPPOSITE_PAIRS = [
    ("won", "lost"),
    ("win", "lose"),
    ("wins", "loses"),
    ("winner", "loser"),
    ("victory", "defeat"),
    ("alive", "dead"),
    ("approved", "rejected"),
    ("accepted", "rejected"),
    ("increased", "decreased"),
    ("rise", "fall"),
    ("true", "false")
]

RELATION_NOISE_WORDS = {
    "icc",
    "cricket",
    "world",
    "cup",
    "final",
    "finals",
    "match",
    "matches",
    "tournament",
    "championship",
    "championships",
    "odi",
    "t20",
    "fifa",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
    "2026",
    "2027"
}
# NORMALIZE TEXT
# =========================================================

def normalize_text(text):

    if not text:
        return ""

    text = str(text).lower()

    text = re.sub(
        r"[^a-z0-9\s']",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()

def calculate_word_overlap(original_text, evidence_text):

    original_words = get_important_words(original_text)
    evidence_words = get_important_words(evidence_text)

    if not original_words:
        return 0.0

    common_words = original_words.intersection(evidence_words)

    return len(common_words) / len(original_words)


def calculate_relevance(original_text, evidence_text):

    if not original_text or not evidence_text:
        return 0.0

    original_normalized = normalize_text(original_text)
    evidence_normalized = normalize_text(evidence_text)

    from difflib import SequenceMatcher

    sequence_score = SequenceMatcher(
        None,
        original_normalized,
        evidence_normalized
    ).ratio()

    overlap_score = calculate_word_overlap(
        original_text,
        evidence_text
    )

    final_score = sequence_score * 0.30 + overlap_score * 0.70

    return round(min(final_score, 1.0), 4)
def clean_relation_entity(text):

    words = get_important_words(text)

    return {
        word
        for word in words
        if word not in RELATION_NOISE_WORDS
    }


# =========================================================
# IMPORTANT WORDS
# =========================================================

def get_important_words(text):

    normalized = normalize_text(text)

    return {
        word
        for word in normalized.split()
        if word not in STOP_WORDS
        and len(word) > 2
    }
# EXTRACT WIN/LOSS RELATION
# =========================================================

def extract_relation(text):

    return (
        extract_loss_relation(text)
        or extract_defeat_relation(text)
    )
def extract_loss_relation(text):

    normalized = normalize_text(text)

    patterns = [
        r"(.+?)\s+lost to\s+(.+)",
        r"(.+?)\s+loses to\s+(.+)",
        r"(.+?)\s+lose to\s+(.+)",
        r"(.+?)\s+was defeated by\s+(.+)",
        r"(.+?)\s+were defeated by\s+(.+)"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            normalized
        )

        if match:

            loser = trim_relation_object(
                match.group(1)
            )

            winner = trim_relation_object(
                match.group(2)
            )

            return {
                "winner": winner,
                "loser": loser
            }

    return None

# EXTRACT DEFEAT RELATION
# =========================================================

def extract_defeat_relation(text):

    normalized = normalize_text(text)

    patterns = [
        r"(.+?)\s+defeated\s+(.+)",
        r"(.+?)\s+defeats\s+(.+)",
        r"(.+?)\s+defeat\s+(.+)",
        r"(.+?)\s+beat\s+(.+)",
        r"(.+?)\s+beats\s+(.+)",
        r"(.+?)\s+won against\s+(.+)"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            normalized
        )

        if match:

            winner = trim_relation_object(
                match.group(1)
            )

            loser = trim_relation_object(
                match.group(2)
            )

            return {
                "winner": winner,
                "loser": loser
            }

    return None
# TRIM RELATION OBJECT
# =========================================================

def trim_relation_object(text):

    text = normalize_text(text)

    ending_patterns = [
        r"\s+in\s+the\s+\d{4}\s+",
        r"\s+in\s+\d{4}\s+",
        r"\s+at\s+the\s+",
        r"\s+during\s+the\s+",
        r"\s+after\s+the\s+",
        r"\s+before\s+the\s+"
    ]

    for pattern in ending_patterns:

        parts = re.split(
            pattern,
            text,
            maxsplit=1
        )

        if parts:
            text = parts[0]

    return text.strip()
# ENTITY SIMILARITY
# =========================================================

def relation_entities_match(
    first_text,
    second_text
):

    first_words = clean_relation_entity(
        first_text
    )

    second_words = clean_relation_entity(
        second_text
    )

    if not first_words or not second_words:
        return False

    intersection = first_words.intersection(
        second_words
    )

    return bool(intersection)
# CHECK DIRECT RELATION CONTRADICTION
# =========================================================

def check_relation_contradiction(
    original_text,
    evidence_text
):

    original_relation = extract_relation(
        original_text
    )

    evidence_relation = extract_relation(
        evidence_text
    )

    if not original_relation or not evidence_relation:
        return False

    reversed_winner = relation_entities_match(
        original_relation["winner"],
        evidence_relation["loser"]
    )

    reversed_loser = relation_entities_match(
        original_relation["loser"],
        evidence_relation["winner"]
    )

    if reversed_winner and reversed_loser:

        print(
            "DIRECT RELATION CONTRADICTION:",
            original_relation,
            "<->",
            evidence_relation
        )

        return True

    return False
# GENERAL CONTRADICTION DETECTION
# =========================================================

def has_contradiction(original_text, evidence_text):

    if check_relation_contradiction(
        original_text,
        evidence_text
    ):
        return True

    original = normalize_text(original_text)
    evidence = normalize_text(evidence_text)

    original_words = set(original.split())
    evidence_words = set(evidence.split())

    # Opposite word pairs
    for first, second in OPPOSITE_PAIRS:

        if first in original_words and second in evidence_words:
            return True

        if second in original_words and first in evidence_words:
            return True

    # Negation difference
    original_has_negation = any(
        word in original_words
        for word in NEGATION_WORDS
    )

    evidence_has_negation = any(
        word in evidence_words
        for word in NEGATION_WORDS
    )

    if original_has_negation != evidence_has_negation:

        relevance = calculate_relevance(
            original_text,
            evidence_text
        )

        if relevance >= 0.70:
            return True

    return False