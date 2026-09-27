import { PageHeader } from '../components/common/Common.jsx'

const MAPPING = [
  { topic: 'Hashing (Introduction & Core Concept)', feature: 'SHA-based identity fingerprint generation', location: 'Hash Laboratory, Identity Vault' },
  { topic: 'Message Authentication Code', feature: 'HMAC-SHA256 authenticated identity payload + tampering demonstration', location: 'Hash Laboratory' },
  { topic: 'Secure Hash Algorithms (SHA-1)', feature: 'Legacy algorithm retained for academic comparison only, clearly labeled insecure', location: 'Hash Laboratory, Hash Comparison Matrix' },
  { topic: 'Secure Hash Algorithm Version 3', feature: 'SHA3-256 advanced identity fingerprint (Keccak sponge construction)', location: 'Hash Laboratory, Identity Vault' },
  { topic: 'Distributed Hash Tables', feature: 'Consistent hash ring identity routing simulation (educational)', location: 'DHT Explorer' },
  { topic: 'Hashing and Data Structures', feature: 'Hash-indexed identity registry + educational collision simulation (reduced hash space)', location: 'Security Laboratory' },
  { topic: 'Hashing in Blockchain Mining', feature: 'Proof-of-Work nonce & difficulty simulator (educational, bounded)', location: 'Blockchain Explorer' },
  { topic: 'Consensus — Introduction & Approach', feature: 'Validator voting network with live vote outcomes', location: 'Consensus Network' },
  { topic: 'Consensus Algorithms', feature: 'Proof-of-Authority inspired consensus (implemented) + PoW / PoS / BFT comparison (educational)', location: 'Consensus Network' },
  { topic: 'Byzantine Agreement Methods', feature: 'Malicious/offline validator simulation, N ≥ 3f+1 fault-tolerance analysis, 4 scenarios', location: 'Consensus Network' },
]

export default function Documentation() {
  return (
    <div>
      <PageHeader
        title="Module II Concept Implementation"
        subtitle="A direct mapping between every Module II syllabus concept (Hash Functions, Consensus) and the working feature that implements it — for faculty demonstration and viva."
      />

      <div className="panel p-5 mb-6">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Syllabus → Implementation Map</div>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-graphite-500 border-b border-graphite-700">
              <th className="py-2 pr-4 font-normal w-1/3">Syllabus Topic</th>
              <th className="py-2 pr-4 font-normal w-1/3">Implemented Feature</th>
              <th className="py-2 pr-4 font-normal">Where in the App</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING.map((row) => (
              <tr key={row.topic} className="border-b border-graphite-800 align-top">
                <td className="py-3 pr-4 text-graphite-200">{row.topic}</td>
                <td className="py-3 pr-4 text-graphite-400">{row.feature}</td>
                <td className="py-3 pr-4 mono text-accent-cyan text-[11.5px]">{row.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel p-5 mb-6">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">The Cryptographic Trust Pipeline</div>
        <p className="text-graphite-400 text-[13px] mb-4 max-w-3xl">
          Every identity registered in IDENTITYCHAIN travels through the same pipeline — this is the project's
          central, signature concept, and it is genuinely executed on the backend (not simulated in the UI alone).
        </p>
        <PipelineDiagram />
      </div>

      <div className="panel p-5">
        <div className="mono text-[11px] text-graphite-400 uppercase mb-3">Important Academic Notes</div>
        <ul className="text-graphite-400 text-[13px] space-y-2 list-disc list-inside">
          <li>Sensitive identity data is never stored on-chain — only cryptographic fingerprints, block metadata, and validator information.</li>
          <li>SHA-1 is displayed only for algorithmic comparison and is never used as a primary integrity mechanism.</li>
          <li>The Proof-of-Work mining simulator is bounded and educational — it is not real cryptocurrency mining.</li>
          <li>The DHT is a simplified consistent hash ring, not a production peer-to-peer network (no gossip protocol or real networking).</li>
          <li>The hash table collision demo uses a deliberately reduced hash space — SHA-256 collisions are not being realistically generated.</li>
          <li>The project's primary, actually-implemented consensus mechanism is Proof-of-Authority combined with majority agreement and Byzantine fault-tolerance analysis. PoW and PoS are presented only as educational comparisons.</li>
        </ul>
      </div>
    </div>
  )
}

const STAGES = [
  'IDENTITY DATA', 'CANONICALIZATION', 'MULTI-ALGORITHM HASHING', 'HMAC AUTHENTICATION',
  'DHT ROUTING', 'VALIDATOR BROADCAST', 'BYZANTINE-RESILIENT CONSENSUS', 'MERKLE AGGREGATION',
  'BLOCK HASHING', 'LEDGER COMMITMENT',
]

function PipelineDiagram() {
  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map((stage, i) => (
        <div key={stage} className="flex items-center gap-2">
          <div className="panel-soft px-3 py-2 mono text-[11px] text-graphite-200 whitespace-nowrap">{stage}</div>
          {i < STAGES.length - 1 && <span className="text-graphite-600">→</span>}
        </div>
      ))}
    </div>
  )
}
