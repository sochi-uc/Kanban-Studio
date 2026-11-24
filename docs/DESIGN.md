# Design system: Liquid Glass

The interface follows Apple's Liquid Glass principles, adapted for the web and applied with restraint.

## Principles

1. **Glass is for chrome, not content.** The floating control layer (sidebar, toolbar, inspector, dialogs, menus, dropdown lists, toasts) is glass. Cards, tables and panels are solid surfaces. Glass on glass muddies legibility, and every `backdrop-filter` costs a GPU pass.
2. **Shape carries meaning; colour reinforces it.** Status and priority each have their own glyph, so nothing depends on colour alone.
3. **Concentric geometry.** Nested radii shrink by the padding between them: window 24, panel 20, card 14, control 10, chip 7, and capsules for pills and buttons.
4. **Quiet until needed.** Secondary actions (column +, rename pencil, dropdown chevrons in the inspector) appear on hover or focus. On touch devices they are always visible.
5. **The platform first.** `<dialog>` for modals, `popover` for menus and dropdowns, `light-dark()` for theming, and container queries for layout. These give the browser's own focus management, top layer and accessibility for free.

## Layers and files

| File | Contents |
|---|---|
| `styles/tokens.css` | Every colour, radius, shadow and easing as a custom property. One set, using `light-dark()`. |
| `styles/base.css` | Reset, typography, focus ring, reduced-motion handling |
| `styles/glass.css` | The material: `.glass`, `.glass-btn`, `.surface`, wallpaper, and fallbacks |
| `styles/app.css` | Layout and components |
| `styles/product.css` | Shell chrome, composer, empty states, menus |
| `styles/controls.css` | **Buttons, dropdowns, icon tints**: the single source of truth for controls |

## The glass material

```css
.glass {
  background-color: var(--glass-fill);                              /* translucent tint */
  background-image: linear-gradient(180deg, var(--glass-sheen), transparent 42%); /* sheen */
  backdrop-filter: blur(28px) saturate(180%);                       /* lensing */
  border: 1px solid var(--glass-edge);
  box-shadow: inset 0 1px 0 var(--glass-specular),                  /* specular top rim */
              0 0 0 .5px var(--glass-rim),                          /* thickness */
              var(--shadow-float);                                  /* lift */
}
```

Fallbacks apply automatically:

| Condition | Result |
|---|---|
| `prefers-reduced-transparency: reduce` | Opaque fill, no blur, plain wallpaper |
| No `backdrop-filter` support | Opaque fill |
| `prefers-contrast: more` | Stronger edges and ink |
| `forced-colors: active` | System `CanvasText` borders |
| `prefers-reduced-motion: reduce` | Transitions and animations effectively off |

## Icons

`web/src/ui/Icon.jsx`

- **Line icons**: 24 px grid, 1.6 stroke, round caps and joins. Default render size is 16 px; use 14 px in dense rows and 15 px in toolbars.
- **`StatusIcon`** (16 px grid), filling up as work progresses:

  | Backlog | To Do | In Progress | Review | Done |
  |---|---|---|---|---|
  | dashed ring | ring | half-filled | ¾-filled | filled check |

- **`PriorityIcon`**: an alert tile for Urgent (P0), then 3, 2 and 1 filled signal bars for High, Medium and Low.
- **`BrandMark`**: three ascending columns on a blue-to-violet tile. The same artwork is used for `public/favicon.svg`.

Icons are always `aria-hidden`. The adjacent text or the control's `aria-label` carries the meaning.

## Colour

- **Lanes** use a categorical palette validated in both themes for lightness band, chroma floor and colour-blind separation (deutan ΔE ≥ 9). Lanes are always labelled, so colour is never the only cue.

  | Lane | Light | Dark |
  |---|---|---|
  | Backlog | `#6250d6` | `#9085e9` |
  | To Do | `#eda100` | `#c98500` |
  | In Progress | `#2a78d6` | `#3987e5` |
  | Review | `#eb6834` | `#d95926` |
  | Done | `#1baf7a` | `#199e70` |

- **Priority** uses a separate status family: red, orange, blue and grey.
- **Text never wears a series colour.** Labels stay in the text tokens, and the coloured glyph beside them carries identity.

## Controls

### Buttons (`.btn`)

| Variant | Use |
|---|---|
| `.btn` | Secondary: frosted fill with a specular top edge |
| `.btn--primary` | One per view. Tinted glass with an accent fill, highlight and coloured glow. |
| `.btn--danger` | Destructive confirmation only |
| `.btn--ghost` / `.btn--plain` | Tertiary actions (Cancel in tight spaces) |
| `.btn--sm` / `.btn--lg` / `.btn--block` | Sizes 28, 34 (default) and 42 px; full width |
| `aria-busy="true"` | Loading: the label hides, a spinner shows, and the width stays stable |
| `.icon-btn` (`--sm`, `--xs`) | Circular icon-only buttons with a required `aria-label` |

Every button has a spring press (`scale(.965)`) and a visible focus ring.

### Dropdowns (`ui/Select.jsx`)

A glass listbox replaces the native `<select>`.

- **Variants:** `field` (forms), `pill` (toolbar and table), `ghost` (inspector properties: chrome only on hover).
- **Options** take an `icon` and a `hint`. Shared option sets live in `lib/options.jsx`, so status, priority, people and labels look identical everywhere.
- **Accessibility:** the WAI-ARIA select-only combobox pattern, with `aria-activedescendant`, ↑ ↓ Home End, Enter or Space to choose, Esc to close (without closing the parent panel), and type-ahead.
- **Rendering:** top layer via `popover`, so it works inside modal dialogs. It flips above the trigger when there's no room below and closes when the page scrolls.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-spring` | `cubic-bezier(.32, 1.25, .42, 1)` | Glass appearing, lens sliding, button press |
| `--ease-out` | `cubic-bezier(.2, .8, .2, 1)` | State changes |
| `--t-fast` / `--t-med` | 140 / 260 ms | |

Entry animations use `@starting-style`, so there is no JavaScript animation code.
