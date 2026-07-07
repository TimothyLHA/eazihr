---
name: Emerald & Mint Professional
colors:
  surface: '#fff9ec'
  surface-dim: '#e0dac9'
  surface-bright: '#fff9ec'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3e2'
  surface-container: '#f4eddd'
  surface-container-high: '#eee8d7'
  surface-container-highest: '#e9e2d2'
  on-surface: '#1e1c12'
  on-surface-variant: '#3f4944'
  inverse-surface: '#333025'
  inverse-on-surface: '#f7f0df'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#1b6b51'
  primary: '#004532'
  on-primary: '#ffffff'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#8bd6b6'
  secondary: '#1b6b4f'
  on-secondary: '#ffffff'
  secondary-container: '#a6f2cf'
  on-secondary-container: '#247155'
  tertiary: '#004533'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d5d49'
  on-tertiary-container: '#95d4ba'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#a6f2cf'
  secondary-fixed-dim: '#8bd6b4'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#b0f0d6'
  tertiary-fixed-dim: '#95d3ba'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#0b513d'
  background: '#fff9ec'
  on-background: '#1e1c12'
  surface-variant: '#e9e2d2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
This design system embodies a "Fresh Professional" aesthetic, blending the stability of traditional corporate design with a modern, organic vitality. The target audience includes professionals in sustainability, finance, or wellness who value clarity and a sense of calm efficiency.

The style leverages **Minimalism** with a **Tactile** edge. It utilizes heavy whitespace and a restricted palette to maintain focus, while subtle tonal layering provides a sense of physical structure. The interface should feel breathable and deliberate, evoking an emotional response of trust, freshness, and high-end quality.

## Colors
The palette is built on a "Deep Organic" foundation. 
- **Primary Emerald (#065F46):** Used for brand-heavy elements, primary actions, and high-emphasis navigation.
- **Secondary Mint (#A7F3D0):** Utilized for accents, success states, and soft highlights. It acts as a bridge between the deep primary and the light background.
- **Surface Cream (#FFF8E7):** Replaces pure white as the primary background to reduce eye strain and provide a premium, paper-like feel.
- **Tertiary Deep Emerald (#064E3B):** Reserved for maximum contrast text on Cream surfaces to ensure AA/AAA accessibility compliance.

## Typography
The system uses **Inter** exclusively to maintain a systematic, utilitarian, and highly legible profile. 

Headline levels utilize tighter letter spacing and heavier weights to provide a strong visual anchor against the soft Cream background. Body text maintains a generous line height (1.6) to enhance readability. For text appearing on Mint accents, use the Primary Emerald color for the font to ensure sufficient contrast. Labels use a slight tracking increase for clarity at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** logic within a max-width container. 
- **Desktop:** 12-column grid, 24px gutters, 80px side margins.
- **Tablet:** 8-column grid, 24px gutters, 40px side margins.
- **Mobile:** 4-column grid, 16px gutters, 16px side margins.

Spacing follows a linear 8pt rhythm. Component internal padding should be generous to reinforce the minimalist aesthetic. Use `lg` and `xl` spacing for vertical section separation to give content "room to breathe" on the Cream surface.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows. 

1.  **Base:** The Cream (#FFF8E7) surface.
2.  **Raised:** A slightly darker cream/beige (#F3F1E0) used for card backgrounds or secondary sections.
3.  **Floating:** Elements like menus or modals use a very soft, high-diffusion shadow: `0 10px 30px rgba(6, 95, 70, 0.08)`. The slight Emerald tint in the shadow keeps it harmonious with the brand colors.
4.  **Borders:** 1px solid strokes in a desaturated version of Emerald at 10% opacity are used to define boundaries without adding visual noise.

## Shapes
The design system utilizes **Rounded** geometry (0.5rem base) to convey approachability and modernity. 
- **Buttons and Inputs:** 0.5rem (8px) corner radius.
- **Cards and Containers:** 1rem (16px) corner radius.
- **Overlays/Modals:** 1.5rem (24px) corner radius.
This moderate rounding strikes a balance between the precision of professional tools and the softness of the brand's organic color palette.

## Components
- **Buttons:** Primary buttons use the Emerald background with Cream text. Secondary buttons use the Mint background with Emerald text. Ghost buttons use an Emerald outline.
- **Chips:** Small, Pill-shaped (rounded-xl). Use Mint background with 80% opacity and Emerald text for a "fresh" badge feel.
- **Input Fields:** Cream background with a 1px border. On focus, the border thickens and changes to Emerald, with a soft Mint outer glow.
- **Lists:** Separated by thin 1px horizontal lines in a soft beige. Hover states should use a subtle shift to a Mint-tinted background.
- **Cards:** Use the "Raised" elevation tier. No heavy shadows; instead, use a 1px border that is only slightly darker than the Cream base.
- **Checkboxes/Radios:** When active, they are filled with Emerald and feature a white/cream checkmark.
- **Progress Indicators:** Use Mint for the track and Emerald for the active progress bar to signify growth and completion.