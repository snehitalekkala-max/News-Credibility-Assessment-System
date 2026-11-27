from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import AnalysisHistory

# IMPORTANT:
# Change this import only if your project stores
# get_current_user in a different file.
from app.security import get_current_user


router = APIRouter(
    prefix="/history",
    tags=["Analysis History"]
)


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# GET USER HISTORY
# =========================================================

@router.get("")
def get_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    history = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.user_id == current_user.id
        )
        .order_by(
            AnalysisHistory.created_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "count": len(history),
        "history": [
            {
                "id": item.id,
                "article_title": item.article_title,
                "article_text": item.article_text,
                "verdict": item.verdict,
                "status": item.status,
                "credibility_score": item.credibility_score,
                "ml_prediction": item.ml_prediction,
                "ml_confidence": item.ml_confidence,
                "evidence_source": item.evidence_source,
                "created_at": item.created_at.isoformat()
                if item.created_at
                else None
            }
            for item in history
        ]
    }


# =========================================================
# GET SINGLE HISTORY ITEM
# =========================================================

@router.get("/{history_id}")
def get_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    item = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == current_user.id
        )
        .first()
    )

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Analysis history not found."
        )

    return {
        "success": True,
        "history": {
            "id": item.id,
            "article_title": item.article_title,
            "article_text": item.article_text,
            "verdict": item.verdict,
            "status": item.status,
            "credibility_score": item.credibility_score,
            "ml_prediction": item.ml_prediction,
            "ml_confidence": item.ml_confidence,
            "evidence_source": item.evidence_source,
            "created_at": item.created_at.isoformat()
            if item.created_at
            else None
        }
    }


# =========================================================
# DELETE HISTORY ITEM
# =========================================================

@router.delete("/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    item = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == current_user.id
        )
        .first()
    )

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Analysis history not found."
        )

    db.delete(item)

    db.commit()

    return {
        "success": True,
        "message": "Analysis history deleted successfully."
    }