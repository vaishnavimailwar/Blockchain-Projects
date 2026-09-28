const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || JSON.stringify(body)
    } catch (_) {}
    throw new Error(detail)
  }
  return res.json()
}

export const api = {
  // Identity
  createIdentity: (payload) => request('/identities', { method: 'POST', body: JSON.stringify(payload) }),
  listIdentities: () => request('/identities'),
  getIdentity: (id) => request(`/identities/${id}`),
  verifyIdentity: (id) => request(`/identities/${id}/verify`, { method: 'POST' }),

  // Blockchain
  getChain: () => request('/blockchain'),
  getBlock: (index) => request(`/blockchain/blocks/${index}`),
  validateChain: () => request('/blockchain/validate', { method: 'POST' }),
  mineBlock: (payload) => request('/blockchain/mine', { method: 'POST', body: JSON.stringify(payload) }),

  // Security
  hashText: (text) => request('/security/hash', { method: 'POST', body: JSON.stringify({ text }) }),
  compareAlgorithms: (text) => request('/security/compare', { method: 'POST', body: JSON.stringify({ text }) }),
  hmacGenerate: (payload) => request('/security/hmac/generate', { method: 'POST', body: JSON.stringify({ payload }) }),
  hmacVerify: (payload, mac) => request('/security/hmac/verify', { method: 'POST', body: JSON.stringify({ payload, mac }) }),
  avalanche: (original_text, modified_text, algorithm = 'sha256') =>
    request('/security/avalanche', { method: 'POST', body: JSON.stringify({ original_text, modified_text, algorithm }) }),
  hashTable: () => request('/security/hash-table'),
  tamperIdentity: (identity_id, field, new_value) =>
    request('/security/tamper/identity', { method: 'POST', body: JSON.stringify({ identity_id, field, new_value }) }),
  tamperBlock: (block_index) =>
    request('/security/tamper/block', { method: 'POST', body: JSON.stringify({ block_index }) }),

  // Consensus
  listValidators: () => request('/consensus/nodes'),
  setNodeBehavior: (node_id, behavior) =>
    request('/consensus/node-behavior', { method: 'POST', body: JSON.stringify({ node_id, behavior }) }),
  resetValidators: () => request('/consensus/reset', { method: 'POST' }),
  listScenarios: () => request('/consensus/scenarios'),
  simulateByzantine: (scenario) =>
    request('/consensus/simulate-byzantine', { method: 'POST', body: JSON.stringify({ scenario }) }),
  faultAnalysis: () => request('/consensus/fault-analysis'),
  consensusComparison: () => request('/consensus/comparison'),

  // DHT
  getDhtRing: () => request('/dht/nodes'),
  dhtLookup: (identity_id) => request('/dht/lookup', { method: 'POST', body: JSON.stringify({ identity_id }) }),
  dhtSimulate: (node_name, action) =>
    request(`/dht/simulate?action=${action}`, { method: 'POST', body: JSON.stringify({ node_name }) }),

  // Analytics
  dashboard: () => request('/analytics/dashboard'),
  audit: () => request('/analytics/audit'),
  charts: () => request('/analytics/charts'),
}
