# VELES Strength — concept site

An unofficial mock landing page for [VELES Strength Melbourne](https://www.facebook.com/VelesStrength/),
a Melbourne gym & fitness equipment supplier (home gyms, commercial fitouts, Maribyrnong warehouse,
Australia-wide delivery, tagline *"tools for greatness"*).

## Running it

Static — no build step, no dependencies. Serve the folder over HTTP:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Opening `index.html` via `file://` works but browsers block the local webfonts
under that scheme, so the page falls back to system sans.

```
index.html    all markup + inline SVG line-art
styles.css    tokens, layout, components, responsive, reduced-motion
main.js       nav, reveals, counters, tabs, carousel, form (no dependencies)
fonts/        Archivo + JetBrains Mono variable subsets (latin, 121 KB total)
```

## The consumer journey

The page is sequenced to move someone from "never heard of them" to "I want to
go there", with the showroom visit as the conversion moment rather than a cart:

1. **Hero** — the promise (`Tools for greatness`) plus the three numbers that
   establish credibility before any scrolling: gyms outfitted, rating, dispatch time.
2. **Marquee** — freight, warranty, showroom. Risk-removal, read in a glance.
3. **Why Veles** — four pillars answering the four objections a buyer actually has
   (is it strong enough / is it tested / when does it arrive / can I try it).
4. **The Range** — five categories with entry prices, so nobody has to guess budget.
5. **Build a Gym** — the decision shortcut. Three named packages by space
   (Garage / Home Platform / Floor), each fully specced and priced.
6. **The Steel** — the spec numbers, which is where a considered purchase is won.
7. **Reviews** — 4.9 from 312, with named, specific, regional testimonials.
8. **Showroom** — *"Come and pull on it."* The emotional close: address, hours,
   parking, map, and a 30-minute floor session.
9. **Quote form** — low-commitment capture with budget chips, not a checkout.

## Art direction

Reference points were Represent 247 (cinematic dark editorial, huge condensed
display type), REVL (energy, high contrast) and STRONG Pilates (heavy display
type, punchy accent colour).

- **Palette** — forged black `#08080A` on bone `#F4F1EA`, single ember accent
  `#FF4D1F` used only for actions, numbers and hot parts of a drawing.
- **Type** — Archivo variable, run condensed and heavy (`font-stretch: 80–88%`)
  for display, with JetBrains Mono for eyebrows, specs and labels — the mono
  carries the "engineering document" register.
- **Imagery** — no stock photography. Every product visual is hand-drawn inline
  SVG technical line-art with dimension callouts, which suits a brand whose whole
  argument is steel gauge and load ratings, and keeps the page fully self-contained.
- **Motion** — staggered scroll reveals, counting stats, marquee, pointer parallax
  on the hero blueprint. All of it collapses under `prefers-reduced-motion`.

## Notes

Every product, price, spec, review, address and phone number on this page is
illustrative mock content written for the concept. It is not affiliated with or
endorsed by VELES Strength.
