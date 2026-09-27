import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, Button, Loading, ErrorState, Badge } from '../components/common/Common.jsx'

const BEHAVIORS = ['HONEST', 'MALICIOUS', 'CONFLICTING', 'OFFLINE']

export default function ConsensusNetwork() {
  const [nodes, setNodes] = useState(null)
  const [error, setError] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [simResult, setSimResult] = useState(null)
  const [comparison, setComparison] = useState([])
  const [busy, setBusy] = useState(false)

  const load = () => api.listValidators().then((r) => setNodes(r.nodes)).catch((e) => setError(e.message))

  useEffect(() => {
    load()
    api.listScenarios().then((r) => setScenarios(r.scenarios)).catch(() => {})
    api.consensusComparison().then((r) => setComparison(r.comparison)).catch(() => {})
  }, [])

  const changeBehavior = async (node_id, behavior) => {
    await api.setNodeBehavior(node_id, behavior)
    load()
  }

  const reset = async () => {
    await api.resetValidators()
    setSimResult(null)
    load()
  }

  const runScenario = async (key) => {
    setBusy(true)
    setSimResult(null)
    try {
      const result = await api.simulateByzantine(key)
      setSimResult(result)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorState message={error} />
  if (!nodes) return <Loading label="Connecting to validator network…" />

  return (
    <div>
      <PageHeader
        title="Consensus Network"
        subtitle="Proof-of-Authority inspired validator consensus combined with majority agreement."
        right={<Button variant="ghost" onClick={reset}>Reset All Nodes</Button>}
      />

      <div className="panel p-4 mb-6">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Validator Nodes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-graphite-500 border-b border-graphite-700">
                <th className="py-2 pr-4 font-normal">Node ID</th>
                <th className="py-2 pr-4 font-normal">Organization</th>
                <th className="py-2 pr-4 font-normal">Status</th>
                <th className="py-2 pr-4 font-normal">Behavior</th>
                <th className="py-2 pr-4 font-normal">Reputation</th>
                <th className="py-2 pr-4 font-normal">Latency</th>
                <th className="py-2 pr-4 font-normal">Set Behavior</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n.node_id} className="border-b border-graphite-800">
                  <td className="py-2 pr-4 mono text-graphite-200">{n.node_id}</td>
                  <td className="py-2 pr-4 text-graphite-400">{n.organization}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={n.status === 'ONLINE' ? 'success' : 'danger'}>{n.status}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge tone={n.behavior === 'HONEST' ? 'neutral' : 'warning'}>{n.behavior}</Badge>
                  </td>
                  <td className="py-2 pr-4 mono text-graphite-400">{n.reputation}%</td>
                  <td className="py-2 pr-4 mono text-graphite-500">{n.latency_ms}ms</td>
                  <td className="py-2 pr-4">
                    <select
                      value={n.status === 'OFFLINE' ? 'OFFLINE' : n.behavior}
                      onChange={(e) => changeBehavior(n.node_id, e.target.value)}
                      className="bg-graphite-800 border border-graphite-600 rounded px-2 py-1 text-[11px] mono"
                    >
                      {BEHAVIORS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="panel p-5">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Byzantine Agreement Security Lab</div>
          <div className="space-y-2">
            {scenarios.map((s) => (
              <Button key={s.key} variant="ghost" className="w-full text-left" onClick={() => runScenario(s.key)} disabled={busy}>
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Simulation Result</div>
          {!simResult && <div className="text-graphite-500 text-[13px] py-6 text-center">Run a scenario to see results.</div>}
          {simResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 gap-2 mb-3 text-[12px]">
                <MiniStat label="Honest Nodes" value={simResult.fault_analysis.honest_nodes} />
                <MiniStat label="Malicious Nodes" value={simResult.fault_analysis.malicious_nodes} />
                <MiniStat label="Offline Nodes" value={simResult.fault_analysis.offline_nodes} />
                <MiniStat label="Max Tolerable Faults" value={simResult.fault_analysis.max_tolerable_faults} />
              </div>
              <div className={`text-center py-3 rounded-md mono text-[13px] font-medium ${
                simResult.fault_analysis.byzantine_fault_tolerated ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
              }`}>
                {simResult.fault_analysis.verdict}
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries(simResult.consensus_result.votes).map(([id, v]) => (
                  <div key={id} className="flex justify-between text-[11.5px] mono">
                    <span className="text-graphite-400">{id}</span>
                    <span className={v.vote === 'VALID' ? 'text-accent-green' : v.vote === 'REJECT' ? 'text-accent-red' : 'text-graphite-500'}>{v.vote}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center mono text-[12px] text-graphite-300">
                {simResult.consensus_result.approved} / {simResult.consensus_result.total_nodes} VALIDATORS APPROVED
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Consensus Algorithm Comparison</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {comparison.map((c) => (
            <div key={c.algorithm} className="panel-soft p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-graphite-100 font-medium">{c.algorithm}</span>
                <Badge tone={c.status.includes('Primary') ? 'success' : 'neutral'}>
                  {c.status.includes('Primary') ? 'IMPLEMENTED' : 'COMPARISON'}
                </Badge>
              </div>
              <p className="text-graphite-400 text-[12px]">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="panel-soft p-2.5">
      <div className="text-[10px] text-graphite-500 uppercase">{label}</div>
      <div className="mono text-[14px] text-accent-cyan mt-0.5">{value}</div>
    </div>
  )
}
