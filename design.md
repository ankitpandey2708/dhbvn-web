## PART 1: DESIGN TOKENS

### Color System

**Philosophy**: Use gradients to add depth and energy. Flat colors for text, gradients for interactive surfaces.

**Primary Palette** (with gradients):
```
primary: #3B82F6
primary-gradient: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
primary-hover: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)
primary-active: #1D4ED8
primary-light: #DBEAFE
primary-glow: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)

success: #10B981
success-gradient: linear-gradient(135deg, #10B981 0%, #059669 100%)
success-hover: linear-gradient(135deg, #059669 0%, #047857 100%)
success-light: #D1FAE5

warning: #F59E0B
warning-gradient: linear-gradient(135deg, #F59E0B 0%, #D97706 100%)
warning-hover: linear-gradient(135deg, #D97706 0%, #B45309 100%)
warning-light: #FEF3C7

error: #EF4444
error-gradient: linear-gradient(135deg, #EF4444 0%, #DC2626 100%)
error-hover: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)
error-light: #FEE2E2

neutral: #64748B
neutral-gradient: linear-gradient(135deg, #64748B 0%, #475569 100%)
```

**Gradient Usage Rules**:
```
✅ Use gradients for:
- Primary action buttons
- Call-to-action cards
- Hero sections
- Badge backgrounds (subtle)
- Hover states (add energy)
- Focus glows

❌ Use flat colors for:
- Text (always flat for readability)
- Borders
- Icons (unless featured/hero icons)
- Secondary/tertiary buttons
- Backgrounds
```

**Text Colors** (always flat):
```
text-primary: #0F172A
text-secondary: #64748B
text-tertiary: #94A3B8
text-disabled: #CBD5E1
text-on-primary: #FFFFFF (for text on gradient backgrounds)
```

**Background Colors** (flat, with optional gradient overlays):
```
bg-primary: #FFFFFF
bg-secondary: #F8FAFC
bg-tertiary: #F1F5F9
bg-elevated: #FFFFFF

bg-gradient-subtle: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)
bg-gradient-hero: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)
```

**Border Colors** (flat):
```
border: #E2E8F0
border-strong: #CBD5E1
border-focus: primary (flat, not gradient)
```

**Dark Mode**:
```
text-primary: #F1F5F9
text-secondary: #94A3B8
text-tertiary: #64748B

bg-primary: #0F172A
bg-secondary: #1E293B
bg-tertiary: #334155
bg-elevated: #1E293B

bg-gradient-subtle: linear-gradient(180deg, #0F172A 0%, #1E293B 100%)
bg-gradient-hero: linear-gradient(180deg, #1E293B 0%, #0F172A 100%)

Gradients in dark mode:
- Increase saturation slightly (+5%)
- Add subtle glow effect around gradient elements
```

**Glow Effects**:
```
glow-primary: 0 0 20px rgba(59,130,246,0.3)
glow-success: 0 0 20px rgba(16,185,129,0.3)
glow-error: 0 0 20px rgba(239,68,68,0.3)

Use for:
- Focus states on gradient buttons
- Hover states on cards with gradient accents
- Loading states
```

---

### Animation

**Philosophy**: All motion uses spring physics for natural, playful feel.

**Spring Easing Functions**:
```
spring-smooth: cubic-bezier(0.34, 1.56, 0.64, 1)
  Use: Default for most transitions (buttons, hover, focus)
  Feel: Gentle bounce, professional

spring-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  Use: Playful interactions (badges, success states)
  Feel: Pronounced bounce, energetic

spring-snappy: cubic-bezier(0.22, 1, 0.36, 1)
  Use: Quick feedback (toggles, checkboxes)
  Feel: Fast and responsive

spring-entrance: cubic-bezier(0.175, 0.885, 0.32, 1.275)
  Use: Elements entering view (modals, dropdowns)
  Feel: Gentle overshoot on entry

spring-exit: cubic-bezier(0.6, -0.28, 0.735, 0.045)
  Use: Elements exiting view (closing modals)
  Feel: Quick departure with slight anticipation
```

**Durations** (slightly longer for spring physics):
```
instant: 100ms   (micro-feedback)
fast: 200ms      (DEFAULT - most interactions)
base: 300ms      (state changes, complex transitions)
slow: 400ms      (page transitions, large movements)
slower: 600ms    (drawer/modal open)
```

**Magnetic Hover Effect**:
```
When hovering interactive elements, they "reach" toward cursor

Button/Card hover:
  transform: translate(
    calc((mouseX - elementCenterX) * 0.05),
    calc((mouseY - elementCenterY) * 0.05)
  )
  transition: transform 200ms spring-smooth

Reset on mouse leave:
  transform: translate(0, 0)
  transition: transform 300ms spring-smooth

Intensity:
  Buttons: 0.05 (subtle)
  Cards: 0.03 (very subtle)
  Large elements: 0.02 (barely perceptible)
```

**Staggered Animations** (for lists/grids):
```
When multiple items enter view, stagger their entrance:

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

Item 1: animation-delay: 0ms
Item 2: animation-delay: 50ms
Item 3: animation-delay: 100ms
Item n: animation-delay: (n-1) * 50ms

Max delay: 400ms (cap at 8th item)
Animation: fadeInUp 300ms spring-entrance forwards
```

**Choreographed Sequences**:
```
Modal opening sequence:
1. Backdrop fade in (150ms)
2. Modal scale up (300ms spring-entrance, delay 50ms)
3. Content fade in (200ms, delay 150ms)

Success feedback sequence:
1. Button scale (200ms spring-bounce)
2. Checkmark appear (300ms spring-entrance, delay 100ms)
3. Success message slide in (250ms spring-smooth, delay 200ms)
```

**What to Animate**:
```
✅ Always animate with spring:
- transform (translate, scale, rotate)
- opacity

⚠️ Animate carefully with spring:
- filter (blur, brightness) - can be janky

❌ Never animate:
- width, height (causes reflow)
- margin, padding (causes reflow)
- top, left (use transform instead)
```

**Performance Optimization**:
```css
/* Add to animated elements */
will-change: transform, opacity;
backface-visibility: hidden;
transform: translateZ(0); /* Force GPU acceleration */

/* Remove after animation */
will-change: auto;
```

---

### Spacing Scale

**Base unit: 4px**

```
0.5: 2px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

**Contextual Guidelines**:
- Icon-to-text gap: 2 (8px)
- Within component: 3-4 (12-16px)
- Between related items: 4 (16px)
- Between groups: 6 (24px)
- Between sections: 8-12 (32-48px)
- Major sections: 12-16 (48-64px)

---

### Typography

**Font Stack**:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             Roboto, "Helvetica Neue", sans-serif;
font-feature-settings: "kern" 1;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

**Size Scale**:
```
xs: 12px
sm: 14px
base: 16px
lg: 18px
xl: 20px
2xl: 24px
3xl: 30px
4xl: 36px
5xl: 48px
6xl: 60px
```

**Weights**:
```
normal: 400
medium: 500
semibold: 600
bold: 700
```

**Line Heights**:
```
none: 1
tight: 1.25
snug: 1.375
normal: 1.5
relaxed: 1.625
loose: 2
```

**Letter Spacing**:
```
tighter: -0.05em
tight: -0.025em
normal: 0
wide: 0.025em
wider: 0.05em
widest: 0.1em
```

**Gradient Text Effect**:
```css
/* Use sparingly for hero headings only */
.gradient-text {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

Usage:
- Hero h1 only
- Special call-out text
- Feature highlight numbers
```

---

### Border Radius

```
none: 0px
sm: 4px
md: 6px (default)
lg: 8px
xl: 12px
2xl: 16px
3xl: 24px
full: 9999px
```

---

### Shadows & Elevation

**Light Mode**:
```
sm: 0 1px 2px 0 rgba(0,0,0,0.05)
md: 0 4px 6px -1px rgba(0,0,0,0.1), 
    0 2px 4px -1px rgba(0,0,0,0.06)
lg: 0 10px 15px -3px rgba(0,0,0,0.1), 
    0 4px 6px -2px rgba(0,0,0,0.05)
xl: 0 20px 25px -5px rgba(0,0,0,0.1), 
    0 10px 10px -5px rgba(0,0,0,0.04)
2xl: 0 25px 50px -12px rgba(0,0,0,0.25)
```

**Gradient Shadow** :
```
shadow-primary: 0 8px 16px -4px rgba(59,130,246,0.3)
shadow-success: 0 8px 16px -4px rgba(16,185,129,0.3)
shadow-error: 0 8px 16px -4px rgba(239,68,68,0.3)

Use with gradient buttons on hover
Creates cohesive glow effect
```

**Dark Mode**:
```
sm: 0 1px 2px 0 rgba(0,0,0,0.3)
md: 0 4px 6px -1px rgba(0,0,0,0.4), 
    0 2px 4px -1px rgba(0,0,0,0.3)
lg: 0 10px 15px -3px rgba(0,0,0,0.5), 
    0 4px 6px -2px rgba(0,0,0,0.4)
xl: 0 20px 25px -5px rgba(0,0,0,0.6), 
    0 10px 10px -5px rgba(0,0,0,0.5)
2xl: 0 25px 50px -12px rgba(0,0,0,0.7)

Gradient shadows in dark mode (stronger):
shadow-primary: 0 8px 16px -4px rgba(59,130,246,0.5)
```

---

### Z-Index Scale

```
base: 0
dropdown: 100
sticky: 200
fixed: 300
modal-backdrop: 400
modal: 500
popover: 600
toast: 700
tooltip: 800
```

---

## PART 2: COMPONENT PATTERNS

### Buttons

**Base Specs**:
```
Height: 40px (desktop), 44px (mobile)
Horizontal padding: 16px
Font: sm (14px), weight: medium (500)
Line-height: 1
Border-radius: md (6px)
Transition: all 200ms spring-smooth
Display: inline-flex
Align-items: center
Justify-content: center
White-space: nowrap
User-select: none
Position: relative
Cursor: pointer
```

**Icon Sizing**:
```
Icon: 16px (for 14px text)
Icon: 20px (for 16-18px text)

Icon + Text spacing:
  Icon before: padding-left 12px, padding-right 16px, gap 8px
  Icon after: padding-left 16px, padding-right 12px, gap 8px
  Icon only: width 40px, padding 0, justify-content center
```

---

**Primary Variant**:
```
Background: primary-gradient
Color: white
Border: none
Font-weight: medium (500)
Box-shadow: 0 1px 2px rgba(0,0,0,0.05)
Overflow: hidden (for gradient animation)

Gradient animation on mount:
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  Background-size: 200% 200%
  Animation: gradientShift 3s ease infinite (subtle movement)

Hover:
  Background: primary-hover (darker gradient)
  Transform: translateY(-2px)
  Box-shadow: shadow-primary
  Transition: all 200ms spring-smooth
  
  Magnetic effect:
    Transform: translateY(-2px) 
              translate(mouseOffsetX * 0.05, mouseOffsetY * 0.05)

Active:
  Transform: translateY(0) scale(0.98)
  Box-shadow: 0 1px 2px rgba(0,0,0,0.05)
  Transition: all 100ms spring-snappy

Focus:
  Outline: 2px solid primary-light
  Outline-offset: 2px
  Box-shadow: shadow-primary, 0 0 0 4px rgba(59,130,246,0.1)

Disabled:
  Background: linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)
  Color: white
  Opacity: 0.6
  Cursor: not-allowed
  Pointer-events: none
  Transform: none

Loading:
  Pointer-events: none
  Cursor: wait
  
  Spinner overlay:
    Position: absolute
    Inset: 0
    Display: flex
    Align-items: center
    Justify-content: center
    Background: inherit (same gradient)
    
  Spinner:
    Width: 16px
    Height: 16px
    Border: 2px solid rgba(255,255,255,0.3)
    Border-top-color: white
    Border-radius: full
    Animation: spin 600ms linear infinite
    
  Text:
    Opacity: 0
    
  Maintain width (don't collapse)
```

---

**Secondary Variant**:
```
Background: bg-primary
Color: text-primary
Border: 1.5px solid border-strong
Font-weight: medium (500)

Hover:
  Background: bg-secondary
  Border-color: text-secondary
  Transform: translateY(-1px)
  Box-shadow: sm
  Transition: all 200ms spring-smooth
  
  Magnetic effect (subtle):
    Transform: translateY(-1px) 
              translate(mouseOffsetX * 0.03, mouseOffsetY * 0.03)

Active:
  Background: bg-tertiary
  Transform: scale(0.98)
  Transition: all 100ms spring-snappy

Focus:
  Outline: 2px solid primary-light
  Outline-offset: 2px
  Border-color: primary

Disabled:
  Background: bg-primary
  Border-color: border
  Color: text-disabled
  Opacity: 0.6
  Cursor: not-allowed

Loading:
  Same pattern as primary, but:
    Spinner: border rgba(0,0,0,0.1), border-top primary
```

---

**Tertiary/Ghost Variant**:
```
Background: transparent
Color: primary
Border: none
Padding: 8px 12px
Font-weight: medium (500)

Hover:
  Background: primary-light
  Color: primary
  Transform: scale(1.02)
  Transition: all 200ms spring-bounce

Active:
  Background: rgba(59,130,246,0.15)
  Transform: scale(0.98)
  Transition: all 100ms spring-snappy

Focus:
  Outline: 2px solid primary-light
  Outline-offset: 2px
  Background: primary-light
```

---

**Gradient Accent Button** (special variant):
```
Background: bg-primary
Color: text-primary
Border: 2px solid transparent
Background-clip: padding-box
Position: relative

::before (gradient border):
  Content: ""
  Position: absolute
  Inset: -2px
  Background: primary-gradient
  Border-radius: inherit
  Z-index: -1
  Opacity: 1

Hover:
  Background: bg-secondary
  
  ::before:
    Background: primary-hover
    Filter: brightness(1.1)

Active:
  Transform: scale(0.98)

Use for:
  Secondary CTAs that need more emphasis than ghost
  Special actions (e.g., "Upgrade", "Get Started")
```

---

**Success/Error Variants**:
```
Success button:
  Background: success-gradient
  Box-shadow: shadow-success on hover
  All other states same as primary

Error/Destructive button:
  Background: error-gradient
  Box-shadow: shadow-error on hover
  All other states same as primary
```

---

**Button with Icon Animation**:
```
Icon inside button:
  Transition: transform 200ms spring-smooth

Hover:
  Icon (if right-arrow):
    Transform: translateX(2px)
    
  Icon (if external link):
    Transform: translate(1px, -1px)
    
  Icon (if download):
    Transform: translateY(2px)
```

---

### Form Inputs

**Text Input Base**:
```
Height: 40px (desktop), 44px (mobile)
Padding: 0 12px
Font: sm (14px), weight: normal (400)
Line-height: 1.5
Color: text-primary
Background: bg-primary
Border: 1.5px solid border
Border-radius: md (6px)
Transition: all 200ms spring-smooth
Outline: none

::placeholder:
  Color: text-tertiary
  Opacity: 1
```

**States**:
```
Default:
  Border-color: border

Hover:
  Border-color: border-strong
  Transform: translateY(-1px)
  Transition: all 200ms spring-smooth

Focus:
  Border-color: primary
  Outline: 2px solid primary-light
  Outline-offset: 0px
  Box-shadow: inset 0 0 0 1px primary, 
              0 0 0 4px rgba(59,130,246,0.1)
  Transform: translateY(-1px) scale(1.01)
  Transition: all 200ms spring-entrance

Error:
  Border-color: error
  
  Focus:
    Border-color: error
    Outline: 2px solid error-light
    Box-shadow: inset 0 0 0 1px error,
                0 0 0 4px rgba(239,68,68,0.1)
    
  Animation on error (shake):
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    Animation: shake 200ms spring-bounce

Success:
  Border-color: success
  
  Animation on success:
    @keyframes successPulse {
      0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
      100% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
    }
    Animation: successPulse 400ms spring-smooth

Disabled:
  Background: bg-tertiary
  Border-color: border
  Color: text-disabled
  Cursor: not-allowed
  Opacity: 0.6
```

---

**Label**:
```
Display: block
Margin-bottom: 6px
Font: sm (14px), weight: medium (500)
Color: text-primary
Line-height: 1.25
Transition: color 200ms spring-smooth

Required indicator:
  Content: " *"
  Color: error
  Margin-left: 2px
  
Focus-within (when input focused):
  Color: primary
  Transform: scale(1.01)
  Transform-origin: left
  Transition: all 200ms spring-smooth
```

---

**Error Message**:
```
Display: flex
Align-items: flex-start
Gap: 6px
Margin-top: 6px
Font: xs (12px)
Color: error
Line-height: 1.5

Animation on appear:
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  Animation: slideInDown 200ms spring-entrance

Icon:
  Width: 14px
  Height: 14px
  Flex-shrink: 0
  Margin-top: 2px
  
  Animation:
    @keyframes iconBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    Animation: iconBounce 300ms spring-bounce
```

---

**Success Message**:
```
Same as error message, but:
  Color: success
  
  Animation on appear:
    @keyframes successSlideIn {
      from {
        opacity: 0;
        transform: translateX(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    Animation: successSlideIn 250ms spring-smooth
    
  Icon (checkmark):
    Animation: iconBounce 300ms spring-bounce (delayed 100ms)
```

---

**Checkbox/Radio with Spring**:
```
Custom box:
  Width: 20px
  Height: 20px
  Border: 1.5px solid border-strong
  Background: bg-primary
  Transition: all 200ms spring-smooth
  
  Checkbox: border-radius sm (4px)
  Radio: border-radius full

Hover:
  Border-color: primary
  Transform: scale(1.05)
  Transition: all 200ms spring-bounce

Checked:
  Background: primary-gradient
  Border-color: primary
  Transform: scale(1)
  
  Checkmark/dot entrance:
    @keyframes checkAppear {
      0% {
        opacity: 0;
        transform: scale(0) rotate(-45deg);
      }
      60% {
        transform: scale(1.1) rotate(0deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }
    Animation: checkAppear 300ms spring-bounce

Focus:
  Outline: 2px solid primary-light
  Outline-offset: 2px
  Box-shadow: 0 0 0 4px rgba(59,130,246,0.1)
```

---

### Cards

**Base Card**:
```
Background: bg-primary
Border: 1px solid border
Border-radius: lg (8px)
Padding: 24px (desktop), 16px (mobile)
Transition: all 300ms spring-smooth
Overflow: hidden
Position: relative
```

**If Clickable**:
```
Cursor: pointer
User-select: none

Hover:
  Transform: translateY(-4px)
  Box-shadow: lg
  Border-color: border-strong
  Transition: all 300ms spring-smooth
  
  Magnetic effect:
    Transform: translateY(-4px) 
              translate(mouseOffsetX * 0.03, mouseOffsetY * 0.03)

Active:
  Transform: translateY(-2px) scale(0.99)
  Box-shadow: md
  Transition: all 150ms spring-snappy
```

**Gradient Accent Card** :
```
Position: relative
Border: none
Padding: 24px
Background: bg-primary
Overflow: hidden

::before (gradient accent):
  Content: ""
  Position: absolute
  Top: 0
  Left: 0
  Right: 0
  Height: 4px
  Background: primary-gradient
  Transform-origin: left
  
Hover:
  ::before:
    Height: 6px
    Transition: height 200ms spring-smooth
    
  Box-shadow: shadow-primary (subtle)
  
Use for:
  Featured cards
  Pricing tiers
  Important call-outs
```

---

**Card with Image**:
```
Image container:
  Margin: -24px -24px 16px -24px
  Aspect-ratio: 16/9
  Overflow: hidden
  Background: bg-tertiary
  Position: relative
  
Image:
  Width: 100%
  Height: 100%
  Object-fit: cover
  Transition: transform 400ms spring-smooth
  
  Card hover:
    Transform: scale(1.05) rotate(1deg)
    
Gradient overlay (optional):
  Position: absolute
  Inset: 0
  Background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0,0,0,0.3) 100%
  )
  Opacity: 0
  Transition: opacity 300ms spring-smooth
  
  Card hover:
    Opacity: 1
```

---

### Modals

**Backdrop**:
```
Position: fixed
Inset: 0
Background: rgba(0,0,0,0.5)
Backdrop-filter: blur(8px)
Display: flex
Align-items: center
Justify-content: center
Padding: 16px (mobile), 24px (desktop)
Z-index: modal-backdrop (400)

Entrance:
  @keyframes backdropFadeIn {
    from { 
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to { 
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
  Animation: backdropFadeIn 300ms spring-smooth

Exit:
  @keyframes backdropFadeOut {
    from {
      opacity: 1;
      backdrop-filter: blur(8px);
    }
    to {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
  }
  Animation: backdropFadeOut 200ms spring-exit
```

**Modal Container**:
```
Background: bg-primary
Border-radius: xl (12px)
Box-shadow: 2xl
Max-width: 500px
Width: 100%
Max-height: 90vh
Display: flex
Flex-direction: column
Z-index: modal (500)
Position: relative

Entrance:
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
  Animation: modalEnter 400ms spring-entrance 100ms backwards

Exit:
  @keyframes modalExit {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(20px) scale(0.98);
    }
  }
  Animation: modalExit 250ms spring-exit forwards
```

**Modal Header**:
```
Padding: 20px 24px
Border-bottom: 1px solid border
Display: flex
Align-items: center
Justify-content: space-between
Gap: 16px
Flex-shrink: 0

Entrance (staggered after modal):
  @keyframes headerSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  Animation: headerSlideIn 250ms spring-smooth 200ms backwards

Title:
  Font: xl (20px), weight: semibold (600)
  Color: text-primary
  Margin: 0
  Line-height: 1.25

Close button:
  Width: 32px
  Height: 32px
  Background: transparent
  Border: none
  Border-radius: md (6px)
  Color: text-secondary
  Cursor: pointer
  Display: flex
  Align-items: center
  Justify-content: center
  Transition: all 200ms spring-smooth
  
  Hover:
    Background: bg-secondary
    Color: text-primary
    Transform: scale(1.1) rotate(90deg)
    Transition: all 200ms spring-bounce
    
  Active:
    Transform: scale(0.95)
    Transition: all 100ms spring-snappy
```

**Modal Body**:
```
Padding: 24px
Overflow-y: auto
Flex: 1

Entrance (staggered):
  @keyframes bodyFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  Animation: bodyFadeIn 200ms ease-out 300ms backwards
```

**Modal Footer**:
```
Padding: 16px 24px
Border-top: 1px solid border
Display: flex
Justify-content: flex-end
Gap: 8px
Flex-shrink: 0

Entrance (staggered):
  Animation: headerSlideIn 250ms spring-smooth 350ms backwards

Buttons:
  Animation: none (inherit from footer)
```

---

### Badges

**Base Badge**:
```
Display: inline-flex
Align-items: center
Padding: 4px 12px
Border-radius: full (9999px)
Font: xs (12px), weight: medium (500)
Line-height: 1
White-space: nowrap
Transition: all 200ms spring-smooth
```

**Gradient Badge** :
```
Primary:
  Background: primary-gradient
  Color: white
  Box-shadow: 0 2px 4px rgba(59,130,246,0.2)
  
  Hover (if clickable):
    Transform: scale(1.05)
    Box-shadow: shadow-primary
    Transition: all 200ms spring-bounce

Success:
  Background: success-gradient
  Color: white
  Box-shadow: 0 2px 4px rgba(16,185,129,0.2)

Subtle (no gradient):
  Background: primary-light
  Color: primary
  
  Hover:
    Background: rgba(59,130,246,0.15)
    Transform: scale(1.05)
```

**Badge Entrance Animation**:
```
@keyframes badgePop {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
Animation: badgePop 300ms spring-bounce
```

---

### Toast Notifications

**Toast Container**:
```
Position: fixed
Bottom: 24px
Right: 24px
Display: flex
Flex-direction: column
Gap: 12px
Z-index: toast (700)
Max-width: 420px
Pointer-events: none
```

**Toast**:
```
Background: #1E293B (dark surface)
Color: white
Padding: 16px
Border-radius: lg (8px)
Box-shadow: xl
Display: flex
Align-items: flex-start
Gap: 12px
Pointer-events: auto
Position: relative
Overflow: hidden

Entrance:
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
  Animation: toastSlideIn 400ms spring-entrance

Exit:
  @keyframes toastSlideOut {
    from {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateX(120%) scale(0.9);
    }
  }
  Animation: toastSlideOut 300ms spring-exit forwards
```

**Toast with Gradient Accent** :
```
Border-left: 3px solid transparent
Position: relative

Success:
  Border-image: success-gradient 1
  
  ::before (glow):
    Content: ""
    Position: absolute
    Left: 0
    Top: 0
    Bottom: 0
    Width: 3px
    Background: success-gradient
    Filter: blur(8px)
    Opacity: 0.5

Error:
  Border-image: error-gradient 1
  Glow with error-gradient

Info:
  Border-image: primary-gradient 1
  Glow with primary-gradient
```

**Progress Bar**:
```
Position: absolute
Bottom: 0
Left: 0
Height: 3px
Background: rgba(255,255,255,0.2)
Transform-origin: left
Width: 100%

Animation:
  @keyframes progressShrink {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }
  Animation: progressShrink [duration] linear

Gradient version:
  Background: linear-gradient(
    90deg,
    transparent 0%,
    white 50%,
    transparent 100%
  )
  Background-size: 200% 100%
  
  Animation: 
    progressShrink [duration] linear,
    shimmer 1s ease-in-out infinite
```

---

### Loading States

**Spinner with Gradient** :
```
Width: 24px
Height: 24px
Border-radius: full
Position: relative

::before:
  Content: ""
  Position: absolute
  Inset: 0
  Border-radius: full
  Border: 3px solid transparent
  Border-top-color: primary
  Border-right-color: primary
  Animation: spin 800ms linear infinite

::after (gradient overlay):
  Content: ""
  Position: absolute
  Inset: 0
  Border-radius: full
  Background: conic-gradient(
    from 0deg,
    transparent 0deg,
    primary 360deg
  )
  Mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 3px),
    black calc(100% - 3px)
  )
  Animation: spin 800ms linear infinite

In buttons:
  Width: 16px
  Height: 16px
  Border-width: 2px
```

**Skeleton with Gradient Shimmer** :
```
Background: linear-gradient(
  90deg,
  bg-tertiary 0%,
  bg-secondary 25%,
  bg-tertiary 50%,
  bg-secondary 75%,
  bg-tertiary 100%
)
Background-size: 200% 100%
Border-radius: sm (4px)

Animation:
  @keyframes shimmerGradient {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  Animation: shimmerGradient 2s ease-in-out infinite

Entrance (staggered for multiple):
  @keyframes skeletonFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  Skeleton 1: animation-delay: 0ms
  Skeleton 2: animation-delay: 50ms
  Skeleton 3: animation-delay: 100ms
```

**Pulse Effect** (alternative):
```
@keyframes pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(0.98);
  }
}
Animation: pulse 2s spring-smooth infinite
```

---

### Hero Sections

**Hero Background**:
```
Background: linear-gradient(
  180deg,
  rgba(59,130,246,0.05) 0%,
  rgba(139,92,246,0.05) 50%,
  transparent 100%
)
Position: relative
Overflow: hidden

::before (animated gradient orb):
  Content: ""
  Position: absolute
  Top: -50%
  Right: -20%
  Width: 800px
  Height: 800px
  Background: radial-gradient(
    circle at center,
    rgba(59,130,246,0.15) 0%,
    rgba(139,92,246,0.1) 50%,
    transparent 70%
  )
  Border-radius: full
  Filter: blur(40px)
  
  Animation:
    @keyframes orbFloat {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      33% {
        transform: translate(-50px, -30px) scale(1.1);
      }
      66% {
        transform: translate(30px, 50px) scale(0.9);
      }
    }
    Animation: orbFloat 20s spring-smooth infinite

::after (second orb):
  Same but mirrored position (left side)
  Animation delay: 10s
```

**Hero Heading**:
```
Font: 5xl (48px) mobile, 6xl (60px) desktop
Weight: bold (700)
Line-height: tight (1.25)
Letter-spacing: tight (-0.025em)

Gradient text :
  Background: linear-gradient(
    135deg,
    #3B82F6 0%,
    #8B5CF6 50%,
    #EC4899 100%
  )
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  Background-clip: text
  Background-size: 200% 200%
  
  Animation:
    @keyframes gradientFlow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    Animation: gradientFlow 8s ease infinite
```

---

## PART 3: LAYOUT SYSTEM

### Container

```
Max-width: 1280px (default)
Margin: 0 auto
Padding: 0 16px (mobile), 0 24px (desktop)
Width: 100%

Narrow (articles, forms):
  Max-width: 720px

Wide:
  Max-width: 1440px

Full bleed:
  Max-width: none
```

---

### Grid Layouts

**Responsive Grid**:
```css
display: grid;
gap: 24px;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

/* Staggered animation for grid items */
.grid-item {
  animation: gridItemEnter 400ms spring-entrance backwards;
  animation-delay: calc(var(--item-index) * 80ms);
}

@keyframes gridItemEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Cap max delay */
.grid-item:nth-child(n + 9) {
  animation-delay: 640ms;
}
```

---

## PART 4: RESPONSIVE DESIGN

### Breakpoints

```
xs: 0-479px
sm: 480-639px
md: 640-767px
lg: 768-1023px
xl: 1024-1279px
2xl: 1280px+
```

### Mobile (<768px)

```
Padding: 16px
Button height: 44px
Touch targets: 44px minimum
Grid: 1 column
Reduce spacing by ~20%
```

### Desktop (≥768px)

```
Padding: 24px
Button height: 40px
Multi-column grids
Horizontal layouts
Enable magnetic hover effects
```

---

## PART 5: ACCESSIBILITY

### Focus States

```
All interactive elements:
  Outline: 2px solid primary-light
  Outline-offset: 2px
  Box-shadow: 0 0 0 4px rgba(59,130,246,0.1)
  Transition: all 200ms spring-smooth

Inputs (additional):
  Border-color: primary
  Box-shadow: inset 0 0 0 1px primary,
              0 0 0 4px rgba(59,130,246,0.1)
```

### Color Contrast

```
Normal text: 4.5:1 minimum
Large text (≥24px): 3:1 minimum
Interactive elements: 3:1 minimum

Gradient text:
  Ensure average luminance meets contrast requirements
  Test with both start and end colors
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Disable magnetic effects */
  .magnetic-hover {
    transform: none !important;
  }
  
  /* Disable gradient animations */
  .gradient-animated {
    animation: none !important;
    background-position: 0% 50% !important;
  }
}
```

---

## PART 6: IMPLEMENTATION CHECKLIST

### Foundation
- [ ] All spacing uses scale (4, 8, 12, 16, 20, 24...)
- [ ] All colors use semantic names
- [ ] Gradients defined for primary, success, warning, error
- [ ] Spring easing functions set as defaults
- [ ] Z-index scale used throughout

### Elements
- [ ] Primary buttons use gradient backgrounds
- [ ] Spring physics on all transitions (200ms spring-smooth default)
- [ ] Magnetic hover effects on buttons and cards
- [ ] Gradient text effect on hero headings
- [ ] Gradient shadows on primary button hover
- [ ] Animated gradient orbs in hero sections
- [ ] Staggered animations for lists/grids
- [ ] Gradient accent borders for special cards

### Animations
- [ ] All transitions use spring easing (spring-smooth, spring-bounce, spring-snappy)
- [ ] Entrance animations use spring-entrance
- [ ] Exit animations use spring-exit
- [ ] Staggered delays for multiple items (50-80ms per item)
- [ ] Error states shake with spring-bounce
- [ ] Success states pulse with spring-smooth
- [ ] Icons bounce on appear
- [ ] Close buttons rotate on hover
- [ ] Images scale on card hover
- [ ] Progress bars use gradient shimmer
- [ ] Reduced motion support implemented

### Gradients
- [ ] Primary buttons have primary-gradient background
- [ ] Gradient shadows match gradient colors
- [ ] Gradient borders on accent components
- [ ] Hero sections have gradient backgrounds
- [ ] Toasts have gradient accent bars
- [ ] Badges use gradients for emphasis
- [ ] Spinners use gradient animation
- [ ] Hero headings use animated gradient text
- [ ] Card accents use 4px gradient top border

### Polish
- [ ] Magnetic hover on buttons (0.05 intensity)
- [ ] Magnetic hover on cards (0.03 intensity)
- [ ] Button loading maintains width
- [ ] Input errors shake on validation
- [ ] Success states pulse
- [ ] Close button rotates 90° on hover
- [ ] Icons animate based on context (arrows move, downloads bounce)
- [ ] Gradient orbs float in hero backgrounds
- [ ] Skeleton shimmer uses gradient
- [ ] Toast progress bars use gradient

### Performance
- [ ] will-change added before animations
- [ ] will-change removed after animations
- [ ] Only transform/opacity animated
- [ ] Reduced motion media query implemented
- [ ] Gradient animations disabled for reduced motion
- [ ] Magnetic effects disabled for reduced motion

---

## CRITICAL RULES

1. **Always use spring easing** - Default: spring-smooth (200ms)
2. **Gradients for emphasis only** - Primary buttons, CTAs, accents
3. **Touch targets 44px minimum** on mobile
4. **Visible focus states** - 2px outline + 4px glow
5. **Body text 16px minimum** - Readability standard
6. **Stagger list animations** - 50-80ms delay per item
7. **Magnetic hover subtle** - Max 0.05 intensity
8. **Respect prefers-reduced-motion** - Disable all animations
9. **Gradient text sparingly** - Hero headings only
10. **One h1 per page** - SEO and accessibility

---
