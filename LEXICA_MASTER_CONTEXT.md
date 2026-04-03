# LEXICA: MASTER PROJECT CONTEXT & TECHNICAL SPECIFICATIONS

## 1. PROJECT OVERVIEW
- **Name:** LEXICA
- **Type:** Progressive Web App (PWA) / Single Page Application (SPA).
- **Core Mission:** A Tinder-swipe style vocabulary learning app for IELTS. It serves as a 100% free, zero-ad "Funnel App" to drive high-quality traffic to our main product, **ORATIO** (a real-time IELTS speaking platform).
- **Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Web Speech API, Supabase (for static data).
- **Design Philosophy:** Mobile-first, "Cyber-Arcade" Neumorphism, dark mode (`bg-slate-900`) with vibrant neon accents. High dopamine, fast-paced micro-learning.

## 2. CORE GAMEPLAY LOOP & MECHANICS

### A. The Energy System (Scarcity)
- Users have a maximum of 30 Energy points per day.
- 1 swipe/interaction = -1 Energy.
- Recovers fully at midnight. This prevents "mindless swiping" and creates session scarcity.

### B. Card Evolution & ELO Routing
- **Evolution:** Cards have 3 mastery states: Seed (1st correct) -> Sprout (2nd correct) -> Gold/Mastered (3rd correct via Vocal Swipe).
- **Auto-Balancing ELO:** Each word has an ELO rating (e.g., Dog=500, Meticulous=1500). User starts at 1000. 
  - If user swipes LEFT (Forget) 3 times -> Inject lower ELO cards (800) to rebuild confidence.
  - If user swipes RIGHT (Remember) easily -> Inject higher ELO cards (1500) to maintain "Flow".

### C. POV Micro-Scenarios (Contextual Learning)
- Cards DO NOT show dictionary definitions. They show 1st-person roleplay scenarios with a blank.
- *Example Schema:*
  ```json
  {
    "id": "card_123",
    "word": "Meticulous",
    "elo": 1200,
    "scenario": "The bomb is ticking (0:10). You must cut the wires in an extremely [ ___ ] manner to survive.",
    "translation_hint": "Tỉ mỉ, cẩn thận"
  }
3. THE KILLER FEATURE: 3x VOCAL SWIPE
For "Boss Cards" (high ELO or transitioning to Gold state), manual touch swiping is DISABLED.

Requirement: User must use the microphone to read the target word aloud correctly 3 TIMES IN A ROW.

State Machine for Vocal Swipe:

INIT: Mic icon pulses.

HIT_1: Speech recognized. Subtly glows green, plays "tick", counter shows "2 left".

HIT_2: Glow intensifies, subtle anticipation shake, counter shows "1 left".

HIT_3: Confetti explosion, "swoosh" sound, card auto-swipes Right.

FAIL: If any attempt is incorrect, combo breaks, card flashes red, resets to 3 required.

API: Use window.SpeechRecognition or window.webkitSpeechRecognition.

4. ZERO-COST AI STORY MODE & THE FUNNEL
Concept: We DO NOT call OpenAI/Gemini API at runtime. We use pre-generated static stories stored in the database.

Trigger: When a user clears 10 words (completes a deck).

Content: The app fetches an absurd, dark-comedy short story containing exactly those 10 words.

The ORATIO Funnel (CRITICAL CTA): At the end of the story, display a massive, unmissable button:

"Vocabulary is dead until spoken. Take this absurd story and debate it with a real human on ORATIO right now." > (Link routes to https://oratio.example.com)

5. TECHNICAL PITFALLS & DIRECTIVES FOR AI ASSISTANT
Framer Motion Drag Physics: You MUST implement proper useAnimation and dragConstraints. When a card is swiped past the threshold, animate it fully off-screen and remove it from the DOM array cleanly. Do not leave ghost cards.

Web Speech API Quirk: Ensure fallback mechanisms for iOS/Safari, as webkitSpeechRecognition requires user interaction to start. Handle microphone permission denials gracefully.

PWA Setup: Ensure manifest.json is correctly placed in the public folder and metadata exports in layout.tsx include apple-mobile-web-app-capable.

Touch CSS: Apply touch-action: pan-y and user-select: none on the main swipe container to prevent browser default gestures from ruining the swipe experience.

6. DEVELOPMENT PHASES (Follow Strictly)
[ ] Phase 1: App Router setup, PWA config, Global layout (Energy Bar, Cyber-Arcade Theme).

[ ] Phase 2: Framer Motion Swipe Deck implementation (Card UI, drag physics, left/right threshold logic).

[ ] Phase 3: The useVocalSwipe Hook (Web Speech API integration, 3x Combo state machine).

[ ] Phase 4: Mock Database setup (Zustand/Context for local state, ELO routing logic).

[ ] Phase 5: Story Mode UI and the ORATIO Funnel CTA.