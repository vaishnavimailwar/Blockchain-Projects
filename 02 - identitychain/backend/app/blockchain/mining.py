"""
Educational Proof-of-Work mining simulator.

IMPORTANT: this is NOT real cryptocurrency mining. It is a bounded,
classroom-safe demonstration of "hashing in blockchain mining" - searching
for a nonce that produces a hash satisfying a difficulty target
(N leading zero hex characters).
"""
import time
from .hashing import sha256_hash

MAX_DIFFICULTY = 5          # hard safety ceiling so the demo stays fast
MAX_ATTEMPTS = 2_000_000    # circuit breaker


def mine_block(block_header: str, difficulty: int = 3) -> dict:
    difficulty = max(1, min(difficulty, MAX_DIFFICULTY))
    target_prefix = "0" * difficulty

    start = time.perf_counter()
    nonce = 0
    attempts_log = []

    while nonce < MAX_ATTEMPTS:
        candidate = f"{block_header}{nonce}"
        candidate_hash = sha256_hash(candidate)

        if nonce < 5 or nonce % max(1, (nonce // 5 or 1)) == 0:
            if len(attempts_log) < 12:
                attempts_log.append({"nonce": nonce, "hash": candidate_hash})

        if candidate_hash.startswith(target_prefix):
            elapsed = round(time.perf_counter() - start, 4)
            return {
                "success": True,
                "difficulty": difficulty,
                "target_prefix": target_prefix,
                "nonce": nonce,
                "final_hash": candidate_hash,
                "attempts": nonce + 1,
                "mining_time_seconds": elapsed,
                "sample_attempts": attempts_log,
            }
        nonce += 1

    elapsed = round(time.perf_counter() - start, 4)
    return {
        "success": False,
        "difficulty": difficulty,
        "target_prefix": target_prefix,
        "nonce": None,
        "final_hash": None,
        "attempts": MAX_ATTEMPTS,
        "mining_time_seconds": elapsed,
        "sample_attempts": attempts_log,
        "message": "Attempt ceiling reached \u2014 lower the difficulty for this demo environment.",
    }
