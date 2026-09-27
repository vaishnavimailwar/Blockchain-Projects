import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api.js'
import { PageHeader, Button, ErrorState, Badge, HashText } from '../components/common/Common.jsx'

export default function HashLaboratory() {
  const [text, setText] = useState('Vaishnavi')
  const [hashes, setHashes] = useState(null)
  const [error, setError] = useState(null)

  const [original, setOriginal] = useState('Vaishnavi')
  const [modified, setModified] = useState('Vaishnavi1')
  const [avalanche, setAvalanche] = useState(null)

  const [macPayload, setMacPayload] = useState('{"identity_id":"DID-001","name":"Vaishnavi"}')
  const [macResult, setMacResult] = useState(null)
  const [tamperedPayload, setTamperedPayload] = useState('{"identity_id":"DID-001","name":"Malicious User"}')
  const [verifyResult, setVerifyResult] = useState(null)

  const runHash = async () => {
    try { setHashes(await api.hashText(text)) } catch (e) { setError(e.message) }
  }

  const runAvalanche = async () => {
    try { setAvalanche(await api.avalanche(original, modified, 'sha256')) } catch (e) { setError(e.message) }
  }

  const generateMac = async () => {
    try {
      const payload = JSON.parse(macPayload)
      setMacResult(await api.hmacGenerate(payload))
    } catch (e) { setError('Invalid JSON or API error: ' + e.message) }
  }

  const verifyTampered = async () => {
    if (!macResult) return
    try {
      const payload = JSON.parse(tamperedPayload)
      setVerifyResult(await api.hmacVerify(payload, macResult.mac))
    } catch (e) { setError('Invalid JSON or API error: ' + e.message) }
  }

  return (
    <div>
      <PageHeader
        title="Hash Function Laboratory"
        subtitle="Interactive cryptographic laboratory covering SHA-1, SHA-256, SHA3-256, HMAC-SHA256 and the avalanche effect."
      />
      {error && <ErrorState message={error} />}

      <div className="panel p-5 mb-6">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Multi-Algorithm Hash Generator</div>
        <div className="flex gap-2 mb-4">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px]" />
          <Button onClick={runHash}>Generate Hashes</Button>
        </div>
        {hashes && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['sha1', 'sha256', 'sha3_256'].map((key) => {
              const h = hashes[key]
              return (
                <div key={key} className="panel-soft p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-medium text-graphite-100">{h.algorithm}</span>
                    <Badge tone={key === 'sha1' ? 'warning' : 'success'}>{h.bit_length}-bit</Badge>
                  </div>
                  <HashText className="text-graphite-400 block mb-2">{h.digest}</HashText>
                  <div className="text-[10.5px] text-graphite-500">{h.security_status}</div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-graphite-700">
          <div className="mono text-[11px] text-graphite-400 uppercase mb-2">Hash Comparison Matrix</div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-graphite-500 border-b border-graphite-700">
                <th className="py-1.5 font-normal">Algorithm</th>
                <th className="py-1.5 font-normal">Digest Length</th>
                <th className="py-1.5 font-normal">Current Security Status</th>
                <th className="py-1.5 font-normal">Project Usage</th>
              </tr>
            </thead>
            <tbody>
              <MatrixRow algo="SHA-1" len="160-bit" status="LEGACY / EDUCATIONAL COMPARISON ONLY" usage="Comparison laboratory only" tone="warning" />
              <MatrixRow algo="SHA-256" len="256-bit" status="PRIMARY INTEGRITY ALGORITHM" usage="Identity fingerprint, blockchain hashing" tone="success" />
              <MatrixRow algo="SHA3-256" len="256-bit" status="ADVANCED CRYPTOGRAPHIC ALTERNATIVE" usage="Advanced identity fingerprint (Keccak)" tone="success" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-5 mb-6">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Avalanche Effect Demonstration</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] text-graphite-400 block mb-1">Original Input</label>
            <input value={original} onChange={(e) => setOriginal(e.target.value)} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px]" />
          </div>
          <div>
            <label className="text-[11px] text-graphite-400 block mb-1">Modified Input</label>
            <input value={modified} onChange={(e) => setModified(e.target.value)} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[13px]" />
          </div>
        </div>
        <Button onClick={runAvalanche}>Compare Hashes</Button>
        {avalanche && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="panel-soft p-3"><div className="text-[10.5px] text-graphite-500 mb-1">ORIGINAL SHA-256</div><HashText>{avalanche.original_hash}</HashText></div>
              <div className="panel-soft p-3"><div className="text-[10.5px] text-graphite-500 mb-1">MODIFIED SHA-256</div><HashText>{avalanche.modified_hash}</HashText></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[13px]">
                <span className="text-graphite-400">Bits changed: </span>
                <span className="mono text-accent-cyan">{avalanche.changed_bits}/{avalanche.total_bits} ({avalanche.changed_percentage}%)</span>
              </div>
              <Badge tone={avalanche.verdict.includes('STRONG') ? 'success' : 'warning'}>{avalanche.verdict}</Badge>
            </div>
            <div className="flex flex-wrap gap-0.5 mt-3">
              {avalanche.char_diff.map((c, i) => (
                <span key={i} className={`mono text-[10px] w-4 h-5 flex items-center justify-center rounded ${c.changed ? 'bg-accent-red/25 text-accent-red' : 'bg-graphite-800 text-graphite-500'}`}>
                  {c.modified}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="panel p-5">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Message Authentication Code (HMAC-SHA256)</div>
        <p className="text-graphite-400 text-[12.5px] mb-3">Generate an authenticated payload, then tamper with it to see authentication fail.</p>

        <label className="text-[11px] text-graphite-400 block mb-1">Original Payload (JSON)</label>
        <textarea value={macPayload} onChange={(e) => setMacPayload(e.target.value)} rows={3} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[12px] mono mb-2" />
        <Button onClick={generateMac}>Generate Authenticated Payload</Button>

        {macResult && (
          <div className="mt-3 panel-soft p-3">
            <div className="text-[10.5px] text-graphite-500 mb-1">MAC (HMAC-SHA256)</div>
            <HashText className="text-accent-green">{macResult.mac}</HashText>
          </div>
        )}

        {macResult && (
          <div className="mt-4">
            <label className="text-[11px] text-graphite-400 block mb-1">Modified Payload (tamper with it)</label>
            <textarea value={tamperedPayload} onChange={(e) => setTamperedPayload(e.target.value)} rows={3} className="w-full bg-graphite-800 border border-graphite-600 rounded-md px-3 py-2 text-[12px] mono mb-2" />
            <Button variant="ghost" onClick={verifyTampered}>Verify MAC Against Modified Payload</Button>
          </div>
        )}

        {verifyResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-3 text-center py-3 rounded-md mono text-[13px] font-medium ${
            verifyResult.valid ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
          }`}>
            {verifyResult.result}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function MatrixRow({ algo, len, status, usage, tone }) {
  return (
    <tr className="border-b border-graphite-800">
      <td className="py-2 mono text-graphite-200">{algo}</td>
      <td className="py-2 mono text-graphite-400">{len}</td>
      <td className="py-2"><Badge tone={tone}>{status}</Badge></td>
      <td className="py-2 text-graphite-400">{usage}</td>
    </tr>
  )
}
