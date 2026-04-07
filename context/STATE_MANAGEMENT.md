# State Management - Zustand Store

## Store Location
`app/store/lexicaStore.ts`

## State Shape

```typescript
interface LexicaStore {
  // User Data
  userStats: UserStats
  cardProgress: Record<string, UserCardProgress>
  learnedWords: Set<string>
  
  // Energy System
  energy: number
  maxEnergy: number
  lastEnergyReset: string
  
  // UI State
  currentDeck: VocabCardData[]
  selectedLevel: DifficultyLevel | 'all' | null
  hasSeenWelcome: boolean
  
  // Test Flow
  isInTest: boolean
  testScore: number | null
  recommendedLevel: DifficultyLevel | null
  
  // Actions
  swipeCard: (cardId, direction) => void
  consumeEnergy: () => boolean
  checkAndResetEnergy: () => void
  loadNewDeck: () => void
  resetProgress: () => void
  setSelectedLevel: (level) => void
  startTest: () => void
  skipToManual: () => void
  completeTest: (score, recommendedLevel) => void
  acceptRecommendedLevel: () => void
  getLearnedWordsCount: () => number
  getMasteredWordsCount: () => number
}
```

## Key Data Structures

### UserStats
```typescript
{
  currentElo: number         // Default: 1000
  totalSwipes: number
  correctSwipes: number
  incorrectSwipes: number
  longestStreak: number
  currentStreak: number
}
```

### UserCardProgress
```typescript
{
  cardId: string
  state: 'seed' | 'sprout' | 'gold' | 'mastered'
  confidence: number         // 0-100
  lastReviewed: string       // ISO timestamp
  nextReview: string         // ISO timestamp
  reviewCount: number
  correctCount: number
  intervalDays: number       // SRS interval
}
```

## Important State Actions

### 1. swipeCard(cardId, direction)
**What it does:**
- Consumes 1 energy
- Updates ELO based on swipe direction
- Updates card progress (confidence, state, intervals)
- Removes card from currentDeck
- Adds to learnedWords set

**Flow:**
```
1. Find card in currentDeck
2. consumeEnergy() (fails if energy = 0)
3. Calculate ELO change (remember = +points, forget = -points)
4. Update userStats (ELO, streaks, swipe counts)
5. Update cardProgress (state progression, SRS intervals)
6. Remove from currentDeck
7. Add to learnedWords
8. Persist to localStorage
```

### 2. loadNewDeck()
**What it does:**
- Filters vocab database by selectedLevel
- Loads cards not yet learned OR due for review
- Sorts by: Boss cards first → Due cards → New cards
- Limits to 20 cards max

**Filter Logic:**
```typescript
1. Filter by level (beginner/intermediate/advanced/expert/'all')
2. Exclude cards already in deck
3. Include cards:
   - Not yet learned (!learnedWords.has(id))
   - OR due for review (nextReview <= now)
4. Sort:
   - isBossCard first
   - Then by dueDate (oldest first)
   - Then by ELO difficulty
5. Take first 20 cards
```

### 3. Energy System
**checkAndResetEnergy():**
- Checks if midnight passed since lastEnergyReset
- If yes: reset energy to maxEnergy (20)
- Update lastEnergyReset timestamp

**consumeEnergy():**
- Returns false if energy = 0
- Decrements energy by 1
- Returns true on success

## Persistence Strategy

**Zustand Persist Middleware:**
```typescript
partialize: (state) => ({
  userStats,
  cardProgress,
  learnedWords: Array.from(learnedWords), // Set → Array
  energy,
  lastEnergyReset,
  selectedLevel,
  hasSeenWelcome,
  testScore,
  recommendedLevel
})

merge: (persistedState, currentState) => ({
  ...currentState,
  ...persistedState,
  learnedWords: new Set(persistedState.learnedWords) // Array → Set
})
```

## Initialization

**initializeLexicaStore():**
- Called once in page.tsx useEffect
- Checks and resets energy if needed
- Loads initial deck if level selected

## State Access Patterns

**Reading state:**
```typescript
const energy = useLexicaStore(state => state.energy)
```

**Calling actions:**
```typescript
const swipeCard = useLexicaStore(state => state.swipeCard)
swipeCard(cardId, 'right')
```

## Common Gotchas

1. **Set serialization**: learnedWords is a Set in memory, Array in localStorage
2. **Deck regeneration**: currentDeck is NOT persisted, loads fresh on mount
3. **Energy reset**: Must call checkAndResetEnergy() to handle midnight rollover
4. **Type safety**: Use DifficultyLevel | 'all' | null for selectedLevel
