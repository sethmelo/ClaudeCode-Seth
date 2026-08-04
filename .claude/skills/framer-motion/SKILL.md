---
name: framer-motion
description: "Animate React interfaces with Framer Motion / Motion (the `framer-motion` and `motion` npm packages, v12). Covers motion components, variants and orchestration, AnimatePresence exit animations, layout and shared-layout transitions, scroll-linked and scroll-triggered motion, drag and gestures, motion values, springs, and reduced-motion accessibility. Use this whenever the user is adding or debugging animation in a React/Next.js codebase — page and route transitions, modals, drawers, accordions, toasts, carousels, hover and tap feedback, staggered list reveals, scroll progress bars, parallax, skeleton loaders, or anything that should 'fade in', 'slide in', 'animate on scroll', or 'feel smoother'. Also use it when the user mentions framer-motion, motion.dev, `motion.div`, `useScroll`, `useTransform`, `useAnimate`, `whileHover`, or `layoutId`, and when animation code is janky, flickering, not firing on exit, or breaking a Next.js build."
license: MIT
metadata:
  author: skill-creator
  version: "1.0.0"
  targets: "framer-motion@12 / motion@12"
---

# Framer Motion (Motion v12)

Animation library for React. This skill targets **v12** — verified against `framer-motion@12.43.0` type definitions.

## Package identity — read this first

Framer Motion rebranded to **Motion**. Two packages ship from the same repo (`motiondivision/motion`) at the same version:

| Package | Import | Use when |
|---|---|---|
| `motion` | `import { motion } from "motion/react"` | New projects. The current name. |
| `framer-motion` | `import { motion } from "framer-motion"` | Existing codebases already on it. |

They are the same library. **Match whatever the project already uses** — check `package.json` before adding an import. Mixing both in one app ships two copies and breaks shared `layoutId` transitions, because layout projection state is per-instance.

## The Next.js gotcha that bites hardest

`framer-motion` ships **no `"use client"` directive** — not in the main entry, not even in the `framer-motion/client` subpath. Verified in the built output.

So in the Next.js App Router, any file rendering a `motion.*` component needs the directive itself:

```jsx
"use client"                      // ← without this, the build fails
import { motion } from "framer-motion"

export function Card() {
  return <motion.div animate={{ opacity: 1 }} />
}
```

If the user reports "Server Components cannot be passed..." or a hook error in a Next build, this is almost always why. Keep the `"use client"` boundary as low in the tree as possible — wrap the small animated leaf, not the whole page, so the rest stays a Server Component.

(The `framer-motion/client` subpath is unrelated to RSC — it exports pre-bound elements so you can write `<div>` instead of `<motion.div>`. It does not make anything a client component.)

## Four ways to animate — pick deliberately

The most common mistake is reaching for imperative animation when declarative would do. Work down this list and stop at the first one that fits:

1. **Props on a motion component** — `animate={{ x: 100 }}`. State-driven, re-renders React. Default choice.
2. **Variants** — named states propagated to children. Use the moment more than one element animates together, or anything staggers.
3. **Motion values** — `useMotionValue` / `useTransform` / `useScroll`. Values that update *outside* React's render cycle. Essential for scroll and pointer tracking: a scroll handler in React state re-renders every frame and will drop frames.
4. **Imperative** — `useAnimate`. Only for sequences that can't be expressed as state: chained timelines, animating on an event with no state change, or animating a third-party DOM node.

```jsx
// 1. Props
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

// 2. Variants — parent orchestrates children
const list = { show: { transition: { delayChildren: stagger(0.07) } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }
<motion.ul variants={list} initial="hidden" animate="show">
  {items.map((i) => <motion.li key={i.id} variants={item} />)}
</motion.ul>

// 3. Motion values — no re-render per frame
const { scrollYProgress } = useScroll()
const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
<motion.div style={{ scale }} />

// 4. Imperative sequence
const [scope, animate] = useAnimate()
await animate(scope.current, { x: 100 })
await animate("li", { opacity: 1 }, { delay: stagger(0.1) })
```

Children with `variants` inherit the parent's animate label — don't repeat `animate="show"` on each child, and don't pass `initial`/`animate` to children at all if the parent already drives them.

## Exit animations need AnimatePresence

An element that unmounts cannot animate — React has already removed it. `AnimatePresence` holds it in the DOM until `exit` finishes.

```jsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="modal"                          // ← stable, unique key is mandatory
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

Two rules that cause nearly every "exit doesn't fire" bug:

- **The direct child needs a stable `key`.** No key, or a key that changes identity, and Motion can't track the element across renders.
- **The conditional must be *inside* `AnimatePresence`**, not around it. `{isOpen && <AnimatePresence>…</AnimatePresence>}` unmounts the presence tracker itself, so nothing survives to animate.

`mode` options: `"sync"` (default, in and out overlap), `"wait"` (outgoing finishes before incoming starts — right for swapping one thing for another, like tabs or route transitions), `"popLayout"` (outgoing is popped from flow so siblings reflow immediately — right for removing an item from a list).

## Layout animations

`layout` animates a change in position or size that you did *not* animate explicitly — a flex direction flip, a list reorder, content expanding.

```jsx
<motion.div layout />                       // animate own layout changes
<motion.div layoutId="card-1" />            // morph between two components
```

`layoutId` is the shared-element transition: render the same id in two places and Motion morphs one into the other. It's how you get a thumbnail expanding into a lightbox.

Layout animations work by measuring and applying transforms, which means **children get distorted** unless they also carry `layout`. Give a border-radius or text child its own `layout` prop to counteract the scale.

Layout animation is measurably more expensive than transform animation. Use it where you genuinely can't know the target values; don't reach for it as a default.

## Scroll

Two different needs, two different APIs — conflating them is a common error:

**Scroll-*linked*** (progress tied continuously to scroll position) — `useScroll` + `useTransform`:

```jsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"],   // [when target start hits viewport end, …]
})
const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
```

**Scroll-*triggered*** (fires once when an element enters view) — `whileInView`, far cheaper:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}   // once: don't re-fire on scroll back
/>
```

For "fade in as I scroll down the page", `whileInView` is the answer — reaching for `useScroll` there is overkill and costs performance.

## Gestures

`whileHover`, `whileTap`, `whileFocus`, `whileDrag`, `whileInView` take the same target objects or variant labels as `animate`, and clean up after themselves — no state needed for hover/press feedback.

```jsx
<motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} />
```

Always pair `whileHover` with `whileFocus` on interactive elements, or keyboard users get no feedback at all.

Drag needs `dragConstraints` in almost every real case, or the element leaves the screen:

```jsx
<motion.div drag="x" dragConstraints={containerRef} dragElastic={0.2} />
```

## Transitions

```jsx
transition={{ type: "spring", stiffness: 300, damping: 30 }}
transition={{ duration: 0.3, ease: "easeOut" }}
transition={{ type: "spring", visualDuration: 0.4, bounce: 0.2 }}
```

Springs are the default for physical, interruptible motion — and interruptibility matters, because a spring retargeted mid-flight carries its velocity instead of snapping. Prefer `visualDuration` + `bounce` over hand-tuning `stiffness`/`damping`: `visualDuration` is how long it *looks* like it takes to arrive, which is the thing you actually want to control.

Use `duration`/`ease` tweens for opacity and color, where physicality reads as sloppy rather than natural.

## Performance and accessibility

**Animate `transform` and `opacity`.** They run on the compositor. Animating `width`, `height`, `top`, `left`, or `margin` triggers layout on every frame and will jank. Use `x`/`y` (transform shorthands) instead of `left`/`top`, and `scale` instead of `width`.

**Respect reduced motion.** Users who set the OS preference can get physically ill from parallax and large motion. This is not optional polish:

```jsx
const shouldReduceMotion = useReducedMotion()
<motion.div animate={{ x: shouldReduceMotion ? 0 : 100 }} />
```

Or globally: `<MotionConfig reducedMotion="user">`. The honest approach is to cut movement while keeping opacity fades, so the interface still communicates state change.

## Debugging table

| Symptom | Cause |
|---|---|
| Exit animation never plays | Missing `key`, or the condition wraps `AnimatePresence` instead of sitting inside it |
| Next.js build fails on a motion component | Missing `"use client"` in that file |
| Animation janky / drops frames | Animating layout properties (`width`, `top`) instead of `transform`/`opacity` |
| Scroll handler re-renders constantly | Using React state for scroll instead of `useScroll` motion values |
| Children of a `layout` element look squashed | Children need their own `layout` prop |
| `layoutId` morph doesn't happen | Both packages installed, or ids not unique/stable |
| Stagger does nothing | `variants` missing on children, or children override `initial`/`animate` |
| Value animates from wrong start | `initial` not set, so it animates from the computed DOM value |

## Deeper references

Load these as needed rather than upfront:

- `references/api-reference.md` — full export list, hook signatures, every transition and viewport option, prop tables.
- `references/patterns.md` — worked recipes: modal, drawer, accordion, staggered grid, scroll progress bar, parallax, shared-element lightbox, page transitions, drag-to-reorder, toast stack.
- `references/performance.md` — bundle size and `LazyMotion` (`m` components), the will-change story, SSR/RSC boundaries, and reduced-motion strategy in depth.
