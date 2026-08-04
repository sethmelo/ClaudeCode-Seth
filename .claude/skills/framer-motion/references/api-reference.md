# Motion v12 API Reference

Verified against `framer-motion@12.43.0` type definitions. Import from `framer-motion` or `motion/react` depending on which package the project uses.

## Contents

- [Components](#components)
- [Motion component props](#motion-component-props)
- [Transition options](#transition-options)
- [Hooks](#hooks)
- [Standalone functions](#standalone-functions)
- [Full export list](#full-export-list)

---

## Components

| Component | Purpose |
|---|---|
| `motion.*` | Animatable DOM/SVG elements — `motion.div`, `motion.button`, `motion.path`, … |
| `motion.create(Component)` | Wrap a custom component. It must forward a ref to a DOM node. |
| `AnimatePresence` | Keeps unmounting children alive so `exit` can run. |
| `LayoutGroup` | Groups components so layout changes in one trigger measurement in others. |
| `LazyMotion` | Defers loading animation features to cut initial bundle. Pairs with `m.*`. |
| `MotionConfig` | Sets `transition`, `reducedMotion`, `nonce`, `transformPagePoint` for a subtree. |
| `Reorder.Group` / `Reorder.Item` | Drag-to-reorder lists with built-in layout animation. |
| `m.*` | Minimal motion components — identical API, no bundled features. Requires `LazyMotion`. |

### AnimatePresence props

| Prop | Type | Notes |
|---|---|---|
| `initial` | `boolean` | `false` disables the mount animation for children present on first render. |
| `mode` | `"sync" \| "wait" \| "popLayout"` | `sync` overlaps; `wait` finishes exit first; `popLayout` removes exiting element from flow. |
| `custom` | `any` | Passed to dynamic `exit` variants — the only way to give leaving components fresh data. |
| `onExitComplete` | `() => void` | Fires when all exiting nodes finish. |
| `root` | `HTMLElement \| ShadowRoot` | Style injection root for `popLayout`. Defaults to `document.head`. |
| `propagate` | `boolean` | Whether exit propagates from a parent `AnimatePresence`. |

---

## Motion component props

### Animation targets

| Prop | Purpose |
|---|---|
| `initial` | Starting state, or `false` to skip the mount animation. |
| `animate` | Target state. Object, variant label, or array of labels. |
| `exit` | State to animate to before unmount. Requires `AnimatePresence`. |
| `variants` | Named states this component (and its children) can reference. |
| `transition` | Default transition for this component. |
| `style` | Accepts motion values alongside normal CSS. |
| `custom` | Data passed to dynamic (function) variants. |
| `transformTemplate` | `(transform, generated) => string` — customise transform string order. |

### Gestures

| Prop | Fires |
|---|---|
| `whileHover` / `onHoverStart` / `onHoverEnd` | Pointer over (filters out touch). |
| `whileTap` / `onTap` / `onTapStart` / `onTapCancel` | Press. `onTap` only fires if released over the element. |
| `whileFocus` | Focus — pair with `whileHover` for keyboard parity. |
| `whileDrag` | While dragging. |
| `onPan*` | Pan gestures: `onPanStart`, `onPan`, `onPanEnd`. |

### Drag

| Prop | Type | Notes |
|---|---|---|
| `drag` | `boolean \| "x" \| "y"` | Axis lock or free. |
| `dragConstraints` | `false \| {top,right,bottom,left} \| RefObject` | Pixel box or a ref to constrain within. |
| `dragElastic` | `number \| boolean \| object` | 0–1 resistance past constraints. Default `0.5`. |
| `dragMomentum` | `boolean` | Inertia after release. Default `true`. |
| `dragSnapToOrigin` | `boolean` | Spring back to start on release. |
| `dragPropagation` | `boolean` | Allow parent drag gestures to also fire. |
| `dragTransition` | `InertiaOptions` | Tune the post-release inertia. |
| `dragControls` | `DragControls` | Start drag from another element (`useDragControls`). |
| `dragListener` | `boolean` | `false` = only start via `dragControls`. |

### Layout

| Prop | Notes |
|---|---|
| `layout` | `true`, `"position"`, `"size"`, or `"preserve-aspect"`. |
| `layoutId` | Shared element id — morphs between components across trees. |
| `layoutDependency` | Only re-measure when this value changes (perf). |
| `layoutScroll` | Mark a scrollable container so measurements account for scroll. |
| `layoutRoot` | Mark as a fixed/independent projection root. |

### Viewport

| Prop | Notes |
|---|---|
| `whileInView` | Target or variant label while in view. |
| `onViewportEnter` / `onViewportLeave` | `(entry: IntersectionObserverEntry \| null) => void` |
| `viewport.once` | Fire only the first time. |
| `viewport.amount` | `"some"` \| `"all"` \| `0`–`1` fraction visible. |
| `viewport.margin` | IntersectionObserver root margin, e.g. `"0px 0px -100px 0px"`. |
| `viewport.root` | Ref to a scroll container instead of the viewport. |

### Lifecycle

`onAnimationStart`, `onAnimationComplete`, `onUpdate`, `onLayoutAnimationStart`, `onLayoutAnimationComplete`.

---

## Transition options

### Shared

| Option | Notes |
|---|---|
| `type` | `"spring" \| "tween" \| "inertia" \| "decay" \| "keyframes"` or `false` for instant. |
| `delay` | Seconds before start. |
| `repeat` | Count, or `Infinity`. |
| `repeatType` | `"loop" \| "reverse" \| "mirror"`. |
| `repeatDelay` | Pause between repeats. |
| `duration` | Seconds. |
| `autoplay`, `startTime`, `from` | Playback control. |
| `onUpdate`, `onPlay`, `onComplete`, `onRepeat`, `onStop` | Lifecycle callbacks. |

### Spring

| Option | Notes |
|---|---|
| `visualDuration` | How long it *looks* like it takes to arrive. Prefer this. |
| `bounce` | 0 = no overshoot, higher = bouncier. Pairs with `visualDuration`. |
| `stiffness` | Default `100`. Higher = snappier. |
| `damping` | Default `10`. Higher = less oscillation. |
| `mass` | Default `1`. Higher = more sluggish. |
| `velocity`, `restSpeed`, `restDelta` | Initial velocity and settle thresholds. |

### Tween

`duration`, `ease`, `times`, `easings`. `ease` accepts `"linear"`, `"easeIn"`, `"easeOut"`, `"easeInOut"`, `"circIn"`, `"backOut"`, `"anticipate"`, a cubic-bezier array `[0.4, 0, 0.2, 1]`, or a custom function.

### Orchestration (on a parent variant)

| Option | Notes |
|---|---|
| `when` | `"beforeChildren"` \| `"afterChildren"` \| `false`. |
| `delayChildren` | Number, or `stagger(...)` for the modern staggered form. |
| `staggerChildren` | Seconds between each child. |
| `staggerDirection` | `1` forward, `-1` reverse. |

### Per-value overrides

Any transition can name specific values:

```jsx
transition={{
  default: { type: "spring" },
  opacity: { duration: 0.2, ease: "linear" },
}}
```

---

## Hooks

### Motion values

| Hook | Signature / notes |
|---|---|
| `useMotionValue(initial)` | Creates a value that updates without re-rendering React. |
| `useTransform(value, input[], output[], opts?)` | Map one value onto another. Also accepts a function form. |
| `useMotionTemplate` | Tagged template combining motion values into a string: `` useMotionTemplate`blur(${v}px)` ``. |
| `useSpring(source, opts)` | Spring-smooths a value or another motion value. |
| `useFollowValue(source, opts)` | Like `useSpring` but accepts *any* transition type, not just springs. |
| `useVelocity(value)` | Derived velocity of a motion value. |
| `useTime()` | Milliseconds since mount — drives perpetual animation. |
| `useMotionValueEvent(value, event, cb)` | Subscribe to `"change"`, `"animationStart"`, `"animationComplete"`. |

### Scroll and viewport

| Hook | Returns |
|---|---|
| `useScroll({ container, target, offset, axis })` | `{ scrollX, scrollY, scrollXProgress, scrollYProgress }` |
| `useInView(ref, { root, margin, amount, once, initial })` | `boolean` |
| `usePageInView()` | `boolean` — whether the tab/page is visible. |

`offset` uses two-token strings — `["start end", "end start"]` means "from when the target's start edge meets the viewport's end edge, to when the target's end edge meets the viewport's start edge". Common values: `"start start"`, `"center center"`, `"end end"`.

### Imperative and control

| Hook | Notes |
|---|---|
| `useAnimate()` | `[scope, animate]`. Scoped selector animation and sequences. Returns awaitable controls. |
| `useAnimateMini()` | Lighter variant driven by WAAPI — transform/opacity only. |
| `useDragControls()` | Start drags programmatically from another element. |
| `useCycle(...items)` | `[current, cycle]` — cycle through states. |
| `useAnimationFrame(cb)` | Per-frame callback `(time, delta) => void`. |
| `useReducedMotion()` | `boolean` — the OS preference. |
| `useReducedMotionConfig()` | Resolves `MotionConfig`'s `reducedMotion` setting. |

### Presence

| Hook | Notes |
|---|---|
| `usePresence()` | `[isPresent, safeToRemove]` — manual exit control for custom animation. |
| `useIsPresent()` | `boolean`, read-only. |
| `usePresenceData()` | Reads `custom` passed via `AnimatePresence`. |

---

## Standalone functions

Usable outside React (vanilla JS, or in effects):

| Function | Notes |
|---|---|
| `animate(target, keyframes, options)` | Animate elements, selectors, motion values, or plain objects. |
| `animateMini` | WAAPI-only, smaller. |
| `scroll(onScroll, options)` | Scroll-driven callback or animation. |
| `inView(target, onStart, options)` | Viewport callback. |
| `stagger(duration, { startDelay, from, ease })` | Returns a dynamic delay — use as `delayChildren`. |
| `transform(input, inputRange, outputRange)` | One-off value mapping. |
| `distance(a, b)` / `distance2D(a, b)` | Numeric helpers. |
| `frame`, `cancelFrame` | Frame scheduler. |

`animate()` returns playback controls: `play`, `pause`, `stop`, `complete`, `cancel`, `time`, `speed`, `duration`, `finished` (a promise), and is itself awaitable.

---

## Full export list

`AnimatePresence`, `LayoutGroup`, `LazyMotion`, `MotionConfig`, `Reorder`, `DragControls`, `motion`, `m`, `animate`, `animateMini`, `scroll`, `scrollInfo`, `inView`, `stagger`, `transform`, `distance`, `distance2D`, `domAnimation`, `domMax`, `domMin`, `useAnimate`, `useAnimateMini`, `useAnimation`, `useAnimationControls`, `useAnimationFrame`, `useCycle`, `useDragControls`, `useElementScroll`, `useFollowValue`, `useInView`, `useIsPresent`, `useMotionTemplate`, `useMotionValue`, `useMotionValueEvent`, `usePageInView`, `usePresence`, `usePresenceData`, `useReducedMotion`, `useReducedMotionConfig`, `useScroll`, `useSpring`, `useTime`, `useTransform`, `useVelocity`, `useWillChange`, `isMotionComponent`, `isValidMotionProp`, `unwrapMotionComponent`, `addPointerEvent`, `addPointerInfo`, `disableInstantTransitions`, `useInstantTransition`, `useInstantLayoutTransition`, `useResetProjection`, `transformViewBoxPoint`.

**Deprecated / legacy** — don't reach for these in new code: `AnimateSharedLayout` (use `layoutId`), `useElementScroll` and `useViewportScroll` (use `useScroll`), `useInvertedScale` (use `layout` on children), `useAnimatedState`.

### Entry points

| Subpath | Contents |
|---|---|
| `framer-motion` | Everything. |
| `framer-motion/client` | Pre-bound DOM components (`import { div }`). Not an RSC marker. |
| `framer-motion/m` | Minimal components only. |
| `framer-motion/mini`, `/dom`, `/dom/mini` | Vanilla-JS and size-optimised builds. |
| `framer-motion/debug` | Projection debugging tools. |
