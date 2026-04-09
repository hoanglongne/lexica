# Source Of Truth va Cac Do Lech Quan Trong

## Nguyen tac uu tien

- Neu can biet app hien dang lam gi:
  - uu tien code trong `app/`
- Neu can biet san pham dang muon tien toi dau:
  - doc `LEXICA_MASTER_CONTEXT.md`
- Neu can context tom tat va da doi chieu:
  - doc `docs/context/*`

## Do lech: master context vs code hien tai

### Energy

- Master context:
  - 30 energy / ngay
- Code hien tai:
  - 30 energy / ngay
- Ket luan:
  - phan nay khop

### Scenario format

- Master context:
  - uu tien micro-scenario co cho trong `[ ___ ]`, khong show dinh nghia tu dien tren card
- Code hien tai:
  - `scenario` dang nhung truc tiep target word vao cau
  - nghia duoc reveal bang nut "xem nghia"
- Ket luan:
  - product vision va UI data model chua khop hoan toan

### Boss cards / vocal swipe

- Master context:
  - boss cards la co che quan trong, touch swipe bi disable cho boss cards
- Code hien tai:
  - support `isBossCard`
  - co them `swipeMode = voice` cho top card
  - data chua thay route boss-card ro rang trong database
- Ket luan:
  - vocal mechanic da duoc lam, nhung boss-card routing chua thanh he thong day du

### Story mode

- Master context:
  - unlock sau khi clear 10 words
- Code hien tai:
  - unlock theo tung story pack 10/10
  - preview xuat hien tu 5/10
  - co catch-up inject khi pack dang 7-9/10
- Ket luan:
  - implementation hien tai da cu the hoa y tuong story theo pack

### Data source

- Master context:
  - nhac Supabase cho static data
- Code hien tai:
  - chua dung Supabase
  - toan bo vocab va story dang la local static data
- Ket luan:
  - app dang offline-first theo huong local-only

## Do lech: `context/` cu vs code hien tai

### Version va stack

- `context/ARCHITECTURE.md` ghi Next.js 15
- `package.json` dang la Next.js 16.2.2 va React 19.2.4

### Energy

- `context/ARCHITECTURE.md` va `context/FEATURES.md` ghi 20 energy
- store hien tai dung 30 energy

### Story mode

- `context/FEATURES.md` van xep Story Mode vao "planned"
- code hien tai da co unlock modal, story reader, preview va CTA

### Backend

- `context/ARCHITECTURE.md` ghi "No backend/database"
- cau nay dung o runtime hien tai, nhung master context van de mo kha nang static data tu Supabase

## Cac note huu ich cho lan sau

- Khi can doc nhanh app nay, bat dau tu `docs/context/README.md`.
- Khi can resolve mau thuan trong docs, tin code truoc, roi moi map nguoc len master context de biet can refactor theo huong nao.
- Thu muc `context/` cu nen xem la historical snapshot, khong nen xem la nguon su that duy nhat nua.
