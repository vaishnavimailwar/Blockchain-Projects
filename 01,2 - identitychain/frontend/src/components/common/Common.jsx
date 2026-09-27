import { Loader2, Inbox, AlertTriangle } from 'lucide-react'

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="heading text-xl font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-graphite-400 text-[13px] mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function StatCard({ label, value, sub, accent = 'cyan' }) {
  const accents = {
    cyan: 'text-accent-cyan', blue: 'text-accent-blue', amber: 'text-accent-amber',
    red: 'text-accent-red', green: 'text-accent-green',
  }
  return (
    <div className="panel p-4">
      <div className="text-[11px] mono text-graphite-400 uppercase tracking-wide">{label}</div>
      <div className={`heading text-2xl font-semibold mt-2 ${accents[accent]}`}>{value}</div>
      {sub && <div className="text-[11px] text-graphite-500 mt-1">{sub}</div>}
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-graphite-700 text-graphite-200 border-graphite-600',
    success: 'bg-accent-green/10 text-accent-green border-accent-green/30',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    danger: 'bg-accent-red/10 text-accent-red border-accent-red/30',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] mono border ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Loading({ label = 'Loading network data…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-graphite-400 text-sm">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  )
}

export function EmptyState({ label = 'No data available' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-graphite-500 text-sm">
      <Inbox size={22} strokeWidth={1.5} /> {label}
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="flex items-center gap-2 py-4 px-4 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
      <AlertTriangle size={16} /> {message}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }) {
  const variants = {
    primary: 'bg-accent-cyan text-graphite-950 hover:bg-accent-cyan/90 font-medium',
    ghost: 'bg-graphite-800 text-graphite-200 hover:bg-graphite-700 border border-graphite-600',
    danger: 'bg-accent-red/15 text-accent-red hover:bg-accent-red/25 border border-accent-red/30',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-3.5 py-2 rounded-md text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function HashText({ children, className = '' }) {
  return <span className={`mono text-[12px] break-all ${className}`}>{children}</span>
}
