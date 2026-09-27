"""
Cryptographic hashing primitives for IDENTITYCHAIN.

Implements the Module II "Hash Functions" topic set:
- SHA-1 (legacy, kept ONLY for academic/security comparison)
- SHA-256 (primary identity integrity algorithm)
- SHA3-256 (advanced alternative, Keccak-based sponge construction)
- HMAC-SHA256 (Message Authentication Code)
- Avalanche-effect measurement between two hash digests
"""
import hashlib
import hmac
import json
import time


# ---------------------------------------------------------------------------
# Canonicalization
# ---------------------------------------------------------------------------
def canonicalize(data: dict) -> str:
    """Deterministic JSON serialization so identical data always hashes the
    same way, regardless of key insertion order. This is the 'Identity Data
    -> Canonical JSON Serialization' step of the Cryptographic Trust Pipeline.
    """
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


# ---------------------------------------------------------------------------
# Core digest functions
# ---------------------------------------------------------------------------
def sha1_hash(text: str) -> str:
    """LEGACY / EDUCATIONAL COMPARISON ONLY. SHA-1 is cryptographically
    broken (practical collision attacks demonstrated by Google's SHAttered,
    2017) and must never be used as a primary integrity mechanism."""
    return hashlib.sha1(text.encode("utf-8")).hexdigest()


def sha256_hash(text: str) -> str:
    """Primary identity integrity algorithm used throughout IDENTITYCHAIN."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha3_256_hash(text: str) -> str:
    """Advanced cryptographic alternative using the Keccak sponge
    construction (structurally different from SHA-2)."""
    return hashlib.sha3_256(text.encode("utf-8")).hexdigest()


def multi_hash(text: str) -> dict:
    """Generate all three digests for a given input plus metadata used by
    the Hash Function Laboratory and Hash Comparison Matrix."""
    return {
        "input": text,
        "sha1": {
            "algorithm": "SHA-1",
            "digest": sha1_hash(text),
            "bit_length": 160,
            "security_status": "LEGACY / EDUCATIONAL COMPARISON ONLY",
            "project_usage": "Academic comparison laboratory only — never used for integrity",
        },
        "sha256": {
            "algorithm": "SHA-256",
            "digest": sha256_hash(text),
            "bit_length": 256,
            "security_status": "SECURE — PRIMARY ALGORITHM",
            "project_usage": "Primary identity fingerprint & blockchain hashing",
        },
        "sha3_256": {
            "algorithm": "SHA3-256",
            "digest": sha3_256_hash(text),
            "bit_length": 256,
            "security_status": "SECURE — ADVANCED ALTERNATIVE",
            "project_usage": "Advanced identity fingerprint (Keccak sponge construction)",
        },
    }


# ---------------------------------------------------------------------------
# HMAC — Message Authentication Code
# ---------------------------------------------------------------------------
def generate_hmac(message: str, secret_key: str) -> str:
    return hmac.new(secret_key.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_hmac(message: str, secret_key: str, mac_to_verify: str) -> bool:
    expected = generate_hmac(message, secret_key)
    # constant-time comparison to avoid timing side-channel leakage
    return hmac.compare_digest(expected, mac_to_verify)


# ---------------------------------------------------------------------------
# Avalanche Effect
# ---------------------------------------------------------------------------
def _hex_to_bits(hex_str: str) -> str:
    return bin(int(hex_str, 16))[2:].zfill(len(hex_str) * 4)


def avalanche_analysis(original_text: str, modified_text: str, algorithm: str = "sha256") -> dict:
    """Compares hashes of two near-identical inputs and measures how many
    output bits flipped — demonstrating the avalanche effect required by
    a secure hash function (~50% bit difference is ideal)."""
    algo_map = {"sha1": sha1_hash, "sha256": sha256_hash, "sha3_256": sha3_256_hash}
    hash_fn = algo_map.get(algorithm, sha256_hash)

    original_hash = hash_fn(original_text)
    modified_hash = hash_fn(modified_text)

    bits_a = _hex_to_bits(original_hash)
    bits_b = _hex_to_bits(modified_hash)

    total_bits = len(bits_a)
    changed_bits = sum(1 for a, b in zip(bits_a, bits_b) if a != b)
    changed_pct = round((changed_bits / total_bits) * 100, 2)

    # per-character hex diff for a friendlier UI visualization
    char_diff = [
        {"index": i, "original": a, "modified": b, "changed": a != b}
        for i, (a, b) in enumerate(zip(original_hash, modified_hash))
    ]

    return {
        "algorithm": algorithm,
        "original_input": original_text,
        "modified_input": modified_text,
        "original_hash": original_hash,
        "modified_hash": modified_hash,
        "total_bits": total_bits,
        "changed_bits": changed_bits,
        "changed_percentage": changed_pct,
        "ideal_percentage": 50.0,
        "char_diff": char_diff,
        "verdict": "STRONG AVALANCHE EFFECT" if changed_pct > 35 else "WEAK AVALANCHE EFFECT",
    }


def timestamp() -> float:
    return time.time()
