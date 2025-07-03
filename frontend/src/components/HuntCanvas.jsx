import React, { useState, useRef, useEffect } from 'react'
import { nodeAPI } from '../api/hunts'

function HuntCanvas({ hunt, onClose }) {
  const canvasRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragNode, setDragNode] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [showNodeCreator, setShowNodeCreator] = useState(false)
  const [newNodePos, setNewNodePos] = useState({ x: 0, y: 0 })
  const [newNodeText, setNewNodeText] = useState('')
  const [editingNode, setEditingNode] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (hunt?.id) {
      loadNodes()
    }
  }, [hunt?.id])

  const loadNodes = async () => {
    try {
      const data = await nodeAPI.getForHunt(hunt.id)
      setNodes(data)
    } catch (err) {
      console.error('Error loading nodes:', err)
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)

    // Draw connections
    ctx.strokeStyle = '#4a9eff40'
    ctx.lineWidth = 2
    nodes.forEach(node => {
      if (node.connections) {
        node.connections.forEach(connectionId => {
          const targetNode = nodes.find(n => n.id === connectionId)
          if (targetNode) {
            ctx.beginPath()
            ctx.moveTo(node.x + 100, node.y + 25)
            ctx.lineTo(targetNode.x + 100, targetNode.y + 25)
            ctx.stroke()
          }
        })
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node)
    })

    ctx.restore()
  }

  const calculateNodeSize = (text) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = '14px Inter'
    
    const words = text.split(' ')
    const maxWidth = 250
    const padding = 20
    const lineHeight = 18
    
    let lines = []
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) lines.push(currentLine)
    
    const width = Math.max(200, Math.min(400, maxWidth + padding))
    const height = Math.max(50, lines.length * lineHeight + padding)
    
    return { width, height, lines }
  }

  const drawNode = (ctx, node) => {
    const { x, y, text, type = 'note' } = node
    const { width, height, lines } = calculateNodeSize(text)
    
    // Update node size if not set
    if (!node.width || !node.height) {
      node.width = width
      node.height = height
    }
    
    const nodeWidth = node.width || width
    const nodeHeight = node.height || height
    
    ctx.fillStyle = type === 'llm' ? '#4a9eff20' : '#1a1a1a'
    ctx.strokeStyle = type === 'llm' ? '#4a9eff' : '#2a2a2a'
    ctx.lineWidth = 1
    
    ctx.fillRect(x, y, nodeWidth, nodeHeight)
    ctx.strokeRect(x, y, nodeWidth, nodeHeight)
    
    ctx.fillStyle = '#e0e0e0'
    ctx.font = '14px Inter'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    const lineHeight = 18
    const padding = 10
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x + padding, y + padding + (index * lineHeight))
    })
  }

  useEffect(() => {
    draw()
  }, [nodes, panOffset])

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left - panOffset.x,
      y: e.clientY - rect.top - panOffset.y
    }
  }

  const getNodeAt = (x, y) => {
    return nodes.find(node => 
      x >= node.x && x <= node.x + (node.width || 200) &&
      y >= node.y && y <= node.y + (node.height || 50)
    )
  }

  const handleMouseDown = (e) => {
    const pos = getMousePos(e)
    const node = getNodeAt(pos.x, pos.y)
    
    if (node && e.detail === 1) { // Single click
      setIsDragging(true)
      setDragNode(node)
      setDragOffset({
        x: pos.x - node.x,
        y: pos.y - node.y
      })
    } else if (!node) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleNodeDoubleClick = (node) => {
    setEditingNode(node)
    setEditText(node.text)
  }

  const handleMouseMove = (e) => {
    if (isDragging && dragNode) {
      const pos = getMousePos(e)
      const newX = pos.x - dragOffset.x
      const newY = pos.y - dragOffset.y
      
      setNodes(prev => prev.map(node => 
        node.id === dragNode.id 
          ? { ...node, x: newX, y: newY }
          : node
      ))
    } else if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    if (isDragging && dragNode) {
      // Save the final position to database
      const updatedNode = nodes.find(n => n.id === dragNode.id)
      if (updatedNode) {
        updateNodePosition(updatedNode, updatedNode.x, updatedNode.y)
      }
    }
    
    setIsDragging(false)
    setDragNode(null)
    setIsPanning(false)
  }

  const handleDoubleClick = (e) => {
    const pos = getMousePos(e)
    const node = getNodeAt(pos.x, pos.y)
    
    if (node) {
      handleNodeDoubleClick(node)
    } else {
      setNewNodePos(pos)
      setShowNodeCreator(true)
      setNewNodeText('')
    }
  }

  // Simple semantic similarity function using word overlap
  const calculateSimilarity = (text1, text2) => {
    const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2)
    const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2)
    
    const commonWords = words1.filter(word => words2.includes(word))
    const totalWords = Math.max(words1.length, words2.length)
    
    return totalWords > 0 ? commonWords.length / totalWords : 0
  }

  // Find the best position for a new node based on semantic similarity
  const findSemanticPosition = (text) => {
    if (nodes.length === 0) {
      return { x: newNodePos.x, y: newNodePos.y }
    }

    let bestSimilarity = 0
    let bestNode = null
    
    nodes.forEach(node => {
      const similarity = calculateSimilarity(text, node.text)
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity
        bestNode = node
      }
    })

    if (bestSimilarity > 0.2 && bestNode) {
      // Place near the most similar node
      const angle = Math.random() * Math.PI * 2
      const distance = 150 + Math.random() * 100
      return {
        x: bestNode.x + Math.cos(angle) * distance,
        y: bestNode.y + Math.sin(angle) * distance
      }
    }

    return { x: newNodePos.x, y: newNodePos.y }
  }

  const createNode = async (type = 'note') => {
    if (!newNodeText.trim()) return
    
    try {
      const { width, height } = calculateNodeSize(newNodeText)
      const semanticPos = findSemanticPosition(newNodeText)
      
      const nodeData = {
        x: semanticPos.x,
        y: semanticPos.y,
        text: newNodeText,
        type,
        width,
        height,
        connections: []
      }
      
      const newNode = await nodeAPI.create(hunt.id, nodeData)
      setNodes(prev => [...prev, newNode])
      setShowNodeCreator(false)
      setNewNodeText('')
    } catch (err) {
      console.error('Error creating node:', err)
    }
  }

  const updateNode = async () => {
    if (!editText.trim() || !editingNode) return
    
    try {
      const { width, height } = calculateNodeSize(editText)
      const updatedNode = await nodeAPI.update(editingNode.id, {
        ...editingNode,
        text: editText,
        width,
        height
      })
      
      setNodes(prev => prev.map(node => 
        node.id === editingNode.id ? updatedNode : node
      ))
      setEditingNode(null)
      setEditText('')
    } catch (err) {
      console.error('Error updating node:', err)
    }
  }

  const updateNodePosition = async (node, x, y) => {
    try {
      const updatedNode = await nodeAPI.update(node.id, {
        ...node,
        x,
        y
      })
      setNodes(prev => prev.map(n => 
        n.id === node.id ? updatedNode : n
      ))
    } catch (err) {
      console.error('Error updating node position:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingNode) {
        updateNode()
      } else {
        createNode('note')
      }
    }
  }

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      updateNode()
    }
  }

  return (
    <div className="fixed inset-0 bg-hunter-bg z-50">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        <button
          onClick={onClose}
          className="bg-hunter-surface/80 text-hunter-text px-4 py-2 rounded-lg 
                   hover:bg-hunter-surface transition-colors backdrop-blur-sm"
        >
          ← Back
        </button>
        <div className="bg-hunter-surface/80 px-4 py-2 rounded-lg backdrop-blur-sm">
          <h1 className="font-mono font-bold text-hunter-text">{hunt.name}</h1>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <div className="bg-hunter-surface/80 px-3 py-1 rounded text-sm text-hunter-muted backdrop-blur-sm">
          Double-click to add/edit • Drag to move
        </div>
        <div className="bg-hunter-surface/80 px-3 py-1 rounded text-sm text-hunter-muted backdrop-blur-sm">
          Right-click for LLM
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          const pos = getMousePos(e)
          setNewNodePos(pos)
          setShowNodeCreator(true)
          setNewNodeText('')
        }}
      />

      {showNodeCreator && (
        <div 
          className="absolute z-20 bg-hunter-surface border border-hunter-border rounded-lg p-4 min-w-64"
          style={{
            left: newNodePos.x + panOffset.x + 20,
            top: newNodePos.y + panOffset.y
          }}
        >
          <textarea
            value={newNodeText}
            onChange={(e) => setNewNodeText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-hunter-text placeholder-hunter-muted 
                     border-0 resize-none focus:outline-none"
            rows={3}
            autoFocus
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              <button
                onClick={() => createNode('note')}
                className="text-xs bg-hunter-accent/20 text-hunter-accent px-3 py-1 rounded 
                         hover:bg-hunter-accent/30 transition-colors"
              >
                Note
              </button>
              <button
                onClick={() => createNode('llm')}
                className="text-xs bg-hunter-success/20 text-hunter-success px-3 py-1 rounded 
                         hover:bg-hunter-success/30 transition-colors"
              >
                Ask LLM
              </button>
            </div>
            <button
              onClick={() => setShowNodeCreator(false)}
              className="text-xs text-hunter-muted hover:text-hunter-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingNode && (
        <div 
          className="absolute z-20 bg-hunter-surface border border-hunter-border rounded-lg p-4 min-w-64"
          style={{
            left: editingNode.x + panOffset.x + 20,
            top: editingNode.y + panOffset.y
          }}
        >
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={handleEditKeyPress}
            placeholder="Edit your note..."
            className="w-full bg-transparent text-hunter-text placeholder-hunter-muted 
                     border-0 resize-none focus:outline-none"
            rows={4}
            autoFocus
          />
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={updateNode}
              className="text-xs bg-hunter-accent/20 text-hunter-accent px-3 py-1 rounded 
                       hover:bg-hunter-accent/30 transition-colors"
            >
              Update
            </button>
            <button
              onClick={() => {
                setEditingNode(null)
                setEditText('')
              }}
              className="text-xs text-hunter-muted hover:text-hunter-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HuntCanvas