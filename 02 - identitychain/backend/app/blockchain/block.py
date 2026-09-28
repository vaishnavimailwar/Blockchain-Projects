"""
Block structure for the IDENTITYCHAIN custom blockchain engine.
"""
import time
from dataclasses import dataclass, field
from .hashing import sha256_hash, canonicalize
from .merkle import MerkleTree


@dataclass
class Block:
    index: int
    previous_hash: str
    identity_transactions: list  # list of {identity_id, identity_hash, ...}
    validator: str
    consensus_result: dict
    difficulty: int = 2
    nonce: int = 0
    timestamp: float = field(default_factory=time.time)
    block_hash: str = ""
    merkle_root: str = ""

    def compute_merkle_root(self) -> str:
        leaf_hashes = [tx["identity_hash"] for tx in self.identity_transactions] or [
            sha256_hash("GENESIS")
        ]
        tree = MerkleTree(leaf_hashes)
        self.merkle_root = tree.root
        return self.merkle_root

    def header_string(self) -> str:
        """The canonical block header used as mining/hash input - everything
        except the final block_hash itself."""
        header = {
            "index": self.index,
            "previous_hash": self.previous_hash,
            "merkle_root": self.merkle_root,
            "timestamp": self.timestamp,
            "validator": self.validator,
            "difficulty": self.difficulty,
        }
        return canonicalize(header)

    def compute_hash(self) -> str:
        return sha256_hash(f"{self.header_string()}{self.nonce}")

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "block_hash": self.block_hash,
            "merkle_root": self.merkle_root,
            "nonce": self.nonce,
            "difficulty": self.difficulty,
            "validator": self.validator,
            "consensus_result": self.consensus_result,
            "transaction_count": len(self.identity_transactions),
            "identity_transactions": self.identity_transactions,
        }
