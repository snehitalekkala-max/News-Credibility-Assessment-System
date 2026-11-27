import re
from urllib.parse import urlsplit
from ddgs import DDGS


def search_web(query, max_results=10):

    if not query or not query.strip():
        return []

    query = re.sub(r"\s+", " ", query).strip()

    try:

        print("\n========== WEB SEARCH ==========")
        print("WEB SEARCH QUERY:", query)
        print("SEARCH ENGINE: Bing")

        results = DDGS(timeout=20).text(
            query[:400],
            backend="bing",
            max_results=max_results
        )

        articles = []
        seen_urls = set()

        for item in results or []:

            url = item.get("href") or item.get("url") or ""

            host = urlsplit(url).hostname

            if not host:
                continue

            if urlsplit(url).scheme not in ("http", "https"):
                continue

            if url in seen_urls:
                continue

            title = item.get("title") or ""
            description = item.get("body") or ""

            if not title:
                continue

            seen_urls.add(url)

            articles.append({

                "title": title,

                "description": description,

                "content": "",

                "source": host,

                "url": url,

                "publishedAt": "",

                "provider": "Web Search"
            })

        print("WEB SEARCH RESULTS:", len(articles))

        for index, article in enumerate(articles, start=1):

            print(f"{index}. {article['title']}")
            print("SOURCE:", article["source"])
            print("DESCRIPTION:", article["description"])

        print("================================\n")

        return articles

    except Exception as error:

        print("WEB SEARCH ERROR:", str(error))

        return []