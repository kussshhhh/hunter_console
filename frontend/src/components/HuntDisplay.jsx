import React from 'react'

function HuntDisplay({ hunt, onOpenCanvas }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysActive = (startDate) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="hunt-card animate-fade-in cursor-pointer hover:border-hunter-accent/30 transition-all duration-200" 
         onClick={onOpenCanvas}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-mono font-bold text-hunter-text mb-1">
            {hunt.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-hunter-muted">
            <span>Started {formatDate(hunt.startDate)}</span>
            <span>•</span>
            <span>{getDaysActive(hunt.startDate)} days active</span>
            {hunt.duration && (
              <>
                <span>•</span>
                <span>{hunt.duration}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-hunter-success rounded-full animate-pulse"></div>
          <span className="text-sm text-hunter-success font-medium">
            Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hunt.terrain && (
          <div>
            <h4 className="text-sm font-medium text-hunter-text mb-2">
              Terrain
            </h4>
            <p className="text-sm text-hunter-muted leading-relaxed">
              {hunt.terrain}
            </p>
          </div>
        )}

        {hunt.victoryConditions && (
          <div>
            <h4 className="text-sm font-medium text-hunter-text mb-2">
              Victory Conditions
            </h4>
            <p className="text-sm text-hunter-muted leading-relaxed">
              {hunt.victoryConditions}
            </p>
          </div>
        )}

        {hunt.failureModes && (
          <div>
            <h4 className="text-sm font-medium text-hunter-text mb-2">
              Failure Modes
            </h4>
            <p className="text-sm text-hunter-muted leading-relaxed">
              {hunt.failureModes}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-hunter-border">
        <div className="text-sm text-hunter-muted">
          Click to explore →
        </div>
      </div>
    </div>
  )
}

export default HuntDisplay