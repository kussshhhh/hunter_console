# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Hunt Console is a React-based application for tracking and exploring "hunts" - obsessive pursuits that transform the hunter. The interface features an infinite canvas where users can create, connect, and semantically organize notes related to their hunts.

## Development Commands

### Frontend Development
```bash
cd frontend
bun install          # Install dependencies
bun run dev         # Start development server on port 3000
bun run build       # Build for production
bun run preview     # Preview production build
```

### Project Structure
- `frontend/` - React application with Vite build system
- `backend/` - Placeholder for future Flask backend
- `database/` - Placeholder for future SQLite database

## Architecture

### Core Components
- **App.jsx** - Main application with view routing and hunt state management
- **HuntCreator.jsx** - Progressive hunt creation interface starting with simple text input
- **HuntDisplay.jsx** - Hunt card display with click-to-explore functionality  
- **HuntCanvas.jsx** - Interactive canvas with drag-and-drop nodes, semantic positioning, and editing

### State Management
- Local React state only (no external state management)
- Hunt data stored in memory (no persistence yet)
- View state managed in App.jsx with callback pattern

### Canvas System
The infinite canvas implements:
- **Semantic Positioning** - New notes auto-cluster near similar content using word overlap algorithm
- **Dynamic Sizing** - Nodes resize based on text content
- **Interactive Editing** - Double-click to edit existing notes
- **Pan and Drag** - Full canvas interaction with mouse controls

### Design System
Custom "hunter" theme with dark aesthetic:
- Colors defined in `tailwind.config.js` under `hunter` namespace
- Typography mixing monospace (headers) and sans-serif (body)
- Component styles in `@layer components` section of `index.css`

## Key Technical Decisions

### Frontend-Only Architecture
Currently no backend integration - all data is ephemeral. Hunt objects use `Date.now()` for IDs and are stored in component state.

### Canvas Implementation  
Hand-rolled HTML5 Canvas system rather than using libraries like Konva or Fabric.js. Includes custom hit detection, semantic positioning algorithm, and manual text rendering.

### Progressive Enhancement
Hunt creation starts minimal (just name input) and progressively reveals detail fields, supporting quick creation or detailed planning.

## Development Notes

### Semantic Algorithm
The `calculateSimilarity()` function in HuntCanvas uses simple word overlap to position new notes near related content. Notes with >20% word similarity auto-cluster.

### Styling Patterns
- Use existing hunter-themed classes from tailwind.config.js
- Follow dark theme aesthetic with subtle animations
- Maintain consistent spacing and hover states

### Component Communication
- Parent-to-child: Props
- Child-to-parent: Callback functions
- No prop drilling - state lifted to App.jsx when needed

## Future Architecture Considerations

The codebase is structured for future backend integration:
- Hunt data model ready for API serialization
- Canvas nodes designed for persistence
- LLM mentor functionality placeholder in place
- File structure includes backend/ and database/ directories