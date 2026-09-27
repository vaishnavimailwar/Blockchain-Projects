import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { PageHeader, Loading, ErrorState, Badge } from '../components/common/Common.jsx'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const CHART_COLORS = { cyan: '#3fd0c9', blue: '#4d8dff', amber: '#e8a23d', green: '#4dc98a' }

export default function AuditAnalytics() {
  const [charts, setCharts] = useState(null)
  const [audit, setAudit] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.charts().then(setCharts).catch((e) => setError(e.message))
    api.audit().then(setAudit).catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!charts || !audit) return <Loading label="Compiling analytics…" />

  const hashUsageData = Object.entries(charts.hash_algorithm_usage).map(([name, count]) => ({ name, count }))

  return (
    <div>
      <PageHeader
        title="Audit & Analytics"
        subtitle="Network-wide analytics and the automated Security Audit Report."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <ChartPanel title="Identity Registrations Over Time">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts.registrations_over_time}>
              <CartesianGrid stroke="#1e242c" vertical={false} />
              <XAxis dataKey="period" stroke="#5b6675" fontSize={10} tickLine={false} />
              <YAxis stroke="#5b6675" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: '#171c22', border: '1px solid #2a323c', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Blockchain Growth (Transactions per Block)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.blockchain_growth}>
              <CartesianGrid stroke="#1e242c" vertical={false} />
              <XAxis dataKey="block" stroke="#5b6675" fontSize={10} tickLine={false} />
              <YAxis stroke="#5b6675" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: '#171c22', border: '1px solid #2a323c', fontSize: 12 }} />
              <Bar dataKey="transactions" fill={CHART_COLORS.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Hash Algorithm Usage">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hashUsageData} layout="vertical">
              <CartesianGrid stroke="#1e242c" horizontal={false} />
              <XAxis type="number" stroke="#5b6675" fontSize={10} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="#5b6675" fontSize={10} width={140} tickLine={false} />
              <Tooltip contentStyle={{ background: '#171c22', border: '1px solid #2a323c', fontSize: 12 }} />
              <Bar dataKey="count" fill={CHART_COLORS.amber} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Validator Participation & Reputation">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.validator_participation}>
              <CartesianGrid stroke="#1e242c" vertical={false} />
              <XAxis dataKey="node_id" stroke="#5b6675" fontSize={10} tickLine={false} />
              <YAxis stroke="#5b6675" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: '#171c22', border: '1px solid #2a323c', fontSize: 12 }} />
              <Bar dataKey="reputation" fill={CHART_COLORS.green} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="mono text-[11px] text-graphite-400 uppercase">System Security Audit Report</div>
          <Badge tone={audit.overall_status === 'SECURE' ? 'success' : 'danger'}>{audit.overall_status}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {Object.entries(audit.checks).map(([key, value]) => (
            <div key={key} className="panel-soft p-3.5">
              <div className="text-[10.5px] text-graphite-500 uppercase mb-1.5">{key.replace(/_/g, ' ')}</div>
              <Badge tone={value === 'PASS' || value === 'ACTIVE' ? 'success' : value === 'FAIL' || value === 'AT RISK' ? 'danger' : 'neutral'}>
                {String(value)}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mono text-[11px] text-graphite-400 uppercase mb-2">Recent Security Events</div>
        {audit.recent_security_events.length === 0 && <div className="text-graphite-500 text-[12.5px] py-4">No security events recorded.</div>}
        <div className="space-y-1.5">
          {audit.recent_security_events.map((e, i) => (
            <div key={i} className="flex items-center gap-3 text-[12px] py-1.5 border-b border-graphite-800 last:border-0">
              <Badge tone={e.severity === 'CRITICAL' ? 'danger' : e.severity === 'WARNING' ? 'warning' : 'info'}>{e.severity}</Badge>
              <span className="mono text-graphite-500 shrink-0">{e.type}</span>
              <span className="text-graphite-400">{e.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartPanel({ title, children }) {
  return (
    <div className="panel p-5">
      <div className="mono text-[11px] text-graphite-400 uppercase mb-3">{title}</div>
      {children}
    </div>
  )
}
