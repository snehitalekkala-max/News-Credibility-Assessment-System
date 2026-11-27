import re
from collections import Counter
from dataclasses import dataclass


# =========================================================
# RESULT STRUCTURE
# =========================================================

@dataclass
class KeywordResult:
    keywords: list
    top_phrases: list


# =========================================================
# STOP WORDS
# =========================================================

STOPWORDS = {
    "the", "is", "are", "was", "were",
    "a", "an", "to", "of", "and", "or",
    "for", "with", "in", "on", "at",
    "by", "that", "this", "it", "as",
    "from", "be", "been", "being",
    "has", "have", "had", "will",
    "would", "could", "should",
    "can", "may", "might", "also",
    "their", "there", "these", "those",
    "which", "who", "what", "when",
    "where", "how", "said", "says",
    "according", "about", "after",
    "before", "during", "into",
    "its", "they", "them", "he",
    "she", "his", "her", "we",
    "you", "your", "our"
}


# =========================================================
# TOKEN VALIDATION
# =========================================================

def is_valid_keyword(word):

    if not word:
        return False

    if word.lower() in STOPWORDS:
        return False

    # Preserve years and other numerical information.
    if word.isdigit():
        return True

    # Preserve abbreviations such as AI, UN, ICC.
    if word.isupper() and len(word) >= 2:
        return True

    # Preserve mixed terms such as T20, G20 and COVID-19.
    if any(char.isdigit() for char in word):
        return True

    return len(word) >= 3


# =========================================================
# KEYWORD EXTRACTION
# =========================================================

def extract_keywords(text, top_n=10):

    if not text or not text.strip():
        return KeywordResult(
            keywords=[],
            top_phrases=[]
        )

    tokens = re.findall(
        r"\b[a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*\b",
        text
    )

    valid_words = [
        word.lower()
        for word in tokens
        if is_valid_keyword(word)
    ]

    frequency = Counter(valid_words)

    keywords = frequency.most_common(top_n)

    # =====================================================
    # PHRASE EXTRACTION
    # =====================================================

    phrases = []

    for size in (2, 3):

        for index in range(len(tokens) - size + 1):

            group = tokens[index:index + size]

            if all(is_valid_keyword(word) for word in group):

                phrase = " ".join(group).lower()

                phrases.append(phrase)

    phrase_frequency = Counter(phrases)

    top_phrases = [
        phrase
        for phrase, count
        in phrase_frequency.most_common(top_n)
    ]

    return KeywordResult(
        keywords=keywords,
        top_phrases=top_phrases
    )