"""
Process-wide singleton engine state: the blockchain ledger, validator
registry, and DHT ring are shared across all API requests (in-memory,
resets on server restart — this is an educational demo, not a persistent
distributed system).
"""
from .blockchain.blockchain import Blockchain
from .consensus.validators import ValidatorRegistry
from .dht.consistent_hash import ConsistentHashRing

blockchain = Blockchain()
validator_registry = ValidatorRegistry()
dht_ring = ConsistentHashRing()
