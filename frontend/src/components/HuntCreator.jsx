import React, { useState } from 'react'

function HuntCreator({ onHuntCreated }) {
  const [huntName, setHuntName] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState({
    terrain: '',
    victoryConditions: '',
    failureModes: '',
    duration: ''
  })

  const createHunt = () => {
    if (!huntName.trim()) return
    
    onHuntCreated({
      name: huntName,
      ...details,
      startDate: new Date().toISOString(),
      createdAt: Date.now(),
      status: 'active'
    })
    
    setHuntName('')
    setDetails({
      terrain: '',
      victoryConditions: '',
      failureModes: '',
      duration: ''
    })
    setShowDetails(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (huntName.trim() && !showDetails) {
        setShowDetails(true)
      } else if (showDetails) {
        createHunt()
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-mono font-bold text-hunter-text mb-3">
          What calls to you?
        </h2>
        <p className="text-hunter-muted">
          Every great hunt begins with a single obsession
        </p>
      </div>

      <div className="space-y-8">
        <div className="relative">
          <input
            type="text"
            value={huntName}
            onChange={(e) => setHuntName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type what you're hunting..."
            className="w-full bg-transparent border-0 border-b-2 border-hunter-border focus:border-hunter-accent 
                     text-2xl text-hunter-text placeholder-hunter-muted py-4 px-0 
                     focus:outline-none focus:ring-0 transition-colors duration-300"
            autoFocus
          />
          <div className="absolute bottom-0 left-0 h-0.5 bg-hunter-accent transform scale-x-0 transition-transform duration-300 origin-left"
               style={{ transform: huntName ? 'scaleX(1)' : 'scaleX(0)' }}></div>
        </div>

        {huntName && !showDetails && (
          <div className="text-center animate-fade-in">
            <p className="text-hunter-muted mb-4">Press Enter to continue, or</p>
            <button
              onClick={() => setShowDetails(true)}
              className="text-hunter-accent hover:text-hunter-accent/80 transition-colors"
            >
              add more context
            </button>
          </div>
        )}

        {showDetails && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-sm text-hunter-text/60 uppercase tracking-wider">Terrain</h3>
                <textarea
                  value={details.terrain}
                  onChange={(e) => setDetails(prev => ({ ...prev, terrain: e.target.value }))}
                  placeholder="Constraints, resources, obstacles..."
                  className="w-full bg-transparent border border-hunter-border/30 rounded-lg p-4 
                           text-hunter-text placeholder-hunter-muted focus:border-hunter-accent/50 
                           focus:outline-none resize-none h-32"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm text-hunter-text/60 uppercase tracking-wider">Victory</h3>
                <textarea
                  value={details.victoryConditions}
                  onChange={(e) => setDetails(prev => ({ ...prev, victoryConditions: e.target.value }))}
                  placeholder="What does mastery look like?"
                  className="w-full bg-transparent border border-hunter-border/30 rounded-lg p-4 
                           text-hunter-text placeholder-hunter-muted focus:border-hunter-accent/50 
                           focus:outline-none resize-none h-32"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm text-hunter-text/60 uppercase tracking-wider">Failure</h3>
                <textarea
                  value={details.failureModes}
                  onChange={(e) => setDetails(prev => ({ ...prev, failureModes: e.target.value }))}
                  placeholder="What would make this meaningless?"
                  className="w-full bg-transparent border border-hunter-border/30 rounded-lg p-4 
                           text-hunter-text placeholder-hunter-muted focus:border-hunter-accent/50 
                           focus:outline-none resize-none h-32"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm text-hunter-text/60 uppercase tracking-wider">Time</h3>
                <input
                  type="text"
                  value={details.duration}
                  onChange={(e) => setDetails(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Sprint or expedition?"
                  className="w-full bg-transparent border border-hunter-border/30 rounded-lg p-4 
                           text-hunter-text placeholder-hunter-muted focus:border-hunter-accent/50 
                           focus:outline-none"
                />
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={createHunt}
                className="bg-hunter-accent/10 border border-hunter-accent text-hunter-accent 
                         px-8 py-3 rounded-lg hover:bg-hunter-accent/20 transition-colors duration-200
                         font-medium tracking-wide"
              >
                Begin the Hunt
              </button>
            </div>
          </div>
        )}

        {huntName && !showDetails && (
          <div className="text-center animate-fade-in">
            <button
              onClick={createHunt}
              className="bg-hunter-accent/10 border border-hunter-accent text-hunter-accent 
                       px-8 py-3 rounded-lg hover:bg-hunter-accent/20 transition-colors duration-200
                       font-medium tracking-wide"
            >
              Begin the Hunt
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HuntCreator