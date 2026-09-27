"""
Custom blockchain ledger for IDENTITYCHAIN.

Implements block linkage, chain-wide integrity validation, and tamper
detection — no external blockchain framework is used, so every Module II
concept demonstrated here is genuinely implemented in Python.
"""
import time
from .block import Block
from .hashing import sha256_hash
from .mining import mine_block


class Blockchain:
    def __init__(self):
        self.chain: list[Block] = []
        self._create_genesis_block()

    # ------------------------------------------------------------------
    def _create_genesis_block(self):
        genesis = Block(
            index=0,
            previous_hash="0" * 64,
            identity_transactions=[],
            validator="GENESIS",
            consensus_result={"votes": {}, "result": "GENESIS", "approved": 0, "total": 0},
            difficulty=1,
        )
        genesis.compute_merkle_root()
        mined = mine_block(genesis.header_string(), difficulty=1)
        genesis.nonce = mined["nonce"] or 0
        genesis.block_hash = genesis.compute_hash()
        self.chain.append(genesis)

    # ------------------------------------------------------------------
    def latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(
        self,
        identity_transactions: list,
        validator: str,
        consensus_result: dict,
        difficulty: int = 2,
    ) -> Block:
        prev = self.latest_block()
        block = Block(
            index=prev.index + 1,
            previous_hash=prev.block_hash,
            identity_transactions=identity_transactions,
            validator=validator,
            consensus_result=consensus_result,
            difficulty=difficulty,
        )
        block.compute_merkle_root()
        mined = mine_block(block.header_string(), difficulty=difficulty)
        block.nonce = mined["nonce"] or 0
        block.block_hash = block.compute_hash()
        self.chain.append(block)
        return block

    # ------------------------------------------------------------------
    def validate_chain(self) -> dict:
        """Full chain integrity scan: verifies previous-hash linkage,
        recomputed block hash correctness, and Merkle root consistency
        for every block. Used by the 'Chain Integrity Scan' feature."""
        results = []
        compromised = False

        for i, block in enumerate(self.chain):
            block_result = {
                "index": block.index,
                "checks": {},
            }

            # 1. Recompute block hash and compare
            recomputed_hash = block.compute_hash()
            hash_ok = recomputed_hash == block.block_hash
            block_result["checks"]["hash_valid"] = hash_ok

            # 2. Verify previous-hash linkage
            if i == 0:
                prev_ok = block.previous_hash == "0" * 64
            else:
                prev_ok = block.previous_hash == self.chain[i - 1].block_hash
            block_result["checks"]["previous_hash_linked"] = prev_ok

            # 3. Recompute Merkle root from transactions
            from .merkle import MerkleTree
            leaf_hashes = [tx["identity_hash"] for tx in block.identity_transactions] or [
                sha256_hash("GENESIS")
            ]
            recomputed_root = MerkleTree(leaf_hashes).root
            merkle_ok = recomputed_root == block.merkle_root
            block_result["checks"]["merkle_root_valid"] = merkle_ok

            # 4. Consensus metadata sanity check
            consensus_ok = "result" in block.consensus_result
            block_result["checks"]["consensus_metadata_present"] = consensus_ok

            block_result["valid"] = hash_ok and prev_ok and merkle_ok and consensus_ok
            if not block_result["valid"]:
                compromised = True

            results.append(block_result)

        return {
            "blockchain_integrity": "CHAIN COMPROMISED" if compromised else "BLOCKCHAIN INTEGRITY VERIFIED",
            "total_blocks": len(self.chain),
            "compromised": compromised,
            "block_results": results,
            "scanned_at": time.time(),
        }

    # ------------------------------------------------------------------
    def tamper_block(self, index: int, new_identity_hash: str) -> dict:
        """Deliberately corrupts a block's first transaction hash WITHOUT
        recomputing block_hash — used by the Security Lab to demonstrate
        that tampering is detectable via validate_chain()."""
        if index < 0 or index >= len(self.chain):
            return {"success": False, "message": "Block index out of range"}

        block = self.chain[index]
        if not block.identity_transactions:
            return {"success": False, "message": "Block has no transactions to tamper with"}

        block.identity_transactions[0]["identity_hash"] = new_identity_hash
        return {"success": True, "tampered_index": index}

    def to_list(self) -> list[dict]:
        return [b.to_dict() for b in self.chain]

    def get_block(self, index: int) -> Block | None:
        if 0 <= index < len(self.chain):
            return self.chain[index]
        return None
