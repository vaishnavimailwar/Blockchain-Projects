import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, StatCard, Loading, ErrorState, Badge } from '../components/common/Common.jsx'
import { Activity } from 'lucide-react'

export default function CommandCenter() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    api.dashboard().then(setData).catch((e) => setError(e.message))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [])

  if (error) return <ErrorState message={`Could not reach backend API: ${error}`} />
  if (!data) return <Loading label="Initializing network telemetry…" />

  const health = data.network_health

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle="Real-time overview of the IDENTITYCHAIN trust network — blockchain integrity, validator status, and DHT availability."
        right={<Badge tone="success">NETWORK OPERATIONAL</Badge>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Identities" value={data.total_identities} accent="cyan" />
        <StatCard label="Verified Identities" value={data.verified_identities} accent="green" />
        <StatCard label="Blockchain Blocks" value={data.total_blocks} accent="blue" />
        <StatCard label="Active Validators" value={`${data.active_validators}/${data.total_validators}`} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="panel p-5 lg:col-span-1">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-4">Network Health</div>
          {Object.entries(health).map(([k, v]) => (
            <HealthBar key={k} label={k.replace(/_/g, ' ')} value={v} />
          ))}
        </div>

        <div className="panel p-5 lg:col-span-2">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-4 flex items-center gap-2">
            <Activity size={13} /> Recent Network Activity
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {data.recent_activity.length === 0 && (
              <div className="text-graphite-500 text-sm py-6 text-center">No activity recorded yet.</div>
            )}
            {data.recent_activity.map((a, i) => (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                key={i}
                className="flex items-center gap-3 text-[12.5px] py-1.5 border-b border-graphite-800 last:border-0"
              >
                <span className="mono text-graphite-500 shrink-0">
                  {new Date(a.timestamp * 1000).toLocaleTimeString()}
                </span>
                <span className="text-graphite-300">{a.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-4">Validator Network Topology</div>
        <NetworkTopology activeValidators={data.active_validators} totalValidators={data.total_validators} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Consensus Success Rate" value={`${data.consensus_success_rate}%`} accent="green" />
        <StatCard label="DHT Network Availability" value={`${data.dht_availability_pct}%`} accent="blue" />
        <StatCard label="Security Events Detected" value={data.security_events_detected} accent="amber" />
        <StatCard
          label="Byzantine Fault Tolerance"
          value={data.byzantine_fault_tolerance.byzantine_fault_tolerated ? 'TOLERATED' : 'AT RISK'}
          accent={data.byzantine_fault_tolerance.byzantine_fault_tolerated ? 'green' : 'red'}
        />
      </div>
    </div>
  )
}

function HealthBar({ label, value }) {
  const color = value >= 95 ? 'bg-accent-green' : value >= 80 ? 'bg-accent-amber' : 'bg-accent-red'
  return (
    <div className="mb-3.5">
      <div className="flex justify-between text-[12px] mb-1">
        <span className="capitalize text-graphite-300">{label}</span>
        <span className="mono text-graphite-300">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-graphite-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  )
}

function NetworkTopology({ activeValidators, totalValidators }) {
  const nodes = Array.from({ length: totalValidators })
  const radius = 110
  const centerX = 200
  const centerY = 110

  return (
    <svg viewBox="0 0 400 220" className="w-full h-56">
      {nodes.map((_, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle) * 0.85
        const active = i < activeValidators
        return (
          <g key={i}>
            <line x1={centerX} y1={centerY} x2={x} y2={y} stroke={active ? '#3fd0c9' : '#2a323c'} strokeWidth="1" opacity="0.5" />
            <circle cx={x} cy={y} r="14" fill={active ? '#12161b' : '#0f1216'} stroke={active ? '#3fd0c9' : '#3a4450'} strokeWidth="1.5" />
            <text x={x} y={y + 28} textAnchor="middle" fontSize="9" fill="#5b6675" fontFamily="JetBrains Mono">
              NODE-{String(i + 1).padStart(2, '0')}
            </text>
          </g>
        )
      })}
      <circle cx={centerX} cy={centerY} r="22" fill="#171c22" stroke="#4d8dff" strokeWidth="1.5" />
      <text x={centerX} y={centerY + 4} textAnchor="middle" fontSize="9" fill="#4d8dff" fontFamily="JetBrains Mono">
        LEDGER
      </text>
    </svg>
  )
}
