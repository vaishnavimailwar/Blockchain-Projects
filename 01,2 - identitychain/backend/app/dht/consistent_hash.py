"""
Simplified Distributed Hash Table (DHT) simulation using a consistent
hash ring. This is an EDUCATIONAL simulation of DHT routing concepts —
not a production peer-to-peer DHT (no real networking, gossip, or
Kademlia-style XOR routing is implemented).
"""
import bisect
import hashlib

DEFAULT_NODES = ["Node A", "Node B", "Node C", "Node D", "Node E"]
RING_SIZE = 2 ** 32
VIRTUAL_REPLICAS = 6  # virtual nodes per physical node for better distribution


def _ring_hash(key: str) -> int:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % RING_SIZE


class ConsistentHashRing:
    def __init__(self, nodes: list[str] | None = None):
        self.ring: dict[int, str] = {}
        self.sorted_keys: list[int] = []
        self.nodes: list[str] = []
        for node in nodes or DEFAULT_NODES:
            self.add_node(node)

    def add_node(self, node_name: str):
        if node_name in self.nodes:
            return
        self.nodes.append(node_name)
        for i in range(VIRTUAL_REPLICAS):
            vnode_hash = _ring_hash(f"{node_name}#{i}")
            self.ring[vnode_hash] = node_name
            bisect.insort(self.sorted_keys, vnode_hash)

    def remove_node(self, node_name: str) -> dict:
        if node_name not in self.nodes:
            return {"success": False, "message": "Node not found"}

        removed_positions = []
        for i in range(VIRTUAL_REPLICAS):
            vnode_hash = _ring_hash(f"{node_name}#{i}")
            if vnode_hash in self.ring:
                del self.ring[vnode_hash]
                self.sorted_keys.remove(vnode_hash)
                removed_positions.append(vnode_hash)

        self.nodes.remove(node_name)
        return {"success": True, "removed_node": node_name, "removed_positions": removed_positions}

    def get_node(self, key: str) -> dict:
        if not self.ring:
            return {"node": None, "hash_key": None}

        key_hash = _ring_hash(key)
        idx = bisect.bisect(self.sorted_keys, key_hash)
        if idx == len(self.sorted_keys):
            idx = 0
        responsible_hash = self.sorted_keys[idx]
        return {
            "key": key,
            "hash_key": format(key_hash, "08x"),
            "responsible_node": self.ring[responsible_hash],
            "responsible_position": format(responsible_hash, "08x"),
        }

    def snapshot(self) -> dict:
        positions = sorted(
            [{"position": format(h, "08x"), "node": n} for h, n in self.ring.items()],
            key=lambda p: p["position"],
        )
        return {
            "nodes": self.nodes,
            "virtual_replicas": VIRTUAL_REPLICAS,
            "ring_positions": positions,
            "ring_size_hex": format(RING_SIZE, "x"),
        }

    def simulate_lookup_path(self, identity_id: str) -> dict:
        result = self.get_node(identity_id)
        return {
            "identity_id": identity_id,
            "steps": [
                {"stage": "HASH GENERATED", "detail": f"SHA-256(identity_id) truncated -> {result['hash_key']}"},
                {"stage": "ROUTING KEY CALCULATED", "detail": f"Routing key {result['hash_key']} placed on hash ring"},
                {"stage": "RESPONSIBLE NODE LOCATED", "detail": f"Clockwise nearest node: {result['responsible_node']}"},
                {"stage": "IDENTITY REFERENCE FOUND", "detail": f"{identity_id} resolved via {result['responsible_node']}"},
            ],
            "result": result,
        }
