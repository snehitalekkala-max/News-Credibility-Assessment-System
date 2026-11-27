import os
import re
import requests
from dotenv import load_dotenv


# =========================================================
# NEWSAPI CONFIGURATION
# =========================================================

load_dotenv()

API_KEY = os.getenv("NEWS_API_KEY", "")

NEWS_API_URL = "https://newsapi.org/v2/everything"

MAX_ARTICLES = 30

REQUEST_TIMEOUT = 20


# =========================================================
# QUERY CLEANING
# =========================================================

def clean_query(query):

    if not query:
        return ""

    query = query.strip()

    query = re.sub(r"\s+", " ", query)

    # NewsAPI supports queries up to 500 characters.
    if len(query) > 500:
        query = query[:500].rsplit(" ", 1)[0]

    return query


# =========================================================
# SEARCH NEWS
# =========================================================

def search_news(query):

    query = clean_query(query)

    if not query:

        print("NEWSAPI ERROR: Empty search query.")

        return []

    if not API_KEY:

        print("NEWSAPI ERROR: API key is missing.")

        return []

    params = {

        "q": query,

        "language": "en",

        "sortBy": "relevancy",

        "pageSize": MAX_ARTICLES
    }

    headers = {

        "X-Api-Key": API_KEY
    }

    try:

        print("\n========== NEWSAPI SEARCH ==========")

        print("NEWSAPI QUERY:", query)

        response = requests.get(

            NEWS_API_URL,

            params=params,

            headers=headers,

            timeout=REQUEST_TIMEOUT
        )

        print(
            "NEWSAPI STATUS CODE:",
            response.status_code
        )

        # =================================================
        # HANDLE API ERRORS
        # =================================================

        if response.status_code == 401:

            print("NEWSAPI ERROR: Invalid API key.")

            return []

        if response.status_code == 429:

            print("NEWSAPI ERROR: API rate limit exceeded.")

            return []

        if response.status_code != 200:

            print(
                "NEWSAPI ERROR:",
                response.text[:500]
            )

            return []

        data = response.json()

        if data.get("status") != "ok":

            print(
                "NEWSAPI ERROR:",
                data.get("message", "Unknown API error")
            )

            return []

        articles = []

        seen_urls = set()

        seen_titles = set()

        # =================================================
        # PROCESS ARTICLES
        # =================================================

        for article in data.get("articles", []):

            title = (
                article.get("title") or ""
            ).strip()

            description = (
                article.get("description") or ""
            ).strip()

            content = (
                article.get("content") or ""
            ).strip()

            article_url = (
                article.get("url") or ""
            ).strip()

            source = (
                article.get("source") or {}
            ).get("name") or "Unknown Source"

            published_at = (
                article.get("publishedAt") or ""
            )

            # Skip invalid and removed articles.

            if not title or title.lower() == "[removed]":

                continue

            if not article_url:

                continue

            # Remove truncation markers.

            content = re.sub(
                r"\[\+\d+\s+chars\]",
                "",
                content
            ).strip()

            # Remove duplicate articles.

            normalized_title = re.sub(
                r"\W+",
                " ",
                title.lower()
            ).strip()

            if article_url in seen_urls:

                continue

            if normalized_title in seen_titles:

                continue

            seen_urls.add(article_url)

            seen_titles.add(normalized_title)

            articles.append({

                "title": title,

                "source": source,

                "url": article_url,

                "description": description,

                "content": content,

                "publishedAt": published_at
            })

        # =================================================
        # DEBUG INFORMATION
        # =================================================

        print(
            "NEWSAPI TOTAL RESULTS:",
            data.get("totalResults", 0)
        )

        print(
            "NEWSAPI ARTICLES FOUND:",
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

        print("====================================\n")

        return articles

    # =====================================================
    # EXCEPTION HANDLING
    # =====================================================

    except requests.exceptions.Timeout:

        print("NEWSAPI ERROR: Request timed out.")

        return []

    except requests.exceptions.ConnectionError:

        print("NEWSAPI ERROR: Internet connection failed.")

        return []

    except requests.exceptions.RequestException as e:

        print("NEWSAPI REQUEST ERROR:", e)

        return []

    except ValueError as e:

        print("NEWSAPI RESPONSE ERROR:", e)

        return []

    except Exception as e:

        print("UNEXPECTED NEWSAPI ERROR:", e)

        return []