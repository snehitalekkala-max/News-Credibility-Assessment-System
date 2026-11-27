import re
from threading import Lock
from urllib.parse import urlsplit

_lock = Lock()
_model = None
MODEL = 'cross-encoder/nli-deberta-v3-small'
# Explicit source policy for this prototype; not a guarantee of accuracy.
TRUSTED = ('isro.gov.in','nasa.gov','esa.int','pib.gov.in','bbc.com','bbc.co.uk','reuters.com','apnews.com','olympics.com','who.int','un.org','noaa.gov','icc-cricket.com','theguardian.com','nature.com','britannica.com')

def source_group(article):
    host = (urlsplit(article.get('url') or '').hostname or '').lower()
    for domain in TRUSTED:
        if host == domain or host.endswith('.'+domain):
            return 'bbc' if domain.startswith('bbc.') else domain
    return None

def semantic_evidence(claim, articles):
    global _model
    result = {'supporting': [], 'contradicting': [], 'related': []}
    pairs, metadata = [], []
    seen = set()
    for article in articles or []:
        group = source_group(article)
        if not group or article.get('provider') == 'Curated Reference':
            continue
        title = str(article.get('title') or '')
        description = str(article.get('description') or article.get('content') or '')
        # Use title and snippet together, retaining context and avoiding duplicate text.
        passage = (title + '. ' + description)[:1600]
        key = (group, passage.lower())
        if key in seen or not description.strip():
            continue
        seen.add(key)
        pairs.append({'text': passage, 'text_pair': claim[:1000]})
        metadata.append((article, group))
        if len(pairs) >= 24:
            break
    if not pairs:
        return result
    try:
        with _lock:
            if _model is None:
                from transformers import pipeline
                _model = pipeline('text-classification', model=MODEL, device=-1)
            predictions = _model(pairs, top_k=None, truncation=True, max_length=512, batch_size=4)
        for (article, group), scores in zip(metadata, predictions):
            values = {x['label'].lower(): float(x['score']) for x in scores}
            label = max(values, key=values.get)
            score = values[label]
            item = {'article': article, 'relevance': score, 'semantic_label': label, 'source_group': group}
            bucket = 'supporting' if label == 'entailment' and score >= .85 else 'contradicting' if label == 'contradiction' and score >= .90 else 'related'
            result[bucket].append(item)
            print('NLI:', group, label, round(score, 3))
    except Exception as exc:
        print('SEMANTIC VERIFICATION ERROR:', repr(exc))
    for items in result.values():
        items.sort(key=lambda x: x['relevance'], reverse=True)
    return result
