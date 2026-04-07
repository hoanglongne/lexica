# LEXICA Context Documentation

Đây là folder chứa tài liệu chi tiết về architecture và implementation của LEXICA app.

## 📚 File Structure

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Tech stack, project structure, và key decisions**
- Framework và libraries
- Folder organization
- Core algorithms (ELO, SRS, Energy)
- Data persistence strategy
- Offline-first approach

**Đọc đầu tiên:** Để hiểu tổng quan về app

---

### [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
**Zustand store, state shape, và actions**
- Interface LexicaStore
- UserStats, UserCardProgress types
- State actions (swipeCard, loadNewDeck, etc.)
- Persistence với localStorage
- Set serialization pattern

**Đọc khi:** Làm việc với state hoặc debugging store

---

### [COMPONENTS.md](./COMPONENTS.md)
**Component hierarchy và props**
- 9 core components
- Props interfaces
- Icon usage (lucide-react)
- Styling conventions
- Responsive patterns

**Đọc khi:** Tạo/sửa components hoặc UI

---

### [DATA_MODELS.md](./DATA_MODELS.md)
**TypeScript interfaces và data structures**
- VocabCardData
- DifficultyLevel, CardState
- UserStats, UserCardProgress
- ELO types
- localStorage schema

**Đọc khi:** Làm việc với data models hoặc types

---

### [FEATURES.md](./FEATURES.md)
**User flows và feature specifications**
- First-time user journey
- Daily learning session
- Boss card mechanics
- ELO adaptive system
- SRS algorithm
- Edge cases

**Đọc khi:** Implement features mới hoặc hiểu behavior

---

### [STYLING.md](./STYLING.md)
**Design system và styling guidelines**
- Color palette (no gradients!)
- Typography scale
- Spacing system
- Component patterns
- Animations
- Mobile-first principles

**Đọc khi:** Styling components hoặc đảm bảo consistency

---

## 🎯 Quick Reference

### Làm việc với state?
→ `STATE_MANAGEMENT.md` + `DATA_MODELS.md`

### Tạo component mới?
→ `COMPONENTS.md` + `STYLING.md`

### Implement feature?
→ `FEATURES.md` + `ARCHITECTURE.md`

### Debug issue?
→ `ARCHITECTURE.md` (hiểu flow) → `STATE_MANAGEMENT.md` (check state)

### Onboarding mới?
→ Đọc theo thứ tự: ARCHITECTURE → FEATURES → COMPONENTS

---

## 🔄 Cách Update Context Files

Khi có thay đổi lớn trong code:

1. **Architecture changes** → Update `ARCHITECTURE.md`
   - New libraries, new patterns, new algorithms

2. **State changes** → Update `STATE_MANAGEMENT.md`
   - New state fields, new actions, type changes

3. **New components** → Update `COMPONENTS.md`
   - Add component description, props, features

4. **Data model changes** → Update `DATA_MODELS.md`
   - New interfaces, modified types, schema changes

5. **New features** → Update `FEATURES.md`
   - User flows, mechanics, edge cases

6. **Design updates** → Update `STYLING.md`
   - New colors, patterns, conventions

---

## ✅ Best Practices

### Keep It Sync
- Update context files NGAY khi code major features
- Don't let documentation drift from reality
- Mark deprecated patterns with ~~strikethrough~~

### Be Concise
- Bullet points > paragraphs
- Code examples for clarity
- Focus on "what" and "why", not "how to implement"

### Be Specific
- Actual filenames với paths
- Real code snippets (not pseudocode)
- Concrete examples

### Think Future You
- Write for someone reading this 6 months later
- Explain non-obvious decisions
- Link related concepts

---

## 📌 Key Conventions

**No Emojis in Code** 
- UI sử dụng lucide-react icons
- Documentation có thể dùng emoji cho clarity

**No Gradients**
- Solid colors only
- Professional appearance

**Mobile-First**
- All components responsive
- Desktop = enhancements

**TypeScript Strict**
- No `any` types (except necessary casts)
- Proper interfaces for all data

---

## 🚀 Quick Start for New Developers

1. Clone repo
2. `npm install`
3. Đọc `ARCHITECTURE.md` (10 phút)
4. Đọc `FEATURES.md` (15 phút)
5. `npm run dev` và explore app
6. Đọc `COMPONENTS.md` khi cần sửa UI
7. Đọc `STATE_MANAGEMENT.md` khi cần touch state

**Total onboarding time:** ~30-45 phút để hiểu đủ để code

---

## 📝 Context File Maintenance Log

| Date | Updated Files | Reason |
|------|---------------|--------|
| 2026-04-07 | All files | Initial creation |
| | | |

_(Update table này mỗi khi có major doc changes)_
