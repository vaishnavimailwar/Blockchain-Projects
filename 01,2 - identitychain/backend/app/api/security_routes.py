from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database.models import IdentityRecord, SecurityEvent
from ..blockchain.hashing import multi_hash, avalanche_analysis
from ..security.hmac_service import authenticate_payload, verify_payload
from ..security.integrity import build_hash_table
from ..identity.schemas import (
    HashRequest, HMACGenerateRequest, HMACVerifyRequest, AvalancheRequest,
    TamperIdentityRequest, TamperBlockRequest,
)
from .. import state

router = APIRouter(prefix="/security", tags=["Security"])


@router.post("/hash")
def hash_text(req: HashRequest):
    return multi_hash(req.text)


@router.post("/compare")
def compare_algorithms(req: HashRequest):
    result = multi_hash(req.text)
    matrix = [
        {"algorithm": "SHA-1", "digest_length": 160, "security_status": "Legacy / Educational Comparison Only",
         "project_usage": "Academic comparison laboratory", "digest": result["sha1"]["digest"]},
        {"algorithm": "SHA-256", "digest_length": 256, "security_status": "Primary Integrity Algorithm",
         "project_usage": "Identity fingerprint, blockchain hashing", "digest": result["sha256"]["digest"]},
        {"algorithm": "SHA3-256", "digest_length": 256, "security_status": "Advanced Cryptographic Alternative",
         "project_usage": "Advanced identity fingerprint (Keccak sponge)", "digest": result["sha3_256"]["digest"]},
    ]
    return {"input": req.text, "matrix": matrix}


@router.post("/hmac/generate")
def hmac_generate(req: HMACGenerateRequest):
    return authenticate_payload(req.payload)


@router.post("/hmac/verify")
def hmac_verify(req: HMACVerifyRequest):
    return verify_payload(req.payload, req.mac)


@router.post("/avalanche")
def avalanche(req: AvalancheRequest):
    return avalanche_analysis(req.original_text, req.modified_text, req.algorithm or "sha256")


@router.get("/hash-table")
def hash_table_demo(db: Session = Depends(get_db)):
    ids = [r.id for r in db.query(IdentityRecord).all()]
    if not ids:
        ids = [f"DID-{i:03d}" for i in range(1, 21)]
    return build_hash_table(ids)


@router.post("/tamper/identity")
def tamper_identity(req: TamperIdentityRequest, db: Session = Depends(get_db)):
    record = db.query(IdentityRecord).filter(IdentityRecord.id == req.identity_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Identity not found")

    original_hash = record.sha256_hash
    if hasattr(record, req.field):
        setattr(record, req.field, req.new_value)

    from ..blockchain.hashing import canonicalize, sha256_hash
    canonical = canonicalize({
        "full_name": record.full_name,
        "unique_identity_number": record.unique_identity_number,
        "identity_type": record.identity_type,
        "organization": record.organization,
        "email": record.email,
        "department": record.department,
        "additional_metadata": record.metadata_json,
    })
    new_hash = sha256_hash(canonical)

    db.add(SecurityEvent(event_type="TAMPER_DETECTED", severity="CRITICAL",
                          description=f"Field '{req.field}' modified on {req.identity_id} — hash mismatch detected"))
    db.commit()

    return {
        "identity_id": req.identity_id,
        "field_modified": req.field,
        "new_value": req.new_value,
        "original_hash": original_hash,
        "recomputed_hash": new_hash,
        "hash_match": original_hash == new_hash,
        "result": "HASH MISMATCH — TAMPERING DETECTED" if original_hash != new_hash else "NO CHANGE DETECTED",
    }


@router.post("/tamper/block")
def tamper_block(req: TamperBlockRequest, db: Session = Depends(get_db)):
    from ..blockchain.hashing import sha256_hash
    fake_hash = sha256_hash(f"TAMPERED-{req.block_index}-{state.blockchain.chain[-1].timestamp}")
    result = state.blockchain.tamper_block(req.block_index, fake_hash)

    if result.get("success"):
        db.add(SecurityEvent(event_type="BLOCK_TAMPER", severity="CRITICAL",
                              description=f"Block #{req.block_index} transaction hash tampered with"))
        db.commit()

    validation = state.blockchain.validate_chain()
    return {"tamper_result": result, "chain_validation": validation}
