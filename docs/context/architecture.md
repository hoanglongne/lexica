# Architecture Context

## Stack that actually exists

- Framework: Next.js `16.2.2` voi App Router
- UI: React `19.2.4`
- Language: TypeScript
- Styling: Tailwind CSS v4 + `globals.css`
- Motion / gestures: Framer Motion
- State: Zustand + `persist`
- PWA: `next-pwa` + `public/manifest.json`
- Speech:
  - `SpeechRecognition` / `webkitSpeechRecognition`
  - `speechSynthesis` cho nghe phat am

## Folder map

- `app/page.tsx`
  - Man hinh chinh va route root, dieu phoi toan bo flow.
- `app/layout.tsx`
  - Metadata, fonts, manifest, apple web app config.
- `app/store/lexicaStore.ts`
  - Global store: energy, deck, stats, story mode, onboarding, swipe mode.
- `app/lib/eloAlgorithm.ts`
  - ELO routing, SRS helpers, deck generation, progress stats.
- `app/data/vocabCards.ts`
  - 60 vocab cards static.
- `app/data/stories.ts`
  - 3 story packs static + helpers unlock/catch-up/parser.
- `app/components/*`
  - UI cho swipe deck, card, onboarding, learned page support.
- `app/learned/page.tsx`
  - Thu vien tu da hoc + story packs.

## App state model

### Persisted state

- `userStats`
- `cardProgress`
- `learnedWords`
- `energy`
- `lastEnergyReset`
- `selectedLevel`
- `hasSeenWelcome`
- `testScore`
- `recommendedLevel`
- `unlockedStories`
- `readStories`

### Transient state

- `currentDeck`
- `isInTest`
- `showStoryUnlock`
- `showStoryMode`
- `currentStoryId`

## Deck generation flow

1. Store khoi tao va check reset energy.
2. Neu `currentDeck` rong, goi `loadNewDeck()`.
3. `loadNewDeck()`:
   - Lay `learnedWords`
   - Tim `forcedCardIds` tu story pack dang 7-9/10
   - Goi `generateInitialDeck()`
4. `generateInitialDeck()`:
   - inject forced cards truoc
   - them due cards tu `cardProgress`
   - fill phan con lai bang ELO-based selection
5. Deck size hien tai la 10 cards.

## Swipe pipeline

1. `SwipeDeck` xu ly input touch / keyboard / voice-related guard.
2. `consumeEnergy()` tru 1 energy truoc.
3. `swipeCard(cardId, direction)`:
   - update `userStats`
   - update `cardProgress`
   - add vao `learnedWords`
   - remove card khoi `currentDeck`
   - check unlock story
   - neu deck rong thi load deck moi

## Voice pipeline

- Hook trung tam: `app/hooks/useVocalSwipe.ts`
- State machine hien tai:
  - `INIT`
  - `LISTENING`
  - `HIT_1`
  - `HIT_2`
  - `SUCCESS`
  - `FAIL`
- Thanh cong sau 3 lan dung lien tiep, sau do auto swipe right.
- Permission denial va unsupported browser da co state rieng.

## Story pipeline

- Story data nam o `STORIES`.
- Unlock rule theo pack, khong phai chi dua vao tong so tu.
- Story text parse bang braces `{word}` de highlight interactive vocab.
- CTA cuoi story dan sang ORATIO bang external link.

## PWA va offline-first

- `next.config.ts` wrap voi `withPWA(...)`.
- `public/manifest.json` da co `standalone`, `theme_color`, icons.
- Data hoc va state hoc dang local-first, khong phu thuoc backend.

## Luu y khi doc code

- `context/` la docs cu, co mot so chi tiet khong con khop voi code.
- `LEXICA_MASTER_CONTEXT.md` la vision; khi vision va code khac nhau, uu tien code de biet app dang chay the nao.
