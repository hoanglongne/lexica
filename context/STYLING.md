# Design System & Styling

## Color Palette

### Primary Colors
```css
cyan-400: #22d3ee    /* Primary actions, highlights */
cyan-500: #06b6d4    /* Buttons, links */
cyan-600: #0891b2    /* Hover states */
```

### State Colors
```css
/* Success / Correct / Seed */
green-400: #4ade80
green-500: #22c55e

/* Warning / Gold */
yellow-400: #facc15
yellow-500: #eab308

/* Advanced / Purple */
purple-400: #c084fc
purple-500: #a855f7

/* Error / Incorrect */
red-400: #f87171
red-500: #ef4444
```

### Neutral Colors
```css
/* Backgrounds */
slate-900: #0f172a   /* Main background */
slate-800: #1e293b   /* Card backgrounds */
slate-700: #334155   /* Borders, secondary elements */

/* Text */
white: #ffffff       /* Primary text */
slate-300: #cbd5e1   /* Secondary text */
slate-400: #94a3b8   /* Tertiary text */
slate-500: #64748b   /* Disabled text */
```

---

## Typography

### Font Stack
```css
font-family: system-ui, -apple-system, sans-serif
```

### Font Sizes
```css
/* Mobile → Desktop */
text-xs:     0.75rem (12px)
text-sm:     0.875rem (14px)
text-base:   1rem (16px)
text-lg:     1.125rem (18px)
text-xl:     1.25rem (20px)
text-2xl:    1.5rem (24px) → md:1.75rem (28px)
text-3xl:    1.875rem (30px) → md:2.25rem (36px)
text-4xl:    2.25rem (36px) → md:3rem (48px)
text-6xl:    3.75rem (60px) → md:5rem (80px)
```

### Font Weights
```css
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Special Cases
```css
font-mono: 'Courier New', monospace  /* IPA, ELO numbers */
tracking-tight: -0.025em             /* Logo */
tracking-wide: 0.025em               /* Uppercase labels */
```

---

## Spacing System

### Base Scale
```css
/* Tailwind default scale */
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
12: 3rem (48px)
```

### Responsive Spacing
```css
/* Mobile → Desktop */
p-4 → md:p-6 → lg:p-8
gap-4 → md:gap-6 → lg:gap-8
space-y-4 → md:space-y-6
```

### Custom Heights
```css
min-h-125: 31.25rem (500px)
min-h-150: 37.5rem (600px)
```

---

## Layout Patterns

### Container Widths
```css
max-w-md: 28rem (448px)      /* Vocab cards */
max-w-2xl: 42rem (672px)     /* Test screens */
max-w-4xl: 56rem (896px)     /* Level selector grid */
max-w-7xl: 80rem (1280px)    /* Main app layout */
```

### Responsive Breakpoints
```css
sm:  640px
md:  768px
lg:  1024px   /* Desktop layout switch */
xl:  1280px
```

### Main App Layout
```css
/* Desktop (lg+) */
.main-container {
  display: flex;
  flex-direction: row;
  gap: 3rem;
  max-width: 80rem;
  items: center;
}

.left-column {
  flex: 1;
  max-width: 42rem;  /* Prevent over-expansion */
}

.right-sidebar {
  width: 20rem;      /* lg:w-80 */
  width: 24rem;      /* xl:w-96 */
  flex-shrink: 0;
}

/* Mobile */
.main-container {
  flex-direction: column;
  gap: 1.5rem;
}
```

---

## Component Styles

### Cards
```css
/* Primary Card */
.card {
  background: rgba(30, 41, 59, 0.5);  /* slate-800/50 */
  backdrop-filter: blur(8px);
  border: 1px solid #334155;          /* slate-700 */
  border-radius: 1rem;                /* rounded-2xl on desktop */
  padding: 1.5rem;                    /* p-6 on desktop */
}

/* Hover State */
.card:hover {
  border-color: #06b6d4;              /* cyan-500 */
  transform: scale(1.02);
}
```

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: #06b6d4;         /* cyan-500 (solid, no gradient) */
  color: white;
  padding: 0.75rem 1.5rem;     /* py-3 px-6 */
  border-radius: 0.75rem;      /* rounded-xl */
  font-weight: 700;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: scale(1.02);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: rgba(51, 65, 85, 0.5);   /* slate-700/50 */
  border: 1px solid rgba(100, 116, 139, 0.5);
  color: #cbd5e1;                      /* slate-300 */
}

.btn-secondary:hover {
  background: rgba(51, 65, 85, 1);
  border-color: #64748b;               /* slate-500 */
}
```

### Inputs

**Radio Buttons (Test):**
```css
.radio-option {
  padding: 1rem;
  border: 2px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.75rem;
  background: rgba(51, 65, 85, 0.3);
}

.radio-option:hover {
  border-color: #64748b;
  background: rgba(51, 65, 85, 0.5);
}

.radio-option.selected {
  border-color: #22d3ee;               /* cyan-400 */
  background: rgba(34, 211, 238, 0.2); /* cyan-500/20 */
}
```

### Progress Bars
```css
.progress-container {
  height: 0.5rem;                      /* h-2 */
  background: #1e293b;                 /* slate-800 */
  border-radius: 9999px;               /* rounded-full */
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #06b6d4;                 /* cyan-500 (solid) */
  transition: width 0.3s ease-out;
}

/* State-based colors (no gradients) */
.progress-green { background: #4ade80; }
.progress-cyan { background: #22d3ee; }
.progress-purple { background: #c084fc; }
.progress-yellow { background: #facc15; }
```

### Badges
```css
.badge {
  padding: 0.5rem 0.75rem;             /* px-3 py-2 */
  border-radius: 9999px;               /* rounded-full */
  font-size: 0.75rem;                  /* text-xs */
  font-weight: 600;
}

/* State badges */
.badge-seed {
  background: rgba(34, 197, 94, 0.2);  /* green-500/20 */
  color: #4ade80;                      /* green-400 */
}

.badge-sprout {
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
}

.badge-gold {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.badge-mastered {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}
```

---

## Animations

### Framer Motion Presets

**Fade In:**
```javascript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.5 }}
```

**Bounce:**
```javascript
animate={{ scale: [0, 1.2, 1] }}
transition={{ duration: 0.6 }}
```

**Swipe Exit:**
```javascript
exit={{
  x: direction === 'right' ? 300 : -300,
  opacity: 0,
  rotate: direction === 'right' ? 20 : -20,
  transition: { duration: 0.3 }
}}
```

**Pulse (Listening):**
```javascript
animate={{ scale: [1, 1.1, 1] }}
transition={{ repeat: Infinity, duration: 1 }}
```

### CSS Transitions
```css
/* Standard */
transition-all: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Colors */
transition-colors: color, background-color, border-color 0.2s;

/* Transform */
transition-transform: transform 0.2s;

/* Smooth scroll */
scroll-behavior: smooth;
```

---

## Icon Styling

### Size Standards
```css
/* Small icons (inline text) */
w-3 h-3: 0.75rem (12px)
w-4 h-4: 1rem (16px)

/* Medium icons (buttons) */
w-5 h-5: 1.25rem (20px)
w-6 h-6: 1.5rem (24px)

/* Large icons (features) */
w-8 h-8: 2rem (32px)
w-10 h-10: 2.5rem (40px)

/* Extra large (celebrations) */
w-16 h-16: 4rem (64px)
w-24 h-24: 6rem (96px)
w-32 h-32: 8rem (128px)
```

### Icon Colors
```css
/* By context */
text-cyan-400: Primary actions
text-slate-400: Secondary/disabled
text-green-400: Success/correct
text-red-400: Error/incorrect
text-yellow-400: Warning/special
```

---

## Mobile-First Patterns

### Horizontal Scroll (Mobile Stats)
```css
.mobile-stats {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.stat-icon {
  flex-shrink: 0;              /* shrink-0 */
  padding: 0.75rem;
  border-radius: 0.5rem;
}

/* Hide scrollbar */
.mobile-stats::-webkit-scrollbar {
  display: none;
}
```

### Responsive Text
```css
/* Progressive size increase */
text-sm md:text-base           /* 14px → 16px */
text-lg md:text-xl             /* 18px → 20px */
text-2xl md:text-3xl           /* 24px → 30px */
text-4xl md:text-6xl           /* 36px → 60px */
```

### Conditional Display
```css
/* Show on mobile, hide on desktop */
lg:hidden

/* Hide on mobile, show on desktop */
hidden lg:block
hidden lg:flex
```

---

## Design Principles

### ✅ DO
- Use solid colors (no gradients)
- Prioritize readability (high contrast)
- Mobile-first responsive design
- Consistent spacing (4px grid)
- Professional lucide-react icons
- Subtle animations (< 0.3s)

### ❌ DON'T
- No emoji in UI (replaced with icons)
- No gradients (looks unprofessional)
- No complex animations (keep it snappy)
- No tiny text on mobile (<14px)
- No over-designed cards (clean & minimal)

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Primary text: white on slate-900 (19:1)
- Secondary text: slate-300 on slate-900 (9:1)

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-cyan-400
focus:ring-offset-2
focus:ring-offset-slate-900
```

### Touch Targets
- Minimum 44x44px (iOS guideline)
- All buttons have adequate padding
- Swipe cards are full-height

### Screen Readers
- Semantic HTML (button, nav, main)
- ARIA labels where needed
- Alt text for icons (via title prop)
