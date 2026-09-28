from fastapi import APIRouter
from .. import state
from ..consensus.consensus_engine import run_consensus
from ..consensus.byzantine import run_byzantine_simulation, apply_scenario, analyze_fault_tolerance, SCENARIOS
from ..identity.schemas import ByzantineScenarioRequest, ValidatorBehaviorRequest

router = APIRouter(prefix="/consensus", tags=["Consensus"])

CONSENSUS_COMPARISON = [
    {
        "algorithm": "Proof of Work (PoW)",
        "status": "Educational Comparison Only",
        "description": "Nodes compete to solve a computational puzzle (nonce search). Implemented in IDENTITYCHAIN's Mining Simulator for hashing demonstration purposes, but not used as the network's trust mechanism.",
    },
    {
        "algorithm": "Proof of Stake (PoS)",
        "status": "Educational Comparison Only \u2014 Conceptual",
        "description": "Validators are selected to propose blocks proportionally to staked economic value. Not implemented \u2014 described for comparative understanding only.",
    },
    {
        "algorithm": "Proof of Authority (PoA) \u2014 IMPLEMENTED",
        "status": "Primary Project Implementation",
        "description": "A fixed set of pre-authorized, reputable validator nodes vote on proposed identities. IDENTITYCHAIN combines this with majority-agreement thresholds. This is the network's real, working consensus mechanism.",
    },
    {
        "algorithm": "Byzantine Fault Tolerant (BFT) Agreement \u2014 IMPLEMENTED",
        "status": "Primary Project Implementation",
        "description": "Applies the classical N >= 3f + 1 fault bound on top of PoA voting to determine whether malicious/offline validators can be tolerated. Implemented in the Byzantine Agreement Security Lab.",
    },
]


@router.get("/nodes")
def list_nodes():
    return {"nodes": state.validator_registry.list_nodes()}


@router.post("/validate")
def validate_identity_hash(identity_hash: str):
    return run_consensus(state.validator_registry, identity_hash, hmac_valid=True, chain_valid=True)


@router.post("/node-behavior")
def set_node_behavior(req: ValidatorBehaviorRequest):
    ok = state.validator_registry.set_behavior(req.node_id, req.behavior)
    return {"success": ok}


@router.post("/reset")
def reset_validators():
    state.validator_registry.reset()
    return {"success": True}


@router.get("/scenarios")
def list_scenarios():
    return {"scenarios": [{"key": k, "label": v["label"]} for k, v in SCENARIOS.items()]}


@router.post("/simulate-byzantine")
def simulate_byzantine(req: ByzantineScenarioRequest):
    applied = apply_scenario(state.validator_registry, req.scenario)
    if not applied.get("success"):
        return applied
    identity_hash = "demo-identity-hash-for-simulation"
    simulation = run_byzantine_simulation(state.validator_registry, identity_hash)
    return {"applied_scenario": applied, **simulation}


@router.get("/fault-analysis")
def fault_analysis():
    return analyze_fault_tolerance(state.validator_registry)


@router.get("/comparison")
def consensus_comparison():
    return {"comparison": CONSENSUS_COMPARISON}
