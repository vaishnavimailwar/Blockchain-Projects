"""
Hash-indexed identity registry + educational hash table collision
demonstration ("Hashing and Data Structures" syllabus topic).

IMPORTANT: this deliberately uses a SMALL, REDUCED hash space (a simple
modulo hash over a limited bucket count) purely to make collisions occur
predictably for teaching purposes. It does NOT claim SHA-256 collisions are
being generated — that would be cryptographically infeasible.
"""
BUCKET_COUNT = 16


def simple_bucket_hash(key: str) -> int:
    """Educational reduced hash function — NOT cryptographically secure,
    used only to visualize hash table bucket assignment & collisions."""
    total = sum(ord(c) for c in key)
    return total % BUCKET_COUNT


def build_hash_table(identity_ids: list[str]) -> dict:
    buckets: dict[int, list[str]] = {i: [] for i in range(BUCKET_COUNT)}
    for identity_id in identity_ids:
        bucket = simple_bucket_hash(identity_id)
        buckets[bucket].append(identity_id)

    collisions = {b: ids for b, ids in buckets.items() if len(ids) > 1}

    return {
        "bucket_count": BUCKET_COUNT,
        "buckets": buckets,
        "collision_buckets": collisions,
        "collision_count": sum(len(ids) - 1 for ids in collisions.values()),
        "label": "Educational Hash Table Collision Simulation (reduced hash space)",
    }
