"""
Byzantine Agreement / fault-tolerance simulation.

Classical BFT theory: a system of N nodes can tolerate f faulty (malicious)
nodes and still reach reliable agreement only if N >= 3f + 1. We use this
real formula to decide whether a given fault configuration can be tolerated,
then run the actual PoA/majority consensus engine on top of it so the
demonstration reflects genuine vote outcomes, not a scripted result.
"""
from .validators import ValidatorRegistry
from .consensus_engine import run_consensus

SCENARIOS = {
    "single_malicious": {
        "label": "Scenario 1: Single Malicious Node",
        "config": {"NODE-01": "HONEST", "NODE-02": "HONEST", "NODE-03": "HONEST",
                   "NODE-04": "HONEST", "NODE-05": "MALICIOUS"},
    },
    "multiple_malicious": {
        "label": "Scenario 2: Multiple Malicious Nodes",
        "config": {"NODE-01": "HONEST", "NODE-02": "MALICIOUS", "NODE-03": "HONEST",
                   "NODE-04": "MALICIOUS", "NODE-05": "CONFLICTING"},
    },
    "network_partition": {
        "label": "Scenario 3: Network Partition",
        "config": {"NODE-01": "HONEST", "NODE-02": "HONEST", "NODE-03": "OFFLINE",
                   "NODE-04": "OFFLINE", "NODE-05": "HONEST"},
    },
    "insufficient_honest_majority": {
        "label": "Scenario 4: Insufficient Honest Majority",
        "config": {"NODE-01": "MALICIOUS", "NODE-02": "MALICIOUS", "NODE-03": "MALICIOUS",
                   "NODE-04": "HONEST", "NODE-05": "OFFLINE"},
    },
}


def apply_scenario(registry: ValidatorRegistry, scenario_key: str) -> dict:
    scenario = SCENARIOS.get(scenario_key)
    if not scenario:
        return {"success": False, "message": "Unknown scenario"}

    registry.reset()
    for node_id, behavior in scenario["config"].items():
        registry.set_behavior(node_id, behavior)

    return {"success": True, "scenario": scenario["label"], "applied": scenario["config"]}


def analyze_fault_tolerance(registry: ValidatorRegistry) -> dict:
    total = len(registry.nodes)
    honest = sum(1 for n in registry.nodes.values() if n.status == "ONLINE" and n.behavior == "HONEST")
    malicious = sum(1 for n in registry.nodes.values() if n.status == "ONLINE" and n.behavior in ("MALICIOUS", "CONFLICTING"))
    offline = sum(1 for n in registry.nodes.values() if n.status == "OFFLINE")

    # Classical BFT bound: tolerable faulty nodes f must satisfy N >= 3f + 1
    max_tolerable_faults = (total - 1) // 3
    faulty_count = malicious + offline
    tolerated = faulty_count <= max_tolerable_faults

    return {
        "total_nodes": total,
        "honest_nodes": honest,
        "malicious_nodes": malicious,
        "offline_nodes": offline,
        "faulty_nodes": faulty_count,
        "max_tolerable_faults": max_tolerable_faults,
        "byzantine_fault_tolerated": tolerated,
        "verdict": "BYZANTINE FAULT TOLERATED" if tolerated else "CONSENSUS FAILURE — NETWORK TRUST CANNOT BE ESTABLISHED",
    }


def run_byzantine_simulation(registry: ValidatorRegistry, identity_hash: str) -> dict:
    fault_analysis = analyze_fault_tolerance(registry)
    consensus_result = run_consensus(registry, identity_hash, hmac_valid=True, chain_valid=True)

    return {
        "fault_analysis": fault_analysis,
        "consensus_result": consensus_result,
        "final_verdict": (
            "CONSENSUS ACHIEVED — BLOCK COMMITTED"
            if consensus_result["achieved"] and fault_analysis["byzantine_fault_tolerated"]
            else "CONSENSUS FAILURE — NETWORK TRUST CANNOT BE ESTABLISHED"
        ),
    }
