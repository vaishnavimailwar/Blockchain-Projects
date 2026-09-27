from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database.models import IdentityRecord
from ..identity.schemas import IdentityCreate
from ..identity.service import run_trust_pipeline, next_identity_id

router = APIRouter(prefix="/identities", tags=["Identity"])


def _record_to_dict(r: IdentityRecord) -> dict:
    return {
        "id": r.id,
        "full_name": r.full_name,
        "unique_identity_number": r.unique_identity_number,
        "identity_type": r.identity_type,
        "organization": r.organization,
        "email": r.email,
        "department": r.department,
        "additional_metadata": r.metadata_json,
        "sha1_hash": r.sha1_hash,
        "sha256_hash": r.sha256_hash,
        "sha3_256_hash": r.sha3_256_hash,
        "hmac_mac": r.hmac_mac,
        "dht_node": r.dht_node,
        "block_index": r.block_index,
        "verified": r.verified,
        "created_at": r.created_at,
    }


@router.post("")
def create_identity(payload: IdentityCreate, db: Session = Depends(get_db)):
    identity_id = next_identity_id(db)
    result = run_trust_pipeline(db, {"id": identity_id, **payload.model_dump()})
    return result


@router.get("")
def list_identities(db: Session = Depends(get_db)):
    records = db.query(IdentityRecord).order_by(IdentityRecord.created_at.desc()).all()
    return [_record_to_dict(r) for r in records]


@router.get("/{identity_id}")
def get_identity(identity_id: str, db: Session = Depends(get_db)):
    record = db.query(IdentityRecord).filter(IdentityRecord.id == identity_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Identity not found")
    return _record_to_dict(record)


@router.post("/{identity_id}/verify")
def verify_identity(identity_id: str, db: Session = Depends(get_db)):
    record = db.query(IdentityRecord).filter(IdentityRecord.id == identity_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Identity not found")

    from ..blockchain.hashing import canonicalize, sha3_256_hash
    canonical = canonicalize({
        "full_name": record.full_name,
        "unique_identity_number": record.unique_identity_number,
        "identity_type": record.identity_type,
        "organization": record.organization,
        "email": record.email,
        "department": record.department,
        "additional_metadata": record.metadata_json,
    })
    recomputed = sha3_256_hash(canonical)
    match = recomputed == record.sha3_256_hash

    return {
        "identity_id": identity_id,
        "stored_hash": record.sha3_256_hash,
        "recomputed_hash": recomputed,
        "integrity_verified": match,
        "result": "INTEGRITY VERIFIED" if match else "INTEGRITY CHECK FAILED — DATA HAS BEEN MODIFIED",
    }
