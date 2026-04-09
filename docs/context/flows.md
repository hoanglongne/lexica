# Current App Flows

## 1. First-time entry

Neu `hasSeenWelcome = false` va `selectedLevel = null`:

- Hien `LevelTestWelcome`
- User co 2 lua chon:
  - bat dau placement test
  - bo qua va tu chon level

## 2. Placement test

- `LevelTest` gom 5 cau hoi multiple choice.
- Score mapping:
  - `0-2` -> `beginner`
  - `3` -> `intermediate`
  - `4` -> `advanced`
  - `5` -> `expert`
- Sau khi xong:
  - hien `LevelTestResult`
  - user co the accept recommended level hoac tu chon lai

## 3. Manual level selection

- `LevelSelector` cho chon:
  - `beginner`
  - `intermediate`
  - `advanced`
  - `expert`
  - `all`
- Khi set level:
  - store cap nhat `selectedLevel`
  - load deck moi theo level filter

## 4. Main learning loop

Tren `app/page.tsx`, sau onboarding:

1. Hien `EnergyBar`
2. Hien `SwipeDeck`
3. Hien stats sidebar / mobile stats sheet
4. User thao tac voi top card:
   - reveal nghia
   - swipe left = quen
   - swipe right = nho
5. Moi swipe:
   - tru energy
   - update ELO
   - update SRS progress
   - them card vao `learnedWords`
6. Neu deck het card:
   - store tu load deck moi

## 5. Input modes

### Touch / keyboard

- Drag ngang tren card.
- Desktop hotkeys:
  - `Space`: reveal
  - `ArrowLeft`: forget
  - `ArrowRight`: remember, tru khi dang o voice mode

### Voice mode

- Toggle nam trong `SwipeDeck`.
- Khi `swipeMode = voice`, top card bat buoc doc dung 3 lan lien tiep de swipe right.
- Sai se reset streak ve 0.
- Card van co the swipe left binh thuong.

### Boss-card capability

- `VocabCard` da support `isBossCard`.
- Hien tai data vocab chua gan boss-card routing ro rang trong `vocabCards.ts`.
- Nghia la plumbing da co, nhung behavior thuc te dang xoay quanh voice mode toggle la chinh.

## 6. Learned page

Route: `/learned`

- Hien tong so tu da hoc.
- Hien so tu mastered.
- Hien progress bar mastered / learned.
- Hien list tu da hoc, sap theo state uu tien:
  - mastered
  - gold
  - sprout
  - seed

## 7. Story packs

- Story packs chi hien preview khi user dat it nhat 5/10 tu trong pack.
- Story pack unlock khi dat 10/10.
- Khi unlock:
  - open `StoryUnlockModal`
  - user co the doc ngay hoac de sau
- Trong `StoryMode`:
  - vocab duoc highlight interactive
  - click vao vocab mo modal nghia / ipa / example / level
  - cuoi story co CTA sang ORATIO

## 8. Energy reset flow

- `initializeLexicaStore()` goi `checkAndResetEnergy()`.
- Rule reset:
  - neu `lastEnergyReset` nho hon midnight hom nay
  - set `energy = maxEnergy`
  - cap nhat `lastEnergyReset`

## 9. Empty / edge states dang co

- Het energy:
  - card khong cho swipe tiep
  - `EnergyBar` hien warning / depleted message
- Deck empty:
  - `SwipeDeck` hien message deck complete
  - text UI nay van con cau "Story Mode coming in Phase 5..."
- Speech khong support hoac bi tu choi permission:
  - hook tra ve state de UI thong bao loi
