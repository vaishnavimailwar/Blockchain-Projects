"""
Merkle Tree implementation used to aggregate identity transaction hashes
into a single Merkle Root stored inside each block.
"""
from .hashing import sha256_hash


class MerkleTree:
    def __init__(self, leaf_hashes: list[str]):
        # If odd number of leaves, duplicate the last one (standard Bitcoin-style rule)
        self.leaves = leaf_hashes[:] if leaf_hashes else [sha256_hash("EMPTY_BLOCK")]
        self.levels: list[list[str]] = []
        self.root = self._build()

    def _build(self) -> str:
        level = self.leaves[:]
        self.levels.append(level)

        if len(level) == 1:
            return level[0]

        while len(level) > 1:
            if len(level) % 2 == 1:
                level.append(level[-1])
            next_level = []
            for i in range(0, len(level), 2):
                combined = level[i] + level[i + 1]
                next_level.append(sha256_hash(combined))
            self.levels.append(next_level)
            level = next_level

        return level[0]

    def get_proof(self, leaf_hash: str) -> list[dict]:
        """Returns the sibling-hash path from a leaf up to the Merkle root,
        used by the UI to visualize a transaction's inclusion path."""
        if leaf_hash not in self.leaves:
            return []

        proof = []
        index = self.leaves.index(leaf_hash)

        for level in self.levels[:-1]:
            level = level[:]
            if len(level) % 2 == 1:
                level.append(level[-1])
            is_right = index % 2 == 1
            sibling_index = index - 1 if is_right else index + 1
            if sibling_index < len(level):
                proof.append({
                    "hash": level[sibling_index],
                    "position": "left" if is_right else "right",
                })
            index //= 2

        return proof

    def to_dict(self) -> dict:
        return {
            "root": self.root,
            "leaf_count": len(self.leaves),
            "levels": self.levels,
        }
