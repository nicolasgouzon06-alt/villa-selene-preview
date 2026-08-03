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
 *   transitionIn  Optional. "whip-pan" plays a brief directional-blur whip
 *                 pan across this chapter and the one immediately before
 *                 it in this array, the moment scroll crosses between them
 *                 (either direction) — reads as walking through the space
 *                 rather than cutting to a new scene. Omit for a plain cut.
 */

window.CHAPTERS = [
  {
    number: "01",
    id: "hero",
    type: "scrubbed",
    video: "01-hero.mp4",
    poster: "poster.jpg",
    eyebrow: "ARRIVÉE",
    title: "Villa Selene",
    caption: "Un domaine privé sur les hauteurs, révélé souffle après souffle.",
    cue: "Défilez pour découvrir",
    scrollVh: 300
  },
  {
    number: "02",
    id: "salon",
    type: "loop",
    video: "02-salon.mp4",
    poster: "02-salon.jpg",
    eyebrow: "LE SALON",
    title: "Là où la lumière s'attarde",
    caption: "La lumière glisse dans la pièce comme une marée lente, se posant dans chaque recoin où le jour commence et s'achève."
  },
  {
    number: "03",
    id: "salle-a-manger",
    type: "loop",
    video: "03-salle-a-manger.mp4",
    poster: "03-salle-a-manger.jpg",
    eyebrow: "LA SALLE À MANGER",
    title: "Là où les soirées s'attardent, sans hâte.",
    transitionIn: "whip-pan"
  },
  {
    number: "04",
    id: "cave-a-vin",
    type: "loop",
    video: "04-cave-a-vin.mp4",
    poster: "04-cave-a-vin.jpg",
    eyebrow: "LA CAVE À VIN",
    title: "Ici, le temps se compte en millésimes.",
    transitionIn: "whip-pan"
  }

  /* Add future rooms here, e.g.:
  {
    number: "05",
    id: "cuisine",
    type: "loop",
    video: "05-cuisine.mp4",
    poster: "05-cuisine.jpg",
    eyebrow: "LA CUISINE",
    title: "Faite pour les matins tranquilles",
    caption: "Plans de travail en pierre, lumière du nord, et le doux cliquetis du café à l'aube."
  },
  */
];
