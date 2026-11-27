from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# ==========================================================
# Load Dataset
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

fake_path = BASE_DIR / "datasets" / "Fake.csv"
true_path = BASE_DIR / "datasets" / "True.csv"

fake = pd.read_csv(fake_path)
true = pd.read_csv(true_path)

# ==========================================================
# Add Labels
# Fake = 0
# True = 1
# ==========================================================

fake["label"] = 0
true["label"] = 1

# ==========================================================
# Merge Datasets
# ==========================================================

news = pd.concat([fake, true], ignore_index=True)

# ==========================================================
# Shuffle Dataset
# ==========================================================

news = news.sample(frac=1, random_state=42).reset_index(drop=True)

print("\nDataset Loaded Successfully!\n")

print("Dataset Shape:", news.shape)

print("\nColumns:")
print(news.columns)

print("\n-------------------------------------")

print("Fake News :", len(news[news["label"] == 0]))
print("True News :", len(news[news["label"] == 1]))

print("\n-------------------------------------")

# ==========================================================
# Keep Required Columns
# ==========================================================

news["content"] = news["title"].fillna("") + " " + news["text"].fillna("")
news = news[["content", "label"]]

# Remove missing values
news = news.dropna()

print("Final Dataset Shape:", news.shape)

# ==========================================================
# Features & Labels
# ==========================================================

X = news["content"]
y = news["label"]

# ==========================================================
# Train Test Split
# ==========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining Samples :", len(X_train))
print("Testing Samples  :", len(X_test))

# ==========================================================
# TF-IDF Vectorizer
# ==========================================================

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_df=0.8,
    min_df=2,
    ngram_range=(1,2),
    lowercase=True
)

X_train_vectorized = vectorizer.fit_transform(X_train)
X_test_vectorized = vectorizer.transform(X_test)

print("\nText Vectorization Completed!")

# ==========================================================
# Logistic Regression Model
# ==========================================================

model = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train_vectorized, y_train)

print("Model Training Completed!")

# ==========================================================
# Prediction
# ==========================================================

predictions = model.predict(X_test_vectorized)

# ==========================================================
# Accuracy
# ==========================================================

accuracy = accuracy_score(y_test, predictions)

print("\n=====================================")
print(f"Model Accuracy : {accuracy * 100:.2f}%")
print("=====================================\n")

print("Classification Report\n")

print(classification_report(y_test, predictions))

# ==========================================================
# Save Model
# ==========================================================

model_path = BASE_DIR / "ml_models" / "fake_news_model.pkl"
vectorizer_path = BASE_DIR / "ml_models" / "vectorizer.pkl"

joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print("-------------------------------------")
print("Model Saved Successfully!")
print(model_path)

print("\nVectorizer Saved Successfully!")
print(vectorizer_path)
print("-------------------------------------")