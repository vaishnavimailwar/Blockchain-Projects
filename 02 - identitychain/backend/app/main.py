from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import Base, engine, SessionLocal
from .database.models import IdentityRecord  # noqa: F401 (ensures table registration)
from .api import (
    identity_routes,
    blockchain_routes,
    consensus_routes,
    security_routes,
    dht_routes,
    analytics_routes,
)

app = FastAPI(
    title="IDENTITYCHAIN API",
    description="Decentralized Identity Infrastructure & Trust Network \u2014 Blockchain-Based Secure Digital Identity Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(identity_routes.router)
app.include_router(blockchain_routes.router)
app.include_router(consensus_routes.router)
app.include_router(security_routes.router)
app.include_router(dht_routes.router)
app.include_router(analytics_routes.router)


@app.on_event("startup")
def seed_on_startup():
    from .database.seed import seed_if_empty
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "project": "IDENTITYCHAIN",
        "tagline": "Decentralized Identity Infrastructure & Trust Network",
        "status": "OPERATIONAL",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "OK"}
