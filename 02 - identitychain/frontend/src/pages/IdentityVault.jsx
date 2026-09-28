import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, Button, Loading, EmptyState, ErrorState, Badge, HashText } from '../components/common/Common.jsx'
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'

const IDENTITY_TYPES = ['Academic Identity', 'Employee Identity', 'Professional Identity', 'Organization Identity']

const EMPTY_FORM = {
  full_name: '', unique_identity_number: '', identity_type: IDENTITY_TYPES[0],
  organization: '', email: '', department: '',
}

export default function IdentityVault() {
  const [identities, setIdentities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [pipelineResult, setPipelineResult] = useState(null)

  const load = () => {
    setLoading(true)
    api.listIdentities().then(setIdentities).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setPipelineResult(null)
    try {
      const result = await api.createIdentity(form)
      setPipelineResult(result)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Identity Vault"
        subtitle="Register a decentralized identity record. Each submission travels through the full Cryptographic Trust Pipeline."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <form onSubmit={submit} className="panel p-5 lg:col-span-2 h-fit space-y-3">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-1">New Identity Record</div>
          <Field label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
          <Field label="Unique Identity Number" value={form.unique_identity_number} onChange={(v) => setForm({ ...form, unique_identity_number: v })} required />
          <div>
            <label className="text-[11px] text-graphite-400 block mb-1">Identity Type</label>
            <select
              value={form.identity_type}
              onChange={(e) => setForm({ ...form, identity_type: e.target.value })}
              className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] text-graphite-100 focus:outline-none focus:border-accent-cyan"
            >
              {IDENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Organization" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Department / Category" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />

          <Button type="submit" disabled={submitting} className="w-full mt-2">
            {submitting ? 'Processing Trust Pipeline\u2026' : 'Register Identity'}
          </Button>
          {error && <div className="text-accent-red text-[12px] mt-1">{error}</div>}
        </form>

        <div className="lg:col-span-3">
          <AnimatePresence>
            {pipelineResult && <PipelineTrace result={pipelineResult} key={pipelineResult.identity_id} />}
          </AnimatePresence>
          {!pipelineResult && (
            <div className="panel p-8 flex items-center justify-center text-graphite-500 text-sm h-full">
              Submit an identity to watch it travel through the Cryptographic Trust Pipeline.
            </div>
          )}
        </div>
      </div>

      <div className="panel mt-6 p-5">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-4">Registered Identities ({identities.length})</div>
        {loading && <Loading />}
        {!loading && identities.length === 0 && <EmptyState label="No identities registered yet." />}
        {!loading && identities.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-graphite-500 border-b border-graphite-700">
                  <th className="py-2 pr-4 font-normal">ID</th>
                  <th className="py-2 pr-4 font-normal">Name</th>
                  <th className="py-2 pr-4 font-normal">Type</th>
                  <th className="py-2 pr-4 font-normal">Organization</th>
                  <th className="py-2 pr-4 font-normal">SHA3-256 Fingerprint</th>
                  <th className="py-2 pr-4 font-normal">Block</th>
                  <th className="py-2 pr-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {identities.map((id) => (
                  <IdentityRow key={id.id} identity={id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function IdentityRow({ identity }) {
  return (
    <tr className="border-b border-graphite-800 hover:bg-graphite-800/40">
      <td className="py-2 pr-4 mono text-graphite-300">{identity.id}</td>
      <td className="py-2 pr-4 text-graphite-200">{identity.full_name}</td>
      <td className="py-2 pr-4 text-graphite-400">{identity.identity_type}</td>
      <td className="py-2 pr-4 text-graphite-400">{identity.organization}</td>
      <td className="py-2 pr-4"><HashText className="text-graphite-500">{identity.sha3_256_hash?.slice(0, 20)}&hellip;</HashText></td>
      <td className="py-2 pr-4 mono text-graphite-400">{identity.block_index != null ? `#${identity.block_index}` : '\u2014'}</td>
      <td className="py-2 pr-4">
        {identity.verified ? <Badge tone="success">VERIFIED</Badge> : <Badge tone="danger">FAILED</Badge>}
      </td>
    </tr>
  )
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="text-[11px] text-graphite-400 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px] text-graphite-100 focus:outline-none focus:border-accent-cyan"
      />
    </div>
  )
}

function PipelineTrace({ result }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="mono text-[11px] text-graphite-400 uppercase">Cryptographic Trust Pipeline &mdash; {result.identity_id}</div>
        {result.committed ? (
          <Badge tone="success"><CheckCircle2 size={11} className="inline mr-1 -mt-0.5" />COMMITTED</Badge>
        ) : (
          <Badge tone="danger"><XCircle size={11} className="inline mr-1 -mt-0.5" />NOT COMMITTED</Badge>
        )}
      </div>

      <div className="space-y-0">
        {result.pipeline_trace.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-3 relative pl-1"
          >
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-accent-cyan mt-1.5" />
              {i < result.pipeline_trace.length - 1 && <div className="w-px flex-1 bg-graphite-700 my-0.5" />}
            </div>
            <div className="pb-3.5">
              <div className="mono text-[12px] text-accent-cyan">{step.stage}</div>
              <div className="text-[12px] text-graphite-400 mt-0.5">{step.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {result.block && (
        <div className="mt-2 pt-3 border-t border-graphite-700 flex items-center gap-2 text-[12px] text-graphite-400">
          <ShieldCheck size={14} className="text-accent-green" />
          Committed to Block #{result.block.index} &mdash; Merkle root <HashText className="text-graphite-300">{result.block.merkle_root.slice(0, 16)}&hellip;</HashText>
        </div>
      )}
    </motion.div>
  )
}
