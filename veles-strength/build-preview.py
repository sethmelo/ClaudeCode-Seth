#!/usr/bin/env python3
"""Build a single self-contained preview file.

Bundles the CSS, JS and both webfonts into one HTML document so it can be
opened straight from disk (double-clicked) without a local server. Browsers
refuse to load webfonts over file:// for CORS reasons, so the fonts are
embedded as data: URIs rather than referenced.

Photography still loads from its remote host, which works in a normal
browser; if it ever fails, main.js falls the frames back to dark panels.

    python3 build-preview.py   ->  veles-strength-preview.html
"""

import base64
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent

# theme attribute value -> output filename. The dark build is the default
# document; the light build only differs by data-theme on <html>.
BUILDS = {
    None: "veles-strength-preview.html",
    "light": "veles-strength-preview-light.html",
}

FONTS = (
    "fonts/archivo-var-latin.woff2",
    "fonts/jetbrainsmono-var-latin.woff2",
)


def data_uri(path: pathlib.Path) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:font/woff2;base64,{b64}"


def main() -> int:
    base = (HERE / "index.html").read_text(encoding="utf-8")
    css = (HERE / "styles.css").read_text(encoding="utf-8")
    js = (HERE / "main.js").read_text(encoding="utf-8")

    # Embed the fonts into the stylesheet.
    for rel in FONTS:
        src = HERE / rel
        if not src.exists():
            print(f"missing font: {rel}", file=sys.stderr)
            return 1
        before = css
        css = css.replace(f"url('{rel}')", f"url({data_uri(src)})")
        if css == before:
            print(f"font reference not found in styles.css: {rel}", file=sys.stderr)
            return 1

    html = base

    # Guard against a closing tag inside the payload breaking the document.
    if "</style" in css.lower() or "</script" in js.lower():
        print("payload contains a closing tag; refusing to inline", file=sys.stderr)
        return 1

    # Preloads point at files that no longer ship alongside this document.
    html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)

    html, n = re.subn(
        r'<link rel="stylesheet" href="styles\.css">',
        lambda _: f"<style>\n{css}\n</style>",
        html,
    )
    if n != 1:
        print(f"expected 1 stylesheet link, found {n}", file=sys.stderr)
        return 1

    html, n = re.subn(
        r'<script src="main\.js"></script>',
        lambda _: f"<script>\n{js}\n</script>",
        html,
    )
    if n != 1:
        print(f"expected 1 script tag, found {n}", file=sys.stderr)
        return 1

    for theme, filename in BUILDS.items():
        out = HERE / filename
        doc = html
        if theme:
            doc, n = re.subn(r"<html lang=\"en-AU\">",
                             f'<html lang="en-AU" data-theme="{theme}">', doc)
            if n != 1:
                print(f"expected 1 <html> tag, found {n}", file=sys.stderr)
                return 1
            doc = doc.replace('content="#0A0B0C"', 'content="#F4F2ED"')
        out.write_text(doc, encoding="utf-8")
        print(f"{out.name}  {out.stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
