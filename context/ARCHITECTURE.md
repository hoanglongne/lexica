# LEXICA - Architecture Overview

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persist middleware
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Speech**: Web Speech API (SpeechRecognition, SpeechSynthesis)

## Project Structure

```
lexica/
├── app/
│   ├── components/          # React components
│   ├── data/               # Static data (vocab database)
│   ├── hooks/              # Custom React hooks
│   ├── learned/            # Learned words page
│   ├── lib/                # Utility functions (ELO algorithm)
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main app page
├── public/                 # Static assets (PWA, icons)
└── context/                # Documentation (this folder)
```

## Key Architecture Decisions

### 1. **State Management Strategy**
- Global state via Zustand (lightweight, no boilerplate)
- Persist to localStorage (userStats, cardProgress, energy, level)
- Set → Array conversion for JSON serialization

### 2. **Routing**
- Single-page app flow (no page navigation except /learned)
- Conditional rendering based on state (welcome → test → selector → main)

### 3. **Data Flow**
- Vocab cards loaded from static database
- ELO algorithm adjusts difficulty dynamically
- Spaced repetition intervals stored per card

### 4. **Performance**
- Only render top 3 cards in deck (rest hidden)
- Debounced energy reset check
- Memoized deck filtering

### 5. **Responsive Design**
- Mobile-first approach
- Breakpoints: mobile < lg (1024px) < xl (1280px)
- Desktop: 2-column layout (swipe deck + stats sidebar)
- Mobile: Horizontal scrollable icon stats

## Core Algorithms

1. **ELO Rating System** (`lib/eloAlgorithm.ts`)
   - K-factor based on confidence level
   - Asymmetric penalties (forgetting hurts more)
   - Adaptive difficulty routing

2. **Spaced Repetition** (SRS)
   - Intervals: 1h → 4h → 8h → 1d → 3d → 7d → 14d → 30d
   - State progression: seed → sprout → gold → mastered
   - Due date tracking per card

3. **Energy System**
   - Max 20 energy per day
   - Resets at midnight (local timezone)
   - 1 energy per swipe

## Data Persistence

**Persisted** (localStorage):
- userStats (ELO, totalSwipes, correctSwipes, etc.)
- cardProgress (per-card SRS data)
- learnedWords (Set → Array)
- energy, lastEnergyReset
- selectedLevel, hasSeenWelcome
- testScore, recommendedLevel

**Transient** (not persisted):
- currentDeck (regenerated on load)
- isInTest (UI state)

## No External APIs
- All data is local
- No backend/database
- Works 100% offline
