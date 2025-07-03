import React, { useState, useEffect } from 'react'
import HuntCreator from './components/HuntCreator'
import HuntDisplay from './components/HuntDisplay'
import HuntCanvas from './components/HuntCanvas'
import { huntAPI } from './api/hunts'

function App() {
  const [hunts, setHunts] = useState([])
  const [currentView, setCurrentView] = useState('overview')
  const [selectedHunt, setSelectedHunt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHunts()
  }, [])

  const loadHunts = async () => {
    try {
      setLoading(true)
      const data = await huntAPI.getAll()
      setHunts(data)
    } catch (err) {
      setError('Failed to load hunts. Make sure the backend is running.')
      console.error('Error loading hunts:', err)
    } finally {
      setLoading(false)
    }
  }

  const addHunt = async (hunt) => {
    try {
      const newHunt = await huntAPI.create(hunt)
      setHunts([...hunts, newHunt])
      setCurrentView('overview')
    } catch (err) {
      setError('Failed to create hunt')
      console.error('Error creating hunt:', err)
    }
  }

  const openHuntCanvas = (hunt) => {
    setSelectedHunt(hunt)
    setCurrentView('canvas')
  }

  const closeHuntCanvas = () => {
    setSelectedHunt(null)
    setCurrentView('overview')
  }

  return (
    <div className="min-h-screen bg-hunter-bg text-hunter-text">
      <header className="border-b border-hunter-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-mono font-bold text-hunter-text">
            Hunt Console
          </h1>
          <p className="text-hunter-muted mt-2">
            Where obsession becomes transcendence
          </p>
        </div>
      </header>

      <nav className="border-b border-hunter-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('overview')}
              className={`py-4 border-b-2 transition-colors duration-200 ${
                currentView === 'overview'
                  ? 'border-hunter-accent text-hunter-accent'
                  : 'border-transparent text-hunter-muted hover:text-hunter-text'
              }`}
            >
              Active Hunts
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`py-4 border-b-2 transition-colors duration-200 ${
                currentView === 'create'
                  ? 'border-hunter-accent text-hunter-accent'
                  : 'border-transparent text-hunter-muted hover:text-hunter-text'
              }`}
            >
              New Hunt
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-hunter-danger/10 border border-hunter-danger/30 text-hunter-danger px-4 py-3 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-hunter-danger/80 hover:text-hunter-danger"
            >
              ×
            </button>
          </div>
        )}

        {currentView === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-hunter-muted text-lg">Loading hunts...</p>
              </div>
            ) : hunts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-hunter-muted text-lg">
                  No active hunts. The path awaits.
                </p>
                <button
                  onClick={() => setCurrentView('create')}
                  className="hunt-button mt-4"
                >
                  Begin Your First Hunt
                </button>
              </div>
            ) : (
              hunts.map((hunt) => (
                <HuntDisplay key={hunt.id} hunt={hunt} onOpenCanvas={() => openHuntCanvas(hunt)} />
              ))
            )}
          </div>
        )}
        
        {currentView === 'create' && (
          <HuntCreator onHuntCreated={addHunt} />
        )}
      </main>

      {currentView === 'canvas' && selectedHunt && (
        <HuntCanvas hunt={selectedHunt} onClose={closeHuntCanvas} />
      )}
    </div>
  )
}

export default App