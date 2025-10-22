## PART 1: DESIGN TOKENS

```css
/* Colors - Solid */
--primary: #3B82F6;
--primary-hover: #2563EB;
--primary-active: #1D4ED8;
--primary-light: #DBEAFE;

--success: #10B981;
--success-hover: #059669;
--success-light: #D1FAE5;

--warning: #F59E0B;
--warning-hover: #D97706;
--warning-light: #FEF3C7;

--error: #EF4444;
--error-hover: #DC2626;
--error-light: #FEE2E2;

--text-primary: #0F172A;
--text-secondary: #64748B;
--text-tertiary: #94A3B8;
--text-disabled: #CBD5E1;

--bg-primary: #FFFFFF;
--bg-secondary: #F8FAFC;
--bg-tertiary: #F1F5F9;

--border: #E2E8F0;
--border-strong: #CBD5E1;

/* Colors - Gradients (signature feature) */
--gradient-primary: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
--gradient-primary-hover: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
--gradient-success: linear-gradient(135deg, #10B981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
--gradient-error: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);

/* Spacing (4px base scale) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;

/* Typography */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
--text-5xl: 48px;
--text-6xl: 60px;

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25);

--shadow-primary: 0 8px 16px -4px rgba(59,130,246,0.3);
--shadow-success: 0 8px 16px -4px rgba(16,185,129,0.3);
--shadow-error: 0 8px 16px -4px rgba(239,68,68,0.3);

/* Spring Easing (signature feature) */
--ease-spring-smooth: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring-snappy: cubic-bezier(0.22, 1, 0.36, 1);
--ease-spring-entrance: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-spring-exit: cubic-bezier(0.6, -0.28, 0.735, 0.045);

/* Durations */
--duration-fast: 100ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;

/* Z-Index */
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-popover: 600;
--z-toast: 700;
--z-tooltip: 800;
```

**Dark Mode:**
```css
@media (prefers-color-scheme: dark) {
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-tertiary: #334155;
  --border: #334155;
  --border-strong: #475569;
}
```

---

## PART 2: BASE STYLES

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.025em;
  margin: 0;
}

h1 { font-size: 48px; }
h2 { font-size: 36px; }
h3 { font-size: 30px; }
h4 { font-size: 24px; }
h5 { font-size: 20px; }
h6 { font-size: 18px; }

p { margin: 0; }

button {
  font-family: inherit;
  border: none;
  background: none;
  cursor: pointer;
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

* { box-sizing: border-box; }
```

---

## PART 3: COMPONENT SPECS

### Button

```css
/* Base button - apply to <button> or <a> */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Primary variant - gradient background */
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  border: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(59,130,246,0.3);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Secondary variant - bordered */
.btn-secondary {
  background: white;
  color: #0F172A;
  border: 1.5px solid #CBD5E1;
}

.btn-secondary:hover {
  background: #F8FAFC;
  border-color: #64748B;
  transform: translateY(-1px);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-secondary:active {
  background: #F1F5F9;
  transform: scale(0.98);
}

/* Ghost variant - transparent */
.btn-ghost {
  background: transparent;
  color: #3B82F6;
  border: none;
  padding: 8px 12px;
}

.btn-ghost:hover {
  background: #DBEAFE;
  transform: scale(1.02);
}

.btn-ghost:active {
  background: rgba(59,130,246,0.15);
  transform: scale(0.98);
}

/* Success/Error variants */
.btn-success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
}

.btn-success:hover {
  box-shadow: 0 8px 16px -4px rgba(16,185,129,0.3);
  transform: translateY(-2px);
}

.btn-error {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  border: none;
}

.btn-error:hover {
  box-shadow: 0 8px 16px -4px rgba(239,68,68,0.3);
  transform: translateY(-2px);
}

/* Sizes */
.btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
}

.btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
}

/* States */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%);
}

.btn:focus-visible {
  outline: 2px solid #DBEAFE;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
}

/* Loading state - hide text, show spinner */
.btn.loading {
  pointer-events: none;
  color: transparent;
  position: relative;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 9999px;
  animation: spin 600ms linear infinite;
}

.btn-secondary.loading::after {
  border-color: rgba(0,0,0,0.1);
  border-top-color: #3B82F6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Visual Description:**
- Button height: 40px (44px on mobile for touch)
- Gradient background for primary (signature feature)
- Lifts 2px on hover with shadow
- Scales down to 98% on click
- Spring bounce animation (0.34, 1.56, 0.64, 1)
- Icons placed next to text with 8px gap (no special classes needed)

**Usage:** Apply classes to `<button>` or `<a>`. Structure is flexible.

---

### Input

```css
/* Base input - apply to <input>, <textarea>, <select> */
.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: white;
  border: 1.5px solid #E2E8F0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: #0F172A;
  outline: none;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.input::placeholder {
  color: #94A3B8;
}

.input:hover {
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

.input:focus {
  border-color: #3B82F6;
  outline: 2px solid #DBEAFE;
  outline-offset: 0;
  box-shadow: inset 0 0 0 1px #3B82F6, 0 0 0 4px rgba(59,130,246,0.1);
  transform: translateY(-1px) scale(1.005);
}

/* States */
.input.error,
.input:invalid {
  border-color: #EF4444;
}

.input.error:focus,
.input:invalid:focus {
  border-color: #EF4444;
  outline-color: #FEE2E2;
  box-shadow: inset 0 0 0 1px #EF4444, 0 0 0 4px rgba(239,68,68,0.1);
}

.input.success {
  border-color: #10B981;
}

.input.success:focus {
  border-color: #10B981;
  outline-color: #D1FAE5;
  box-shadow: inset 0 0 0 1px #10B981, 0 0 0 4px rgba(16,185,129,0.1);
}

.input:disabled {
  background: #F1F5F9;
  color: #CBD5E1;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Textarea variant */
textarea.input {
  min-height: 80px;
  padding: 12px;
  resize: vertical;
}

/* With icon - add padding when icon present */
.input.icon-left {
  padding-left: 40px;
}

.input.icon-right {
  padding-right: 40px;
}
```

**Label:**
```css
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
  line-height: 1.25;
}
```

**Helper/Error Text:**
```css
.helper-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #64748B;
}

.error-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #EF4444;
}
```

**Visual Description:**
- Input height: 40px (44px on mobile)
- Lifts 1px on hover
- Focus: primary border + outline + glow + slight scale
- Error: shake animation on validation (optional)
- Icons: Position absolutely inside input, add padding to input

**Usage:** Apply to form elements. Add icon with absolute positioning if needed. No wrapper required unless icon present.

---

### Checkbox & Radio

```css
/* Hide native input */
input[type="checkbox"],
input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Custom checkbox/radio box */
input[type="checkbox"] + label::before,
input[type="radio"] + label::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 1.5px solid #CBD5E1;
  background: white;
  vertical-align: middle;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

input[type="checkbox"] + label::before {
  border-radius: 4px;
}

input[type="radio"] + label::before {
  border-radius: 50%;
}

/* Hover */
input[type="checkbox"]:hover + label::before,
input[type="radio"]:hover + label::before {
  border-color: #3B82F6;
  transform: scale(1.05);
}

/* Checked state */
input[type="checkbox"]:checked + label::before,
input[type="radio"]:checked + label::before {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-color: #3B82F6;
}

/* Checkmark (use background-image or ::after) */
input[type="checkbox"]:checked + label::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'/%3E%3C/svg%3E");
  background-size: 12px;
  background-position: center;
  background-repeat: no-repeat;
}

/* Radio dot */
input[type="radio"]:checked + label::after {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
}

/* Focus */
input[type="checkbox"]:focus-visible + label::before,
input[type="radio"]:focus-visible + label::before {
  outline: 2px solid #DBEAFE;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
}

/* Disabled */
input[type="checkbox"]:disabled + label::before,
input[type="radio"]:disabled + label::before {
  background: #F1F5F9;
  border-color: #E2E8F0;
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Visual Description:**
- Custom 20x20px box/circle
- Gradient background when checked (signature)
- Scales up 5% on hover
- Spring bounce on check/uncheck
- Label text beside control

**Usage:** Standard HTML structure - `<input>` + `<label>`. Style with pseudo-elements.

---

### Card

```css
.card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 24px;
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Interactive card */
.card.clickable {
  cursor: pointer;
}

.card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  border-color: #CBD5E1;
}

.card.clickable:active {
  transform: translateY(-2px) scale(0.99);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

/* Gradient accent (signature) */
.card.accent {
  position: relative;
  border-top: 4px solid transparent;
  border-image: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%) 1;
  border-image-slice: 1 0 0 0;
}

/* Mobile padding */
@media (max-width: 767px) {
  .card {
    padding: 16px;
  }
}
```

**Visual Description:**
- White background, 1px border, 8px radius
- 24px padding (16px on mobile)
- Clickable cards lift 4px on hover
- Gradient top border for accent variant
- Images can be placed inside (negative margin for full-width)

**Usage:** Apply to any block element. Internal structure is flexible - no required child elements.

---

### Modal

```css
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 400;
  animation: backdropFadeIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* Modal container */
.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  z-index: 500;
  animation: modalEnter 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 100ms backwards;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal sections - optional structure helpers */
.modal > header {
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.modal > main {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal > footer {
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

**Visual Description:**
- Centered on screen with backdrop
- Max width 500px, max height 90vh
- Enters with slide + scale animation
- Backdrop has blur effect
- Close button typically in top-right

**Usage:** Apply classes. Internal structure is flexible - use semantic HTML (header, main, footer) or divs.

---

### Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.badge-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59,130,246,0.2);
}

.badge-success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16,185,129,0.2);
}

.badge-warning {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(245,158,11,0.2);
}

.badge-error {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(239,68,68,0.2);
}

.badge-subtle {
  background: #DBEAFE;
  color: #3B82F6;
}

/* If clickable */
.badge:hover {
  transform: scale(1.05);
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Visual Description:**
- Pill-shaped (full border radius)
- Gradient backgrounds for variants (signature)
- 12px text, 4px vertical padding
- Scales 5% on hover if clickable

**Usage:** Apply to `<span>` or any inline element.

---

### Toast Notification

```css
/* Container - fixed position */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 700;
  max-width: 420px;
  pointer-events: none;
}

/* Toast */
.toast {
  background: #1E293B;
  color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  display: flex;
  gap: 12px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  animation: toastSlideIn 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%) translateY(20px) rotate(5deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}

/* Variants - colored left border */
.toast-success {
  border-left: 3px solid #10B981;
}

.toast-error {
  border-left: 3px solid #EF4444;
}

.toast-warning {
  border-left: 3px solid #F59E0B;
}

.toast-info {
  border-left: 3px solid #3B82F6;
}

/* Progress bar */
.toast::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255,255,255,0.2);
  animation: progress var(--duration, 4s) linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0; }
}
```

**Visual Description:**
- Dark background (#1E293B), white text
- Fixed bottom-right position
- Slides in from right with rotation
- Colored left border for variants
- Progress bar at bottom (optional)
- 16px padding, 8px border radius

**Usage:** Apply classes. Structure flexible - typically icon + text content + close button.

---

### Alert

```css
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 3px solid;
  font-size: 14px;
  line-height: 1.5;
}

.alert-info {
  background: rgba(59,130,246,0.1);
  border-color: #3B82F6;
  color: #0F172A;
}

.alert-success {
  background: rgba(16,185,129,0.1);
  border-color: #10B981;
  color: #0F172A;
}

.alert-warning {
  background: rgba(245,158,11,0.1);
  border-color: #F59E0B;
  color: #0F172A;
}

.alert-error {
  background: rgba(239,68,68,0.1);
  border-color: #EF4444;
  color: #0F172A;
}
```

**Visual Description:**
- Colored background (10% opacity)
- 3px left border matching color
- 12px vertical, 16px horizontal padding
- Icon and close button optional

**Usage:** Apply to any block element. Internal structure flexible.

---

### Loading States

```css
/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #F1F5F9;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 4px;
}

/* Skeleton */
.skeleton {
  background: linear-gradient(
    90deg,
    #F1F5F9 0%,
    #F8FAFC 25%,
    #F1F5F9 50%,
    #F8FAFC 75%,
    #F1F5F9 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Visual Description:**
- Spinner: Border animation, top segment colored
- Skeleton: Gradient shimmer animation
- Sizes: sm (16px), base (24px), lg (32px)

**Usage:** Apply to empty elements. Size with inline styles or width/height classes.

---

## PART 4: LAYOUT

```css
/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.container-narrow {
  max-width: 720px;
}

.container-wide {
  max-width: 1440px;
}

/* Grid */
.grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Flex utilities */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

/* Responsive */
@media (max-width: 767px) {
  .container {
    padding: 0 16px;
  }
  
  .grid {
    gap: 16px;
    grid-template-columns: 1fr;
  }
}
```

---

## PART 5: UTILITIES

```css
/* Spacing */
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }

.m-0 { margin: 0; }
.m-2 { margin: 8px; }
.m-4 { margin: 16px; }

.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }

/* Text */
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }

.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

.text-primary { color: #0F172A; }
.text-secondary { color: #64748B; }
.text-tertiary { color: #94A3B8; }

.text-center { text-align: center; }

/* Display */
.block { display: block; }
.inline-block { display: inline-block; }
.hidden { display: none; }

.w-full { width: 100%; }
.h-full { height: 100%; }
```

---

## PART 6: ACCESSIBILITY

```css
/* Focus states - all interactive elements */
:focus-visible {
  outline: 2px solid #DBEAFE;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## PART 7: ADVANCED PATTERNS

### Staggered List Animation

```css
/* Apply to grid/list items */
.stagger-item {
  animation: fadeInUp 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 80ms; }
.stagger-item:nth-child(3) { animation-delay: 160ms; }
.stagger-item:nth-child(4) { animation-delay: 240ms; }
.stagger-item:nth-child(5) { animation-delay: 320ms; }
.stagger-item:nth-child(6) { animation-delay: 400ms; }
.stagger-item:nth-child(7) { animation-delay: 480ms; }
.stagger-item:nth-child(8) { animation-delay: 560ms; }
.stagger-item:nth-child(n+9) { animation-delay: 640ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Hero Gradient Background

```css
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(59,130,246,0.05) 0%,
    transparent 100%
  );
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(
    circle,
    rgba(59,130,246,0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  animation: float 20s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(-50px, -30px); }
  66% { transform: translate(30px, 50px); }
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## CRITICAL RULES

1. **Semantic Colors** - Use `var(--primary)` not `#3B82F6`
2. **Scale Values** - Use spacing scale (4, 8, 12, 16...) - no arbitrary numbers
3. **Touch Targets** - 44px minimum on mobile
4. **Focus States** - Always visible (outline + glow)
5. **Spring Easing** - Default transition: `200ms cubic-bezier(0.34, 1.56, 0.64, 1)`
6. **Gradients** - Use for primary buttons, badges, CTAs
7. **Minimal Markup** - No wrapper divs unless functionally required
8. **Reduced Motion** - Respect `prefers-reduced-motion`
9. **Mobile First** - Design for small screens, enhance for large
10. **Body Text** - 16px minimum for readability
