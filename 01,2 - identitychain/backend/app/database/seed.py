"""
Seeds the database with realistic demonstration data so IDENTITYCHAIN never
opens empty: ~30 identities pushed through the real trust pipeline
(producing genuine blockchain blocks, validator votes, and hashes), plus
a handful of illustrative security events.
"""
import random
import time
from sqlalchemy.orm import Session

from .models import IdentityRecord, SecurityEvent, ActivityLog
from ..identity.service import run_trust_pipeline

FIRST_NAMES = ["Vaishnavi", "Arjun", "Meera", "Rohan", "Ananya", "Kabir", "Ishita", "Vikram",
               "Priya", "Aditya", "Sanya", "Karan", "Naina", "Dev", "Riya", "Aarav",
               "Tanya", "Yash", "Simran", "Nikhil", "Diya", "Rahul", "Pooja", "Manav",
               "Sara", "Aryan", "Neha", "Vivaan", "Kritika", "Harsh"]
LAST_NAMES = ["Sharma", "Verma", "Iyer", "Nair", "Gupta", "Reddy", "Chatterjee", "Malhotra",
              "Kapoor", "Bose", "Rao", "Mehta", "Joshi", "Singh", "Desai"]
IDENTITY_TYPES = ["Academic Identity", "Employee Identity", "Professional Identity", "Organization Identity"]
ORGANIZATIONS = ["St. Xavier's Institute of Technology", "Nimbus Financial Group", "Bharat Health Systems",
                  "Orion Software Labs", "National Skills Council", "Meridian Consulting",
                  "Zenith Manufacturing Co.", "Apex Research Foundation"]
DEPARTMENTS = ["Computer Science", "Electronics", "Human Resources", "Finance", "Operations",
               "Cybersecurity", "Data Science", "Administration"]


def seed_if_empty(db: Session):
    existing = db.query(IdentityRecord).count()
    if existing > 0:
        return

    random.seed(42)
    count = random.randint(28, 34)

    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        payload = {
            "id": f"DID-{i + 1:03d}",
            "full_name": f"{first} {last}",
            "unique_identity_number": f"UID-{random.randint(100000, 999999)}",
            "identity_type": random.choice(IDENTITY_TYPES),
            "organization": random.choice(ORGANIZATIONS),
            "email": f"{first.lower()}.{last.lower()}@{random.choice(['org', 'edu', 'net', 'io'])}.example",
            "department": random.choice(DEPARTMENTS),
            "additional_metadata": {"seed_batch": True, "risk_tier": random.choice(["LOW", "MEDIUM", "STANDARD"])},
        }
        run_trust_pipeline(db, payload)

    # A handful of illustrative historical security events for the Audit page
    sample_events = [
        ("TAMPER_DETECTED", "CRITICAL", "Simulated identity field tampering detected during scheduled integrity scan"),
        ("MAC_MISMATCH", "WARNING", "HMAC verification failed during a lab tampering exercise"),
        ("CONSENSUS_FAILURE", "WARNING", "Byzantine simulation scenario triggered temporary consensus failure"),
        ("NODE_OFFLINE", "INFO", "NODE-05 temporarily marked offline during network partition drill"),
    ]
    now = time.time()
    for idx, (etype, sev, desc) in enumerate(sample_events):
        db.add(SecurityEvent(event_type=etype, severity=sev, description=desc, timestamp=now - (idx + 1) * 3600))

    db.add(ActivityLog(message="IDENTITYCHAIN network initialized with seeded demonstration data", timestamp=now))
    db.commit()
