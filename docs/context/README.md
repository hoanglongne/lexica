# LEXICA Context Hub

Muc dich cua thu muc nay la gom context "dang dung duoc ngay" cho LEXICA, de sau nay doc lai nhanh hon ma khong phai moi lan scan ca repo.

## Thu tu nen doc

1. `product.md`
   - Tong quan san pham, gameplay loop, pham vi hien tai.
2. `architecture.md`
   - Tech stack, cau truc code, state, persistence, PWA.
3. `flows.md`
   - Onboarding, swipe loop, voice mode, story packs, learned page.
4. `source-of-truth.md`
   - Cac do lech giua `LEXICA_MASTER_CONTEXT.md`, code hien tai, va bo `context/` cu.

## Thu tu uu tien khi can tin "dung"

- `app/**/*`, `package.json`, `next.config.ts`, `public/manifest.json`
  - Nguon su that cao nhat cho behavior da implement.
- `LEXICA_MASTER_CONTEXT.md`
  - Product vision va direction goc.
- `docs/context/*`
  - Bo tom tat da duoc doi chieu giua vision va code thuc te.
- `context/*`
  - Tai lieu cu, van huu ich de tham khao nhanh nhung da co mot so diem loi thoi.

## Snapshot hien tai

- App la PWA/SPA bang Next.js App Router.
- Stack chinh: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Web Speech API, next-pwa.
- Du lieu dang local-first:
  - Tu vung static trong `app/data/vocabCards.ts`
  - Story packs static trong `app/data/stories.ts`
  - Tien do luu bang `localStorage` qua Zustand persist
- Core features dang co:
  - Welcome + placement test + manual level selection
  - Swipe deck co adaptive ELO
  - Energy 30/ngay reset luc 0h local
  - SRS state `seed -> sprout -> gold -> mastered`
  - Voice mode cho top card, boss-card capability o level component
  - Story packs mo khoa theo pack va trang `/learned`

## Cach dung thu muc nay

- Khi can hieu san pham: doc `product.md`.
- Khi can sua code: doc `architecture.md` truoc.
- Khi can lan theo behavior: doc `flows.md`.
- Khi thay code va spec mau thuan nhau: kiem tra `source-of-truth.md`.
