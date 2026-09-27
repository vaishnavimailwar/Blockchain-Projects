# Simple Blockchain Implementation

## 📌 Objective

To implement a basic blockchain in Python using blocks, transactions,
cryptographic hashing, chaining, proof-of-work, and blockchain validation.

## 🧠 Concepts Demonstrated

- Block creation
- Transactions
- SHA-256 hashing
- Previous block hash
- Hash chaining
- Proof-of-work
- Mining
- Blockchain validation
- Immutability and integrity

## 🛠️ Technologies

- Python
- SHA-256
- Object-Oriented Programming

## ⚙️ Implementation

The blockchain consists of a sequence of blocks.

Each block contains:

- Hash
- Previous block hash
- Timestamp
- Transaction data
- Proof
- Complexity

A new block stores the hash of the previous block, creating a chain.
Mining searches for a hash satisfying the required difficulty.

## ▶️ Demo

The project is demonstrated using `demo.py`.

The demo:

1. Creates a blockchain.
2. Adds two transactions.
3. Mines the blocks.
4. Validates the blockchain.
5. Prints the complete blockchain.

## ✅ Result

The blockchain was successfully executed and validated.

`Blockchain valid: True`

The output demonstrates the genesis block and subsequent transaction
blocks with their hashes, previous hashes, proof values, and difficulty.

## 📸 Result

![Blockchain Result](./screenshots/01-blockchain-result.png)