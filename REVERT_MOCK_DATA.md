# Revert Mock Data Instructions

## To remove mock data and restore production state:

In `/app/store/lexicaStore.ts`:

### 1. Delete the mock function (lines ~153-188):
```typescript
// ============================================
// MOCK DATA GENERATOR (TEMPORARY - FOR TESTING)
// ============================================
function generateMockStudyHistory(): Record<string, StudyHistoryEntry> {
    // ... entire function ...
}
```

### 2. Change line ~200:
**FROM:**
```typescript
studyHistory: generateMockStudyHistory(), // MOCK DATA - Replace with {} for production
```

**TO:**
```typescript
studyHistory: {}, // Empty at start, will be populated as user studies
```

### 3. Rebuild:
```bash
npm run build
```

Done! 🎉
