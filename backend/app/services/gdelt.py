import re
import requests


# =========================================================
# GDELT CONFIGURATION
# =========================================================

GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

DEFAULT_TIMESPAN = "3months"

MAX_RECORDS = 30

REQUEST_TIMEOUT = 20


# =========================================================
# QUERY CLEANING
# =========================================================

def clean_query(query):

    if not query:
        return ""

    query = query.strip()

    query = re.sub(r"\s+", " ", query)

    return query


# =========================================================
# SEARCH GDELT NEWS
# =========================================================

def search_gdelt(
    query,
    timespan=DEFAULT_TIMESPAN,
    maxrecords=MAX_RECORDS
):

    query = clean_query(query)

    if not query:

        print("GDELT ERROR: Empty query.")

        return []

    # Restrict results to English-language sources.

    if "sourcelang:" not in query.lower():

        query = f"{query} sourcelang:english"

    params = {

        "query": query,

        "mode": "artlist",

        "format": "json",

        "maxrecords": min(
            max(int(maxrecords), 1),
            250
        ),

        "timespan": timespan,

        "sort": "HybridRel"
    }

    headers = {

        "User-Agent": "NewsCred/1.0",

        "Accept": "application/json"
    }

    try:

        print("\n========== GDELT SEARCH ==========")

        print("GDELT QUERY:", query)

        print("GDELT TIMESPAN:", timespan)

        response = requests.get(

            GDELT_URL,

            params=params,

            headers=headers,

            timeout=REQUEST_TIMEOUT
        )

        print(
            "GDELT STATUS:",
            response.status_code
        )

        # =================================================
        # API ERROR HANDLING
        # =================================================

        if response.status_code == 429:

            print("GDELT ERROR: Rate limit exceeded.")

            return []

        if response.status_code != 200:

            print(
                "GDELT ERROR:",
                response.text[:500]
            )

            return []

        # Validate JSON response.

        try:

            data = response.json()

        except ValueError:

            print(
                "GDELT INVALID RESPONSE:",
                response.text[:500]
            )

            return []

        articles = []

        seen_urls = set()

        seen_titles = set()

        # =================================================
        # PROCESS NEWS ARTICLES
        # =================================================

        for article in data.get("articles", []):

            title = (
                article.get("title") or ""
            ).strip()

            article_url = (
                article.get("url") or ""
            ).strip()

            source = (
                article.get("domain") or
                "Unknown Source"
            )

            snippet = (

                article.get("snippet") or

                article.get("excerpt") or

                article.get("description") or

                ""

            ).strip()

            published_at = (
                article.get("seendate") or ""
            )

            # Skip invalid articles.

            if not title or not article_url:

                continue

            # Normalize title for duplicate detection.

            normalized_title = re.sub(

                r"\W+",

                " ",

                title.lower()

            ).strip()

            # Remove duplicate URLs.

            if article_url in seen_urls:

                continue

            # Remove duplicate titles.

            if normalized_title in seen_titles:

                continue

            seen_urls.add(article_url)

            seen_titles.add(normalized_title)

            # Preserve original response structure.

            articles.append({

                "title": title,

                "description": snippet,

                "content": snippet,

                "source": source,

                "url": article_url,

                "publishedAt": published_at
            })

        # =================================================
        # DEBUG INFORMATION
        # =================================================

        print(
            "GDELT ARTICLES FOUND:",
            len(articles)
        )

        for index, article in enumerate(
            articles[:5],
            start=1
        ):

            print(
                f"{index}. {article['title']}"
            )

            print(
                "Source:",
                article["source"]
            )

        if not articles:

            print("GDELT: No matching articles found.")

        print("==================================\n")

        return articles

    # =====================================================
    # EXCEPTION HANDLING
    # =====================================================

    except requests.exceptions.Timeout:

        print("GDELT ERROR: Request timed out.")

        return []

    except requests.exceptions.ConnectionError:

        print("GDELT ERROR: Internet connection failed.")

        return []

    except requests.exceptions.RequestException as e:

        print("GDELT REQUEST ERROR:", e)

        return []

    except Exception as e:

        print("UNEXPECTED GDELT ERROR:", e)

        return []