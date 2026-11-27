from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.keyword import extract_keywords
from app.services.entity import extract_entities
from app.services.sentiment import analyze_sentiment
from app.services.bias import detect_bias
from app.services.contradiction import has_contradiction

# Load model once
model = SentenceTransformer("all-MiniLM-L6-v2")


def compare_articles(article1: str, article2: str):

    emb1 = model.encode([article1])
    emb2 = model.encode([article2])

    similarity = float(cosine_similarity(emb1, emb2)[0][0] * 100)

    contradiction = has_contradiction(article1, article2)

    if contradiction:
        verdict = "Contradictory"
    elif similarity >= 85:
        verdict = "Highly Similar"
    elif similarity >= 60:
        verdict = "Partially Similar"
    else:
        verdict = "Different"

    # Keywords
    keywords1 = extract_keywords(article1)
    keywords2 = extract_keywords(article2)

    set1 = {word for word, count in keywords1.keywords}
    set2 = {word for word, count in keywords2.keywords}

    common_keywords = sorted(list(set1 & set2))
    unique_article1 = sorted(list(set1 - set2))
    unique_article2 = sorted(list(set2 - set1))

    # Entities
    entities1 = extract_entities(article1)
    entities2 = extract_entities(article2)

    shared_persons = list(set(entities1.persons) & set(entities2.persons))
    shared_orgs = list(set(entities1.organizations) & set(entities2.organizations))
    shared_locations = list(set(entities1.locations) & set(entities2.locations))

    # Sentiment
    sentiment1 = analyze_sentiment(article1)
    sentiment2 = analyze_sentiment(article2)

    # Bias
    bias1 = detect_bias(article1)
    bias2 = detect_bias(article2)

    # Summary
    if contradiction:
       summary = (
          f"Both articles discuss the same event, "
          f"but they report opposite outcomes, indicating a factual contradiction."
    )
    elif similarity >= 90:
        summary = "Both articles describe the same event with minor wording differences."
    elif similarity >= 70:
        summary = "The articles discuss the same topic with some wording differences."
    else:
        summary = "The articles discuss different topics."

    return {
        "similarity": round(similarity, 2),
        "overall_verdict": verdict,
        "common_keywords": common_keywords,
        "unique_keywords_article1": unique_article1,
        "unique_keywords_article2": unique_article2,
        "shared_entities": {
            "persons": shared_persons,
            "organizations": shared_orgs,
            "locations": shared_locations
        },
        "sentiment": {
            "article1": sentiment1.label,
            "article2": sentiment2.label
        },
        "bias": {
            "article1": {
                "detected": bias1.detected,
                "score": bias1.score
            },
            "article2": {
                "detected": bias2.detected,
                "score": bias2.score
            }
        },
        "contradiction": contradiction,
        "summary": summary
    }