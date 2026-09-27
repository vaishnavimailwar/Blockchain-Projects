# IDENTITYCHAIN

**Decentralized Identity Infrastructure & Trust Network**

*Blockchain-Based Secure Digital Identity Management System — Activity 2, Blockchain Technology (Module II)*

---

## 1. Project Overview

IDENTITYCHAIN is a full-stack, premium-styled decentralized identity management platform built to visibly and
interactively demonstrate every Module II syllabus concept: hash functions (SHA-1, SHA-256, SHA3-256), message
authentication codes, distributed hash tables, hashing in blockchain mining, and consensus (Proof-of-Authority
plus Byzantine fault tolerance).

Sensitive identity data is **never stored on-chain**. Instead, identity records are canonicalized, cryptographically
fingerprinted, authenticated via HMAC, routed through a simulated distributed hash table, broadcast to a validator
network, and — once Byzantine-resilient consensus is reached — committed to a custom Python blockchain as a
Merkle-aggregated block. This end-to-end flow is called the **Cryptographic Trust Pipeline** and is the project's
signature feature (see the Documentation page in-app).

## 2. Problem Statement

Centralized identity systems create single points of failure and require blind trust in one authority. IDENTITYCHAIN
demonstrates how cryptographic hashing, message authentication, distributed storage routing, and multi-party
consensus can combine to build a verifiable, tamper-evident identity trust network — entirely from first principles,
without relying on Ethereum, Solidity, or any third-party blockchain framework.

## 3. Objectives

- Implement a **custom Python blockchain** (not a wrapper around existing chain infrastructure).
- Demonstrate every Module II hash-function concept with real, interactive code — not just documentation.
- Implement a working Proof-of-Authority + majority consensus engine, plus a genuine Byzantine fault-tolerance
  analysis using the classical N ≥ 3f + 1 bound.
- Provide an educational, safely-bounded Proof-of-Work mining simulator.
- Simulate a Distributed Hash Table using a consistent hash ring.
- Present all of the above through a premium, enterprise-security-console-styled UI.

## 4. Features

| Area | What it does |
|---|---|
| Command Center | Live network health, validator topology, recent activity feed |
| Identity Vault | Register identities; watch them travel through the full Trust Pipeline in real time |
| Hash Laboratory | SHA-1/256/SHA3-256 generator, Hash Comparison Matrix, Avalanche Effect visualizer, HMAC tamper demo |
| Blockchain Explorer | Full ledger browser, block detail panel, Chain Integrity Scan, PoW mining simulator |
| Consensus Network | Validator table with adjustable behavior, Byzantine Agreement Security Lab (4 scenarios), PoW/PoS/PoA/BFT comparison |
| DHT Explorer | Consistent hash ring visualization, identity lookup routing trace, node add/remove |
| Security Laboratory | Identity tampering, blockchain block tampering, hash-table collision simulation |
| Audit & Analytics | Charts (registrations, blockchain growth, hash usage, validator participation) + automated Security Audit Report |
| Documentation | Full Module II syllabus → feature mapping for faculty demonstration |

## 5. Module II Syllabus Mapping

See the in-app **Documentation** page for the complete table. Summary:

- **Hashing** → Multi-algorithm identity fingerprinting (Hash Laboratory, Identity Vault)
- **Message Authentication Code** → HMAC-SHA256 authenticated payloads + tamper detection
- **SHA-1** → Legacy comparison only, clearly labeled insecure, never used for integrity
- **SHA-3** → SHA3-256 is the advanced/primary fingerprint algorithm
- **Distributed Hash Tables** → Consistent hash ring (DHT Explorer)
- **Hashing and Data Structures** → Hash-indexed registry + reduced-space collision demo (Security Laboratory)
- **Hashing in Blockchain Mining** → Bounded PoW nonce/difficulty simulator (Blockchain Explorer)
- **Consensus / Consensus Algorithms** → Proof-of-Authority + majority agreement (implemented); PoW/PoS presented as comparison only
- **Byzantine Agreement** → 4 interactive fault scenarios with real N ≥ 3f + 1 analysis

## 6. Architecture

```
Identity Data
  → Canonical JSON Serialization
  → Multi-Algorithm Hashing (SHA-1 / SHA-256 / SHA3-256)
  → HMAC-SHA256 Authentication
  → DHT Routing (consistent hash ring)
  → Validator Broadcast
  → Byzantine-Resilient PoA Consensus
  → Merkle Aggregation
  → Block Hashing (PoW-mined)
  → Ledger Commitment (custom Python blockchain)
```

The blockchain never stores raw identity data — only hashes, HMACs, block metadata, validator votes, and
consensus results.

## 7. Technology Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Framer Motion, Lucide React, Recharts
**Backend:** Python 3.11+, FastAPI, Pydantic, SQLAlchemy, SQLite
**Cryptography:** Python `hashlib` / `hmac` (SHA-1, SHA-256, SHA3-256, HMAC-SHA256)
**Blockchain:** 100% custom Python implementation — no Ethereum/Ganache/MetaMask/Solidity

## 8. Folder Structure

```
identitychain/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── state.py                  # shared in-memory engine singletons
│   │   ├── api/                      # FastAPI routers
│   │   ├── blockchain/               # hashing, merkle, block, blockchain, mining
│   │   ├── consensus/                # validators, consensus_engine, byzantine
│   │   ├── identity/                 # schemas, trust-pipeline service
│   │   ├── security/                 # hmac_service, integrity (hash table demo)
│   │   ├── dht/                      # consistent_hash
│   │   ├── database/                 # SQLAlchemy models, seed data
│   │   └── services/                 # audit_service
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/{layout,common}
    │   ├── pages/                    # 9 primary sections
    │   └── services/api.js
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 9. Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend seeds ~30 demonstration identities, blockchain blocks, and validator nodes automatically on first
startup (it will not open empty). API docs are available at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend on port 8000 — but the frontend
service layer calls `http://localhost:8000` directly by default (see `src/services/api.js`); set `VITE_API_URL` in
a `.env` file if your backend runs elsewhere.

## 10. How to Run (Quick Start)

```bash
# Terminal 1
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm install && npm run dev
```

Then open `http://localhost:5173`.

## 11. API Overview

| Domain | Endpoints |
|---|---|
| Identity | `POST /identities`, `GET /identities`, `GET /identities/{id}`, `POST /identities/{id}/verify` |
| Blockchain | `GET /blockchain`, `GET /blockchain/blocks/{index}`, `POST /blockchain/validate`, `POST /blockchain/mine` |
| Security | `POST /security/hash`, `POST /security/compare`, `POST /security/hmac/generate`, `POST /security/hmac/verify`, `POST /security/avalanche`, `GET /security/hash-table`, `POST /security/tamper/identity`, `POST /security/tamper/block` |
| Consensus | `GET /consensus/nodes`, `POST /consensus/node-behavior`, `POST /consensus/reset`, `GET /consensus/scenarios`, `POST /consensus/simulate-byzantine`, `GET /consensus/fault-analysis`, `GET /consensus/comparison` |
| DHT | `GET /dht/nodes`, `POST /dht/lookup`, `POST /dht/simulate` |
| Analytics | `GET /analytics/dashboard`, `GET /analytics/audit`, `GET /analytics/charts` |

Full interactive documentation: `http://localhost:8000/docs` (Swagger UI, auto-generated by FastAPI).

## 12. Demo Workflow (Suggested Viva Walkthrough)

1. **Command Center** — show live network health and validator topology.
2. **Identity Vault** — register a new identity, watch the Trust Pipeline animate end-to-end.
3. **Hash Laboratory** — generate hashes for the same input, run the Avalanche Effect demo, tamper an HMAC payload.
4. **Blockchain Explorer** — inspect a block, run the Chain Integrity Scan, run the mining simulator.
5. **Consensus Network** — mark a node MALICIOUS, run a Byzantine scenario, show the fault-tolerance verdict.
6. **DHT Explorer** — look up an identity, remove a node, show key redistribution.
7. **Security Laboratory** — tamper an identity field and a block, show both are detected.
8. **Audit & Analytics** — show the automated Security Audit Report.
9. **Documentation** — walk through the full Module II syllabus mapping table.

## 13. Security Features

- SHA-256 / SHA3-256 primary integrity hashing; SHA-1 kept strictly as a labeled, insecure comparison.
- HMAC-SHA256 message authentication with constant-time verification.
- Full blockchain integrity scanning: hash recomputation, previous-hash linkage, Merkle root recomputation.
- Deliberate tamper-injection endpoints for identities and blocks, used only to demonstrate detection.

## 14. Consensus Design

Primary implementation: **Proof-of-Authority inspired validator consensus + majority agreement** (≥60% approval
threshold among responding nodes). Byzantine fault tolerance is analyzed using the classical bound
**N ≥ 3f + 1** (a network of 5 validators can tolerate at most 1 simultaneous faulty node). PoW and PoS are
presented as educational comparisons only — they are not IDENTITYCHAIN's trust mechanism.

## 15. DHT Design

A simplified **consistent hash ring** with 6 virtual replicas per physical node, distributing identity IDs across
5 named storage nodes. Node removal demonstrates minimal key redistribution, the defining property of consistent
hashing. This is explicitly an educational simulation, not a production Kademlia/Chord-style DHT.

## 16. Screenshots

*(Add screenshots here after running the application locally — e.g. `docs/screenshots/command-center.png`,
`docs/screenshots/trust-pipeline.png`, `docs/screenshots/byzantine-lab.png`.)*

## 17. Future Enhancements

- Persistent, multi-process validator nodes communicating over real network sockets
- Pluggable consensus backends (real PoS staking simulation)
- Signed, per-organization HMAC/asymmetric keys instead of a single shared demo secret
- Export of the Security Audit Report as PDF
- WebSocket-based live activity feed instead of polling

## 18. Important Academic Disclaimers

- This is an educational project. It is **not production-ready** and should not be used to manage real identity data.
- The Proof-of-Work simulator is bounded and safe for classroom use — it is not real cryptocurrency mining.
- The DHT and hash-table collision demonstrations are simplified for teaching purposes, as noted directly in the UI.
