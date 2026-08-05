# VELES Strength — concept site

An unofficial mock landing page for [VELES Strength Melbourne](https://www.facebook.com/VelesStrength/),
a Melbourne **gym equipment wholesaler** — home gyms, commercial fitouts, Maribyrnong
warehouse, Australia-wide delivery, tagline *"tools for greatness"*.

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

Sequenced to move someone from "never heard of them" to "these are the people
who kit out my floor", with a trade account or a site visit as the conversion
rather than a cart:

1. **Hero** — a full-width photo card with the promise (`Tools for greatness`)
   overlaid and a floating warehouse-hours widget (address, Mon–Fri and Saturday
   rows with duration chips), plus four credibility stats beneath.
2. **Track marquee** — container direct, trade pricing, 30-day terms, stock depth.
3. **Why wholesale with Veles** — four pillars on margin, stock depth, testing
   and trying it before you buy.
4. **The Catalogue** — six photographed categories carrying retail and trade prices.
5. **Fitouts** — *the floors we've built*. A wholesaler's real portfolio, since
   the finished facility is what's actually being sold.
6. **Packages** — three side-by-side pricing tiers (Garage / Studio / Floor)
   with checked feature lists, the Studio featured.
7. **The Steel** — the spec numbers, where a considered purchase is won.
8. **Trade & wholesale** — accounts, volume tiers, dealer/drop-ship, OEM, freight.
9. **Reviews**, an **FAQ** covering freight, warranty, returns, install, trade
   eligibility and stock truth, then the **warehouse** and a quote form.

## Art direction

Built from a reference set of moody hardware photography, HYROX-style lit
training floors, monochrome grain posters and turf-track signage. Three motifs
carry the whole page:

- **Cool industrial monochrome.** Near-black with a blue cast, cool white light,
  and a single cyan-teal accent (`--accent`) used only for actions, live numbers
  and hot parts of a drawing. Swapping the `--accent` / `--accent-ink` pair
  re-skins the entire site.
- **The lane track.** Turf laid in CSS perspective with painted lane lines and
  numerals — used in the hero, the marquee, the fitout scenes and the closing CTA.
- **Cinematic AI photography.** Eleven Soul Cinema shots (hero, six catalogue
  categories, three fitouts, warehouse) generated to one art direction: matte
  black steel, cool white LEDs, teal glow, no people. They are hot-linked from
  the generation CDN, not vendored into the repo — swap the URLs in index.html
  for local files to make the site fully self-contained.

Type is Archivo variable run condensed and heavy (`font-stretch: 70–86%`) for
display, with JetBrains Mono for eyebrows, specs and labels — the mono carries
the engineering-document register. Two grain layers (a drifting fine grain and a
coarser static one) give flat panels the printed-poster texture of the references.

Motion — staggered scroll reveals, counting stats, the marquee, pointer parallax
on the hero blueprint — all collapses under `prefers-reduced-motion`.

## Notes

Every product, price, spec, review, fitout, address and phone number on this page
is illustrative mock content written for the concept. It is not affiliated with
or endorsed by VELES Strength.
