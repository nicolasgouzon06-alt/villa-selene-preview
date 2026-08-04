# Villa Selene — cinematic scroll site

A one-page, scroll-driven cinematic tour built with vanilla HTML/CSS/JS.
No build step, no framework — GSAP + ScrollTrigger drive the pinning and
choreography, Lenis provides the inertia-smoothed scroll.

Every "room" on the site (hero, living room, and any future chapter) is
generated from a single config array — see **Adding a new chapter** below.

## Running locally

Because the page loads video/image assets by URL, opening `index.html`
directly via `file://` works in most browsers but can hit local security
restrictions (autoplay, CORS) depending on the browser. A tiny static
server is more reliable and closer to production:

```bash
cd luxury-property
npx serve .
# then open the URL it prints (usually http://localhost:3000)
```

**Don't use `python3 -m http.server`** — it doesn't support HTTP Range
requests, which `<video>` elements rely on to load and seek. Videos will
fail to play (and the placeholder/"missing asset" fallback will kick in,
masking the real cause) even though the files are perfectly fine. `npx
serve`, VS Code's "Live Server", nginx, and every real hosting provider
handle Range requests correctly — only Python's built-in server doesn't.

## Assets

Drop files straight into `assets/video/`, using the exact filenames
referenced in `js/chapters.config.js`:

```
assets/video/01-hero.mp4     aerial descent — hero chapter
assets/video/poster.jpg      first frame of 01-hero.mp4 (instant-load poster)
assets/video/02-salon.mp4    living room walk-through — room chapter
assets/video/02-salon.jpg    a still frame from 02-salon.mp4
```

**Nothing has to be missing for the site to run.** If a video or poster
isn't there yet, that chapter falls back to a soft gold gradient +
shimmer placeholder automatically, and the browser console logs exactly
which file is missing (open dev tools → Console). Drop the real file in
under the same name and reload — no code changes needed.

### Re-encoding video for smooth scroll-scrubbing

Every chapter's video is scrubbed (position mapped to scroll, never
autoplayed), which needs every frame to be a keyframe or seeking looks
choppy. Re-encode any source video with:

```bash
ffmpeg -i in.mp4 -vf scale=1920:-2 -g 1 -crf 20 -movflags +faststart -an out.mp4
```

- `-g 1` — one keyframe per frame, required for jitter-free `currentTime` scrubbing
- `-crf 20` — visually lossless-ish quality at a reasonable file size
- `-movflags +faststart` — moves metadata to the front so playback can start before the full file downloads
- `-an` — strips audio (every video here is muted anyway)

`-g 1` produces an all-intra file, which is noticeably bigger than a
normal web export — worth it here since every chapter needs to seek
cleanly, not just the hero.

### Generating a poster from a video's first frame

```bash
ffmpeg -i 01-hero.mp4 -vframes 1 -q:v 2 poster.jpg
```

## Adding a new chapter

Open `js/chapters.config.js` and add an object to the `CHAPTERS` array —
that's the entire integration surface. `main.js` loops over this array to
generate the DOM, wire up video/poster loading, pinning + scroll-scrubbing,
and all the text choreography. Nothing elsewhere needs to change.

The **first** entry in the array gets the full-bleed centered "hero"
layout (giant headline, optional scroll cue). Every other entry gets the
"room" layout (small eyebrow + poetic line + optional body copy). Both
layouts share the exact same pin/scrub mechanics: the chapter is pinned
to the viewport, its video's `currentTime` is mapped to scroll progress
inside that pin, and the pin only releases into the next chapter once
the video has scrubbed through to its end.

```js
{
  number: "05",
  id: "cuisine",
  video: "05-cuisine.mp4",      // lives in assets/video/
  poster: "05-cuisine.jpg",     // optional, also in assets/video/
  eyebrow: "LA CUISINE",
  title: "Faite pour les matins tranquilles",
  caption: "Plans de travail en pierre, lumière du nord, et le doux cliquetis du café à l'aube.",
  scrollVh: 280,
  transitionIn: "whip-pan"
}
```

Field reference:

| Field      | Applies to      | Notes                                                             |
|------------|-----------------|--------------------------------------------------------------------|
| `number`   | both            | Old-style numeral shown in the UI, e.g. `"03"`                     |
| `id`       | both            | Unique slug — used as the section's DOM id / anchor                |
| `video`    | both            | Filename in `assets/video/`                                        |
| `poster`   | both, optional  | Filename in `assets/video/`, shown before video is ready            |
| `eyebrow`  | both            | Small-caps label                                                   |
| `title`    | both            | Big Fraunces headline / poetic line                                |
| `caption`  | room, optional  | Supporting body copy under the poetic title                        |
| `cue`      | hero, optional  | Scroll-cue label (used on the hero: "Scroll to discover")          |
| `scrollVh` | both, optional  | Pin distance in vh (how long it stays pinned while its video scrubs), default `300` |
| `transitionIn` | both, optional | `"whip-pan"` plays a brief directional-blur whip pan across this chapter and the one right before it, exactly when the pin releases from one into the other — a "walking through the space" cut instead of a plain one. Omit for a plain cut. |

Order in the array is the order chapters appear on the page. Reload the
page after saving — there's no build step to run.

## Tech notes

- **GSAP + ScrollTrigger** (CDN) drive pinning, parallax, and masked-line
  reveals. **Lenis** (CDN) provides the smooth-scroll inertia and is wired
  to ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`.
- Scrubbed video scrubbing uses a shared `requestAnimationFrame` loop that
  lerps toward the scroll progress (factor `0.1`) before writing
  `video.currentTime`, so seeking feels weighted instead of jittery.
- `prefers-reduced-motion: reduce` disables pinning/scrubbing entirely —
  chapters fall back to a static poster/placeholder with a simple fade-in,
  same as the mobile Ken Burns fallback at `≤768px` (Ken Burns itself is
  also skipped under reduced motion).
- Missing assets never break the page: every image/video is probed, and a
  gradient-and-shimmer placeholder plus a `console.warn` take over if it
  404s.
