---
name: Executive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-page: 40px
  sidebar-width: 280px
---

## Brand & Style
The design system is engineered for high-end HR management, prioritizing clarity, authority, and professional efficiency. The brand personality is "Quietly Powerful"—it avoids unnecessary ornamentation in favor of a hyper-organized, SaaS-inspired aesthetic that feels both technical and human-centric.

The style is **Refined Minimalism**. It utilizes expansive whitespace to reduce cognitive load during complex administrative tasks. Drawing inspiration from top-tier Behance editorial presentations, the interface employs high-fidelity hierarchy, subtle depth through tonal layering, and a meticulous attention to alignment that evokes a sense of premium reliability.

## Colors
The palette is anchored by **Deep Navy (#0F172A)**, used for structural elements like sidebar navigation and primary headers to establish a foundation of stability. **Crisp White (#FFFFFF)** serves as the primary canvas, ensuring maximum legibility for data-heavy tables and profiles.

Functional accents are applied with surgical precision:
- **Emerald (#10B981)**: Reserved strictly for positive growth metrics, successful status indicators, and "clock-in" confirmations.
- **Amber (#F59E0B)**: Used for high-visibility warnings, late attendance logs, and pending approvals.
- **Slate Neutrals**: A range of cool greys is used for borders and secondary text to maintain a low-contrast, sophisticated atmosphere.

## Typography
**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in data-dense environments. The typographic scale is highly structured to facilitate "scanning" rather than "reading."

Large headings use tighter letter-spacing and semi-bold weights to command attention, while small labels use uppercase tracking to differentiate meta-data from body content. For administrative density, `body-md` (14px) is the workhorse for table data and form inputs.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 280px, while the main content area occupies a fluid space up to a maximum container width of 1440px. 

A strict **8px grid system** governs all internal spacing. Layouts should utilize generous inner padding (24px to 32px) within cards to maintain the "Behance-style" airy aesthetic. 
- **Desktop**: 12-column grid, 24px gutters.
- **Tablet**: 8-column grid, 16px gutters.
- **Mobile**: 4-column grid, 16px margins, vertical stack for all cards.

## Elevation & Depth
This design system uses **Tonal Layers** supplemented by **Ambient Shadows**. 

Depth is primarily communicated by placing white cards on a light grey background (`#F8FAFC`). Shadows are used sparingly; they should be highly diffused (20px - 40px blur) with very low opacity (3-5%) and a slight navy tint to harmonize with the primary color. There are three levels of elevation:
1. **Flat**: For secondary buttons and decorative elements.
2. **Low**: For standard data cards and input fields.
3. **High**: Reserved for active modals, dropdown menus, and hovered state cards.

## Shapes
The shape language is **Rounded**, striking a balance between the clinical sharpness of legacy enterprise software and the soft playfulness of consumer apps. 

A standard `0.5rem` (8px) radius is applied to all primary containers, buttons, and input fields. This consistent rounding creates a cohesive, modern UI rhythm. Large "Hero" cards or dashboard widgets may scale up to `rounded-lg` (16px) to emphasize their role as primary content containers.

## Components
- **Buttons**: Primary buttons are Deep Navy with white text. Secondary buttons use a subtle Slate-100 ghost background. All buttons use 14px Semi-bold text.
- **Input Fields**: Minimalist style with a 1px border (#E2E8F0). On focus, the border transitions to Deep Navy with a 2px soft outer glow.
- **Cards**: Pure white background, 8px corner radius, and a subtle 1px border. No heavy shadows; use a 4px blur ambient shadow only.
- **Chips/Badges**: Small, capsule-shaped (pill) with low-opacity background fills (e.g., Emerald at 10% opacity for "Active" status).
- **Icons**: 24px grid, 1.5pt stroke width, using thin line icons. Icons should always be monochromatic (Navy or Slate) unless indicating a specific status.
- **Data Tables**: Zebra-striping is avoided. Use thin 1px horizontal dividers and ample vertical cell padding (16px) to ensure scannability.