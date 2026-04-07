# Features & User Flows

## Feature Overview

1. **Level Test & Selection** - Determine user's starting level
2. **Swipe Learning** - Core flashcard review with gestures
3. **Boss Cards** - Vocal pronunciation challenges
4. **ELO Adaptive System** - Dynamic difficulty adjustment
5. **Spaced Repetition** - SRS-based review scheduling
6. **Energy System** - Daily limit (20 swipes/day)
7. **Progress Tracking** - Stats, streaks, mastery levels
8. **Learned Words Library** - Review past vocabulary

---

## User Flow 1: First-Time User

### Step 1: Welcome Screen
- Shown when `hasSeenWelcome = false` and `selectedLevel = null`
- Two options presented:
  - **Test nhanh** (Recommended): 5-question placement test
  - **Tự chọn level**: Manual level selection

### Step 2A: Placement Test Flow
```
LevelTestWelcome → LevelTest → LevelTestResult → Main App

1. User clicks "Test nhanh"
2. Takes 5 multiple-choice questions
3. System calculates score and recommends level
4. User sees result screen with:
   - Score (X/5, percentage)
   - Recommended level card
   - Option to accept or choose manually
5. Accept → Sets level → Loads deck → Main app
6. Choose manually → Goes to LevelSelector
```

### Step 2B: Manual Selection Flow
```
LevelTestWelcome → LevelSelector → Main App

1. User clicks "Tự chọn level"
2. Sees 5 level cards (Beginner → Expert + All)
3. Clicks a level → Sets level → Loads deck → Main app
```

---

## User Flow 2: Daily Learning Session

### Entry State Check
```
1. Check energy (if 0 → show depleted message)
2. Check midnight passed (auto-reset energy to 20)
3. Load deck based on selectedLevel
4. Show main learning UI
```

### Main Learning Loop
```
1. See top card in deck
2. Read word, IPA, scenario
3. Try to recall Vietnamese meaning
4. Flip card to check (or don't flip)
5. Swipe:
   - Left (Forget): If couldn't recall
   - Right (Remember): If recalled correctly
6. Energy -1
7. Card removed from deck
8. Next card appears
9. Repeat until deck empty or energy depleted
```

### Boss Card Encounter
```
1. Card appears with red glow + Swords icon
2. "Boss Card: Phát âm đúng 3 lần!"
3. Swipe disabled → Must use vocal mode
4. Click microphone
5. Speak word correctly 3 times
6. On success → Card removed, energy -1
7. On failure → Try again (no penalty)
```

---

## User Flow 3: Changing Level

### From Main App
```
1. Click "Đổi level" button in stats sidebar
2. selectedLevel set to null
3. App shows LevelSelector
4. User picks new level
5. Deck reloads with new difficulty
6. Continue learning
```

**Note:** 
- Progress is NOT reset (userStats, cardProgress preserved)
- Only currentDeck changes to match new level

---

## User Flow 4: Viewing Learned Words

### Navigation
```
Main App → Click "Xem từ đã học (X)" → /learned page
```

### Learned Page Features
- List of all words in learnedWords set
- Shows: word, IPA, Vietnamese, state icon
- Color-coded by state:
  - Green (Sprout): seed/sprout
  - Cyan (Leaf): sprout
  - Yellow (Sparkles): gold
  - Yellow (Trophy): mastered
- Click speaker icon → Hear Vietnamese pronunciation
- Empty state if no words learned yet

---

## Feature Deep-Dive: ELO Adaptive System

### How It Works
```
1. User starts at ELO 1000
2. Each swipe updates ELO:
   - Remember → gain points (amount depends on card state)
   - Forget → lose points (larger penalty)
3. System analyzes accuracy over last 10+ swipes
4. If accuracy < 40% → "Too hard, reducing difficulty"
5. If accuracy > 80% → "Too easy, increasing difficulty"
6. If accuracy 60-70% → "Flow state" (optimal)
```

### Dynamic Deck Loading
- Cards are filtered by ELO range
- As user ELO increases → harder cards appear
- As user ELO decreases → easier cards appear
- Ensures continuous challenge without frustration

---

## Feature Deep-Dive: Spaced Repetition

### SRS Algorithm
```
Initial review: 1 hour later
Correct → Double interval
  1h → 4h → 8h → 1d → 3d → 7d → 14d → 30d
Incorrect → Reset to 1h (or maintain if confidence still good)
```

### State Progression
```
seed (new) 
  → sprout (learning, 1-5 reviews)
  → gold (almost mastered, 6-10 reviews)
  → mastered (11+ reviews, high confidence)
```

### Review Scheduling
- `nextReview` timestamp calculated after each swipe
- Cards with `nextReview <= now` appear in deck
- Due cards prioritized over new cards
- Boss cards appear when confidence drops below 30%

---

## Feature Deep-Dive: Energy System

### Purpose
- Prevent burnout / overlearning
- Encourage daily habit formation
- Limit session to ~10-15 minutes (20 cards)

### Mechanics
```
- Start with 20 energy
- Each swipe costs 1 energy
- Resets to 20 at midnight (local timezone)
- Low energy warning at <5
- Depleted message at 0
```

### Reset Logic
```typescript
checkAndResetEnergy():
  1. Parse lastEnergyReset timestamp
  2. Check if current date > reset date
  3. If yes:
     - Set energy = 20
     - Set lastEnergyReset = today's midnight
  4. Persist to localStorage
```

---

## Feature Deep-Dive: Boss Cards

### Trigger Conditions
```
Boss card appears when:
- Card confidence < 30%
- User has forgotten it multiple times
- Needs reinforcement through pronunciation
```

### Challenge Flow
```
1. Card appears with isBossCard = true
2. VocalSwipeUI overlay shown
3. User must pronounce word correctly 3 times
4. Uses Web Speech API (SpeechRecognition)
5. Transcript compared to target word (normalized)
6. Hit counter: 3 → 2 → 1 → 0
7. On 0 hits remaining → SUCCESS → card removed
8. If wrong word → FAIL → reset attempt (no penalty to hits)
```

### Browser Support
- Chrome/Edge: Full support
- Safari: Limited (iOS mic permissions tricky)
- Firefox: Experimental
- Fallback: Show error message with Ban icon

---

## Edge Cases & Error Handling

### No Energy
- Swipe disabled
- Message: "💀 Energy Depleted! Come back tomorrow"
- User can still view learned words

### No Cards in Deck
- "🎉 Deck Complete!" message
- Teaser: "Story Mode coming in Phase 5..."
- User can change level or view learned words

### Vocal Mode Permissions
- Browser doesn't support Speech API → Error screen
- Mic permission denied → MicOff icon + instructions
- Network issues → Continue listening, may retry

### Data Corruption
- Invalid localStorage data → Ignored, use defaults
- Missing fields → Fill with default values
- Set conversion fails → Empty Set

---

## Planned Features (Not Yet Implemented)

### Phase 5: Story Mode
- Unlock after learning 10+ words
- Contextual scenarios using learned vocabulary
- Multiple-choice questions in story format
- Further reinforcement through practical usage

### Future Enhancements
- Streaks calendar
- Daily goals
- Leaderboards (if adding backend)
- Custom decks
- Import/export progress
- Audio for English pronunciation
