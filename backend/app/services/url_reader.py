from newspaper import Article


def extract_article_from_url(url: str):
    """
    Downloads and extracts article text from a news URL.
    """

    article = Article(url)

    article.download()
    article.parse()

    return {
        "title": article.title,
        "text": article.text,
    }