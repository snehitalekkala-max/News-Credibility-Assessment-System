from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from app.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)

# =========================================================
# ANALYSIS HISTORY
# =========================================================

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    article_title = Column(
        String(500),
        nullable=True
    )

    article_text = Column(
        Text,
        nullable=False
    )

    verdict = Column(
        String(100),
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False
    )

    credibility_score = Column(
        Float,
        nullable=False
    )

    ml_prediction = Column(
        String(100),
        nullable=True
    )

    ml_confidence = Column(
        Float,
        nullable=True
    )

    evidence_source = Column(
        String(200),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )