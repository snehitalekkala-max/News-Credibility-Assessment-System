from dataclasses import dataclass

from nltk.sentiment.vader import SentimentIntensityAnalyzer


@dataclass
class SentimentResult:
    label: str
    score: float
    positive: float
    negative: float
    neutral: float
    explanation: str


def analyze_sentiment(text: str):

    sia = SentimentIntensityAnalyzer()

    scores = sia.polarity_scores(text)

    compound = scores["compound"]

    if compound >= 0.05:
        label = "Positive"

    elif compound <= -0.05:
        label = "Negative"

    else:
        label = "Neutral"

    return SentimentResult(

        label=label,

        score=compound,

        positive=scores["pos"],

        negative=scores["neg"],

        neutral=scores["neu"],

        explanation="Sentiment analysis completed."

    )