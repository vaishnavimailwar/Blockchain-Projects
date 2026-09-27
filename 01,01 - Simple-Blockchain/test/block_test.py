import pytest
from datetime import datetime
from blockchain import Block

complexity = 2

@pytest.fixture(scope='module')
def mined_blocks():
    global complexity
    b1 = Block("", {'var': 'val'}, complexity, time=datetime(1997, 11, 27, 11, 32, 23, 19233))
    b1.mine()
    b2 = Block(b1.hash, {'item': 13_556}, complexity, time=datetime(1993, 3, 12, 10, 0, 3, 234))
    b2.mine()
    b3 = Block(b2.hash, {}, complexity, time=datetime(2000, 1, 1, 0, 0, 0, 3234))
    b3.mine()
    return [b1, b2, b3]

def test_block_empty():
    b = Block("", None, 2)
    assert b.previous_hash == "" 
    assert b.data == None
    assert b.proof == 0

def test_block_previous():
    b1 = Block("", None, 2)
    b2 = Block(b1.hash, None, 2)

    assert b1.hash == b2.previous_hash

def test_block_mine(mined_blocks):
    global complexity

    assert mined_blocks[1].hash.startswith('0' * complexity)
    assert mined_blocks[2].hash.startswith('0' * complexity)

def test_block_validity(mined_blocks):
    b1, b2, b3 = mined_blocks

    assert b1.valid()
    assert b2.valid()
    assert b3.valid()

    assert b1.hash == b2.previous_hash
    assert b2.hash == b3.previous_hash

    b2.data = {'item': 13_555}

    assert not b2.valid()

def test_block_str(mined_blocks):
    b1, b2, b3 = mined_blocks

    assert str(b1).startswith('{')
    assert "13555" in str(b2)

def test_block_sha256(mined_blocks):
    b1, b2, b3 = mined_blocks

    h1 = b1.sha256()
    h2 = b2.sha256()
    h3 = b3.sha256()

    assert len(h1) == 64
    assert h1 != h2 != h3