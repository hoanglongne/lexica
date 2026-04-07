# Components Reference

## Component Hierarchy

```
app/
├── page.tsx (Main App)
│   ├── <LevelTestWelcome />      (first-time only)
│   ├── <LevelTest />              (during test)
│   ├── <LevelTestResult />        (test results)
│   ├── <LevelSelector />          (manual level selection)
│   └── <Main Learning UI>         (default state)
│       ├── <EnergyBar />
│       ├── <SwipeDeck />
│       │   └── <VocabCard />
│       └── Stats Sidebar
│
└── learned/page.tsx
    └── <LearnedWordsList />
```

## Core Components

### 1. VocabCard
**Path:** `app/components/VocabCard.tsx`

**Props:**
```typescript
{
  card: VocabCardData
  onSwipe: (direction: 'left' | 'right') => void
  style?: React.CSSProperties  // For framer-motion position
  isBossCard?: boolean
}
```

**Features:**
- State badge (seed/sprout/gold/mastered) with icons
- Flip animation to reveal Vietnamese meaning
- Boss card indicator (red glow, Swords icon)
- Vocal swipe mode (3 correct pronunciations)
- Speaker button (Web Speech API)
- Swipe indicators (left = forget, right = remember)

**States:**
- seed 🌱 (green) - New word
- sprout 🌿 (cyan) - Learning
- gold ✨ (yellow) - Almost mastered
- mastered 🏆 (yellow) - Fully mastered

**Boss Card:**
- Triggers when confidence < 30%
- Must pronounce word correctly 3 times
- No swipe allowed until completed

---

### 2. SwipeDeck
**Path:** `app/components/SwipeDeck.tsx`

**Features:**
- Manages deck of cards (top 3 rendered)
- Framer Motion drag gestures
- Swipe feedback animation (✓ REMEMBER / ✗ FORGET)
- Empty state (PartyPopper icon + "Deck Complete!")
- Energy consumption per swipe

**Swipe Logic:**
```typescript
- Drag threshold: 100px
- Right swipe (x > 100) = Remember (correct)
- Left swipe (x < -100) = Forget (incorrect)
- OnSwipe: calls store.swipeCard(id, direction)
```

---

### 3. EnergyBar
**Path:** `app/components/EnergyBar.tsx`

**Props:**
```typescript
{
  currentEnergy: number
  maxEnergy: number
}
```

**Features:**
- Lightning bolt icon (Zap)
- Progress bar with gradient
- Low energy warning (< 5 energy) - AlertTriangle icon
- Depleted message (0 energy) - Skull icon
- Animated number count

---

### 4. LevelSelector
**Path:** `app/components/LevelSelector.tsx`

**Features:**
- 5 level cards (Beginner, Intermediate, Advanced, Expert, All)
- Each shows: icon, label, description, ELO range, card count
- Selected state with CheckCircle icon
- Calls onSelect(level) when clicked

**Level Options:**
- Beginner 🌱: ELO 800-950, ~10 words
- Intermediate 🌿: ELO 900-1200, ~25 words
- Advanced ✨: ELO 1100-1400, ~30 words
- Expert 🏆: ELO 1300-1500, ~30 words
- All 🎯: ELO 800-1500, 60 words

---

### 5. LevelTestWelcome
**Path:** `app/components/LevelTestWelcome.tsx`

**Props:**
```typescript
{
  onStartTest: () => void
  onSkipToManual: () => void
}
```

**Features:**
- First-time welcome screen
- Two options:
  1. Test nhanh (FlaskConical icon) - Recommended
  2. Tự chọn level (Gamepad2 icon)
- Benefits listed with CheckCircle icons

---

### 6. LevelTest
**Path:** `app/components/LevelTest.tsx`

**Props:**
```typescript
{
  onComplete: (score: number, recommendedLevel: DifficultyLevel) => void
  onBack: () => void
}
```

**Features:**
- 5 multiple-choice questions
- Progress bar (cyan solid color)
- Radio button selection
- Next button (disabled until selection)
- Scenario-based questions (relatable Vietnamese context)

**Scoring:**
- 0-2 correct → Beginner
- 3 correct → Intermediate
- 4 correct → Advanced
- 5 correct → Expert

---

### 7. LevelTestResult
**Path:** `app/components/LevelTestResult.tsx`

**Props:**
```typescript
{
  score: number
  totalQuestions: number
  recommendedLevel: DifficultyLevel
  onAccept: () => void
  onChooseManually: () => void
}
```

**Features:**
- Celebration animation (level icon bouncing)
- Score display (X/5, percentage)
- Progress bar (color-coded by score)
- Recommended level card (icon + description + stats)
- Two action buttons (Accept / Choose manually)

---

### 8. LearnedWordsList
**Path:** `app/components/LearnedWordsList.tsx`

**Features:**
- List of all learned words
- State icon (Sprout/Leaf/Sparkles/Trophy) with color coding
- Speaker button (Volume2 icon) to pronounce Vietnamese
- Shows: word, IPA, Vietnamese, state
- Empty state with HandHeart icon

---

### 9. VocalSwipeUI
**Path:** `app/components/VocalSwipeUI.tsx`

**Props:**
```typescript
{
  state: 'IDLE' | 'LISTENING' | 'SUCCESS' | 'FAIL'
  hitsRemaining: number
  transcript: string
  isSupported: boolean
  permissionDenied: boolean
  onMicClick: () => void
}
```

**Features:**
- Overlay on VocabCard for boss cards
- Microphone icon (Mic) with color states
- Hit counter badge (shows remaining attempts)
- Success animation (PartyPopper)
- Error states (Ban icon, MicOff icon)

**States:**
- IDLE: gray mic
- LISTENING: cyan mic + pulsing
- SUCCESS: green + party popper
- FAIL: red

---

## Icon Usage (Lucide React)

**State Icons:**
- Sprout: New/Seed state
- Leaf: Learning/Sprout state
- Sparkles: Advanced/Gold state
- Trophy: Mastered state

**Action Icons:**
- Check: Remember/Correct
- X: Forget/Incorrect
- Volume2: Speaker
- Mic: Microphone
- Eye: Reveal answer
- Swords: Boss card

**UI Icons:**
- Zap: Energy
- AlertTriangle: Low energy warning
- Skull: Energy depleted
- TrendingUp: ELO rating
- Target: Accuracy
- BookOpen: Learned count
- Award: Mastered count
- Clock: Due today
- Settings: Change level
- RotateCcw: Reset progress
- ArrowRight: Navigation
- Lightbulb: Hints
- CheckCircle: Selected/Completed

**Feature Icons:**
- FlaskConical: Test
- Gamepad2: Manual selection
- PartyPopper: Success/Celebration
- Ban: Not supported
- MicOff: Permission denied
- HandHeart: Empty state

---

## Styling Conventions

**Colors:**
- cyan-400/500: Primary actions, links, highlights
- green-400/500: Correct, seed state
- yellow-400/500: Mastered, gold state
- purple-400/500: Advanced
- red-400/500: Incorrect, warnings
- slate-xxx: Backgrounds, borders, text

**No Gradients:**
- All solid colors (removed gradients for professional look)

**Spacing:**
- Mobile: p-4, gap-4
- Desktop: p-6/p-8, gap-6/gap-8
- Consistent use of space-y-X for vertical spacing

**Responsive:**
- shrink-0 instead of flex-shrink-0
- min-h-125 (500px), lg:min-h-150 (600px)
- Hidden on lg: lg:hidden
- Shown on lg: hidden lg:block
