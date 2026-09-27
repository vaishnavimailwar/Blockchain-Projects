"""
blockchain.py
--------------
A simplified, educational blockchain implementation used to store and
verify academic certificates.

Concepts demonstrated in this file:
    - Block structure (index, timestamp, data, hashes)
    - SHA-256 cryptographic hashing
    - Genesis block
    - Chain linking (previous_hash -> current_hash)
    - Merkle root calculation over certificate fields
    - Chain validation / tampering detection
    - JSON file based persistence
"""

import hashlib
import json
import os
import uuid
from datetime import datetime

DATA_FILE = "blockchain_data.json"
BACKUP_FILE = "blockchain_backup.json"
GENESIS_PREVIOUS_HASH = "0" * 64


def sha256(text: str) -> str:
    """Return the SHA-256 hex digest of a string."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def hash_data(data: dict) -> str:
    """Deterministic SHA-256 hash of a dictionary (sorted keys)."""
    serialized = json.dumps(data, sort_keys=True, separators=(",", ":"))
    return sha256(serialized)


def compute_merkle_root(data: dict) -> str:
    """
    Build a simple Merkle Tree from the individual fields of the
    certificate data and return the Merkle Root.

    Each key:value pair of the certificate becomes a 'transaction leaf'.
    Leaves are hashed, then combined in pairs (hash of concatenation)
    repeatedly until a single root hash remains. If a level has an odd
    number of nodes, the last node is duplicated (standard convention).
    """
    if not data:
        return sha256("")

    leaves = [sha256(f"{k}:{v}") for k, v in sorted(data.items())]

    level = leaves
    while len(level) > 1:
        next_level = []
        for i in range(0, len(level), 2):
            left = level[i]
            right = level[i + 1] if i + 1 < len(level) else level[i]
            next_level.append(sha256(left + right))
        level = next_level

    return level[0]


class Blockchain:
    def __init__(self, data_file=DATA_FILE, backup_file=BACKUP_FILE):
        self.data_file = data_file
        self.backup_file = backup_file
        self.chain = []
        self._load_or_initialize()

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def _load_or_initialize(self):
        if os.path.exists(self.data_file):
            with open(self.data_file, "r", encoding="utf-8") as f:
                self.chain = json.load(f)
        else:
            self._create_genesis_block()
            self._save(backup=True)

    def _save(self, backup=False):
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(self.chain, f, indent=4)
        if backup:
            with open(self.backup_file, "w", encoding="utf-8") as f:
                json.dump(self.chain, f, indent=4)

    # ------------------------------------------------------------------
    # Block creation
    # ------------------------------------------------------------------
    def _create_genesis_block(self):
        cert_data = {
            "info": "Genesis Block - Certificate Verification Blockchain",
            "created_by": "System",
        }
        merkle_root = compute_merkle_root(cert_data)
        block = {
            "index": 0,
            "timestamp": str(datetime.now()),
            "certificate_data": cert_data,
            "certificate_hash": hash_data(cert_data),
            "merkle_root": merkle_root,
            "previous_hash": GENESIS_PREVIOUS_HASH,
        }
        block["current_hash"] = self._compute_block_hash(block)
        self.chain = [block]

    def _compute_block_hash(self, block: dict) -> str:
        payload = (
            str(block["index"])
            + block["timestamp"]
            + json.dumps(block["certificate_data"], sort_keys=True, separators=(",", ":"))
            + block["certificate_hash"]
            + block["merkle_root"]
            + block["previous_hash"]
        )
        return sha256(payload)

    def generate_certificate_id(self) -> str:
        return f"CERT-{uuid.uuid4().hex[:8].upper()}"

    def add_certificate(self, certificate_data: dict) -> dict:
        """Create a new block for a certificate and append it to the chain."""
        previous_block = self.chain[-1]

        cert_hash = hash_data(certificate_data)
        merkle_root = compute_merkle_root(certificate_data)

        new_block = {
            "index": previous_block["index"] + 1,
            "timestamp": str(datetime.now()),
            "certificate_data": certificate_data,
            "certificate_hash": cert_hash,
            "merkle_root": merkle_root,
            "previous_hash": previous_block["current_hash"],
        }
        new_block["current_hash"] = self._compute_block_hash(new_block)

        self.chain.append(new_block)
        self._save(backup=True)  # legitimate change -> update backup snapshot too
        return new_block

    # ------------------------------------------------------------------
    # Lookup
    # ------------------------------------------------------------------
    def find_certificate(self, certificate_id: str):
        """Search the chain for a block containing this certificate_id."""
        for block in self.chain:
            if block["certificate_data"].get("certificate_id") == certificate_id:
                return block
        return None

    def get_chain(self):
        return self.chain

    # ------------------------------------------------------------------
    # Tampering demo
    # ------------------------------------------------------------------
    def tamper_block(self, index: int, new_certificate_data: dict):
        """
        Overwrite the stored certificate_data of an existing block WITHOUT
        recomputing certificate_hash / merkle_root / current_hash.
        This intentionally breaks the block, simulating an attacker who
        edits data directly in storage. Only the main data file is
        touched -- the backup snapshot is left untouched so the chain can
        be restored.
        """
        for block in self.chain:
            if block["index"] == index:
                if index == 0:
                    raise ValueError("The Genesis Block cannot be tampered with in this demo.")
                block["certificate_data"] = new_certificate_data
                self._save(backup=False)
                return block
        raise ValueError(f"Block with index {index} not found.")

    def restore_from_backup(self):
        """Restore the blockchain to the last known-good (backup) state."""
        if os.path.exists(self.backup_file):
            with open(self.backup_file, "r", encoding="utf-8") as f:
                self.chain = json.load(f)
            self._save(backup=False)
        else:
            # No backup yet (shouldn't normally happen) -> rebuild genesis
            self._create_genesis_block()
            self._save(backup=True)
        return self.chain

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------
    def validate_chain(self):
        """
        Walk the entire chain and check, for every block:
            1. certificate_hash matches a fresh hash of certificate_data
            2. merkle_root matches a fresh merkle root of certificate_data
            3. current_hash matches a freshly computed block hash
            4. previous_hash matches the current_hash of the prior block

        Returns (is_valid: bool, report: list[dict]) where report gives a
        per-block breakdown useful for the UI / demo.
        """
        report = []
        is_valid = True

        for i, block in enumerate(self.chain):
            errors = []

            expected_cert_hash = hash_data(block["certificate_data"])
            if expected_cert_hash != block["certificate_hash"]:
                errors.append("Certificate data does not match stored certificate hash.")

            expected_merkle_root = compute_merkle_root(block["certificate_data"])
            if expected_merkle_root != block["merkle_root"]:
                errors.append("Merkle root does not match certificate data.")

            expected_block_hash = self._compute_block_hash(block)
            if expected_block_hash != block["current_hash"]:
                errors.append("Block hash is invalid (data was modified after hashing).")

            if i > 0:
                if block["previous_hash"] != self.chain[i - 1]["current_hash"]:
                    errors.append("Previous hash does not match the previous block's current hash.")
            else:
                if block["previous_hash"] != GENESIS_PREVIOUS_HASH:
                    errors.append("Genesis block previous hash is invalid.")

            if errors:
                is_valid = False

            report.append({
                "index": block["index"],
                "valid": len(errors) == 0,
                "errors": errors,
            })

        return is_valid, report

    def get_stats(self):
        is_valid, _ = self.validate_chain()
        return {
            "total_blocks": len(self.chain),
            "total_certificates": len(self.chain) - 1,  # excluding genesis
            "chain_valid": is_valid,
        }
