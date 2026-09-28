"""
Validator node registry for the Proof-of-Authority inspired consensus
network.
"""
import random
import time

DEFAULT_VALIDATORS = [
    {"node_id": "NODE-01", "organization": "Identity Authority", "reputation": 98},
    {"node_id": "NODE-02", "organization": "Academic Validator", "reputation": 95},
    {"node_id": "NODE-03", "organization": "Government Identity Validator", "reputation": 97},
    {"node_id": "NODE-04", "organization": "Enterprise Validator", "reputation": 93},
    {"node_id": "NODE-05", "organization": "Independent Trust Validator", "reputation": 90},
]


class ValidatorNode:
    def __init__(self, node_id: str, organization: str, reputation: int = 95):
        self.node_id = node_id
        self.organization = organization
        self.reputation = reputation
        self.status = "ONLINE"          # ONLINE | OFFLINE
        self.behavior = "HONEST"        # HONEST | MALICIOUS | CONFLICTING
        self.last_validation = time.time()
        self.latency_ms = random.randint(12, 90)

    def vote(self, identity_hash: str, hmac_valid: bool, chain_valid: bool) -> str:
        """Cast a vote on a proposed identity. Honest nodes vote based on
        real integrity checks; malicious/conflicting nodes deviate on
        purpose to demonstrate Byzantine behavior."""
        self.last_validation = time.time()
        self.latency_ms = random.randint(12, 90)

        if self.status == "OFFLINE":
            return "NO_RESPONSE"

        genuine_valid = hmac_valid and chain_valid

        if self.behavior == "MALICIOUS":
            # Malicious node deliberately inverts the honest result
            return "REJECT" if genuine_valid else "VALID"
        if self.behavior == "CONFLICTING":
            # Conflicting node votes randomly regardless of truth
            return random.choice(["VALID", "REJECT"])

        return "VALID" if genuine_valid else "REJECT"

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "organization": self.organization,
            "status": self.status,
            "behavior": self.behavior,
            "reputation": self.reputation,
            "last_validation": self.last_validation,
            "latency_ms": self.latency_ms,
        }


class ValidatorRegistry:
    def __init__(self):
        self.nodes: dict[str, ValidatorNode] = {}
        for v in DEFAULT_VALIDATORS:
            self.nodes[v["node_id"]] = ValidatorNode(**v)

    def list_nodes(self) -> list[dict]:
        return [n.to_dict() for n in self.nodes.values()]

    def get(self, node_id: str) -> ValidatorNode | None:
        return self.nodes.get(node_id)

    def set_behavior(self, node_id: str, behavior: str) -> bool:
        node = self.nodes.get(node_id)
        if not node:
            return False
        node.behavior = behavior
        node.status = "OFFLINE" if behavior == "OFFLINE" else "ONLINE"
        if behavior == "OFFLINE":
            node.behavior = "HONEST"
        return True

    def reset(self):
        for node in self.nodes.values():
            node.status = "ONLINE"
            node.behavior = "HONEST"

    def active_nodes(self) -> list[ValidatorNode]:
        return [n for n in self.nodes.values() if n.status == "ONLINE"]
