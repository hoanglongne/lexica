# Product Context

## Muc tieu

- LEXICA la funnel app mien phi cho ORATIO.
- Hinh thuc hoc chinh la micro-learning kieu swipe, toc do nhanh, dopamine cao, mobile-first.
- Doi tuong su dung la nguoi hoc tu vung IELTS muon co trai nghiem ngan, gay nghien, de quay lai hang ngay.

## Cam giac san pham

- Visual tone:
  - nen toi `slate-900`
  - neon cyan la mau nhan
  - style cyber-arcade / dark UI
- Session phai ngan, ro phan hoi, khong can backend de van su dung duoc.

## Pham vi dang co trong code

- 60 the tu vung static chia theo `beginner`, `intermediate`, `advanced`, `expert`.
- Placement test 5 cau cho first-time user.
- Manual level selection hoac hoc tat ca.
- Swipe trai/phai de nho hoac quen.
- Voice mode cho the tren cung; `VocabCard` da co hook vocal swipe 3 lan lien tiep.
- Story packs static, co teaser preview, unlock modal, story reading mode, va CTA sang ORATIO.
- Trang `/learned` de xem cac tu da hoc va cac story pack lien quan.

## Gameplay pillars hien tai

### 1. Energy

- `maxEnergy = 30`.
- Moi swipe ton 1 energy.
- Reset luc 0h local time.
- Energy la scarcity mechanic chinh de ngan session qua dai.

### 2. ELO routing

- User bat dau `currentElo = 1000`.
- LEFT giam ELO, RIGHT tang ELO.
- `recentSwipes` giu 10 lan gan nhat de danh gia struggle rate.
- Deck moi lay card quanh ELO hien tai, co dieu chinh range theo muc do struggle.

### 3. SRS

- Per-card progress luu trong `cardProgress`.
- Card state:
  - `seed`
  - `sprout`
  - `gold`
  - `mastered`
- Swipe dung day state len; swipe sai reset ve `seed`.
- Card due se duoc uu tien dua vao deck truoc card moi.

### 4. Story funnel

- Hien co 3 story packs static.
- Moi story pack gan voi 10 `vocabularyIds`.
- Story preview xuat hien tu 5/10.
- Story unlock khi hoc du 10/10 trong chinh pack do.
- Khi pack dang o 7-9/10, store se force-inject cac tu con thieu vao deck de user som mo khoa story.

## Dieu can nho ve "vision vs reality"

- `LEXICA_MASTER_CONTEXT.md` mo ta scenario co blank `[ ___ ]`, nhung code hien tai van hien target word truc tiep trong `scenario`.
- Master context nhan manh boss cards; code hien tai da co plumbing cho `isBossCard`, nhung experience thuc te hien nghieng sang voice mode toggle cho top card hon la boss-card routing day du.
- Master context nhac Supabase/static data; code hien tai chua dung Supabase, toan bo data dang local static.

## Muc nao dang la "partial"

- Story Mode da ton tai, nhung mot so text trong UI van nhac "coming in Phase 5".
- Voice swipe state machine da co, nhung UX iOS/Safari fallback chua thay mot lop handling rieng rat day du ngoai permission + support checks.
