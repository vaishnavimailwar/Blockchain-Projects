from __future__ import annotations
from datetime import datetime
from hashlib import sha256


class Block:
    data: object
    hash: str
    previous_hash: str
    time: datetime
    proof: int
    complexity: int

    def __init__(self, previous_hash: str, data: object, complexity: int, *, time = datetime.now()):
        self.previous_hash = previous_hash
        self.data = data
        self.time = time
        self.proof = 0
        self.complexity = complexity
        self.hash = self.sha256()

    def sha256(self):
        block = [
            self.previous_hash, ';',
            str(self.time), ';',
            str(self.data), ';',
            str(self.proof), ';',
            str(self.complexity), ';',
        ]
        return sha256(''.join(block).encode('utf8')).hexdigest()

    def valid(self, previous: Block = None):
        if previous is not None and previous.hash != self.previous_hash:
            return False
        return self.sha256() == self.hash and self.hash.startswith('0' * self.complexity)

    def mine(self):
        prefix = '0' * self.complexity
        while not self.hash.startswith(prefix):
            self.proof += 1
            self.hash = self.sha256()

    def __str__(self):
        block = [
            '{\n',
            '   Hash: ', str(self.hash), '\n',
            '   Prev: ', str(self.previous_hash), '\n',
            '   Time: ', str(self.time), '\n',
            '   Data: ', str(self.data), '\n',
            '   Prof: ', str(self.proof), '\n',
            '   Comp: ', str(self.complexity), '\n',
            '}',
        ]
        return ''.join(block)
