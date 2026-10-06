---
name: Tasty
description: A premium-casual burger and sandwich kitchen presented like a grower's best harvest, as a framed crate label in flat condiment inks.
colors:
  tomato: "#d63b20"
  tomato-deep: "#b32f17"
  tomato-bright: "#e8482c"
  pickle: "#1f4d3a"
  pickle-deep: "#163829"
  pickle-soft: "#bfd6c8"
  mustard: "#f4b41a"
  mustard-deep: "#e0a10c"
  label-stock: "#fffdf8"
  surface: "#ffffff"
  pale-pickle: "#eef2ec"
  ink: "#15201b"
  ink-muted: "#4e5b53"
  ink-faint: "#6e7a72"
  line: "#d9ded8"
  basil: "#2f7d4f"
  chilli: "#c7331b"
  steel: "#2d6a8e"
  overlay: "#0c1410"
typography:
  display:
    fontFamily: "Big Shoulders Inline Display, Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.55rem + 4.6vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Big Shoulders Display Variable, Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.55rem + 4.6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.005em"
  title:
    fontFamily: "Big Shoulders Display Variable, Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 1.45rem + 3.1vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "0.005em"
  subtitle:
    fontFamily: "Big Shoulders Display Variable, Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.1vw, 2.125rem)"
    fontWeight: 800
    lineHeight: 1.02
  lead:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.45vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  cell:
    fontFamily: "Big Shoulders Display Variable, Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  label:
    fontFamily: "Big Shoulders Stencil Display, Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  price:
    fontFamily: "Big Shoulders Display Variable, Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
rounded:
  control: "10px"
  card: "16px"
  panel: "20px"
  block: "28px"
  pill: "9999px"
spacing:
  gutter-sm: "8px"
  gutter-md: "12px"
  gutter-lg: "16px"
  container-x-sm: "20px"
  container-x-md: "32px"
  container-x-lg: "48px"
  section-sm: "64px"
  section-md: "80px"
  section-lg: "96px"
  container-max: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.surface}"
    typography: "{typography.cell}"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.tomato-deep}"
    textColor: "{colors.surface}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.cell}"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "56px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.label-stock}"
  button-inverse:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.tomato-deep}"
    typography: "{typography.cell}"
    rounded: "{rounded.control}"
    height: "56px"
  nav-cell:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.cell}"
    padding: "0 16px"
    height: "44px"
  nav-cell-active:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.surface}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  sticker-price:
    backgroundColor: "{colors.mustard}"
    textColor: "{colors.ink}"
    typography: "{typography.price}"
    rounded: "{rounded.pill}"
    size: "76px"
  sticker-chefs-pick:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.surface}"
    typography: "{typography.cell}"
    rounded: "{rounded.pill}"
    padding: "4px 14px"
  card-dish:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  block-field:
    backgroundColor: "{colors.pickle}"
    textColor: "{colors.label-stock}"
    rounded: "{rounded.block}"
---

# Design System: Tasty

## Overview

**Creative North Star: "The Crate Label"**

Tasty presents every dish the way a grower presented their best harvest: framed on a lithographed label, printed in flat condiment inks, with a die-cut sticker for every state. The page is label stock. Coloured sections stack on it as inset cut blocks with rounded corners and narrow gutters. The food always sits inside a window: an arch on cards, heroes and dish pages, and a roundel for the chef's special. Typography is condensed crate lettering in caps over a plain, readable Barlow body.

The world is deliberately bright and confident. It refuses the dark-moody-gold restaurant template (near-black grounds, gold hairlines, a serif display). Density is premium-casual: big food, few words, generous section padding (64–96px), and tight groups inside each block. Motion is one authored moment per surface. The label is stuck on during the splash, the hero window opens and the price sticker lands; everything else is a short rise or a rear-plane drift.

**Key Characteristics:**
- Flat inks only: pickle fields, tomato action, mustard stickers and frames, on label-white stock.
- Big Shoulders caps everywhere a label would print (headings, prices, buttons, navigation), with Barlow for reading.
- Arched photo windows, round die-cut stickers with a white cut edge, double-rule mustard frames.
- Depth from overlap: stickers over windows, labels over fields.
- Ruled cells for navigation and filters, where the active cell floods tomato.
- One authored motion moment per surface; the reading plane moves only when the reader scrolls.

## Colors

A full set of condiment inks, used flat: pickle green owns large fields, tomato is the single action ink, and mustard marks stickers, frames and highlights.

### Primary
- **Tomato Action Ink** (#D63B20): primary buttons, the active navigation and filter cell, the chef's-pick tag, sale and promotion stickers. White text on it reaches 4.7:1. Hover and pressed states go one step deeper to **Tomato Deep** (#B32F17), which is also the colour for tomato text links on light grounds. **Tomato Bright** (#E8482C) is the brighter tomato, reserved for ink that sits on dark fields and for the hero's flat 3D slices.

### Secondary
- **Pickle Field** (#1F4D3A): page headers, the hero label, the footer, the atmosphere block and the admin sidebar. Its deeper step, **Pickle Deep** (#163829), backs empty photo windows and the mobile menu. On pickle, secondary text uses **Pickle Soft** (#BFD6C8, 6.3:1), never grey.

### Tertiary
- **Mustard Sticker** (#F4B41A): price stickers, the double-rule label frame on dark headers, the Why Tasty field, stencil labels on dark grounds, and text selection. Ink text on it reaches 9:1. **Mustard Deep** (#E0A10C) is its hover step and the warning colour.

### Neutral
- **Label Stock** (#FFFDF8): the page ground, crisp rather than cream. It is also the cut edge on every sticker and the text colour on dark fields.
- **White** (#FFFFFF): cards, panels and form controls.
- **Pale Pickle** (#EEF2EC): the tinted Come By block, the admin background and image placeholders.
- **Green-Black Ink** (#15201B): body text (16:1 on label stock) and the ink block behind the chef's special.
- **Ink Muted** (#4E5B53): secondary text (7:1). **Ink Faint** (#6E7A72): placeholders and tertiary metadata.
- **Line** (#D9DED8): hairlines, card borders and input strokes.
- Status inks: **Basil** (#2F7D4F) for available and saved, **Chilli** (#C7331B) for errors and destructive actions, **Steel** (#2D6A8E) for the focus ring and notes on light grounds. **Overlay** (#0C1410) sits behind dialogs and the lightbox.

### Named Rules
**The Condiment Inks Rule.** Brand surfaces are flat ink: no gradient fills, no glows, no glass or blur. The loading shimmer is the only gradient on the site; it marks a state, not an ink.

**The One Action Ink Rule.** Tomato means "act here". It fills primary buttons and the current cell; it is never a decorative background behind body text, except as a full section field (Stacked by Hand) whose buttons then invert to label stock.

**The Label Stock Rule.** The ground is #FFFDF8. Don't warm it toward cream or beige; the warmth comes from the inks and the food.

## Typography

**Display Font:** Big Shoulders Inline Display (fallback: Big Shoulders Display, Arial Narrow)
**Headline Font:** Big Shoulders Display, variable, weight 800 (fallback: Arial Narrow)
**Label Font:** Big Shoulders Stencil Display, weight 700
**Body Font:** Barlow, 400–700 (fallback: system UI sans)

**Character:** tall, condensed crate lettering in caps, the kind stencilled on a fruit crate or printed across a label, over a calm humanist sans that reads easily at length. All four faces are self-hosted through Fontsource.

### Hierarchy
- **Display** (Inline 900, `clamp(2.75rem, 1.55rem + 4.6vw, 6rem)`, line height 0.9): the TASTY wordmark and the few display titles: THE MENU, GALLERY, WHY TASTY, HUNGRY YET?
- **Headline** (Display 800, the same clamp, 0.9, uppercase): page h1s (the hero line, dish names, page titles).
- **Title** (Display 800, `clamp(2.25rem, 1.45rem + 3.1vw, 4.25rem)`, 0.94, uppercase): section h2s.
- **Subtitle** (Display 800, `clamp(1.5rem, 1.2rem + 1.1vw, 2.125rem)`, 1.02, uppercase): h3s and dish names on cards (1.65rem on cards).
- **Lead** (Barlow 400, `clamp(1.125rem, 1rem + 0.45vw, 1.375rem)`, 1.5): intro paragraphs, held to 34–48ch.
- **Body** (Barlow 400, 1.0625rem, 1.6): reading text, held to 54–65ch; balanced headings, pretty paragraphs.
- **Cell** (Display 800, 1.0625rem, tracking 0.06em, uppercase): navigation and filter cells, buttons (1–1.125rem), sticker lettering.
- **Label** (Stencil 700, 0.875rem, tracking 0.14em, uppercase): field labels on dark headers, fact-table keys, footer column heads, the announcement ticker (1.125rem, tracking 0.12em).

### Named Rules
**The Condensed Caps Rule.** Every heading, price, button and navigation cell is set in Big Shoulders caps. Reading text is Barlow in sentence case, never caps.

**The Inline Moment Rule.** Big Shoulders Inline is for the wordmark and display titles only, never below h2 size, in a button or in running text.

**The Counter Rule.** Prices sit on tabular, lining figures (`.tnum`), so price columns align like a shop counter.

## Layout

The page is a vertical stack of cut blocks. Coloured sections are inset from the viewport edge (8px, 12px from 640px, 16px from 1024px) with 28px corners and an 8–16px gutter between neighbours; label-stock sections run full width. Content sits in a 1440px container with 20 / 32 / 48px side padding (mobile / 640px / 1024px). Sections breathe with 64 / 80 / 96px vertical padding.

The hero is one framed label filling the first viewport: a mustard double rule inset inside the pickle block. The text column (7/12) sits bottom-left and the arched dish window (5/12) sits on the right. A ticker band runs below the frame. On short laptop screens the wordmark narrows (it is 3.09:1) so the whole label stays in view. On phones the window leads and the wordmark overlaps its bottom edge.

Grids are editorial rather than uniform. The gallery packs a repeating twelve-beat pattern of feature, tall, wide and standard tiles (2 columns, 4 from 768px; 168–224px rows) that ends flush after 8 or 12 tiles. Featured dishes run as a swipe row on phones and as a pinned horizontal scrub from 1024px. Breakpoints are 640, 768, 1024, 1280 and 1536px. Nothing scrolls sideways at the page level.

## Elevation & Depth

Depth is overlap first. Stickers sit across photo windows, the label frame sits on its field, a smaller tilted photo sits on a larger arched one, and the hero's flat 3D ingredients drift behind everything. Shadows are soft and offset, and they only lift a layer that already sits on another: a card on hover, a dialog over the overlay, the navigation bar once it turns solid, the inset story photo. Surfaces are flat at rest.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(12 20 16 / 0.06), 0 10px 28px -14px rgb(12 20 16 / 0.22)`): admin panels and stat cards, and info cards that sit on a tinted block (opening hours, the contact form).
- **Lift** (`box-shadow: 0 22px 44px -20px rgb(12 20 16 / 0.42)`): a dish card on hover, the inset photo in the story section, the round "message sent" sticker.
- **Overlay** (`box-shadow: 0 28px 70px -18px rgb(12 20 16 / 0.45), 0 10px 24px -12px rgb(12 20 16 / 0.25)`): dialogs, toasts, dropdowns, chart tooltips and the admin drawer.
- **Solid bar** (`box-shadow: 0 1px 0 #D9DED8, 0 10px 30px -20px rgb(12 20 16 / 0.35)`): the navigation strip once the visitor scrolls.

### Named Rules
**The Layers-On-Layers Rule.** Nothing floats alone. A shadow is allowed only where one layer overlaps another, and it always has an offset and a soft blur.

**The Rear-Plane Rule.** Parallax and 3D live only on rear layers (the photo inside its window, the flat ingredients behind the hero). The reading plane moves only when the reader scrolls it.

## Shapes

The signature silhouette is the **arch window**: a semicircular top over a small bottom radius (about 18px on hero and dish windows; 50%/30% elliptical shoulders over 10px on cards), with a 3px mustard rim on dark fields. Stickers are true circles or ovals with a 3px label-stock cut edge, always slightly rotated (−10° to +10°). The chef's special is the one roundel window (a circle with a 6px mustard rim).

Corners otherwise follow a four-step scale: 10px for controls, 16px for cards and rectangular photos, 20px for panels, 28px for section blocks. Rules are drawn, not shadowed: 1.5px dividers between ruled cells and fact rows, and the label frame's heavy 3px rule with a fine 1.5px rule 10px inside it.

## Components

### Buttons
Confident printed tags: condensed caps with a forward arrow that slides on hover.
- **Shape:** gently rounded (10px); heights 36 / 44 / 56px (sm / md / lg).
- **Primary:** tomato with white Big Shoulders caps (tracking 0.06em), 28px side padding at lg; hover deepens to Tomato Deep and the trailing arrow moves 4px forward.
- **Outline:** a 2px current-colour rule, transparent fill; hover floods with the ink (inverting text). On pickle fields it uses label-stock rules and floods label stock.
- **Inverse:** label stock with Tomato Deep text, for buttons on tomato fields.
- **Focus:** a 2px Steel ring offset 2px (mustard on dark fields). Press nudges down 1px; disabled drops to 50% opacity.

### Ruled Cells (navigation, filters, language)
- **Style:** a strip of cells divided by 1.5px rules in the current ink (label at 60% on dark fields, ink at 80% on light), Big Shoulders 800 caps at 1.0625rem, min-height 44px, 16px side padding.
- **State:** the current page, pressed filter or selected language floods tomato with white text; hover tints tomato at 15%. The menu's category strip is sticky under the navigation.

### Stickers
A die-cut sticker marks every state instead of a UI chip.
- **Price:** a mustard circle (64 / 76 / 112–128px) with a 3px label-stock edge, a small currency symbol over tabular digits, rotated −8°. It rotates further and scales up 6% on card hover.
- **Chef's pick:** a tomato tag (pill, 3px label-stock edge, −4°) at the top-left of the window.
- **Sold out:** an ink band (85%) stamped across the photo at −6° in Stencil caps, with the photo desaturated.
- **Promise and section stickers:** round or oval flat-ink stickers carrying lettering only.

### Dish Card
- **Corner Style:** 16px, with a 1.5px Line border.
- **Background:** white label stock with 10px inner padding around an arched 4:5 window.
- **Content:** the dish name in Big Shoulders caps (1.65rem, line height 0.95), two clamped lines of Barlow description in Ink Muted, veggie or spicy chips, and a tomato "View dish" link.
- **Hover:** lifts 4px with the Lift shadow, the border turns pickle, the photo scales 5% inside its window and the price sticker turns.

### Inputs / Fields
- **Style:** white fill, 1px Line stroke, 10px corners, 44px height, 14px side padding, Ink Faint placeholders, Barlow 600 labels above.
- **Focus:** the stroke turns Steel with a 4px Steel ring at 20%.
- **Error / Disabled:** Chilli stroke and ring with an alert message below; disabled at 60% opacity.

### Navigation
- **Style:** a fixed bar over the dark page header. The logo lockup sits left; ruled cells, the EN/FR switch and a tomato "View menu" button sit right. At the top of the home page the bar shows the round mark alone, because the hero's wordmark is already on screen.
- **Scrolled:** after 24px it becomes a solid label-stock strip with the Solid bar shadow and switches the logo to its light-ground colours.
- **Mobile:** a round tomato toggle opens a full-screen Pickle Deep menu with 2.5–3.75rem caps links and a ruled list.

### Label Frame (signature)
A mustard double rule inset inside a dark header field (10px from the edges, 16px from 640px). It starts below the fixed navigation so the bar reads as printed above the label, and it ends above the hero's ticker band so no rule ever crosses text.

## Do's and Don'ts

### Do:
- **Do** set the ground to Label Stock (#FFFDF8) and stack coloured sections as inset blocks with 28px corners and 8–16px gutters.
- **Do** give every dish state a sticker: mustard price circle, tomato chef's-pick tag, ink sold-out band, veggie and spicy chips.
- **Do** keep every price on tabular figures, on stickers and in columns alike.
- **Do** put food in arched windows (or 16px rectangles in walls of photos), untinted, with captions on solid label tabs.
- **Do** switch the focus ring to mustard on dark fields and Steel (#2D6A8E) on light ones.
- **Do** honour reduced motion: no splash animation, no pinned scrub, no 3D, no parallax; horizontal rows fall back to native scrolling.
- **Do** ease everything out exponentially (`cubic-bezier(0.16, 1, 0.3, 1)`); only a sticker landing may overshoot.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading; a state belongs on the photo as a sticker.
- **Don't** use gradients, glows, glass or blur on brand surfaces.
- **Don't** drift toward the dark-moody-gold restaurant template: near-black grounds, gold hairlines, a serif display.
- **Don't** redraw the mark with a fork, knife or chef's hat; the bite out of the sticker is the taste cue.
- **Don't** set reading text in Big Shoulders or in caps.
- **Don't** put pictograms inside stickers; stickers carry lettering or a price only.
- **Don't** let anything on the reading plane drift on its own; only rear layers move without the reader.
