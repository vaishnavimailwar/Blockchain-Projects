"""
The Cryptographic Trust Pipeline — IDENTITYCHAIN's signature feature.

IDENTITY DATA -> CANONICALIZATION -> MULTI-ALGORITHM HASHING ->
HMAC AUTHENTICATION -> DHT ROUTING -> VALIDATOR BROADCAST ->
BYZANTINE-RESILIENT CONSENSUS -> MERKLE AGGREGATION -> BLOCK HASHING ->
LEDGER COMMITMENT
"""
import time
from sqlalchemy.orm import Session

from ..blockchain.hashing import canonicalize, multi_hash
from ..security.hmac_service import authenticate_payload
from ..consensus.consensus_engine import run_consensus
from ..consensus.byzantine import analyze_fault_tolerance
from ..database.models import IdentityRecord, ActivityLog, SecurityEvent
from .. import state


def _log(db: Session, message: str):
    db.add(ActivityLog(message=message, timestamp=time.time()))


def next_identity_id(db: Session) -> str:
    count = db.query(IdentityRecord).count()
    return f"DID-{count + 1:03d}"


def run_trust_pipeline(db: Session, payload: dict) -> dict:
    """Executes every stage of the pipeline and returns a full trace plus
    the persisted identity record — used both by real registrations and by
    the seed script."""
    pipeline_trace = []

    # STAGE 1: canonicalization
    identity_id = payload["id"]
    canonical = canonicalize({k: v for k, v in payload.items() if k != "id"})
    pipeline_trace.append({"stage": "CANONICALIZING DATA", "detail": canonical[:120] + ("..." if len(canonical) > 120 else "")})

    # STAGE 2: multi-algorithm hashing
    hashes = multi_hash(canonical)
    pipeline_trace.append({"stage": "GENERATING CRYPTOGRAPHIC FINGERPRINT", "detail": f"SHA3-256: {hashes['sha3_256']['digest'][:24]}..."})

    # STAGE 3: HMAC authentication
    auth = authenticate_payload({"identity_id": identity_id, "fingerprint": hashes["sha3_256"]["digest"]})
    pipeline_trace.append({"stage": "AUTHENTICATING PAYLOAD", "detail": f"MAC: {auth['mac'][:24]}..."})

    # STAGE 4: DHT routing
    dht_result = state.dht_ring.simulate_lookup_path(identity_id)
    pipeline_trace.append({"stage": "DHT ROUTING", "detail": f"Routed to {dht_result['result']['responsible_node']}"})

    # STAGE 5: validator broadcast + STAGE 6: Byzantine-resilient consensus
    consensus_result = run_consensus(state.validator_registry, hashes["sha3_256"]["digest"], hmac_valid=True, chain_valid=True)
    fault_analysis = analyze_fault_tolerance(state.validator_registry)
    pipeline_trace.append({"stage": "BROADCASTING TO VALIDATORS", "detail": f"{consensus_result['responded']} nodes responded"})
    pipeline_trace.append({"stage": "CONSENSUS ACHIEVED" if consensus_result["achieved"] else "CONSENSUS FAILED",
                            "detail": f"{consensus_result['approved']}/{consensus_result['total_nodes']} validators approved"})

    committed = consensus_result["achieved"] and fault_analysis["byzantine_fault_tolerated"]
    block = None

    if committed:
        # STAGE 7 + 8: Merkle aggregation happens inside add_block(); block hashing via PoW mining
        tx = {
            "identity_id": identity_id,
            "identity_hash": hashes["sha3_256"]["digest"],
            "hmac": auth["mac"],
        }
        block = state.blockchain.add_block(
            identity_transactions=[tx],
            validator=list(consensus_result["votes"].keys())[0],
            consensus_result=consensus_result,
            difficulty=2,
        )
        pipeline_trace.append({"stage": "MERKLE AGGREGATION", "detail": f"Merkle root: {block.merkle_root[:24]}..."})
        pipeline_trace.append({"stage": "BLOCK COMMITTED", "detail": f"Block #{block.index:05d} — hash {block.block_hash[:24]}..."})

    # Persist identity record
    record = IdentityRecord(
        id=identity_id,
        full_name=payload.get("full_name", ""),
        unique_identity_number=payload.get("unique_identity_number", ""),
        identity_type=payload.get("identity_type", ""),
        organization=payload.get("organization", ""),
        email=payload.get("email", ""),
        department=payload.get("department"),
        metadata_json=payload.get("additional_metadata") or {},
        sha1_hash=hashes["sha1"]["digest"],
        sha256_hash=hashes["sha256"]["digest"],
        sha3_256_hash=hashes["sha3_256"]["digest"],
        hmac_mac=auth["mac"],
        dht_node=dht_result["result"]["responsible_node"],
        block_index=block.index if block else None,
        verified=committed,
    )
    db.add(record)
    _log(db, f"Identity {identity_id} pipeline {'committed to block #' + str(block.index) if block else 'FAILED — consensus not achieved'}")
    if not committed:
        db.add(SecurityEvent(event_type="CONSENSUS_FAILURE", severity="WARNING",
                              description=f"Identity {identity_id} failed to reach consensus"))
    db.commit()

    return {
        "identity_id": identity_id,
        "pipeline_trace": pipeline_trace,
        "hashes": hashes,
        "hmac": auth,
        "dht_routing": dht_result,
        "consensus": consensus_result,
        "fault_analysis": fault_analysis,
        "committed": committed,
        "block": block.to_dict() if block else None,
    }
