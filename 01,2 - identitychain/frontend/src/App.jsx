import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import CommandCenter from './pages/CommandCenter.jsx'
import IdentityVault from './pages/IdentityVault.jsx'
import BlockchainExplorer from './pages/BlockchainExplorer.jsx'
import ConsensusNetwork from './pages/ConsensusNetwork.jsx'
import HashLaboratory from './pages/HashLaboratory.jsx'
import SecurityLaboratory from './pages/SecurityLaboratory.jsx'
import DHTExplorer from './pages/DHTExplorer.jsx'
import AuditAnalytics from './pages/AuditAnalytics.jsx'
import Documentation from './pages/Documentation.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/identity-vault" element={<IdentityVault />} />
        <Route path="/blockchain-explorer" element={<BlockchainExplorer />} />
        <Route path="/consensus-network" element={<ConsensusNetwork />} />
        <Route path="/hash-laboratory" element={<HashLaboratory />} />
        <Route path="/security-laboratory" element={<SecurityLaboratory />} />
        <Route path="/dht-explorer" element={<DHTExplorer />} />
        <Route path="/audit-analytics" element={<AuditAnalytics />} />
        <Route path="/documentation" element={<Documentation />} />
      </Routes>
    </Layout>
  )
}
