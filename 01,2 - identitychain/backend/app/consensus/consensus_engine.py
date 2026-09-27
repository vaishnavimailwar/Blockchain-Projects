"""
Proof-of-Authority inspired validator consensus combined with majority
agreement. This is IDENTITYCHAIN's PRIMARY, actually-implemented consensus
mechanism (see byzantine.py for fault-tolerance analysis, and
consensus_comparison.py-style data in api/consensus_routes.py for the purely
educational comparison against PoW / PoS / BFT).
"""
import time
from .validators import ValidatorRegistry

CONSENSUS_THRESHOLD_RATIO = 0.6  # >=60% of participating nodes must approve


def run_consensus(registry: ValidatorRegistry, identity_hash: str, hmac_valid: bool, chain_valid: bool) -> dict:
    votes = {}
    responded = 0
    approved = 0

    for node in registry.nodes.values():
        result = node.vote(identity_hash, hmac_valid, chain_valid)
        votes[node.node_id] = {
            "vote": result,
            "organization": node.organization,
            "behavior": node.behavior,
            "status": node.status,
        }
        if result != "NO_RESPONSE":
            responded += 1
            if result == "VALID":
                approved += 1

    threshold = max(1, round(responded * CONSENSUS_THRESHOLD_RATIO))
    achieved = approved >= threshold and responded > 0

    return {
        "identity_hash": identity_hash,
        "votes": votes,
        "total_nodes": len(registry.nodes),
        "responded": responded,
        "approved": approved,
        "threshold_required": threshold,
        "threshold_ratio": CONSENSUS_THRESHOLD_RATIO,
        "result": "CONSENSUS ACHIEVED" if achieved else "CONSENSUS FAILED",
        "achieved": achieved,
        "timestamp": time.time(),
    }
