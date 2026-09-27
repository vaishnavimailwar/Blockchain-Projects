# Certificate Verification Using Blockchain

**Blockchain Technology — Module 1 Project**

A fully working, from-scratch blockchain (no cryptocurrency, no external chain,
no paid services) that issues tamper-evident academic certificates, verifies
them by ID and by the actual certificate file, and visually demonstrates every
core Module 1 blockchain concept.

---

## 1. Features

- **Custom blockchain engine** written in pure Python — no blockchain library used.
- **Genesis Block** created automatically on first run.
- **Issue Certificate** — creates a new block containing certificate data, a SHA-256 hash, a Merkle Root, and links to the previous block's hash.
- **Verify Certificate by ID** — instantly retrieves and validates a certificate.
- **Certificate File Upload & Verification (NEW)**
  - Upload a PDF/PNG/JPG certificate file when issuing — its SHA-256 file hash is stored on-chain.
  - Re-upload the file later during verification — the app recomputes the hash from the actual bytes and compares it to the stored one.
  - Shows **CERTIFICATE FILE AUTHENTIC — VALID** or **TAMPERING DETECTED — CERTIFICATE FILE INVALID**.
- **Blockchain Explorer** — view every block: index, timestamp, certificate data, Merkle root, previous hash, current hash, validity.
- **Tampering Demo** — deliberately corrupt a block's data and watch the chain flag it as invalid; restore it back with one click.
- **Module 1 Concepts Page** — maps every core theory topic (ledger, blocks, hashing, Merkle tree, immutability, chain validation, etc.) directly to the code that implements it.
- **Local JSON persistence** — `blockchain_data.json` keeps the chain across restarts; `blockchain_backup.json` is the "last known good" snapshot used to undo tampering.
- Clean, modern, light-themed, responsive UI — no dark mode, professional academic look.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| Frontend | HTML, CSS, JavaScript (Jinja2 templates) |
| Hashing | SHA-256 (Python `hashlib`) |
| Storage | JSON files (no database) |
| File handling | Werkzeug `secure_filename`, Flask `request.files` |

No MySQL, MongoDB, Docker, MetaMask, Solidity, Ethereum, or paid cloud services are used anywhere.

---

## 3. Project Structure

```
Certification Verification System/
│
├── app.py                     # Flask routes (issue, verify, explorer, tamper, concepts)
├── blockchain.py              # Blockchain engine: blocks, hashing, Merkle root, validation
├── requirements.txt           # Python dependencies
├── README.md                  # This file
│
├── blockchain_data.json       # Auto-created — the live chain (persists across restarts)
├── blockchain_backup.json     # Auto-created — last valid snapshot, used by "Restore"
│
├── uploads/                   # Auto-created — stores uploaded certificate files
│
├── templates/
│   ├── base.html               # Shared layout, navbar, chain-status indicator
│   ├── index.html              # Dashboard / home
│   ├── issue.html              # Issue Certificate form + file upload
│   ├── verify.html             # Verify by ID + file authenticity check
│   ├── explorer.html           # Full blockchain explorer
│   ├── tamper.html             # Tampering demo + restore
│   └── concepts.html           # Module 1 concept mapping
│
└── static/
    ├── css/
    │   └── style.css           # Light theme, blue/purple accents
    └── js/
        └── script.js           # Copy-to-clipboard, flash auto-dismiss
```

---

## 4. Prerequisites

- **Windows 10/11**
- **Python 3.9+** installed and added to PATH (check with `python --version` in PowerShell)
- No internet connection required to run the app (only needed once to `pip install`)

---

## 5. Full Execution Steps (Windows PowerShell)

### Step 1 — Open the project folder
Open **VS Code** → open the folder `Certification Verification System` → open a new terminal (`` Ctrl + ` ``), which opens PowerShell inside that folder.

### Step 2 — Create a virtual environment (first time only)
```powershell
python -m venv venv
```

### Step 3 — Activate the virtual environment
```powershell
.\venv\Scripts\Activate
```
You should see `(venv)` appear at the start of the PowerShell prompt.

> If PowerShell blocks the script with an execution-policy error, run this once:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Then retry the Activate command.

### Step 4 — Install dependencies
```powershell
pip install -r requirements.txt
```

### Step 5 — Run the application
```powershell
python app.py
```
You should see output similar to:
```
 * Running on http://127.0.0.1:5000
```

### Step 6 — Open the app
Open a browser and go to:
```
http://127.0.0.1:5000
```

### Step 7 — Stop the server
Press `Ctrl + C` in the terminal.

### Next time you run the project
You don't need to recreate the virtual environment — just:
```powershell
.\venv\Scripts\Activate
python app.py
```

---

## 6. How to Use / Demo Script

1. **Home** — Shows total blocks, total certificates, and chain status (VALID / INVALID).
2. **Issue Certificate**
   - Fill in Student Name, USN, Course, Title, Issue Date.
   - Optionally attach the certificate file (PDF/PNG/JPG/JPEG).
   - Submit → see the generated Certificate ID, SHA-256 hash, Merkle Root, and new block details.
3. **Verify Certificate**
   - Enter the Certificate ID → see full certificate details and VALID/TAMPERED status.
   - Optionally upload the same certificate file → see **CERTIFICATE FILE AUTHENTIC** if it matches, or **TAMPERING DETECTED** if the file was altered.
4. **Blockchain Explorer** — Browse every block, see the Genesis Block clearly marked, and inspect hash linkage.
5. **Tampering Demo**
   - Select an issued certificate block → change its student name/title → click **Simulate Tampering**.
   - Chain status banner flips to **TAMPERING DETECTED: BLOCKCHAIN INVALID**.
   - Go back to Verify Certificate with the same ID → see the tampering flagged there too.
   - Click **Restore Blockchain** to undo the tamper and return to a valid state.
6. **Concepts Page** — Walk through the visual flow diagram and concept cards; use this to explain Module 1 theory to faculty directly from the running app.

---

## 7. How Tampering Detection Works (Technical Summary)

Each block stores:
```
index, timestamp, certificate_data, certificate_hash, merkle_root, previous_hash, current_hash
```

- `certificate_hash` = SHA-256 of the certificate data.
- `merkle_root` = built by hashing each certificate field as a leaf, then pairing and hashing repeatedly up to one root.
- `current_hash` = SHA-256 of (index + timestamp + certificate_data + certificate_hash + merkle_root + previous_hash).
- `previous_hash` = the `current_hash` of the block before it.

`validate_chain()` recomputes all four hashes for every block and compares them to the stored values. If **any** stored certificate data is changed after the block was created, the recomputed hashes no longer match — this is what "TAMPERING DETECTED" means. Because each block's `previous_hash` depends on the prior block's `current_hash`, tampering with an early block would, in a real system, invalidate every block after it too — the explorer highlights exactly which block(s) fail and why.

File integrity works the same way at the byte level: the SHA-256 hash of the uploaded file's raw bytes is stored at issue time; verification re-reads the uploaded file's bytes and re-hashes them. Any change to the file — even one byte — produces a different hash.

---

## 8. Resetting the Demo

- **Restore Blockchain** button (Tampering Demo page) reverts to the last valid backup — use this after any tampering demo.
- To wipe everything and start completely fresh, close the app and delete `blockchain_data.json` and `blockchain_backup.json` — a new Genesis Block will be created automatically on the next run.

---

## 9. Notes for Faculty Evaluation

- The blockchain, hashing, Merkle root, and validation logic are implemented entirely in `blockchain.py` with **no external blockchain library** — this is a genuine, from-scratch data-structure implementation, not a database dressed up as one.
- All certificate and file hashing uses Python's built-in `hashlib.sha256`.
- Persistence uses plain JSON files as allowed, with no database server involved.
- The Concepts page directly cites which function/field implements each Module 1 topic for easy cross-referencing during evaluation.
