# Motion v12 Patterns

Worked recipes for the things people actually build. Adapt the values — the structure is the point.

All examples assume `import { motion } from "framer-motion"` (or `"motion/react"`), and a `"use client"` directive at the top of the file in a Next.js App Router project.

## Contents

- [Modal / dialog](#modal--dialog)
- [Drawer / sheet](#drawer--sheet)
- [Accordion (unknown height)](#accordion-unknown-height)
- [Staggered list or grid](#staggered-list-or-grid)
- [Scroll reveal](#scroll-reveal)
- [Scroll progress bar](#scroll-progress-bar)
- [Parallax](#parallax)
- [Shared-element lightbox](#shared-element-lightbox)
- [Page / route transitions](#page--route-transitions)
- [Drag to reorder](#drag-to-reorder)
- [Toast stack](#toast-stack)
- [Imperative sequence](#imperative-sequence)
- [Animated number counter](#animated-number-counter)

---

## Modal / dialog

Backdrop and panel animate independently, so the panel can spring while the backdrop simply fades.

```jsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 m-auto h-fit w-fit"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", visualDuration: 0.25, bounce: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

Scale from `0.96`, not `0` — a panel growing from nothing reads as a cartoon. Small offsets sell "arriving" better than large ones.

Motion handles the animation, not the accessibility: you still need focus trapping, `Escape` to close, and focus restoration on close. Consider a headless dialog primitive underneath and let Motion animate its open state.

## Drawer / sheet

```jsx
<AnimatePresence>
  {isOpen && (
    <motion.aside
      key="drawer"
      className="fixed right-0 top-0 h-full w-80"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", visualDuration: 0.3, bounce: 0 }}
    />
  )}
</AnimatePresence>
```

Percentage strings on `x` are relative to the element's own width, so this works at any drawer size. `bounce: 0` because a panel overshooting past the screen edge looks like a bug.

To make it swipe-dismissible, add `drag="x"`, `dragConstraints={{ left: 0, right: 0 }}`, and close from `onDragEnd` when `info.offset.x` or `info.velocity.x` passes a threshold.

## Accordion (unknown height)

`height: "auto"` is supported and is the reason to use Motion here at all — CSS alone can't transition to an intrinsic height.

```jsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.section
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.section>
  )}
</AnimatePresence>
```

`overflow: hidden` is required or content spills during the collapse. Note this animates `height`, which is a layout property — acceptable for a one-shot user-triggered toggle, but don't do it on many elements at once or on scroll.

## Staggered list or grid

Parent orchestrates; children only declare their own states.

```jsx
import { motion, stagger } from "framer-motion"

const container = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.06, { from: "first" }) } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.li key={i.id} variants={item} />
  ))}
</motion.ul>
```

`stagger()` accepts `from: "first" | "last" | "center" | number` — `"center"` is a nice touch for grids. The older `staggerChildren: 0.06` on the parent transition still works and is equivalent for the simple case.

Keep the stagger small. Above ~0.08s per item a ten-item list feels sluggish; for long lists, cap the total by reducing the interval rather than letting it grow unbounded.

## Scroll reveal

The cheap, correct default for "animate in as I scroll".

```jsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
```

`once: true` matters — without it the animation replays every time the user scrolls past, which is distracting. `amount: 0.3` waits until 30% is visible, avoiding a trigger while the element is barely peeking in.

To stagger a revealed group, combine with variants: put `whileInView="show"` on the parent and `variants` on children.

## Scroll progress bar

```jsx
const { scrollYProgress } = useScroll()
const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 })

<motion.div
  className="fixed left-0 top-0 h-1 w-full origin-left bg-blue-500"
  style={{ scaleX }}
/>
```

`scaleX` with `origin-left` rather than animating `width` — transform stays on the compositor. The `useSpring` wrapper smooths the raw scroll value so trackpad jitter doesn't show.

## Parallax

```jsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"],
})
const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"])

<div ref={ref} className="overflow-hidden">
  <motion.img style={{ y }} />
</div>
```

Parallax is the single most common reduced-motion offender — gate it:

```jsx
const reduce = useReducedMotion()
const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-15%", "15%"])
```

## Shared-element lightbox

The same `layoutId` in two places, and Motion morphs between them.

```jsx
{items.map((item) => (
  <motion.img
    key={item.id}
    layoutId={`photo-${item.id}`}
    onClick={() => setSelected(item)}
  />
))}

<AnimatePresence>
  {selected && (
    <motion.div
      key="overlay"
      className="fixed inset-0 grid place-items-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelected(null)}
    >
      <motion.img layoutId={`photo-${selected.id}`} />
    </motion.div>
  )}
</AnimatePresence>
```

The `layoutId` must be unique per item and stable across renders. The backdrop gets a plain `key` and normal opacity animation — only the morphing element carries `layoutId`.

## Page / route transitions

`mode="wait"` so the outgoing page clears before the incoming one arrives — otherwise both are absolutely positioned on top of each other mid-transition.

```jsx
// Next.js App Router — in a client component wrapping {children}
"use client"
import { usePathname } from "next/navigation"

const pathname = usePathname()

<AnimatePresence mode="wait" initial={false}>
  <motion.main
    key={pathname}                        // ← route identity drives the transition
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.main>
</AnimatePresence>
```

Keep route transitions short — 150–250ms. They sit between the user and the content they asked for, and anything longer feels like latency.

## Drag to reorder

```jsx
import { Reorder } from "framer-motion"

<Reorder.Group axis="y" values={items} onReorder={setItems}>
  {items.map((item) => (
    <Reorder.Item key={item.id} value={item}>
      {item.label}
    </Reorder.Item>
  ))}
</Reorder.Group>
```

`values` must be the array itself and `value` the item — Motion diffs them to compute the new order. `onReorder` fires continuously during the drag, so persist to a server on drag *end*, not on every reorder event.

## Toast stack

`popLayout` is what makes the remaining toasts slide up smoothly as one is dismissed.

```jsx
<AnimatePresence mode="popLayout">
  {toasts.map((t) => (
    <motion.div
      key={t.id}
      layout
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", visualDuration: 0.3, bounce: 0.15 }}
    />
  ))}
</AnimatePresence>
```

## Imperative sequence

When the animation is a timeline rather than a state.

```jsx
const [scope, animate] = useAnimate()

async function celebrate() {
  await animate(scope.current, { scale: 1.1 }, { duration: 0.15 })
  await animate("li", { opacity: 1, y: 0 }, { delay: stagger(0.05) })
  await animate(scope.current, { scale: 1 }, { type: "spring" })
}

<ul ref={scope}>{/* selectors resolve inside this scope only */}</ul>
```

String selectors are scoped to the ref, so `"li"` can't accidentally animate list items elsewhere on the page.

## Animated number counter

```jsx
const count = useMotionValue(0)
const rounded = useTransform(count, (v) => Math.round(v))

useEffect(() => {
  const controls = animate(count, target, { duration: 1, ease: "easeOut" })
  return () => controls.stop()
}, [target])

<motion.span>{rounded}</motion.span>
```

Rendering a motion value directly as a child updates the text without re-rendering the component each frame. Returning `controls.stop()` from the effect prevents overlapping animations when `target` changes rapidly.
