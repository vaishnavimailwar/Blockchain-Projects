import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, Button, Loading, ErrorState, Badge, HashText } from '../components/common/Common.jsx'
import { Search, Plus, Minus } from 'lucide-react'

export default function DHTExplorer() {
  const [ring, setRing] = useState(null)
  const [error, setError] = useState(null)
  const [lookupId, setLookupId] = useState('DID-001')
  const [lookupResult, setLookupResult] = useState(null)
  const [newNode, setNewNode] = useState('Node F')
  const [busy, setBusy] = useState(false)

  const load = () => api.getDhtRing().then(setRing).catch((e) => setError(e.message))
  useEffect(load, [])

  const runLookup = async () => {
    try { setLookupResult(await api.dhtLookup(lookupId)) } catch (e) { setError(e.message) }
  }

  const addNode = async () => {
    setBusy(true)
    try {
      await api.dhtSimulate(newNode, 'add')
      await load()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const removeNode = async (nodeName) => {
    setBusy(true)
    try {
      await api.dhtSimulate(nodeName, 'remove')
      await load()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  if (error) return <ErrorState message={error} />
  if (!ring) return <Loading label="Loading distributed hash ring…" />

  return (
    <div>
      <PageHeader
        title="Distributed Hash Table Explorer"
        subtitle="Simplified consistent hash ring simulation — routes identity IDs to responsible storage nodes. Not a production peer-to-peer DHT."
      />
      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 panel p-5">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-4">Consistent Hash Ring</div>
          <RingVisualization ring={ring} highlight={lookupResult?.result} />
          <div className="flex flex-wrap gap-2 mt-4">
            {ring.nodes.map((n) => (
              <div key={n} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-graphite-800 border border-graphite-600 text-[11px]">
                <span>{n}</span>
                <button onClick={() => removeNode(n)} disabled={busy || ring.nodes.length <= 2} className="text-graphite-500 hover:text-accent-red disabled:opacity-30">
                  <Minus size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Identity Lookup</div>
          <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] mb-2" />
          <Button onClick={runLookup} className="w-full mb-4"><Search size={13} className="inline mr-1.5 -mt-0.5" />Lookup Identity</Button>

          {lookupResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              {lookupResult.steps.map((s, i) => (
                <div key={i} className="text-[11.5px]">
                  <span className="mono text-accent-cyan">{s.stage}</span>
                  <div className="text-graphite-500 text-[11px]">{s.detail}</div>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-graphite-700">
                <Badge tone="success">RESOLVED → {lookupResult.result.responsible_node}</Badge>
              </div>
            </motion.div>
          )}

          <div className="mt-6 pt-4 border-t border-graphite-700">
            <div className="mono text-[11px] text-graphite-400 uppercase mb-2">Add Storage Node</div>
            <div className="flex gap-2">
              <input value={newNode} onChange={(e) => setNewNode(e.target.value)} className="flex-1 bg-graphite-800 border border-graphite-600 rounded-md px-2.5 py-1.5 text-[12.5px]" />
              <Button onClick={addNode} disabled={busy}><Plus size={13} /></Button>
            </div>
            <p className="text-graphite-500 text-[11px] mt-2">
              Adding/removing a node only redistributes the keys adjacent to it on the ring — this minimal
              redistribution is the core benefit of consistent hashing over plain modulo hashing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RingVisualization({ ring, highlight }) {
  const size = 380
  const center = size / 2
  const radius = 150

  const positions = ring.ring_positions.map((p) => {
    const angle = (parseInt(p.position, 16) / parseInt(ring.ring_size_hex, 16)) * 2 * Math.PI - Math.PI / 2
    return { ...p, x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }
  })

  const colors = ['#3fd0c9', '#4d8dff', '#e8a23d', '#4dc98a', '#e2495a', '#a78bfa', '#f472b6']
  const nodeColor = {}
  ring.nodes.forEach((n, i) => { nodeColor[n] = colors[i % colors.length] })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-h-[380px] mx-auto">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e242c" strokeWidth="1.5" />
      {positions.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill={nodeColor[p.node] || '#5b6675'} opacity="0.85" />
      ))}
      {highlight && (() => {
        const angle = (parseInt(highlight.responsible_position || highlight.hash_key, 16) / parseInt(ring.ring_size_hex, 16)) * 2 * Math.PI - Math.PI / 2
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return <circle cx={x} cy={y} r="9" fill="none" stroke="#3fd0c9" strokeWidth="2.5"><animate attributeName="r" values="9;14;9" dur="1.4s" repeatCount="indefinite" /></circle>
      })()}
      <text x={center} y={center} textAnchor="middle" fontSize="11" fill="#5b6675" fontFamily="JetBrains Mono">HASH RING</text>
    </svg>
  )
}
