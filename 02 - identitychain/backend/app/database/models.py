import time
from sqlalchemy import Column, String, Integer, Float, JSON, Boolean
from .database import Base


class IdentityRecord(Base):
    __tablename__ = "identities"

    id = Column(String, primary_key=True, index=True)          # e.g. DID-001
    full_name = Column(String, nullable=False)
    unique_identity_number = Column(String, nullable=False)
    identity_type = Column(String, nullable=False)              # Academic / Employee / Professional / Organization
    organization = Column(String, nullable=False)
    email = Column(String, nullable=False)
    department = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)

    sha1_hash = Column(String)
    sha256_hash = Column(String)
    sha3_256_hash = Column(String)
    hmac_mac = Column(String)

    dht_node = Column(String)
    block_index = Column(Integer, nullable=True)
    verified = Column(Boolean, default=True)
    created_at = Column(Float, default=time.time)


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String)          # e.g. TAMPER_DETECTED, CONSENSUS_FAILURE, MAC_MISMATCH
    severity = Column(String)            # INFO / WARNING / CRITICAL
    description = Column(String)
    timestamp = Column(Float, default=time.time)


class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message = Column(String)
    timestamp = Column(Float, default=time.time)
