# Data Models & Types

## Core Data Structures

### VocabCardData
**Path:** `app/components/VocabCard.tsx`

```typescript
interface VocabCardData {
  id: string                    // Unique identifier
  word: string                  // English word (uppercase)
  ipa: string                   // IPA pronunciation
  vietnamese: string            // Vietnamese translation
  scenario: string              // Relatable scenario (Vietnamese)
  difficulty: DifficultyLevel   // ELO-based difficulty
  isBossCard?: boolean          // Requires vocal challenge
}
```

**Example:**
```typescript
{
  id: 'abundant_001',
  word: 'ABUNDANT',
  ipa: 'əˈbʌndənt',
  vietnamese: 'Nhiều, dư thừa, phong phú',
  scenario: 'Ảnh couple mới của ex tôi abundant trên Instagram vãi.',
  difficulty: 'beginner',
  isBossCard: false
}
```

---

### DifficultyLevel
```typescript
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
```

**ELO Ranges:**
- beginner: 800-950
- intermediate: 900-1200
- advanced: 1100-1400
- expert: 1300-1500

---

### CardState
```typescript
type CardState = 'seed' | 'sprout' | 'gold' | 'mastered'
```

**Progression:**
```
seed (0-30% confidence)
  ↓ correct answer
sprout (30-60% confidence)
  ↓ correct answer
gold (60-90% confidence)
  ↓ correct answer
mastered (90-100% confidence)
```

---

### UserStats
**Path:** `app/store/lexicaStore.ts`

```typescript
interface UserStats {
  currentElo: number          // User's ELO rating (default: 1000)
  totalSwipes: number         // Total cards swiped
  correctSwipes: number       // Right swipes (remember)
  incorrectSwipes: number     // Left swipes (forget)
  longestStreak: number       // Highest streak achieved
  currentStreak: number       // Current consecutive correct
}
```

**ELO Calculation:**
- Base change: ±16 points
- K-factor multiplier: seed(2.0) / sprout(1.5) / gold(1.0) / mastered(0.5)
- Asymmetric: Forgetting penalty is 1.5x larger than remembering bonus

---

### UserCardProgress
**Path:** `app/store/lexicaStore.ts`

```typescript
interface UserCardProgress {
  cardId: string                // Reference to vocab card
  state: CardState              // Current learning state
  confidence: number            // 0-100 percentage
  lastReviewed: string          // ISO timestamp
  nextReview: string            // ISO timestamp (for SRS)
  reviewCount: number           // Total times reviewed
  correctCount: number          // Times answered correctly
  intervalDays: number          // Current SRS interval
}
```

**SRS Intervals:**
```typescript
const SRS_INTERVALS = [1, 4, 8, 24, 72, 168, 336, 720] // hours
// = 1h, 4h, 8h, 1d, 3d, 7d, 14d, 30d
```

---

### VocalSwipeState
**Path:** `app/hooks/useVocalSwipe.ts`

```typescript
type VocalSwipeState = 'IDLE' | 'LISTENING' | 'SUCCESS' | 'FAIL'
```

**State Machine:**
```
IDLE → (mic click) → LISTENING
LISTENING → (correct 3x) → SUCCESS
LISTENING → (wrong word) → FAIL → (timeout) → IDLE
SUCCESS → (auto after 2s) → card removed
```

---

## ELO Algorithm Types

### PerformanceZone
**Path:** `app/lib/eloAlgorithm.ts`

```typescript
type PerformanceZone = 
  | 'very-hard'      // <40% accuracy
  | 'challenging'    // 40-60%
  | 'too-easy'       // >80%
  | 'slightly-easy'  // 70-80%
  | 'flow-state'     // 60-70% (optimal)
```

---

### DifficultyAnalysis
```typescript
interface DifficultyAnalysis {
  zone: PerformanceZone
  accuracy: number
  recommendation: string        // Human-readable feedback
  suggestedAdjustment: number   // ELO adjustment suggestion
}
```

---

### ProgressStats
```typescript
interface ProgressStats {
  total: number       // Total learned words
  seed: number        // Count in seed state
  sprout: number      // Count in sprout state
  gold: number        // Count in gold state
  mastered: number    // Count in mastered state
  dueToday: number    // Cards due for review today
}
```

---

## Vocab Database

**Path:** `app/data/vocabCards.ts`

**Structure:**
```typescript
export const VOCAB_DATABASE: VocabCardData[] = [
  // ~60 vocabulary cards
  // Organized by difficulty level
  // Each with scenario-based context
]
```

**Content Strategy:**
- Relatable Vietnamese scenarios (Gen Z friendly)
- Real-world usage examples
- Mix of everyday and academic vocabulary
- IELTS-focused higher-level words

---

## Test Question Type

**Path:** `app/components/LevelTest.tsx`

```typescript
interface TestQuestion {
  id: string
  word: string
  ipa: string
  scenario: string              // Same as VocabCardData
  options: string[]             // 4 multiple choice answers
  correctAnswer: number         // Index of correct option (0-3)
  level: DifficultyLevel
}
```

**Test Structure:**
- 5 questions total
- 2 beginner + 2 intermediate + 1 advanced
- Words: ABUNDANT, FEASIBLE, UBIQUITOUS, CONTEMPLATE, RECALCITRANT

---

## localStorage Schema

**Key:** `lexica-storage`

**Stored Object:**
```json
{
  "state": {
    "userStats": { ... },
    "cardProgress": { 
      "card_id_1": { ... },
      "card_id_2": { ... }
    },
    "learnedWords": ["id1", "id2", ...],  // Array (not Set)
    "energy": 20,
    "lastEnergyReset": "2026-04-07T00:00:00Z",
    "selectedLevel": "intermediate",
    "hasSeenWelcome": true,
    "testScore": 4,
    "recommendedLevel": "advanced"
  },
  "version": 0
}
```

**Note:** 
- `learnedWords` is Set in memory, Array in storage
- `cardProgress` is key-value object (not array)
- All timestamps are ISO 8601 strings
