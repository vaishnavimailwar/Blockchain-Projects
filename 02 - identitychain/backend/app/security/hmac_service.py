"""
Message Authentication Code (HMAC-SHA256) service for authenticated
identity payloads.
"""
from ..blockchain.hashing import generate_hmac, verify_hmac, canonicalize

# Demo secret. In a real deployment this would be a securely provisioned,
# per-organization key - never hardcoded or shipped to the client.
NETWORK_SECRET_KEY = "IDENTITYCHAIN-NETWORK-SECRET-V1-DEMO-KEY"


def authenticate_payload(payload: dict) -> dict:
    message = canonicalize(payload)
    mac = generate_hmac(message, NETWORK_SECRET_KEY)
    return {
        "payload": payload,
        "canonical_message": message,
        "mac": mac,
        "algorithm": "HMAC-SHA256",
    }


def verify_payload(payload: dict, mac: str) -> dict:
    message = canonicalize(payload)
    valid = verify_hmac(message, NETWORK_SECRET_KEY, mac)
    return {
        "payload": payload,
        "canonical_message": message,
        "submitted_mac": mac,
        "expected_mac": generate_hmac(message, NETWORK_SECRET_KEY),
        "valid": valid,
        "result": "AUTHENTICATION SUCCESSFUL" if valid else "AUTHENTICATION FAILED \u2014 MAC MISMATCH DETECTED",
    }
