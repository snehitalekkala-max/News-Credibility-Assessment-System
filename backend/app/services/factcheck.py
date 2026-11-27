import os
import re
import logging

from dataclasses import dataclass, field
from difflib import SequenceMatcher
from typing import List, Dict, Optional, Set

import requests
from dotenv import load_dotenv


# =========================================================
# CONFIGURATION
# =========================================================

load_dotenv()

FACTCHECK_API_KEY = os.getenv("FACTCHECK_API_KEY", "")

GOOGLE_FACTCHECK_API_URL = (
    "https://factchecktools.googleapis.com/v1alpha1/claims:search"
)

REQUEST_TIMEOUT = 15

MAX_CLAIMS_TO_SEARCH = 6

MIN_RELEVANCE_SCORE = 0.55

logger = logging.getLogger(__name__)


# =========================================================
# RESULT DATA STRUCTURE
# =========================================================

@dataclass
class FactCheckResult:

    status: str

    checked_claims: int = 0

    flagged_claims: List[str] = field(
        default_factory=list
    )

    supporting_signals: List[str] = field(
        default_factory=list
    )

    summary: str = ""

    claims: List[Dict] = field(
        default_factory=list
    )


# =========================================================
# STOP WORDS
# =========================================================

STOP_WORDS = {
    "the", "is", "are", "was", "were",
    "a", "an", "and", "or", "but",
    "in", "on", "at", "to", "from",
    "for", "of", "by", "with", "as",
    "that", "this", "these", "those",
    "it", "its", "he", "she", "they",
    "them", "their", "his", "her",
    "we", "you", "your", "our",
    "be", "been", "being", "has",
    "have", "had", "do", "does",
    "did", "also", "than", "then",
    "there", "here", "which", "who",
    "what", "when", "where", "why",
    "how", "about", "according",
    "reported", "said", "says"
}


NEGATION_WORDS = {
    "not", "no", "never", "cannot"
}


# =========================================================
# CLAIM EXTRACTION
# =========================================================

def extract_claims(text: str) -> List[str]:

    if not text or not text.strip():

        return []

    text = text.strip()

    sentences = re.split(
        r"(?<=[.!?])\s+|\n+",
        text
    )

    claims = []

    seen = set()

    for sentence in sentences:

        sentence = re.sub(
            r"\s+",
            " ",
            sentence
        ).strip()

        # Allow short news headlines and claims.

        if len(sentence.split()) < 3:

            continue

        sentence = sentence[:500]

        normalized = sentence.lower()

        if normalized in seen:

            continue

        seen.add(normalized)

        claims.append(sentence)

    # Preserve short inputs.

    if not claims and text:

        claims.append(text[:500])

    return claims


# =========================================================
# TEXT NORMALIZATION
# =========================================================

def normalize_fact_text(text: str) -> str:

    if not text:

        return ""

    text = text.lower()

    text = text.replace("’", "'")

    text = re.sub(
        r"\bcan't\b",
        "cannot",
        text
    )

    text = re.sub(
        r"\bwon't\b",
        "will not",
        text
    )

    text = re.sub(
        r"n't\b",
        " not",
        text
    )

    text = re.sub(
        r"[^\w\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# =========================================================
# IMPORTANT WORD EXTRACTION
# =========================================================

def get_important_words(text: str) -> Set[str]:

    normalized = normalize_fact_text(text)

    words = normalized.split()

    return {

        word

        for word in words

        if word not in STOP_WORDS

        and (
            len(word) >= 2
            or word.isdigit()
        )
    }


# =========================================================
# NUMBER EXTRACTION
# =========================================================

def extract_numbers(text: str) -> Set[str]:

    return set(

        re.findall(
            r"\b\d+(?:\.\d+)?\b",
            text or ""
        )
    )


# =========================================================
# FACT CHECK RELEVANCE
# =========================================================

def fact_check_relevance(
    original_claim: str,
    fact_claim: str
) -> float:

    if not original_claim or not fact_claim:

        return 0.0

    original_normalized = normalize_fact_text(
        original_claim
    )

    fact_normalized = normalize_fact_text(
        fact_claim
    )

    if original_normalized == fact_normalized:

        return 1.0

    original_words = get_important_words(
        original_claim
    )

    fact_words = get_important_words(
        fact_claim
    )

    if not original_words or not fact_words:

        return 0.0

    common_words = original_words.intersection(
        fact_words
    )

    if not common_words:

        return 0.0

    original_coverage = (
        len(common_words) / len(original_words)
    )

    fact_coverage = (
        len(common_words) / len(fact_words)
    )

    # Balanced keyword similarity.

    keyword_score = (

        2 * original_coverage * fact_coverage

        / (original_coverage + fact_coverage)
    )

    sequence_score = SequenceMatcher(

        None,

        original_normalized,

        fact_normalized

    ).ratio()

    final_score = (

        keyword_score * 0.75

        + sequence_score * 0.25
    )

    # Reduce similarity when numerical details differ.

    original_numbers = extract_numbers(
        original_claim
    )

    fact_numbers = extract_numbers(
        fact_claim
    )

    if original_numbers and fact_numbers:

        if not original_numbers.intersection(
            fact_numbers
        ):

            final_score *= 0.60

    # Reduce similarity for opposite negation.

    original_negation = bool(

        original_words.intersection(
            NEGATION_WORDS
        )
    )

    fact_negation = bool(

        fact_words.intersection(
            NEGATION_WORDS
        )
    )

    if original_negation != fact_negation:

        final_score *= 0.60

    return round(

        max(0.0, min(final_score, 1.0)),

        4
    )


# =========================================================
# RELEVANCE VALIDATION
# =========================================================

def is_relevant_fact_check(

    original_claim: str,

    fact_claim: str,

    threshold: float = MIN_RELEVANCE_SCORE

) -> bool:

    return fact_check_relevance(

        original_claim,

        fact_claim

    ) >= threshold


# =========================================================
# GOOGLE QUERY PREPARATION
# =========================================================

def prepare_google_query(claim: str) -> str:

    if not claim:

        return ""

    claim = re.sub(

        r"\s+",

        " ",

        claim

    ).strip()

    claim = re.sub(

        r"[^\w\s.,'-]",

        "",

        claim
    )

    return claim[:450]


# =========================================================
# FACT CHECK RATING CLASSIFICATION
# =========================================================

def classify_rating(rating: str) -> str:

    rating = normalize_fact_text(rating)

    misleading_ratings = {

        "misleading",

        "partly false",

        "partially false",

        "mostly false",

        "half true",

        "partly true",

        "partially true",

        "mostly true",

        "mixed",

        "missing context",

        "out of context",

        "needs context"
    }

    false_ratings = {

        "false",

        "fake",

        "incorrect",

        "pants on fire",

        "completely false",

        "totally false",

        "not true",

        "fabricated"
    }

    true_ratings = {

        "true",

        "correct",

        "accurate",

        "verified",

        "completely true"
    }

    if rating in misleading_ratings:

        return "Misleading"

    if rating in false_ratings:

        return "False"

    if rating in true_ratings:

        return "True"

    return "Unverified"


# =========================================================
# GOOGLE FACT CHECK API
# =========================================================

def search_google_claim(

    claim: str,

    errors: Optional[List[str]] = None

) -> List[Dict]:

    if errors is None:

        errors = []

    if not FACTCHECK_API_KEY:

        errors.append("Google Fact Check API key is missing.")

        print("FACTCHECK ERROR: API key is missing.")

        return []

    query = prepare_google_query(claim)

    if not query:

        return []

    params = {

        "query": query,

        "key": FACTCHECK_API_KEY,

        "pageSize": 10,

        "languageCode": "en"
    }

    try:

        print("\n========== GOOGLE FACT CHECK ==========")

        print("FACTCHECK QUERY:", query)

        response = requests.get(

            GOOGLE_FACTCHECK_API_URL,

            params=params,

            timeout=REQUEST_TIMEOUT
        )

        print(

            "FACTCHECK STATUS CODE:",

            response.status_code
        )

        if response.status_code != 200:

            message = (

                f"Google Fact Check HTTP error "

                f"{response.status_code}"
            )

            errors.append(message)

            print("FACTCHECK ERROR:", message)

            return []

        data = response.json()

        results = []

        for item in data.get("claims", []):

            claim_text = (

                item.get("text") or ""

            ).strip()

            if not claim_text:

                continue

            relevance = fact_check_relevance(

                claim,

                claim_text
            )

            if relevance < MIN_RELEVANCE_SCORE:

                continue

            for review in item.get("claimReview", []):

                publisher_info = (

                    review.get("publisher") or {}
                )

                publisher_name = (

                    publisher_info.get("name")

                    or "Unknown Publisher"
                )

                rating = (

                    review.get("textualRating")

                    or "Not specified"
                )

                review_url = (

                    review.get("url") or ""
                )

                if not review_url:

                    continue

                result = {

                    "text": claim_text,

                    "rating": rating,

                    "normalized_rating": classify_rating(
                        rating
                    ),

                    "publisher": publisher_name,

                    "url": review_url,

                    "searched_claim": claim,

                    "relevance_score": relevance,

                    "review_date": review.get(
                        "reviewDate", ""
                    )
                }

                results.append(result)

                print("MATCHED CLAIM:", claim_text)

                print("RATING:", rating)

                print("RELEVANCE:", relevance)

        print(

            "FACTCHECK RESULTS FOUND:",

            len(results)
        )

        return results

    except requests.exceptions.Timeout:

        errors.append("Google Fact Check request timed out.")

        print("FACTCHECK ERROR: Request timed out.")

        return []

    except requests.exceptions.RequestException:

        errors.append("Google Fact Check connection failed.")

        print("FACTCHECK ERROR: Connection failed.")

        return []

    except ValueError:

        errors.append("Invalid Google Fact Check response.")

        print("FACTCHECK ERROR: Invalid JSON response.")

        return []

    except Exception as error:

        errors.append("Unexpected Google Fact Check error.")

        print(

            "FACTCHECK ERROR:",

            type(error).__name__
        )

        return []


# =========================================================
# REMOVE DUPLICATE RESULTS
# =========================================================

def remove_duplicate_results(

    results: List[Dict]

) -> List[Dict]:

    unique_results = {}

    for result in results:

        key = (

            normalize_fact_text(
                result.get("text", "")
            ),

            result.get("url", ""),

            normalize_fact_text(
                result.get("rating", "")
            )
        )

        previous = unique_results.get(key)

        if previous is None or (

            result.get("relevance_score", 0)

            > previous.get("relevance_score", 0)
        ):

            unique_results[key] = result

    return list(unique_results.values())


# =========================================================
# GOOGLE FACT CHECK ANALYSIS
# =========================================================

def google_fact_check(

    text: str,

    errors: Optional[List[str]] = None

) -> Optional[FactCheckResult]:

    if errors is None:

        errors = []

    if not FACTCHECK_API_KEY:

        errors.append("Google Fact Check API key is missing.")

        return None

    article_claims = extract_claims(text)

    if not article_claims:

        return None

    all_results = []

    checked_count = 0

    for claim in article_claims[:MAX_CLAIMS_TO_SEARCH]:

        checked_count += 1

        results = search_google_claim(

            claim,

            errors
        )

        all_results.extend(results)

    all_results = remove_duplicate_results(
        all_results
    )

    if not all_results:

        return None

    all_results.sort(

        key=lambda item: item.get(
            "relevance_score", 0
        ),

        reverse=True
    )

    flagged_claims = []

    supporting_signals = []

    for result in all_results:

        # Only strong matches contribute to signals.

        if result.get("relevance_score", 0) < 0.75:

            continue

        rating = result.get(
            "normalized_rating",
            "Unverified"
        )

        claim_text = result.get("text", "")

        if rating in {"False", "Misleading"}:

            flagged_claims.append(claim_text)

        elif rating == "True":

            supporting_signals.append(claim_text)

    flagged_claims = list(
        dict.fromkeys(flagged_claims)
    )

    supporting_signals = list(
        dict.fromkeys(supporting_signals)
    )

    if flagged_claims and supporting_signals:

        summary = (

            "External reviews contain both positive "

            "and negative ratings. Individual claims "

            "require further evaluation."
        )

    elif flagged_claims:

        summary = (

            "External fact-check reviews contain "

            "negative or misleading ratings."
        )

    elif supporting_signals:

        summary = (

            "External fact-check reviews contain "

            "supporting ratings."
        )

    else:

        summary = (

            "Related fact-check reviews were found, "

            "but stronger claim matching or manual "

            "interpretation is required."
        )

    if errors:

        summary += (

            " Some fact-check requests could not "

            "be completed."
        )

    return FactCheckResult(

        status="Fact Checks Found",

        checked_claims=checked_count,

        flagged_claims=flagged_claims,

        supporting_signals=supporting_signals,

        summary=summary,

        claims=all_results
    )


# =========================================================
# LOCAL WARNING PATTERNS
# =========================================================

UNVERIFIED_PATTERNS = [

    r"\bshare this before it gets deleted\b",

    r"\bforward this message\b",

    r"\bsecretly hidden\b",

    r"\bthey don't want you to know\b",

    r"\bmiracle cure\b",

    r"\b100 percent guaranteed\b",

    r"\bno evidence whatsoever\b",

    r"\bshare immediately\b",

    r"\bguaranteed results\b"
]


# =========================================================
# LOCAL FACT CHECK FALLBACK
# =========================================================

def local_fact_check(

    text: str,

    errors: Optional[List[str]] = None

) -> FactCheckResult:

    claims = extract_claims(text)

    lowered = (text or "").lower()

    flagged = []

    for pattern in UNVERIFIED_PATTERNS:

        match = re.search(

            pattern,

            lowered
        )

        if match:

            flagged.append(match.group(0))

    if errors:

        status = "Verification Service Unavailable"

        summary = (

            "External fact-checking could not be "

            "completed. "

            + "; ".join(dict.fromkeys(errors))
        )

        if flagged:

            summary += (

                ". Local warning signals were also "

                "detected, but these do not prove "

                "that the article is false."
            )

    elif flagged:

        status = "Needs Review"

        summary = (

            "Potential warning signals were detected. "

            "Independent verification is required."
        )

    else:

        status = "Insufficient Evidence"

        summary = (

            "No matching external fact-check was found. "

            "This does not establish whether the "

            "article is true or false."
        )

    claim_list = []

    for sentence in claims:

        claim_list.append({

            "text": sentence,

            "rating": status,

            "normalized_rating": "Unverified",

            "publisher": "Local Analysis",

            "url": "",

            "searched_claim": sentence,

            "relevance_score": 0.0
        })

    return FactCheckResult(

        status=status,

        checked_claims=len(claims),

        flagged_claims=flagged[:10],

        supporting_signals=[],

        summary=summary,

        claims=claim_list
    )


# =========================================================
# MAIN FACT CHECK FUNCTION
# =========================================================

def fact_check(text: str) -> FactCheckResult:

    if not text or not text.strip():

        return FactCheckResult(

            status="Insufficient Evidence",

            checked_claims=0,

            summary="No article text was provided."
        )

    errors = []

    try:

        google_result = google_fact_check(

            text,

            errors
        )

        if google_result and google_result.claims:

            return google_result

    except Exception:

        errors.append(

            "Unexpected external verification error."
        )

        logger.error(

            "Google Fact Check analysis failed."
        )

    return local_fact_check(

        text,

        errors
    )