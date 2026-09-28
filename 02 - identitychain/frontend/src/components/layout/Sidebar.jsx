import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Fingerprint, Blocks, Network, FlaskConical,
  Share2, BarChart3, BookOpen, ShieldCheck,
} from 'lucide-react'

const NAV = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard },
  { to: '/identity-vault', label: 'Identity Vault', icon: Fingerprint },
  { to: '/blockchain-explorer', label: 'Blockchain Explorer', icon: Blocks },
  { to: '/consensus-network', label: 'Consensus Network', icon: Network },
  { to: '/hash-laboratory', label: 'Hash Laboratory', icon: FlaskConical },
  { to: '/security-laboratory', label: 'Security Laboratory', icon: ShieldCheck },
  { to: '/dht-explorer', label: 'DHT Explorer', icon: Share2 },
  { to: '/audit-analytics', label: 'Audit & Analytics', icon: BarChart3 },
  { to: '/documentation', label: 'Documentation', icon: BookOpen },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-graphite-900 border-r border-graphite-700 flex flex-col">
      <div className="px-5 py-5 border-b border-graphite-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
            <span className="heading text-graphite-950 font-bold text-sm">IC</span>
          </div>
          <div>
            <div className="heading font-semibold text-[15px] tracking-tight text-ink leading-none">IDENTITYCHAIN</div>
            <div className="mono text-[10px] text-graphite-400 mt-1">v1.0.0 &mdash; TRUST NETWORK</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 mono text-[11px] text-accent-green">
          <span className="status-dot bg-accent-green animate-pulse-soft" />
          NETWORK OPERATIONAL
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] mb-0.5 transition-colors ${
                isActive
                  ? 'bg-graphite-700 text-ink'
                  : 'text-graphite-400 hover:text-graphite-100 hover:bg-graphite-800'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-graphite-700">
        <div className="mono text-[10px] text-graphite-400 mb-2">VALIDATOR NETWORK</div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-graphite-300">5 Nodes Registered</span>
          <span className="mono text-accent-green">ACTIVE</span>
        </div>
        <div className="mt-3 mono text-[10px] text-graphite-500">
          Module II &mdash; Hash Functions &amp; Consensus
        </div>
      </div>
    </aside>
  )
}
