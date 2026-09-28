from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class IdentityCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    unique_identity_number: str = Field(..., min_length=3)
    identity_type: str
    organization: str
    email: EmailStr
    department: Optional[str] = None
    additional_metadata: Optional[dict] = None


class HashRequest(BaseModel):
    text: str


class HMACGenerateRequest(BaseModel):
    payload: dict


class HMACVerifyRequest(BaseModel):
    payload: dict
    mac: str


class AvalancheRequest(BaseModel):
    original_text: str
    modified_text: str
    algorithm: Optional[str] = "sha256"


class MineRequest(BaseModel):
    block_header: Optional[str] = "IDENTITYCHAIN-DEMO-BLOCK"
    difficulty: int = 3


class ByzantineScenarioRequest(BaseModel):
    scenario: str


class ValidatorBehaviorRequest(BaseModel):
    node_id: str
    behavior: str  # HONEST | MALICIOUS | CONFLICTING | OFFLINE


class DHTLookupRequest(BaseModel):
    identity_id: str


class DHTNodeRequest(BaseModel):
    node_name: str


class TamperIdentityRequest(BaseModel):
    identity_id: str
    field: str
    new_value: str


class TamperBlockRequest(BaseModel):
    block_index: int
