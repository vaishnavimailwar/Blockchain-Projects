from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..services.audit_service import dashboard_summary, security_audit_report, chart_data

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return dashboard_summary(db)


@router.get("/audit")
def audit(db: Session = Depends(get_db)):
    return security_audit_report(db)


@router.get("/charts")
def charts(db: Session = Depends(get_db)):
    return chart_data(db)
