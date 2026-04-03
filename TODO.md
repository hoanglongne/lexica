# LEXICA DEVELOPMENT ROADMAP

## Phase 1: App Router Setup, PWA Config & Global Layout ✅ COMPLETE
- [x] PWA Configuration
  - [x] Create manifest.json with PWA metadata
  - [x] Update layout.tsx with apple-mobile-web-app-capable
  - [x] Add PWA icons to public folder
- [x] Global Layout & Theme
  - [x] Implement Cyber-Arcade Neumorphism dark theme (bg-slate-900)
  - [x] Add custom font (cyberpunk-style)
  - [x] Create Energy Bar component (30 max, persistent UI)
  - [x] Mobile-first responsive layout
- [x] CSS Touch Optimizations
  - [x] Add touch-action: pan-y
  - [x] Add user-select: none on swipe container

## Phase 2: Framer Motion Swipe Deck Implementation ✅ COMPLETE
- [x] Install Framer Motion dependency
- [x] Card Component (VocabCard.tsx)
  - [x] Design card UI with neumorphic styling
  - [x] Implement drag physics with Framer Motion
  - [x] Add dragConstraints configuration
- [x] Swipe Logic
  - [x] Left swipe threshold detection (Forget)
  - [x] Right swipe threshold detection (Remember)
  - [x] Card removal animation (off-screen)
  - [x] Clean DOM array management with AnimatePresence
- [x] Card States
  - [x] Seed state (1st correct) 🌱
  - [x] Sprout state (2nd correct) 🌿
  - [x] Gold/Mastered state (3rd correct via Vocal) ✨

## Phase 3: The useVocalSwipe Hook (Web Speech API) ✅ COMPLETE
- [x] Web Speech API Integration
  - [x] Create useVocalSwipe custom hook
  - [x] Implement webkitSpeechRecognition fallback
  - [x] Handle microphone permissions gracefully
  - [x] iOS/Safari compatibility check
- [x] 3x Vocal Combo State Machine
  - [x] INIT: Mic icon ready state
  - [x] LISTENING: Pulsing animation
  - [x] HIT_1: Green glow, counter "2 left"
  - [x] HIT_2: Intensified glow, "1 left"
  - [x] SUCCESS: Confetti 🎉, auto-swipe right
  - [x] FAIL: Red flash, error message, reset to 3
- [x] Boss Card Logic
  - [x] Disable manual touch swipe for Boss Cards
  - [x] VocalSwipeUI overlay component
  - [x] Progress indicators (3 dots)

## Phase 4: Mock Database Setup & ELO Routing
- [ ] State Management
  - [ ] Choose between Zustand or Context API
  - [ ] Implement global state structure
- [ ] Card Data Schema
  - [ ] Define card interface (id, word, elo, scenario, translation_hint)
  - [ ] Create mock card database (50-100 cards)
  - [ ] Seed initial data
- [ ] ELO Routing Logic
  - [ ] User starts at ELO 1000
  - [ ] Auto-balance: 3x LEFT → inject lower ELO (800)
  - [ ] Auto-balance: Easy RIGHT → inject higher ELO (1500)
  - [ ] Maintain "Flow" state algorithm
- [ ] Energy System Integration
  - [ ] Track energy consumption per swipe
  - [ ] Implement midnight reset logic
  - [ ] Persistent storage (localStorage)

## Phase 5: Story Mode UI & ORATIO Funnel
- [ ] Story Completion Trigger
  - [ ] Detect when user clears 10 words (completes deck)
  - [ ] Fetch pre-generated story from database
- [ ] Story Mode Interface
  - [ ] Design absurd dark-comedy story display
  - [ ] Highlight the 10 learned words in the story
  - [ ] Smooth transition animation
- [ ] The ORATIO Funnel CTA
  - [ ] Create massive, unmissable CTA button
  - [ ] Copy: "Vocabulary is dead until spoken. Take this absurd story and debate it with a real human on ORATIO right now."
  - [ ] Route to https://oratio.example.com
  - [ ] Track conversion events

## Phase 6: Polish & Production Ready
- [ ] Performance Optimization
  - [ ] Code splitting
  - [ ] Image optimization
  - [ ] Bundle size analysis
- [ ] Testing
  - [ ] Cross-browser testing (Chrome, Safari, Firefox)
  - [ ] Mobile device testing (iOS, Android)
  - [ ] PWA installation testing
- [ ] Analytics Integration
  - [ ] Track swipe patterns
  - [ ] Track vocal swipe success rate
  - [ ] Track ORATIO funnel clicks
- [ ] Deployment
  - [ ] Configure Vercel/hosting
  - [ ] Set up CI/CD pipeline
  - [ ] Domain configuration

---

**Current Status:** Phase 1 - In Progress
**Last Updated:** April 3, 2026
