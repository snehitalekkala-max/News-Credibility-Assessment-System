from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.news import router as news_router
from app.routes.history import router as history_router
from app import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="News Credibility Assessment API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_router)
app.include_router(news_router)
app.include_router(history_router)
@app.get("/")
def home():
    return {
        "message": "Welcome to News Credibility Assessment API"
    }

@app.get("/health")
def health():
    return {
        "status": "API is running successfully"
    }