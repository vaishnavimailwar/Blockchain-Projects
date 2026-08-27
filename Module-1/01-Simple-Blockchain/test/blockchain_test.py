import pytest
from blockchain import Blockchain

@pytest.fixture(scope='module')
def standard_chain():
    bc = Blockchain(3)
    bc.add(None)
    bc.add("heyo")
    bc.add(2)
    bc.add({'a': True})
    return bc

def test_blockchain_empty():
    bc = Blockchain(2)
    assert bc.complexity == 2
    assert len(bc.blocks) == 1

def test_blockchain_adding(standard_chain):
    bc = standard_chain

    assert bc.blocks[1].data == None
    assert bc.blocks[2].data == "heyo"
    assert bc.blocks[3].data == 2
    assert bc.blocks[4].data == {'a': True}

def test_blockchain_validity(standard_chain):
    bc = standard_chain

    assert bc.validate()

def test_blockchain_invalidity(standard_chain):
    bc = standard_chain

    bc.blocks[1].data = '!'

    print(bc.blocks)

    assert not bc.validate()

def test_blockchain_search(standard_chain):
    bc = standard_chain

    h0 = bc.blocks[0].hash
    h3 = bc.blocks[3].hash
    h4 = bc.blocks[4].hash
    assert bc.search(h0).data == None
    assert bc.search(h3).data == 2
    assert bc.search(h4).data == {'a': True}
    assert bc.search('---') == None

def test_blockchain_add_multiple(standard_chain):
    bc = standard_chain
    bc.add_multiple([1, 2, 3])
    
    assert bc.blocks[-1].data == 3
    assert bc.blocks[-2].data == 2
    assert bc.blocks[-3].data == 1