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
  - [x] Voice UI inline on card (mic + feedback)
  - [x] Progress indicators (3 dots)

## Phase 4: Mock Database Setup & ELO Routing ✅ COMPLETE
- [x] State Management
  - [x] Zustand with localStorage persistence
  - [x] Global state structure (lexicaStore.ts)
- [x] Card Data Schema
  - [x] Define card interface (id, word, elo, scenario, translation_hint)
  - [x] Create mock card database (60 cards, 4 difficulty levels)
  - [x] Seed initial data (vocabCards.ts)
- [x] ELO Routing Logic
  - [x] User starts at ELO 1000
  - [x] Auto-balance: struggle rate → reduce ELO range
  - [x] Auto-balance: low struggle → increase ELO range
  - [x] Maintain "Flow" state algorithm
- [x] Energy System Integration
  - [x] Track energy consumption per swipe
  - [x] Implement midnight reset logic
  - [x] Persistent storage (localStorage)
- [x] Spaced Repetition (SRS)
  - [x] Card review scheduling (1/3/7/14 day intervals)
  - [x] Due cards prioritized in deck generation

## Phase 5: Story Mode UI & ORATIO Funnel ✅ COMPLETE
- [x] Story Completion Trigger
  - [x] Detect when user learns 10/10 words per story pack
  - [x] Story pack catch-up: inject missing words at 7-9/10
- [x] Story Mode Interface
  - [x] Absurd dark-comedy stories (3 pre-generated)
  - [x] Highlight vocabulary words with click-to-define
  - [x] TTS pronunciation on click
  - [x] Story unlock modal with animation
- [x] The ORATIO Funnel CTA
  - [x] "Vocabulary is dead until spoken." CTA button
  - [ ] Replace placeholder URL (https://oratio.example.com)

## Bonus Features (Not in Original Roadmap) ✅ COMPLETE
- [x] Level Test (5 MCQ → auto-recommend difficulty)
- [x] Level Selector (beginner/intermediate/advanced/expert/all)
- [x] Learned Words page with SRS schedule display
- [x] Voice/Touch swipe mode toggle (persisted)
- [x] Desktop keyboard controls (Space/←/→)
- [x] Difficulty status notifications
- [x] Mobile stats bottom sheet
- [x] Story Packs browser on Learned page
- [x] Review card badge ("ÔN TẬP")

## Phase 6: Polish & Production Ready ✅ COMPLETE
- [x] Error Boundary (catches Speech API / component crashes)
- [x] Dynamic imports for heavy components (code splitting)
- [x] Dead code cleanup (VocalSwipeUI.tsx, STORY_TEMPLATES)
- [x] Bug fixes (state mutation, dead code, swipeMode persistence)
- [x] Fix voice auto-swipe bug (stale closure in `recognition.onend`)
- [x] Analytics module (`lib/analytics.ts`) — thin layer, ready to wire to any provider
- [x] `vercel.json` — security headers (CSP, X-Frame-Options, Permissions-Policy for mic)
- [ ] Cross-browser testing (Chrome, Safari, Firefox) — manual
- [ ] Mobile device testing (iOS, Android) — manual
- [ ] PWA installation testing — manual
- [ ] Deployment (Vercel, CI/CD, domain config)

## Phase 7: UX & Bug Fixes — PLANNED

### Priority P0 — Bugs (quick wins)
- [ ] **Fix: nói sai → button bị disable + error pop up rõ ràng**
  - Approach: `isCoolingDown` state đang block button đúng rồi, chỉ cần thêm toast/snackbar hiện lỗi khi FAIL state
- [ ] **Fix: Replace ORATIO placeholder URL** (real url: `https://oratio-new.vercel.app/`)

### Priority P1 — UX quan trọng
- [x] **Onboarding guide** — modal/walkthrough lần đầu dùng app
  - Approach: Thêm `hasSeenOnboarding` vào store; modal hiện sau welcome screen; 3-4 steps giải thích swipe / voice / energy / stories
- [x] **Cải thiện UX voice mode** — R&D cách bấm mic
  - Option A: Hold-to-talk (giữ nút → record, thả → stop) — mobile-friendly nhất
  - Option B: Auto-listen sau mỗi hit (timeout 2s rồi tự listen) — ít bấm nhất
  - Option C: Debounced auto-listen ngay khi vào voice mode — nhưng cần handle noise tốt
  - *Recommended: Option A (hold-to-talk)*
  => Chọn option A

### Priority P2 — Content
- [ ] **Làm giàu list từ vựng** — thêm 300-400 cards mới (target: 500+ total)
  - Approach: Thêm vào `vocabCards.ts`, phân bổ đều theo 4 levels
- [ ] **Cải thiện test đầu vào** cho ELO chính xác hơn
  - Hiện tại: 5 MCQ → 1 trong 4 levels
  - Cải thiện: 8-10 câu, mỗi câu có ELO riêng, average ELO của câu đúng → calibrate userELO chính xác

## Phase 8: Gamification & Engagement
- [ ] Streak logic (daily streak để tăng gắn bó)
- [ ] Lịch hiển thị mỗi ngày có bao nhiêu từ sẽ xuất hiện lại (SRS calendar)
- [ ] Hiện tổng số story và đã unlock bao nhiêu
- [ ] Test lại kiến thức ở các lần ôn tập (thay vì chỉ nhìn card)

## Phase 9: Stats & Analytics Dashboard
- [ ] Heatmap (activity calendar)
- [ ] Charts (progress over time)
- [ ] Thống kê dạng số (words learned, accuracy, streaks)
- [ ] Pie chart (card states breakdown)

## Phase 10: Design System & Animations
- [ ] Redesign app theo bộ design system nhất quán (sẽ cung cấp)
- [ ] Animation kĩ hơn cho SVG, effects, transitions

---

**Current Status:** Phase 7 - Pending
**Last Updated:** April 13, 2026
