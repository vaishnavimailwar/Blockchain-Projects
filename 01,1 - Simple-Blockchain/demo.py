import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src" / "blockchain"))

from blockchain import Blockchain


bc = Blockchain(3)

bc.add({
    "from": "Student",
    "to": "College",
    "amount": 100
})

bc.add({
    "from": "College",
    "to": "Student",
    "amount": 50
})

print("Blockchain valid:", bc.validate())

print("\nBlockchain:")
bc.print()