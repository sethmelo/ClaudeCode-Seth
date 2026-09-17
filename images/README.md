# Images

Drop the real photos in this folder. Nothing here is referenced until you
uncomment the matching `<img>` tag in `index.html` — the hatched placeholder
in each slot disappears on its own once the image is in.

## Files the page is already wired for

| Filename | Where it appears | Size | Crop |
|---|---|---|---|
| `logo.svg` | Header, next to the business name | any (drawn at 38×38) | square |
| `natt-and-van.jpg` | Why Platinum section | 1200×900+ | landscape 4:3 |
| `job-01.jpg` … `job-06.jpg` | Recent Jobs gallery | 800×800 | square 1:1 |
| `hero.jpg` | Optional hero background | 1920×1080+ | landscape 16:9 |

## Getting the photos off Instagram / Google

From [@platinumplumbingandgas](https://www.instagram.com/platinumplumbingandgas/)
or the Google Business Profile, save the originals — do **not** link to them.

Instagram and Google serve images from signed, time-limited CDN URLs
(`scontent-*.cdninstagram.com`, `lh3.googleusercontent.com`). Those links
expire, and when they do the photos turn into broken images with no warning.
They also change whenever the post is edited. Self-hosting is the only
version that keeps working.

Saving your own photos from your own accounts is fine. If a photo was taken
by someone else (a supplier, a photographer, a customer), get their OK first.

## Export settings

- JPEG, quality ~75, sRGB.
- Gallery images ≤ 120KB each; hero ≤ 250KB.
- Strip EXIF before uploading — phone photos carry GPS coordinates, which on
  a job photo means a customer's home address.

```
# ImageMagick, if you have it:
magick input.jpg -strip -resize 800x800^ -gravity center -extent 800x800 -quality 75 job-01.jpg
magick input.jpg -strip -resize 1920x -quality 70 hero.jpg
```

## Alt text

Each `<img>` ships with placeholder alt text describing a *typical* photo.
Correct it to describe the photo you actually used — screen readers and
Google both read it. Describe the content, not the filename:

- Good: `Copper pipe repair under a house at Edwardstown`
- Bad: `job-01` / `plumbing image` / `emergency plumber Adelaide`
