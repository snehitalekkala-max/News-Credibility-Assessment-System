from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from difflib import SequenceMatcher
import os
import re
# =========================================================
# PROJECT SERVICES
# =========================================================
from app.services.predictor import predict_news
from app.services.pdf_reader import extract_text_from_pdf
from app.services.sentiment import analyze_sentiment
from app.services.bias import detect_bias
from app.services.clickbait import detect_clickbait
from app.services.keyword import extract_keywords
from app.services.entity import extract_entities
from app.services.summarizer import summarize_article
from app.services.report_generator import generate_report
from app.services.url_reader import extract_article_from_url
from app.services.newsapi import search_news
from app.services.gdelt import search_gdelt
from app.services.web_search import search_web
from app.services.semantic_verifier import semantic_evidence
from app.services.reference_evidence import search_references
from app.services.factcheck import fact_check
from app.services.factcheck import fact_check_relevance, classify_rating
from urllib.parse import urlsplit
from app.services.article_compare import compare_articles
from app.database import SessionLocal
from app.models import AnalysisHistory
from app.security import get_current_user
# =========================================================
# ROUTER
# =========================================================
router = APIRouter(
    prefix="/news",
    tags=["News Analysis"]
)
# =========================================================
# REQUEST MODELS
# =========================================================
class NewsRequest(BaseModel):
    article: str
class URLRequest(BaseModel):
    url: str
class ReportRequest(BaseModel):
    analysis: dict
class CompareRequest(BaseModel):
    article1: str
    article2: str
# =========================================================
# CONSTANTS
# =========================================================
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
    "not", "never", "no", "didn't", "didnt",
    "doesn't", "doesnt", "wasn't", "wasnt",
    "weren't", "werent", "false", "fake"
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
    "icc", "cricket", "world", "cup", "final",
    "finals", "match", "matches", "tournament",
    "championship", "championships", "odi", "t20",
    "fifa", "2020", "2021", "2022", "2023",
    "2024", "2025", "2026", "2027"
}
FALSE_RATINGS = [
    "false", "fake", "incorrect", "fabricated",
    "pants on fire"
]
MISLEADING_RATINGS = [
    "misleading", "partly false", "partially false",
    "half true", "half false", "missing context",
    "altered"
]
TRUE_RATINGS = [
    "true", "correct", "accurate", "verified"
]
MAX_CLAIMS = 5
MAX_SEARCH_QUERIES = 4
MIN_EVIDENCE_RELEVANCE = 0.60
STRONG_EVIDENCE_RELEVANCE = 0.75
FACT_CHECK_THRESHOLD = 0.75
FACTUAL_INDICATORS = {
    "announced", "reported", "confirmed", "launched",
    "approved", "rejected", "won", "lost", "died",
    "arrested", "released", "increased", "decreased",
    "discovered", "invented", "created", "passed",
    "failed", "appointed", "elected", "banned",
    "ordered", "completed", "achieved", "occurred",
    "recorded", "published", "signed", "opened",
    "closed", "started", "ended", "declared",
    "landed", "developed", "introduced", "built",
    "revealed", "resigned", "returned", "scored"
}
# =========================================================
# NORMALIZE TEXT
# =========================================================
def normalize_text(text):
    if not text:
        return ""
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s']", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()
# =========================================================
# DATE CONTRADICTION
# =========================================================
def extract_years(text):
    return set(
        re.findall(
            r"\b(?:19|20)\d{2}\b",
            normalize_text(text)
        )
    )
def has_date_contradiction(original_text, evidence_text):
    original_years = extract_years(original_text)
    evidence_years = extract_years(evidence_text)
    if not original_years or not evidence_years:
        return False
    # This is a warning signal, not proof by itself.
    if original_years.isdisjoint(evidence_years):
        print(
            "DATE MISMATCH:",
            original_years,
            "<->",
            evidence_years
        )
        return True
    return False
# =========================================================
# IMPORTANT WORDS
# =========================================================
def get_important_words(text):
    normalized = normalize_text(text)
    return {
        word for word in normalized.split()
        if word not in STOP_WORDS and (len(word) >= 2 or word.isdigit())
    }
# =========================================================
# WORD OVERLAP
# =========================================================
def calculate_word_overlap(original_text, evidence_text):
    original_words = get_important_words(original_text)
    evidence_words = get_important_words(evidence_text)
    if not original_words:
        return 0.0
    common_words = original_words.intersection(evidence_words)
    return len(common_words) / len(original_words)
# =========================================================
# CALCULATE RELEVANCE
# =========================================================
def calculate_relevance(original_text, evidence_text):
    if not original_text or not evidence_text:
        return 0.0
    original_normalized = normalize_text(original_text)
    evidence_normalized = normalize_text(evidence_text)
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
# =========================================================
# CLEAN RELATION ENTITY
# =========================================================
def clean_relation_entity(text):
    words = get_important_words(text)
    return {
        word for word in words
        if word not in RELATION_NOISE_WORDS
    }
# =========================================================
# FIND BEST FACT CHECK
# =========================================================
def find_best_fact_check(original_article, claims):
    best_claim = None
    best_relevance = 0.0
    if not claims:
        return None, 0.0
    for claim in claims:
        claim_text = str(
            claim.get("text", "") or ""
        ).strip()
        if not claim_text:
            continue
        # Prefer the service's relevance helper if it works;
        # otherwise use our local relevance score.
        relevance = None
        try:
            relevance = fact_check_relevance(
                original_article,
                claim_text
            )
            relevance = float(relevance)
        except Exception:
            relevance = calculate_relevance(
                original_article,
                claim_text
            )
        # Normalize helpers that may return percentage values.
        if relevance > 1:
            relevance = relevance / 100.0
        relevance = max(0.0, min(relevance, 1.0))
        print(
            "FACT CHECK RELEVANCE:",
            round(relevance, 4),
            "|",
            claim_text
        )
        if relevance > best_relevance:
            best_relevance = relevance
            best_claim = claim
    return best_claim, best_relevance
# =========================================================
# ENTITY SIMILARITY
# =========================================================
def relation_entities_match(first_text, second_text):
    first_words = clean_relation_entity(first_text)
    second_words = clean_relation_entity(second_text)
    if not first_words or not second_words:
        return False
    intersection = first_words.intersection(second_words)
    return bool(intersection)
# =========================================================
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
        parts = re.split(pattern, text, maxsplit=1)
        if parts:
            text = parts[0]
    return text.strip()
# =========================================================
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
        match = re.search(pattern, normalized)
        if match:
            winner = trim_relation_object(match.group(1))
            loser = trim_relation_object(match.group(2))
            return {
                "winner": winner,
                "loser": loser
            }
    return None
# =========================================================
# EXTRACT LOSS RELATION
# =========================================================
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
        match = re.search(pattern, normalized)
        if match:
            loser = trim_relation_object(match.group(1))
            winner = trim_relation_object(match.group(2))
            return {
                "winner": winner,
                "loser": loser
            }
    return None
# =========================================================
# EXTRACT WIN/LOSS RELATION
# =========================================================
def extract_relation(text):
    return (
        extract_loss_relation(text)
        or extract_defeat_relation(text)
    )
# =========================================================
# CHECK DIRECT RELATION SUPPORT
# =========================================================
def check_relation_support(original_text, evidence_text):
    original_relation = extract_relation(original_text)
    evidence_relation = extract_relation(evidence_text)
    if not original_relation or not evidence_relation:
        return False
    same_winner = relation_entities_match(
        original_relation["winner"],
        evidence_relation["winner"]
    )
    same_loser = relation_entities_match(
        original_relation["loser"],
        evidence_relation["loser"]
    )
    if same_winner and same_loser:
        print(
            "DIRECT RELATION SUPPORT:",
            original_relation,
            "<->",
            evidence_relation
        )
        return True
    return False
# =========================================================
# CHECK DIRECT RELATION CONTRADICTION
# =========================================================
def check_relation_contradiction(original_text, evidence_text):
    original_relation = extract_relation(original_text)
    evidence_relation = extract_relation(evidence_text)
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
# =========================================================
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
    # Opposite words are only a possible signal.
    for first, second in OPPOSITE_PAIRS:
        if (
            first in original_words
            and second in evidence_words
        ):
            relevance = calculate_relevance(
                original_text,
                evidence_text
            )
            if relevance >= STRONG_EVIDENCE_RELEVANCE:
                return True
        if (
            second in original_words
            and first in evidence_words
        ):
            relevance = calculate_relevance(
                original_text,
                evidence_text
            )
            if relevance >= STRONG_EVIDENCE_RELEVANCE:
                return True
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
        if relevance >= STRONG_EVIDENCE_RELEVANCE:
            return True
    return False
# =========================================================
# STRICT SUPPORT DETECTION
# =========================================================
def supports_claim(original_text, evidence_text):
    if not original_text or not evidence_text:
        return False
    if has_date_contradiction(original_text, evidence_text):
        return False
    if has_contradiction(original_text, evidence_text):
        return False
    # Require the actual claim wording, not merely shared topic words.
    original = normalize_text(original_text)
    evidence = normalize_text(evidence_text)
    if not original or not evidence:
        return False
    if re.search(r"\b(?:claim(?:s|ed)?|rumou?r|alleged|allegedly|hoax|fake|false|unverified|debunked|whether|could|might|may)\b", evidence):
        return False
    if "?" in evidence_text:
        return False
    if original == evidence:
        return len(get_important_words(original)) >= 2
    # Very close paraphrases are candidate evidence, not proof by themselves.
    return (fact_check_relevance(original_text, evidence_text) >= 0.90
            and get_important_words(original_text) <= get_important_words(evidence_text))

# =========================================================
# CLAIM EXTRACTION
# =========================================================
def extract_key_claims(article):
    """
    Heuristic claim extraction.
    Prioritizes sentences with factual indicators,
    numbers, or years. This is not an AI extractor.
    """
    if not article:
        return []
    return [x.strip() for x in re.split(r"(?<=[.!?])\s+|\n+", article) if x.strip()][:MAX_CLAIMS]
# =========================================================
# SEARCH QUERY GENERATION
# =========================================================
def create_claim_search_query(claim):
    words = re.findall(
        r"\b[a-zA-Z0-9]+\b",
        str(claim).lower()
    )
    filtered = [
        word for word in words
        if word not in STOP_WORDS
        and (len(word) >= 2 or word.isdigit())
    ]
    filtered = list(dict.fromkeys(filtered))
    return " ".join(filtered[:6])
def build_search_query(keywords):
    query_words = []
    for item in (keywords or [])[:8]:
        if isinstance(item, (list, tuple)):
            if item:
                word = str(item[0]).strip()
                if len(word) >= 2:
                    query_words.append(word)
        elif isinstance(item, dict):
            word = str(item.get("word", "")).strip()
            if len(word) >= 2:
                query_words.append(word)
        else:
            word = str(item).strip()
            if len(word) >= 2:
                query_words.append(word)
    query_words = list(dict.fromkeys(query_words))
    return " ".join(query_words[:5])
# =========================================================
# REMOVE DUPLICATE ARTICLES
# =========================================================
def remove_duplicate_articles(articles):
    unique_articles = []
    seen = set()
    for article in articles or []:
        url = str(article.get("url", "") or "").strip()
        title = normalize_text(
            article.get("title", "")
        )
        identifier = url or title
        if identifier and identifier not in seen:
            seen.add(identifier)
            unique_articles.append(article)
    return unique_articles
# =========================================================
# SEARCH RELATED NEWS
# =========================================================
def search_related_news(
    article,
    keyword_query,
    claims=None
):
    all_articles = search_references(article)
    print("OFFLINE REFERENCE RESULTS:", len(all_articles))
    queries = []
    if keyword_query:
        queries.append(keyword_query)
    if len(article.split()) <= 35:
        queries.append(article)
    for claim in (claims or [])[:3]:
        claim_query = create_claim_search_query(claim)
        if claim_query:
            queries.append(claim_query)
    queries = list(dict.fromkeys(queries))
    queries = queries[:MAX_SEARCH_QUERIES]
    # Search historical and current web pages first, with bounded requests.
    for claim in (claims or [article])[:MAX_CLAIMS]:
        all_articles.extend(search_web(claim))
    if keyword_query and keyword_query not in (claims or [article]):
        all_articles.extend(search_web(keyword_query))
    # Limit calls to the news services, particularly rate-limited GDELT.
    for query in queries[:2]:
        try:
            all_articles.extend(search_news(query) or [])
        except Exception as exc:
            print("NewsAPI Search Error:", type(exc).__name__)
    if not all_articles and queries:
        try:
            all_articles.extend(search_gdelt(queries[0]) or [])
        except Exception as exc:
            print("GDELT Search Error:", type(exc).__name__)
    all_articles = remove_duplicate_articles(all_articles)
    print("\nTOTAL UNIQUE NEWS ARTICLES:", len(all_articles))
    return all_articles
# =========================================================
# SOURCE IDENTIFIER / INDEPENDENCE ESTIMATE
# =========================================================
def get_source_identifier(article):
    host = urlsplit(str(article.get("url") or "")).hostname or ""
    return host.lower().removeprefix("www.")

def count_independent_sources(evidence_list):
    sources = set()
    for evidence in evidence_list:
        article = evidence.get("article", {})
        source = get_source_identifier(article)
        if source:
            sources.add(source)
    return len(sources)
# =========================================================
# ANALYZE NEWS EVIDENCE
# =========================================================
def analyze_news_evidence(original_article, related_articles):
    result = {"supporting": [], "contradicting": [], "related": []}
    for news in related_articles or []:
        passages = []
        for field in ("title", "description", "content"):
            value = str(news.get(field) or "")
            passages.extend(re.split(r"(?<=[.!?])\s+|\n+", value))
        passages = [p.strip() for p in passages if p.strip()]
        if not passages:
            continue
        relevance = max(calculate_relevance(original_article, p) for p in passages)
        # A reversed relation or a date mismatch is not enough to establish
        # a contradiction: the source may describe a different event.
        support = any(supports_claim(original_article, p) for p in passages)
        conflict = any(has_contradiction(original_article, p) or
                       has_date_contradiction(original_article, p)
                       for p in passages if calculate_relevance(original_article, p) >= 0.70)
        item = {"article": news, "relevance": relevance,
                "direct_support": False, "direct_contradiction": False}
        if support and not conflict:
            result["supporting"].append(item)
        elif relevance >= MIN_EVIDENCE_RELEVANCE:
            result["related"].append(item)
    for items in result.values():
        items.sort(key=lambda item: item["relevance"], reverse=True)
    return result

# =========================================================
# CLAIM-LEVEL EVIDENCE ANALYSIS
# =========================================================
def analyze_claims(claims, related_articles):
    results = []
    for claim in claims or []:
        evidence = semantic_evidence(claim, related_articles)
        supporting = evidence['supporting']
        contradicting = evidence['contradicting']
        ns = len({x['source_group'] for x in supporting})
        nc = len({x['source_group'] for x in contradicting})
        primary = {'isro.gov.in', 'nasa.gov', 'olympics.com'}
        strong_support = any(x['source_group'] in primary and x['relevance'] >= .97 for x in supporting)
        strong_contradiction = any(x['source_group'] in primary and x['relevance'] >= .97 for x in contradicting)
        if (ns >= 2 or strong_support) and nc == 0:
            status = 'Supported'
        elif (nc >= 2 or strong_contradiction) and ns == 0:
            status = 'Contradicted'
        elif ns or nc:
            status = 'Partially Verified'
        else:
            status = 'Unverified'
        results.append({'claim': claim, 'status': status,
                        'supporting_sources': ns, 'contradicting_sources': nc,
                        'supporting_evidence': [x['article'] for x in supporting[:3]],
                        'contradicting_evidence': [x['article'] for x in contradicting[:3]],
                        'related_evidence': [x['article'] for x in evidence['related'][:3]]})
    return results
# =========================================================
# CLAIM-BASED FINAL DECISION
# =========================================================
def determine_claims_verdict(claim_results):
    # Related news is corroboration, not an authoritative fact check.
    # Never promote a partial match or a subset of claims to a true verdict.
    return None

# =========================================================
# DETERMINE CREDIBILITY
# =========================================================
# Small, explicitly curated reference dataset. These records are not live
# search results. Only complete, listed claim variants are accepted.
REFERENCE_CLAIMS = [
    {
        "variants": [
            "Chandrayaan-3 successfully landed on the Moon on August 23, 2023.",
            "Chandrayaan-3 successfully landed on the Moon in August 2023.",
            "Chandrayaan-3 landed on the Moon on 23 August 2023.",
            "Chandrayaan-3 landed on the Moon on August 23, 2023.",
        ],
        "sources": [
            {"title": "Chandrayaan-3 - ISRO", "source": "www.isro.gov.in",
             "url": "https://www.isro.gov.in/Chandrayaan3.html",
             "description": "ISRO reports a successful soft landing on the Moon.",
             "content": "", "publishedAt": "", "provider": "Curated Reference"},
            {"title": "Chandrayaan-3: India makes historic landing near Moon's south pole",
             "source": "www.bbc.com", "url": "https://www.bbc.com/news/world-asia-india-66594520",
             "description": "BBC reported India's successful lunar landing on August 23, 2023.",
             "content": "", "publishedAt": "2023-08-23", "provider": "Curated Reference"},
        ],
    },
]


def reference_match(text):
    # Preserve all words and digits; do not use fuzzy topic matching.
    key = normalize_text(text)
    for record in REFERENCE_CLAIMS:
        if key in {normalize_text(v) for v in record["variants"]}:
            return record["sources"]
    return []


def determine_credibility(original_article, fact_check_claims, related_articles, ml_result, claims_analysis=None):
    claims = extract_key_claims(original_article)
    decisions = []
    for claim in claims:
        ratings = set()
        for review in fact_check_claims or []:
            if str(review.get("publisher", "")).lower() == "local analysis" or not review.get("url"):
                continue
            reviewed = review.get("text", "")
            # Exact normalized claim matching avoids transferring a rating
            # to a similar but materially different claim.
            if normalize_text(claim) != normalize_text(reviewed):
                continue
            rating = review.get("normalized_rating") or classify_rating(review.get("rating", ""))
            if rating in {"True", "False", "Misleading"}:
                ratings.add(rating)
        decisions.append(next(iter(ratings)) if len(ratings) == 1 else "Conflict" if ratings else "Unknown")
    def verdict(label, status, score, reason, source):
        return {"verdict": label, "status": status, "credibility_score": score,
                "reason": reason, "evidence_source": source}
    full_count = len([x for x in re.split(r"(?<=[.!?])\s+|\n+", original_article) if x.strip()])
    if len(claims) == full_count and decisions and all(d == "True" for d in decisions):
        return verdict("True News", "credible", 90, "Matching published fact checks support all selected claims.", "Google Fact Check")
    if len(claims) == full_count and decisions and all(d == "False" for d in decisions):
        return verdict("Fake News", "false", 10, "Matching published fact checks rate all selected claims false.", "Google Fact Check")
    if "Conflict" not in decisions and ("Misleading" in decisions or ("True" in decisions and "False" in decisions)):
        return verdict("Misleading", "misleading", 35, "Matching fact checks identify misleading or mixed claims.", "Google Fact Check")
    if "Conflict" in decisions or "False" in decisions:
        return verdict("Needs Verification", "unverified", 50, "Some claims have conflicting or negative reviews; the entire article cannot be confirmed.", "Google Fact Check")
    evidence = claims_analysis if claims_analysis is not None else analyze_claims(claims, related_articles)
    statuses = [item['status'] for item in evidence]
    # Do not certify an entire long article if extraction omitted sentences.
    sentences = [x.strip() for x in re.split(r"(?<=[.!?])\s+|\n+", original_article) if x.strip()]
    complete = len(sentences) == len(claims) and all(normalize_text(x) in {normalize_text(c) for c in claims} for x in sentences)
    if statuses and all(x == 'Supported' for x in statuses) and complete:
        return verdict('True News', 'credible', 85, 'All extracted claims are supported by semantic comparison with two selected domains or a high-scoring primary source. Rule-based score; not a probability.', 'Semantic Verification')
    if statuses and 'Contradicted' in statuses and 'Supported' not in statuses:
        return verdict('Fake News', 'false', 15, 'At least one extracted claim is contradicted by selected evidence and none is classified as supported; remaining claims may be unverified. Rule-based score; not a probability.', 'Semantic Verification')
    return verdict('Needs Verification', 'unverified', 50, 'Insufficient or mixed semantic evidence for the complete article.', 'Semantic Verification')

# =========================================================
# SAVE ANALYSIS HISTORY
# =========================================================
def save_analysis_history(
    user_id,
    article,
    analysis,
    title=None
):
    db = SessionLocal()
    try:
        history = AnalysisHistory(
            user_id=user_id,
            article_title=title,
            article_text=article,
            verdict=analysis.get(
                "verdict",
                "Needs Verification"
            ),
            status=analysis.get(
                "status",
                "unverified"
            ),
            credibility_score=float(
                analysis.get("credibility_score", 50)
            ),
            ml_prediction=analysis.get("ml_prediction"),
            ml_confidence=float(
                analysis.get("ml_confidence", 50)
            ),
            evidence_source=analysis.get("evidence_source")
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        return history
    except Exception as e:
        db.rollback()
        print("History Save Error:", e)
        return None
    finally:
        db.close()
# =========================================================
# COMMON ANALYSIS FUNCTION
# =========================================================
def perform_analysis(article: str, user_id=None):
    # VALIDATION
    if not article or not article.strip():
        return {
            "success": False,
            "message": "Article text cannot be empty."
        }
    article = article.strip()
    # ML PREDICTION
    try:
        prediction = predict_news(article)
        print("\nML RESULT:", prediction)
    except Exception as e:
        print("ML Prediction Error:", e)
        prediction = {
            "prediction": "Unverified",
            "confidence": 50,
            "credibility_score": 50
        }
    # NLP ANALYSIS
    sentiment = analyze_sentiment(article)
    bias = detect_bias(article)
    clickbait = detect_clickbait(article)
    keywords = extract_keywords(article)
    entities = extract_entities(article)
    summary = summarize_article(article)
    # CLAIM EXTRACTION
    claims = extract_key_claims(article)
    print("\nEXTRACTED CLAIMS:")
    for index, claim in enumerate(claims, 1):
        print(f"{index}. {claim}")
    # SEARCH QUERY
    keyword_query = build_search_query(
        getattr(keywords, "keywords", [])
    )
    if not keyword_query and claims:
        keyword_query = create_claim_search_query(
            claims[0]
        )
    # RELATED NEWS SEARCH
    try:
        related_articles = search_related_news(
            article,
            keyword_query,
            claims=claims
        )
        if related_articles is None:
            related_articles = []
    except Exception as e:
        print("Related News Search Error:", e)
        related_articles = []
    # FACT CHECK
    try:
        fact_result = fact_check(article)
        print("FACT CHECK:", fact_result)
    except Exception as e:
        print("Fact Check Error:", e)
        fact_result = None
    fact_claims = (
        getattr(fact_result, "claims", [])
        if fact_result
        else []
    )
    # Include curated evidence even if the external services are unavailable.
    reference_sources = []
    if reference_sources:
        related_articles = remove_duplicate_articles(reference_sources + related_articles)
    # CLAIM ANALYSIS
    try:
        claims_analysis = analyze_claims(
            claims,
            related_articles
        )
        if reference_sources and len(claims_analysis) == 1:
            claims_analysis[0].update({
                "status": "Supported", "supporting_sources": len(reference_sources),
                "supporting_evidence": reference_sources,
            })
        print("\nCLAIM ANALYSIS RESULTS:")
        for item in claims_analysis:
            print(item["status"], "|", item["claim"])
    except Exception as e:
        print("Claim Analysis Error:", e)
        claims_analysis = []
    # CREDIBILITY ASSESSMENT
    try:
        credibility = determine_credibility(
            article,
            fact_claims,
            related_articles,
            prediction,
            claims_analysis=claims_analysis
        )
        if credibility.get("status") == "unverified" and getattr(fact_result, "status", "") == "Verification Service Unavailable":
            credibility["reason"] += " Google Fact Check was unavailable."
    except Exception as e:
        print("Credibility Error:", e)
        credibility = {
            "verdict": "Needs Verification",
            "status": "unverified",
            "credibility_score": 50,
            "reason": (
                "Unable to verify the claim using external evidence."
            ),
            "evidence_source": "Combined Analysis"
        }
    # FINAL RESPONSE
    result = {
        "success": True,
        # Final credibility result
        "prediction": prediction.get("prediction", "Unverified"),
        "verdict": credibility.get(
            "verdict",
            "Needs Verification"
        ),
        "status": credibility.get(
            "status",
            "unverified"
        ),
        "credibility_score": credibility.get(
            "credibility_score",
            50
        ),
        "verdict_reason": credibility.get(
            "reason",
            "Evidence is insufficient."
        ),
        "claims_analysis": claims_analysis,
        "evidence_source": credibility.get(
            "evidence_source",
            "Combined Analysis"
        ),
        # ML information
        "confidence": prediction.get("confidence", 50),
        "ml_prediction": prediction.get("prediction", "Unverified"),
        "ml_confidence": prediction.get("confidence", 50),
        # Sentiment
        "sentiment": {
            "label": sentiment.label,
            "score": sentiment.score,
            "positive": sentiment.positive,
            "negative": sentiment.negative,
            "neutral": sentiment.neutral,
            "explanation": sentiment.explanation
        },
        # Bias
        "bias": {
            "detected": bias.detected,
            "score": bias.score,
            "types": bias.bias_types,
            "flagged_phrases": bias.flagged_phrases,
            "explanation": bias.explanation
        },
        # Clickbait
        "clickbait": {
            "detected": clickbait.is_clickbait,
            "score": clickbait.score,
            "signals": clickbait.signals,
            "explanation": clickbait.explanation
        },
        # Keywords
        "keywords": {
            "top_keywords": keywords.keywords,
            "top_phrases": keywords.top_phrases
        },
        # Entities
        "entities": {
            "persons": entities.persons,
            "organizations": entities.organizations,
            "locations": entities.locations,
            "other": entities.other
        },
        # Summary
        "summary": {
            "text": summary.summary,
            "bullet_points": summary.bullet_points,
            "word_count": summary.word_count,
            "reading_time_seconds": summary.reading_time_seconds
        },
        # Related news
        "related_news": {
            "query": keyword_query,
            "articles": related_articles
        },
        # Fact-check result
        "fact_check_count": (
            fact_result.__dict__
            if fact_result
            else None
        )
    }
    if user_id is not None:
        save_analysis_history(
            user_id=user_id,
            article=article,
            analysis=result
        )
    return result
# =========================================================
# ANALYZE TEXT
# =========================================================
@router.post("/analyze")
def analyze_news(
    data: NewsRequest,
    current_user=Depends(get_current_user)
):
    return perform_analysis(
        data.article,
        current_user.id
    )
# =========================================================
# ANALYZE URL
# =========================================================
@router.post("/analyze-url")
def analyze_url(
    data: URLRequest,
    current_user=Depends(get_current_user)
):
    try:
        article = extract_article_from_url(data.url)
        article_text = article.get("text", "")
        if not article_text or not article_text.strip():
            return {
                "success": False,
                "message": (
                    "Could not extract readable article "
                    "text from the provided URL."
                )
            }
        analysis = perform_analysis(
            article_text,
            current_user.id
        )
        analysis["title"] = article.get(
            "title",
            "Untitled Article"
        )
        analysis["url"] = data.url
        return analysis
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
# =========================================================
# ANALYZE PDF
# =========================================================
@router.post("/analyze-pdf")
async def analyze_pdf(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    file_path = None
    try:
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        safe_filename = os.path.basename(
            file.filename or "uploaded.pdf"
        )
        file_path = os.path.join(
            upload_dir,
            safe_filename
        )
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        article = extract_text_from_pdf(file_path)
        if not article or not article.strip():
            return {
                "success": False,
                "message": (
                    "No readable text was found "
                    "in the uploaded PDF."
                )
            }
        result = perform_analysis(
            article,
            current_user.id
        )
        result["filename"] = safe_filename
        return result
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
    # Uploaded PDF is retained in the uploads folder.
# =========================================================
# DOWNLOAD REPORT
# =========================================================
@router.post("/download-report")
def download_report(data: ReportRequest):
    try:
        pdf_path = generate_report(data.analysis)
        return FileResponse(
            path=pdf_path,
            filename="NewsCredAI_Report.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to generate report: {str(e)}"
        }
# =========================================================
# COMPARE ARTICLES
# =========================================================
@router.post("/compare")
def compare(request: CompareRequest):
    return compare_articles(
        request.article1,
        request.article2
    )
