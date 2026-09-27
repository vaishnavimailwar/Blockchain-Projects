from fastapi import APIRouter
from .. import state
from ..identity.schemas import DHTLookupRequest, DHTNodeRequest

router = APIRouter(prefix="/dht", tags=["DHT"])


@router.get("/nodes")
def get_ring():
    return state.dht_ring.snapshot()


@router.post("/lookup")
def lookup(req: DHTLookupRequest):
    return state.dht_ring.simulate_lookup_path(req.identity_id)


@router.post("/simulate")
def simulate_membership_change(req: DHTNodeRequest, action: str = "add"):
    before = set(state.dht_ring.nodes)
    if action == "remove":
        result = state.dht_ring.remove_node(req.node_name)
    else:
        state.dht_ring.add_node(req.node_name)
        result = {"success": True, "added_node": req.node_name}
    after = set(state.dht_ring.nodes)
    return {
        "action": action,
        "result": result,
        "nodes_before": sorted(before),
        "nodes_after": sorted(after),
        "ring_snapshot": state.dht_ring.snapshot(),
    }
