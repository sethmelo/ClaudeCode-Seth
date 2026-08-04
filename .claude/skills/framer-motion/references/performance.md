# Performance, Bundle Size, SSR, and Accessibility

## What actually costs frames

The browser runs style → layout → paint → composite. Animating a property deep in that pipeline means redoing everything after it, 60+ times a second.

| Animating | Pipeline cost | Verdict |
|---|---|---|
| `transform` (`x`, `y`, `scale`, `rotate`), `opacity` | Composite only | Free — use these |
| `filter`, `backdrop-filter` | Paint + composite | Usable, but expensive on large surfaces |
| `background-color`, `box-shadow`, `color` | Paint | Fine for a few elements, not for many |
| `width`, `height`, `top`, `left`, `margin`, `padding` | Full layout | Avoid in animation |

The rewrites are nearly always available:

- `left: 100px` → `x: 100`
- `width: 200px` → `scaleX`, with a counter-scaled child if content distorts
- `top` on a fixed bar → `y`
- Growing a card → `layout` prop, which measures once and animates with transforms

The exception worth knowing: `height: "auto"` genuinely can't be done with transforms, which is why the accordion pattern accepts the layout cost. One user-triggered accordion is fine. Twenty of them animating on scroll is not.

### `will-change`

Motion sets `will-change` automatically for animating values. Don't add it manually to everything — a permanent `will-change: transform` promotes the element to its own compositor layer forever, which costs memory and can *reduce* performance across many elements. `useWillChange` exists if you need manual control.

## Bundle size — `LazyMotion` and `m`

The full `motion` component bundles every feature: drag, layout projection, gestures, scroll. If a page only fades things in, that's a lot of unused code on the critical path.

`m` components have the identical API but ship no features. `LazyMotion` loads a feature bundle — sync or async — and every `m` inside it picks it up:

```jsx
import { LazyMotion, domAnimation, m } from "framer-motion"

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```

| Feature bundle | Includes |
|---|---|
| `domMin` | Animation only |
| `domAnimation` | + variants, exit, gestures (tap/hover/focus) |
| `domMax` | + drag, layout, `layoutId` projection |

Each is a strict superset of the one above. For current byte counts, check the project's own bundle analyzer or bundlephobia rather than trusting a number from a doc — they move every release.

Load it async to keep it off the initial bundle entirely:

```jsx
const loadFeatures = () => import("./features.js").then((m) => m.default)
<LazyMotion features={loadFeatures} strict>
  <m.div />
</LazyMotion>
```

`strict` makes any `motion.*` inside throw, so nobody accidentally reintroduces the full bundle. It's the flag that keeps this optimisation from silently rotting.

**The catch:** `m` components inside `LazyMotion` only get the features you loaded. A `drag` prop under `domAnimation` silently does nothing. If drag or `layoutId` is in play, you need `domMax` — at which point the saving is small, and plain `motion` is simpler.

Use `LazyMotion` when a large app's animation is mostly simple. Don't bother for a small site or when you need the full feature set anyway.

### The mini/WAAPI builds

`animateMini` and `useAnimateMini` drive animation through the browser's Web Animations API instead of Motion's own loop. Much smaller, but they only animate transform and opacity, and they can't do springs on independent transforms. Reach for them only in size-critical contexts.

## SSR and React Server Components

`framer-motion` ships **no `"use client"` directive** in any entry point — verified in the built output of 12.43.0. Every file that renders a motion component needs the directive itself.

The practical consequence for Next.js App Router: push the boundary down. This wastes the Server Component benefit for a whole page —

```jsx
"use client"                          // ✗ entire page becomes a client component
export default function Page() {
  return <div><motion.h1 />{/* lots of static content */}</div>
}
```

— whereas this keeps the page on the server and ships only the animated leaf:

```jsx
// FadeIn.tsx
"use client"
export function FadeIn({ children }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.div>
}

// page.tsx — stays a Server Component
export default function Page() {
  return <FadeIn><StaticContent /></FadeIn>
}
```

Passing Server Component children *through* a client wrapper as `children` is fine — they're rendered on the server and slotted in.

### Hydration

`initial` is rendered server-side, so an element with `initial={{ opacity: 0 }}` ships as invisible HTML. If JS fails or is slow, the content stays hidden — a real accessibility and SEO risk for above-the-fold content.

For critical content, either skip the mount animation (`initial={false}`) or animate something that degrades safely, like transform without opacity. For a hero that must be visible without JS, don't animate it in at all.

A `nonce` for CSP can be supplied via `<MotionConfig nonce={nonce}>`, since Motion injects style tags for `popLayout`.

## Reduced motion

`prefers-reduced-motion` is set by users who get motion sickness, migraines, or vestibular symptoms from animation. Large translations, parallax, scale, and rotation are the triggers; opacity and colour changes generally are not.

The useful principle: **remove movement, keep meaning**. A fade still communicates that something appeared; the parallax was never carrying information.

Per component:

```jsx
const reduce = useReducedMotion()
<motion.div
  initial={{ opacity: 0, y: reduce ? 0 : 24 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

Globally:

```jsx
<MotionConfig reducedMotion="user">   {/* "user" | "always" | "never" */}
  <App />
</MotionConfig>
```

`reducedMotion="user"` disables transform and layout animations while leaving opacity intact — exactly the right default, and one line. Set it at the app root, then override per component only where you have a specific reason.

## Testing and debugging

- **Jest/Vitest** — `MotionGlobalConfig.skipAnimations = true` makes animations resolve instantly so assertions don't race. Alternatively `<MotionConfig reducedMotion="always">` or `transition={{ duration: 0 }}` in test setup.
- **Layout projection issues** — the `framer-motion/debug` entry point exposes projection visualisation.
- **Frame drops** — record a Chrome Performance profile. Purple bars (Layout) or green (Paint) during animation mean you're animating the wrong property; a clean run shows mostly compositing.
- **`onUpdate`** on a motion component logs values per frame — useful for confirming a `useTransform` range is actually producing what you expect.
