import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, Button, Loading, ErrorState, Badge, HashText } from '../components/common/Common.jsx'
import { AlertOctagon } from 'lucide-react'

export default function SecurityLaboratory() {
  const [identities, setIdentities] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [field, setField] = useState('full_name')
  const [newValue, setNewValue] = useState('Malicious User')
  const [tamperResult, setTamperResult] = useState(null)

  const [blocks, setBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState(0)
  const [blockTamperResult, setBlockTamperResult] = useState(null)

  const [hashTable, setHashTable] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.listIdentities().then((list) => {
      setIdentities(list)
      if (list.length) setSelectedId(list[0].id)
    }).catch((e) => setError(e.message))
    api.getChain().then((c) => setBlocks(c.blocks)).catch(() => {})
    api.hashTable().then(setHashTable).catch(() => {})
  }, [])

  const runIdentityTamper = async () => {
    try { setTamperResult(await api.tamperIdentity(selectedId, field, newValue)) } catch (e) { setError(e.message) }
  }

  const runBlockTamper = async () => {
    try { setBlockTamperResult(await api.tamperBlock(selectedBlock)) } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <PageHeader
        title="Security Laboratory"
        subtitle="Cybersecurity experiment environment — demonstrating tamper detection across the identity, HMAC, and blockchain layers."
      />
      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="panel p-5">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-3 flex items-center gap-2">
            <AlertOctagon size={13} className="text-accent-red" /> Experiment A — Identity Data Tampering
          </div>
          <label className="text-[11px] text-graphite-400 block mb-1">Identity</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] mb-2">
            {identities.map((i) => <option key={i.id} value={i.id}>{i.id} — {i.full_name}</option>)}
          </select>
          <label className="text-[11px] text-graphite-400 block mb-1">Field to Modify</label>
          <select value={field} onChange={(e) => setField(e.target.value)} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] mb-2">
            <option value="full_name">full_name</option>
            <option value="email">email</option>
            <option value="organization">organization</option>
          </select>
          <label className="text-[11px] text-graphite-400 block mb-1">New Value</label>
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] mb-3" />
          <Button onClick={runIdentityTamper} disabled={!selectedId}>Tamper Identity Record</Button>

          {tamperResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <div className="grid grid-cols-1 gap-2 mb-2 text-[11.5px]">
                <div className="panel-soft p-2.5"><span className="text-graphite-500">ORIGINAL HASH: </span><HashText>{tamperResult.original_hash}</HashText></div>
                <div className="panel-soft p-2.5"><span className="text-graphite-500">RECOMPUTED HASH: </span><HashText>{tamperResult.recomputed_hash}</HashText></div>
              </div>
              <Badge tone={tamperResult.hash_match ? 'success' : 'danger'}>{tamperResult.result}</Badge>
            </motion.div>
          )}
        </div>

        <div className="panel p-5">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-3 flex items-center gap-2">
            <AlertOctagon size={13} className="text-accent-red" /> Experiment B — Blockchain Block Tampering
          </div>
          <label className="text-[11px] text-graphite-400 block mb-1">Block Index</label>
          <select value={selectedBlock} onChange={(e) => setSelectedBlock(Number(e.target.value))} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] mb-3">
            {blocks.filter((b) => b.transaction_count > 0).map((b) => <option key={b.index} value={b.index}>Block #{b.index}</option>)}
          </select>
          <Button onClick={runBlockTamper}>Tamper Identity Reference In Block</Button>

          {blockTamperResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <div className={`text-center py-3 rounded-md mono text-[13px] font-medium mb-2 ${
                blockTamperResult.chain_validation.compromised ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'
              }`}>
                {blockTamperResult.chain_validation.blockchain_integrity}
              </div>
              <p className="text-graphite-400 text-[12px]">
                Block #{selectedBlock} hash no longer matches its recomputed hash — subsequent blocks are now
                unlinkable from a trusted root without re-mining, which the Chain Integrity Scan detects.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-2">Educational Hash Table Collision Simulation</div>
        <p className="text-graphite-400 text-[12.5px] mb-4">
          Identity IDs are hashed into a deliberately reduced hash space (16 buckets) to visualize collisions.
          This does NOT simulate SHA-256 collisions — those remain cryptographically infeasible.
        </p>
        {!hashTable ? <Loading /> : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Object.entries(hashTable.buckets).map(([bucket, ids]) => (
              <div key={bucket} className={`panel-soft p-2.5 text-center ${ids.length > 1 ? 'border-accent-amber/40' : ''}`}>
                <div className="text-[10px] text-graphite-500">BUCKET {bucket}</div>
                <div className={`mono text-[13px] mt-1 ${ids.length > 1 ? 'text-accent-amber' : 'text-graphite-300'}`}>{ids.length}</div>
                {ids.length > 1 && <div className="text-[9px] text-accent-amber mt-1">COLLISION</div>}
              </div>
            ))}
          </div>
        )}
        {hashTable && (
          <div className="mt-3 text-[12px] text-graphite-400">
            Total collisions: <span className="mono text-accent-amber">{hashTable.collision_count}</span>
          </div>
        )}
      </div>
    </div>
  )
}
