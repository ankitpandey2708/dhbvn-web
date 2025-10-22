## A. Layout & Structure
1. Use a fixed spacing scale (e.g., 4px or 8px increments).  
2. Group related elements together; separate unrelated ones clearly.  
3. Maintain consistent vertical rhythm between sections.  
4. Add padding inside containers — no content should touch edges.  
5. Apply consistent spacing inside all components (buttons, cards, modals).  
6. Use a uniform grid system for alignment and rhythm.  
7. Avoid overcrowding or too many elements in a single row.  

---

## B. Typography
1. Choose one font family with up to 3 weights (regular, medium, bold).  
2. Define a clear type scale (e.g., 14, 16, 20, 24, 32).  
3. Use hierarchy via size, weight, and color — not just size.  
4. Keep line height comfortable (1.4–1.6 for body).  
5. Limit body text width to 45–75 characters.  
6. Use Sentence case consistently across the UI.  
7. Keep secondary text visually distinct (lighter, smaller, or muted).  
8. Avoid all-caps or thin fonts for long content.  

---

## C. Color & Contrast
1. Use a limited palette; derive shades from base colors.  
2. Keep neutral backgrounds so accent colors stand out.  
3. Maintain strong contrast for readability and accessibility.  
4. Don’t rely on color alone — pair with icons or text labels.  
5. Avoid decorative or purposeless colors/patterns.  
6. Use gradients only when they improve clarity or legibility.  

---

## D. Visual Hierarchy
1. Define one clear primary action per screen.  
2. Use secondary actions with lower visual weight.  
3. Establish hierarchy through spacing, contrast, and typography.  
4. Use whitespace strategically before adding borders or lines.  
5. Guide user focus with alignment and visual anchors.  

---

## E. Components & Styling

### Borders, Corners, Shadows
1. Use borders sparingly — rely on spacing and contrast first.  
2. Define consistent border thickness and color rules.  
3. Set a clear radius scale (e.g., 4px, 8px, 16px).  
4. Apply uniform corner radius across related components.  
5. Keep shadow direction consistent; use minimal elevation levels.  

### Icons & Imagery
1. Stick to one icon set with consistent stroke and style.  
2. Match icon size to text height.  
3. Keep icon placement consistent (e.g., always left of text).  
4. Avoid decorative or mixed-style icons.  
5. Crop images to highlight the subject.  
6. Keep avatar shapes and placeholders consistent.  

---

## F. Interactivity & Inputs

### Buttons
1. Minimum tap/click size: 44px.  
2. Keep button heights consistent within a layout.  
3. Use clear hierarchy:  
   - **Primary:** Solid  
   - **Secondary:** Outline  
   - **Tertiary:** Muted or text-only  
4. Keep hover and active states subtle and consistent.  
5. Always include visible focus states for keyboard users.  
6. Disabled buttons should look inactive but readable.  

### Forms
1. Keep labels close — typically above inputs.  
2. Use clear, sentence-case labels; don’t rely on placeholders.  
3. Make labels clickable for checkboxes and radios.  
4. Size inputs relative to expected content length.  
5. Indicate required fields with symbols, not just color.  
6. Provide inline hints or format examples.  
7. Show actionable error messages inline.  
8. Keep form actions aligned and ordered consistently.  

---

## G. Data Presentation
1. Use subtle row shading or dividers for readability.  
2. Make headers stand out through weight or background color.  
3. Right-align numbers for easy comparison.  
4. Maintain consistent column widths and row heights.  
5. Keep table spacing even across related views.  

---

## H. System States & Feedback
1. Design all states — empty, loading, success, and error.  
2. Empty states should guide users on what to do next.  
3. Prefer skeletons or progress indicators over spinners alone.  
4. Provide immediate feedback after any action.  
5. Write specific, fixable error messages.  
6. Avoid dead ends — always suggest the next step.  

---

## I. Motion & Interaction Behavior
1. Keep animations short (200–300ms) and consistent.  
2. Use motion to explain flow or hierarchy, not decoration.  
3. Apply one easing and duration system across the product.  
4. Favor direct manipulation (drag, click-to-edit) when possible.  

---

## J. Systemization & Reuse
1. Build and document a shared design system (spacing, type, colors, components).  
2. Reuse components — avoid one-off solutions.  
3. Keep all style rules (radius, shadow, spacing, casing) consistent.  
4. Prioritize consistency and clarity over novelty.  

---

## K. Responsiveness
1. Design mobile-first, then scale up.  
2. Use flexible grids (flex/grid) — avoid fixed widths.  
3. Define clear breakpoints (mobile, tablet, desktop).  
4. Reflow layouts intelligently — don’t just shrink.  
5. Keep key actions visible on small screens.  
6. Scale typography and spacing with relative units (`em`, `rem`).  

---