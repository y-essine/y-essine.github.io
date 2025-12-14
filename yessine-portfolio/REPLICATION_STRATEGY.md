# Precise Replication Strategy for Yassine's Resume Website

## Overview
This document outlines the exact strategy to replicate the original `page.html` Framer site in Next.js with pixel-perfect accuracy.

## Phase 1: Analysis & Data Extraction

### 1.1 Color Tokens Extraction
**Status**: Not Started
**Priority**: High

Extract all color tokens from the HTML:
```
--token-e2b3e115-6772-4873-ba11-049b11b30d8f: rgb(164, 164, 164)  // Muted text
--token-0f1b60e9-1b81-4863-983f-db9afa130b6b: rgb(255, 255, 255)  // White text
--token-ac9cb30b-a01e-4275-be89-8cf1cbb70095: rgb(43, 43, 43)     // Border
--token-92d8255a-feac-4aed-ab72-dbce294d5959: rgb(20, 20, 23)     // Background dark
--token-c89ea9f4-1c08-4225-bee9-c2e710a47467: rgb(208, 165, 139)  // Accent light
--token-d0fdb86e-048a-4262-a382-354e31e865d4: rgb(66, 52, 43)     // Accent dark
```

**Action Items**:
- [ ] Run `analyze_html.py` to extract all color tokens
- [ ] Create CSS variables mapping in `globals.css`
- [ ] Document hex equivalents for each RGB value

### 1.2 Typography Specifications
**Status**: In Progress
**Priority**: Critical

#### Font Family
- Primary: Inter (Google Fonts)
- Weights: 400 (regular), 500 (medium), 700 (bold)
- Styles: normal, italic

#### Text Styles to Extract

**H1 (Name)**:
- Font size: Look for largest heading in HTML
- Line height: Extract from inline styles
- Font weight: 700 (bold)
- Letter spacing: Extract from --letter-spacing
- Transform: Check for any text-transform properties

**H2 (Section Titles - "Compétences", "Expérience")**:
- Font size: Extract from framer-styles-preset-1jzdcro
- Line height: Extract exact value
- Font weight: 700
- Color: White (#ffffff)

**H3 (Subsection Titles)**:
- Font size: Extract from framer-styles-preset-3yhvoo or D9fLq48kA
- Line height: Extract value
- Font weight: 400 or 700 (determine from context)
- Color: Varies (white or muted)

**Body Text (Paragraphs)**:
- Font size: 16px base (verify)
- Line height: Extract exact value
- Font weight: 400
- Color: rgb(164, 164, 164) for muted text

**Action Items**:
- [ ] Extract all `framer-styles-preset-*` definitions
- [ ] Map preset IDs to actual CSS properties
- [ ] Document exact font-size, line-height, letter-spacing for each text element
- [ ] Create TypeScript types for text styles

### 1.3 Layout Measurements
**Status**: Not Started
**Priority**: High

#### Container Widths
- Max width: Extract from .framer-* classes
- Padding: Extract horizontal padding values
- Breakpoints: Identify responsive behavior

#### Spacing System
- Gap values: Extract all gap: properties
- Margin values: Extract all margin: properties
- Padding values: Extract all padding: properties

#### Grid Specifications
- Hero section: 2-column layout specifications
- Competences: Determine exact grid columns and gaps
- Experience: Single column or 2-column layout

**Action Items**:
- [ ] Run layout extraction script
- [ ] Document all spacing tokens (8px, 12px, 16px, 24px, etc.)
- [ ] Create Tailwind spacing scale or CSS variables
- [ ] Map Framer layout classes to Tailwind utilities

### 1.4 Component Structure
**Status**: Partial
**Priority**: High

#### Navigation Bar
- Height: Extract exact px value
- Background: Backdrop blur + opacity
- Border: Bottom border specifications
- Sticky behavior: Position and z-index

#### Hero Section
- Name typography: Exact font size (80px lg:120px?)
- Profile image: Size, rotation, border-radius
- About card: Padding, border, background
- Bio text: Spacing and styling

#### Competences Grid
- Grid columns: 1 sm:2
- Gap between cards: Extract exact value
- Card padding: Extract exact value
- Card border: Color and width

#### Work Experience
- Layout: 2-column with title on left
- Timeline styling: If any
- Job card specifications: Padding, borders, gaps

**Action Items**:
- [ ] Create component hierarchy diagram
- [ ] Document exact props for each component
- [ ] Map Framer animations (if any) to Framer Motion
- [ ] Extract hover states and transitions

## Phase 2: Precise Measurement Extraction

### 2.1 Run Python Scripts

```bash
# Install dependencies
pip install beautifulsoup4 lxml

# Run analysis script
python scripts/analyze_html.py

# Run content extraction
python scripts/extract_content.py
```

**Expected Outputs**:
- `analysis/html_analysis.json`: All CSS variables, classes, typography specs
- `app/data/resume_extracted.json`: Structured content data

### 2.2 Manual Verification Points

For elements that scripts might miss:
1. Open `page.html` in Chrome DevTools
2. Inspect each section and note:
   - Computed font sizes
   - Computed line heights
   - Exact color values (RGB)
   - Border radiuses
   - Box shadows
   - Transform properties (rotation, scale)
   - Transition durations

### 2.3 Screenshot Comparison

1. Take screenshots of original at breakpoints:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1440px width

2. Create comparison tool:
   - Overlay screenshots side-by-side
   - Use image diff to highlight discrepancies

## Phase 3: Component Precision Implementation

### 3.1 Design Token System

Create `app/styles/tokens.ts`:
```typescript
export const colors = {
  background: 'rgb(20, 20, 23)',
  foreground: 'rgb(255, 255, 255)',
  muted: 'rgb(164, 164, 164)',
  mutedDark: 'rgb(143, 143, 143)',
  border: 'rgb(43, 43, 43)',
  accent: 'rgb(66, 52, 43)',
  accentLight: 'rgb(208, 165, 139)',
};

export const typography = {
  fontSizes: {
    h1: 'clamp(80px, 10vw, 120px)',
    h2: '48px',
    h3: '16px',
    body: '16px',
    small: '14px',
  },
  lineHeights: {
    tight: '0.85',
    normal: '1.2',
    relaxed: '1.5',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
};

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};
```

### 3.2 Component Refinement Checklist

For each component, verify:
- [ ] Exact font size matches original
- [ ] Line height matches original
- [ ] Letter spacing matches original
- [ ] Colors match (use RGB values, not approximations)
- [ ] Spacing (margin/padding) matches
- [ ] Border properties match
- [ ] Border radius matches
- [ ] Hover states match
- [ ] Transitions match (duration, easing)
- [ ] Responsive behavior matches

### 3.3 Framer Motion Animations

If original has animations:
1. Identify animation triggers
2. Note animation properties (opacity, translateY, etc.)
3. Extract timing functions
4. Implement with Framer Motion

## Phase 4: Quality Assurance

### 4.1 Pixel-Perfect Verification

Use browser extension or tool to overlay original and new version:
1. Install "Pixel Perfect" Chrome extension
2. Load original screenshot
3. Compare pixel-by-pixel

### 4.2 Responsive Testing

Test at exact breakpoints:
- 375px (Mobile S)
- 414px (Mobile L)
- 768px (Tablet)
- 1024px (Laptop)
- 1440px (Desktop)
- 1920px (Desktop L)

### 4.3 Cross-Browser Testing

Verify in:
- Chrome
- Firefox
- Safari
- Edge

## Phase 5: Optimization

### 5.1 Performance
- Ensure fonts load optimally (font-display: swap)
- Optimize images
- Minimize CSS

### 5.2 Accessibility
- Proper heading hierarchy
- Alt text for images
- ARIA labels where needed
- Keyboard navigation

## Tools Required

### Scripts (Created)
- [x] `scripts/analyze_html.py` - Extract CSS and layout specs
- [x] `scripts/extract_content.py` - Extract structured content

### Additional Tools Needed
- [ ] `scripts/compare_screenshots.py` - Visual diff tool
- [ ] `scripts/extract_animations.py` - Extract animation specs
- [ ] `scripts/generate_types.py` - Generate TypeScript types from analysis

### Manual Tools
- Chrome DevTools
- Pixel Perfect extension
- ColorZilla (for exact color picking)
- WhatFont (for font verification)

## Measurement Reference Sheet

### Key Measurements to Extract

```
NAVIGATION:
- Height: ___ px
- Padding: ___ px horizontal
- Background: rgba(___, ___, ___, ___)
- Backdrop blur: ___ px
- Border bottom: ___ px solid rgb(___, ___, ___)

HERO SECTION:
- Name font size desktop: ___ px
- Name font size mobile: ___ px
- Name line height: ___
- Name letter spacing: ___ em
- Profile image size: ___ px × ___ px
- Profile image rotation: ___ deg
- Profile border radius: ___ px
- About card padding: ___ px
- About card border: ___ px solid rgb(___, ___, ___)
- Bio text font size: ___ px
- Bio text line height: ___
- Bio text color: rgb(___, ___, ___)

COMPETENCES SECTION:
- Section title font size: ___ px
- Section title line height: ___
- Card padding: ___ px
- Card border: ___ px solid rgb(___, ___, ___)
- Grid gap: ___ px
- List item spacing: ___ px
- List item font size: ___ px
- List item color (muted): rgb(___, ___, ___)

EXPERIENCE SECTION:
- Job title font size: ___ px
- Job title font weight: ___
- Job title color: rgb(___, ___, ___)
- Meta text (period, company, location) font size: ___ px
- Meta text color: rgb(___, ___, ___)
- Description font size: ___ px
- Description line height: ___
- Description color: rgb(___, ___, ___)
- "Current" badge background: rgb(___, ___, ___)
- "Current" badge text color: rgb(___, ___, ___)
- "Current" badge padding: ___ px ___ px
- "Current" badge border radius: ___ px
- Job entry padding bottom: ___ px
- Job entry border bottom: ___ px solid rgb(___, ___, ___)
```

## Next Steps

1. **Immediate**: Run extraction scripts to populate measurement sheet
2. **Phase 1**: Complete color token extraction and mapping
3. **Phase 2**: Extract and document all typography specifications
4. **Phase 3**: Map layout measurements and create spacing system
5. **Phase 4**: Refine components with exact measurements
6. **Phase 5**: Visual comparison and iteration until pixel-perfect

## Notes

- Framer uses custom CSS variables extensively - map these to our design tokens
- Some measurements may be viewport-relative (vw, vh) - document these separately
- Animation timings should be extracted from transition properties
- Hover states and interactive elements need special attention
- The original uses Framer Motion - consider using it for animations

## Success Criteria

✅ All measurements match within 1px
✅ All colors match exactly (RGB values)
✅ All typography specs match (size, weight, height, spacing)
✅ Responsive behavior identical at all breakpoints
✅ Animations match (if any)
✅ Hover states match
✅ Layout structure matches
✅ Visual diff shows < 1% difference
