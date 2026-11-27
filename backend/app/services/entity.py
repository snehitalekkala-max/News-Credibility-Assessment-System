import re
from dataclasses import dataclass

import nltk


@dataclass
class EntityResult:
    persons: list[str]
    organizations: list[str]
    locations: list[str]
    other: list[str]


COUNTRY_WORDS = {
    "India", "Australia", "Pakistan", "China", "Japan",
    "England", "Sri Lanka", "Bangladesh", "Nepal",
    "USA", "United States", "Canada", "France",
    "Germany", "Russia", "Brazil", "South Africa",
    "New Zealand"
}

ORGANIZATION_WORDS = {
    "ICC", "BCCI", "FIFA", "WHO", "UN", "NASA",
    "Google", "Microsoft", "Apple",
    "Infosys", "TCS", "Wipro", "Accenture"
}


def unique(values):

    seen = set()
    result = []

    for item in values:

        if item.lower() not in seen:
            seen.add(item.lower())
            result.append(item)

    return result


def extract_entities(text: str):

    persons = []
    organizations = []
    locations = []
    other = []

    try:

        tokens = nltk.word_tokenize(text)

        pos_tags = nltk.pos_tag(tokens)

        chunks = nltk.ne_chunk(pos_tags)

        for chunk in chunks:

            if hasattr(chunk, "label"):

                label = chunk.label()

                entity = " ".join(word for word, tag in chunk)

                if label == "PERSON":
                    persons.append(entity)

                elif label == "ORGANIZATION":
                    organizations.append(entity)

                elif label in ("GPE", "LOCATION", "GSP"):
                    locations.append(entity)

                else:
                    other.append(entity)

    except Exception:

        entities = re.findall(
            r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b",
            text
        )

        for entity in entities:

            if entity in COUNTRY_WORDS:
                locations.append(entity)

            elif entity in ORGANIZATION_WORDS:
                organizations.append(entity)

            else:
                other.append(entity)

    return EntityResult(
        persons=unique(persons),
        organizations=unique(organizations),
        locations=unique(locations),
        other=unique(other)
    )