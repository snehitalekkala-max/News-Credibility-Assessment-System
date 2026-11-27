from pathlib import Path
import joblib


# =========================================================
# MODEL CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "ml_models" / "fake_news_model.pkl"

VECTORIZER_PATH = BASE_DIR / "ml_models" / "vectorizer.pkl"


# =========================================================
# CLASS LABEL CONFIGURATION
# =========================================================

REAL_LABEL = 1
FAKE_LABEL = 0


# =========================================================
# LOAD MODEL AND VECTORIZER
# =========================================================

model = None
vectorizer = None

try:

    model = joblib.load(MODEL_PATH)

    vectorizer = joblib.load(VECTORIZER_PATH)

    print("ML Model loaded successfully.")

    print("Vectorizer loaded successfully.")

    print("Model Classes:", model.classes_)

except Exception as e:

    print("Model Loading Error:", e)


# =========================================================
# DEFAULT RESPONSE
# =========================================================

def unverified_result(reason):

    return {
        "prediction": "Unverified",
        "confidence": 0,
        "credibility_score": 50,
        "real_probability": None,
        "fake_probability": None,
        "reason": reason
    }


# =========================================================
# NEWS PREDICTION
# =========================================================

def predict_news(article: str):

    # Input validation

    if not article or not article.strip():

        return unverified_result(
            "Article text cannot be empty."
        )

    # Model validation

    if model is None or vectorizer is None:

        return unverified_result(
            "Machine learning model is unavailable."
        )

    try:

        article = article.strip()

        # Transform article

        article_vector = vectorizer.transform(
            [article]
        )

        non_zero_features = article_vector.nnz

        # Check whether the model recognizes the input

        if non_zero_features == 0:

            return unverified_result(
                "No recognizable features were found."
            )

        # Predict class

        prediction = model.predict(
            article_vector
        )[0]

        # Predict probabilities

        probabilities = model.predict_proba(
            article_vector
        )[0]

        classes = list(model.classes_)

        probability_map = {
            label: float(probability)
            for label, probability in zip(
                classes,
                probabilities
            )
        }

        # Validate class labels

        if set(classes) != {REAL_LABEL, FAKE_LABEL}:

            return unverified_result(
                "Unexpected model class labels."
            )

        # Calculate individual probabilities

        real_probability = round(
            probability_map[REAL_LABEL] * 100,
            2
        )

        fake_probability = round(
            probability_map[FAKE_LABEL] * 100,
            2
        )

        # Prediction confidence

        confidence = round(
            probability_map[prediction] * 100,
            2
        )

        # Determine ML prediction

        if prediction == REAL_LABEL:

            result = "Real News"

        elif prediction == FAKE_LABEL:

            result = "Fake News"

        else:

            result = "Unverified"

        # Credibility score represents the model's
        # estimated probability of the real-news class.

        credibility_score = real_probability

        # =================================================
        # DEBUG INFORMATION
        # =================================================

        print("\n========== ML PREDICTION ==========")

        print("Model Classes:", classes)

        print("Prediction Value:", prediction)

        print("ML Prediction:", result)

        print("Real Probability:", real_probability)

        print("Fake Probability:", fake_probability)

        print("Confidence:", confidence)

        print("Credibility Score:", credibility_score)

        print("Vector Shape:", article_vector.shape)

        print("Non-zero Features:", non_zero_features)

        print("===================================\n")

        # =================================================
        # FINAL RESPONSE
        # =================================================

        return {

            "prediction": result,

            "confidence": confidence,

            "credibility_score": credibility_score,

            "real_probability": real_probability,

            "fake_probability": fake_probability,

            "reason": (
                "Machine learning classification based "
                "on learned textual patterns."
            )
        }

    except Exception as e:

        print("ML Prediction Error:", e)

        return unverified_result(
            "Machine learning prediction failed."
        )