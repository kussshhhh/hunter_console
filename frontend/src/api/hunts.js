const API_BASE = 'http://localhost:5000/api'

// Hunt API functions
export const huntAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE}/hunts`)
    if (!response.ok) throw new Error('Failed to fetch hunts')
    return response.json()
  },

  async create(hunt) {
    const response = await fetch(`${API_BASE}/hunts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hunt)
    })
    if (!response.ok) throw new Error('Failed to create hunt')
    return response.json()
  },

  async get(id) {
    const response = await fetch(`${API_BASE}/hunts/${id}`)
    if (!response.ok) throw new Error('Failed to fetch hunt')
    return response.json()
  },

  async update(id, hunt) {
    const response = await fetch(`${API_BASE}/hunts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hunt)
    })
    if (!response.ok) throw new Error('Failed to update hunt')
    return response.json()
  },

  async delete(id) {
    const response = await fetch(`${API_BASE}/hunts/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete hunt')
  }
}

// Hunt Nodes API functions
export const nodeAPI = {
  async getForHunt(huntId) {
    const response = await fetch(`${API_BASE}/hunts/${huntId}/nodes`)
    if (!response.ok) throw new Error('Failed to fetch nodes')
    return response.json()
  },

  async create(huntId, node) {
    const response = await fetch(`${API_BASE}/hunts/${huntId}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node)
    })
    if (!response.ok) throw new Error('Failed to create node')
    return response.json()
  },

  async update(nodeId, node) {
    const response = await fetch(`${API_BASE}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node)
    })
    if (!response.ok) throw new Error('Failed to update node')
    return response.json()
  },

  async delete(nodeId) {
    const response = await fetch(`${API_BASE}/nodes/${nodeId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete node')
  }
}

// Hunt Logs API functions
export const logAPI = {
  async getForHunt(huntId) {
    const response = await fetch(`${API_BASE}/hunts/${huntId}/logs`)
    if (!response.ok) throw new Error('Failed to fetch logs')
    return response.json()
  },

  async create(huntId, log) {
    const response = await fetch(`${API_BASE}/hunts/${huntId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    })
    if (!response.ok) throw new Error('Failed to create log')
    return response.json()
  },

  async update(logId, log) {
    const response = await fetch(`${API_BASE}/logs/${logId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    })
    if (!response.ok) throw new Error('Failed to update log')
    return response.json()
  },

  async delete(logId) {
    const response = await fetch(`${API_BASE}/logs/${logId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete log')
  }
}