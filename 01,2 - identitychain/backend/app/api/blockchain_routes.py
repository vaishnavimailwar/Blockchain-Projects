from fastapi import APIRouter, HTTPException
from .. import state
from ..blockchain.mining import mine_block
from ..identity.schemas import MineRequest

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


@router.get("")
def get_chain():
    return {
        "length": len(state.blockchain.chain),
        "blocks": state.blockchain.to_list(),
    }


@router.get("/blocks/{index}")
def get_block(index: int):
    block = state.blockchain.get_block(index)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return block.to_dict()


@router.post("/validate")
def validate_chain():
    return state.blockchain.validate_chain()


@router.post("/mine")
def mine_demo_block(req: MineRequest):
    result = mine_block(req.block_header or "IDENTITYCHAIN-DEMO-BLOCK", req.difficulty)
    return result
