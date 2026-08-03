/**
 * CHAPTER CONFIG
 * ---------------------------------------------------------------------
 * Single source of truth for every "room" section on the site.
 * main.js loops over this array and generates the DOM, ScrollTrigger
 * pins, video wiring, and text choreography for each entry — there is
 * no per-chapter markup anywhere else in the codebase.
 *
 * To add a new room (kitchen, bedroom, dining room, dressing, wine
 * cellar, ...): duplicate one of the objects below, drop the matching
 * video (and optional poster) into /assets/video/, and reload. See
 * README.md → "Adding a new chapter" for the full walkthrough.
 *
 * Fields:
 *   number      Old-style chapter numeral shown in the UI, e.g. "01".
 *   id          Unique slug, used for DOM ids and anchor links.
 *   type        "scrubbed" — video position is mapped to scroll
 *                            progress inside a pinned section.
 *               "loop"     — video autoplays on a muted loop while
 *                            ≥50% visible, with parallax + scrim.
 *   video       Filename inside /assets/video/.
 *   poster      Filename inside /assets/video/ shown before the video is
 *                ready, on mobile (Ken Burns fallback), and if the
 *                video asset is missing entirely. Optional.
 *   eyebrow     Small-caps label, e.g. "THE LIVING ROOM".
 *   title       Large Fraunces headline for the chapter.
 *   caption     Short poetic line / body copy.
 *   cue         Optional scroll-cue label (hero only, typically).
 *   scrollVh    Scrubbed chapters only — pin distance in vh (default 300).
 */

window.CHAPTERS = [
  {
    number: "01",
    id: "hero",
    type: "scrubbed",
    video: "01-hero.mp4",
    poster: "poster.jpg",
    eyebrow: "ARRIVAL",
    title: "Villa Selene",
    caption: "A private hilltop estate, revealed one breath at a time.",
    cue: "Scroll to discover",
    scrollVh: 300
  },
  {
    number: "02",
    id: "salon",
    type: "loop",
    video: "02-salon.mp4",
    poster: "02-salon.jpg",
    eyebrow: "THE LIVING ROOM",
    title: "Where Light Lingers",
    caption: "Sunlight moves through the room like a slow tide, gathering in every corner where the day begins and ends."
  }

  /* Add future rooms here, e.g.:
  {
    number: "03",
    id: "kitchen",
    type: "loop",
    video: "03-kitchen.mp4",
    poster: "03-kitchen.jpg",
    eyebrow: "THE KITCHEN",
    title: "Made for Slow Mornings",
    caption: "Stone counters, north light, and the quiet clatter of coffee at dawn."
  },
  */
];
