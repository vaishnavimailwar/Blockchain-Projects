import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, Button, Loading, ErrorState, Badge, HashText } from '../components/common/Common.jsx'
import { ScanSearch, CheckCircle2, XCircle, Pickaxe } from 'lucide-react'

export default function BlockchainExplorer() {
  const [chain, setChain] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [mining, setMining] = useState(false)
  const [difficulty, setDifficulty] = useState(3)
  const [mineResult, setMineResult] = useState(null)

  const load = () => api.getChain().then(setChain).catch((e) => setError(e.message))
  useEffect(load, [])

  const runScan = async () => {
    setScanning(true)
    setScanResult(null)
    try {
      const result = await api.validateChain()
      setScanResult(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setScanning(false)
    }
  }

  const runMining = async () => {
    setMining(true)
    setMineResult(null)
    try {
      const result = await api.mineBlock({ block_header: 'IDENTITYCHAIN-DEMO-BLOCK', difficulty })
      setMineResult(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setMining(false)
    }
  }

  if (error) return <ErrorState message={error} />
  if (!chain) return <Loading label="Loading blockchain ledger…" />

  return (
    <div>
      <PageHeader
        title="Blockchain Explorer"
        subtitle="Custom Python blockchain — block linkage, Merkle roots, and cryptographic integrity, no third-party chain."
        right={
          <Button onClick={runScan} disabled={scanning}>
            <ScanSearch size={14} className="inline mr-1.5 -mt-0.5" />
            {scanning ? 'Scanning…' : 'Chain Integrity Scan'}
          </Button>
        }
      />

      {scanResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            {scanResult.compromised ? <XCircle className="text-accent-red" size={16} /> : <CheckCircle2 className="text-accent-green" size={16} />}
            <span className={`heading font-semibold ${scanResult.compromised ? 'text-accent-red' : 'text-accent-green'}`}>
              {scanResult.blockchain_integrity}
            </span>
            <span className="text-graphite-500 text-[12px] mono ml-2">{scanResult.total_blocks} blocks scanned</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scanResult.block_results.map((b) => (
              <span key={b.index} className={`mono text-[10px] px-1.5 py-0.5 rounded border ${b.valid ? 'border-accent-green/30 text-accent-green' : 'border-accent-red/30 text-accent-red'}`}>
                BLK-{String(b.index).padStart(3, '0')}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel p-4 max-h-[560px] overflow-y-auto">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Ledger ({chain.length} blocks)</div>
          <div className="space-y-1.5">
            {[...chain.blocks].reverse().map((block) => (
              <button
                key={block.index}
                onClick={() => setSelected(block)}
                className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors ${
                  selected?.index === block.index ? 'border-accent-cyan bg-graphite-800' : 'border-graphite-700 hover:bg-graphite-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[12.5px] text-graphite-200">Block #{String(block.index).padStart(5, '0')}</span>
                  <span className="mono text-[10px] text-graphite-500">{block.transaction_count} tx</span>
                </div>
                <div className="mono text-[10.5px] text-graphite-500 mt-1 truncate">{block.block_hash}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          {selected ? (
            <div>
              <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Block Metadata</div>
              <DetailRow label="Block Number" value={selected.index} />
              <DetailRow label="Timestamp" value={new Date(selected.timestamp * 1000).toLocaleString()} />
              <DetailRow label="Previous Hash" value={<HashText>{selected.previous_hash}</HashText>} />
              <DetailRow label="Block Hash" value={<HashText>{selected.block_hash}</HashText>} />
              <DetailRow label="Merkle Root" value={<HashText>{selected.merkle_root}</HashText>} />
              <DetailRow label="Nonce" value={selected.nonce} />
              <DetailRow label="Difficulty" value={selected.difficulty} />
              <DetailRow label="Validator" value={selected.validator} />
              <DetailRow label="Consensus Result" value={selected.consensus_result?.result || '—'} />
              <div className="mt-3 pt-3 border-t border-graphite-700">
                <div className="text-[11px] text-graphite-400 mb-1.5">Identity Transactions</div>
                {selected.identity_transactions.length === 0 && <div className="text-graphite-500 text-[12px]">None (genesis block)</div>}
                {selected.identity_transactions.map((tx, i) => (
                  <div key={i} className="mono text-[11px] text-graphite-400 mb-1">{tx.identity_id} — {tx.identity_hash.slice(0, 18)}…</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-graphite-500 text-sm text-center py-10">Select a block to view details.</div>
          )}
        </div>
      </div>

      <div className="panel p-5 mt-6">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3 flex items-center gap-2">
          <Pickaxe size={13} /> Proof-of-Work Mining Simulator (Educational)
        </div>
        <p className="text-graphite-400 text-[12.5px] mb-4 max-w-2xl">
          Demonstrates how hashing is used in blockchain mining: the miner searches for a nonce whose block hash
          satisfies a difficulty target (N leading zero hex characters). Not real cryptocurrency mining.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-[12px] text-graphite-400">Difficulty (leading zeros):</label>
          <input
            type="range" min={1} max={5} value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-40"
          />
          <span className="mono text-accent-cyan text-[13px]">{difficulty}</span>
          <Button onClick={runMining} disabled={mining}>{mining ? 'Mining…' : 'Start Mining'}</Button>
        </div>
        {mineResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat label="Nonce Found" value={mineResult.nonce ?? '—'} />
            <MiniStat label="Hashes Tried" value={mineResult.attempts} />
            <MiniStat label="Mining Time" value={`${mineResult.mining_time_seconds}s`} />
            <MiniStat label="Final Hash" value={<HashText className="text-[10px]">{mineResult.final_hash?.slice(0, 14)}…</HashText>} />
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="mb-2.5">
      <div className="text-[10.5px] text-graphite-500 uppercase">{label}</div>
      <div className="text-[12.5px] text-graphite-200 mt-0.5 break-all">{value}</div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="panel-soft p-3">
      <div className="text-[10px] text-graphite-500 uppercase">{label}</div>
      <div className="mono text-[13px] text-accent-cyan mt-1">{value}</div>
    </div>
  )
}
