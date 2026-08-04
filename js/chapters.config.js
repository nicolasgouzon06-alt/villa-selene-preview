/**
 * CHAPTER CONFIG
 * ---------------------------------------------------------------------
 * Single source of truth for every "room" section on the site.
 * main.js loops over this array and generates the DOM, ScrollTrigger
 * pins, video wiring, and text choreography for each entry — there is
 * no per-chapter markup anywhere else in the codebase.
 *
 * Every chapter is pinned to the viewport and scrubbed: scroll position
 * inside the pin maps to video.currentTime (lerp-smoothed), and the pin
 * only releases into the next chapter once the video has played through.
 * The first chapter in the array gets the full-bleed centered "hero"
 * treatment (giant headline, scroll cue); every other chapter gets the
 * eyebrow + poetic-line "room" treatment. Both share the same pin/scrub
 * mechanics — see main.js's wireScrubbedChapter.
 *
 * To add a new room (kitchen, bedroom, dining room, dressing, wine
 * cellar, ...): duplicate one of the room objects below, drop the
 * matching video (and optional poster) into /assets/video/, and reload.
 * See README.md → "Adding a new chapter" for the full walkthrough.
 *
 * Fields:
 *   number      Old-style chapter numeral shown in the UI, e.g. "01".
 *   id          Unique slug, used for DOM ids and anchor links.
 *   video       Filename inside /assets/video/.
 *   poster      Filename inside /assets/video/ shown before the video is
 *                ready, on mobile (Ken Burns fallback), and if the
 *                video asset is missing entirely. Optional.
 *   eyebrow     Small-caps label, e.g. "LE SALON".
 *   title       Large Fraunces headline / poetic line for the chapter.
 *   caption     Room chapters only, optional — supporting body copy.
 *   cue         Optional scroll-cue label (hero only, typically).
 *   features    Hero only, optional — array of short strings shown as a
 *                subtle small-caps list with gold dividers, fading in once
 *                the hero's video has scrubbed almost to its end and out
 *                again just before the pin releases into the next chapter.
 *   scrollVh    Pin distance in vh — how long the chapter stays pinned
 *                while its video scrubs from start to end (default 300).
 *   transitionIn  Optional. "whip-pan" plays a brief directional-blur whip
 *                 pan across this chapter and the one immediately before
 *                 it in this array, the moment the pin releases from one
 *                 into the other — reads as walking through the space
 *                 rather than cutting to a new scene. Omit for a plain cut.
 */

window.CHAPTERS = [
  {
    number: "01",
    id: "hero",
    video: "01-hero.mp4",
    poster: "poster.jpg",
    eyebrow: "BIENVENUE",
    title: "Villa Selene",
    caption: "Un domaine privé sur les hauteurs, révélé souffle après souffle.",
    cue: "Défilez pour découvrir",
    features: [
      "Trois suites parentales",
      "Piscine à débordement",
      "Terrain de tennis privé",
      "Deux dressings sur-mesure"
    ],
    scrollVh: 300
  },
  {
    number: "02",
    id: "salon",
    video: "02-salon.mp4",
    poster: "02-salon.jpg",
    eyebrow: "LE SALON",
    title: "Là où la lumière s'attarde",
    caption: "Le calme, à perte de vue.",
    scrollVh: 280
  },
  {
    number: "03",
    id: "salle-a-manger",
    video: "03-salle-a-manger.mp4",
    poster: "03-salle-a-manger.jpg",
    eyebrow: "LA SALLE À MANGER",
    title: "Un dîner suspendu au-dessus du monde.",
    scrollVh: 280,
    transitionIn: "whip-pan"
  },
  {
    number: "04",
    id: "cave-a-vin",
    video: "04-cave-a-vin.mp4",
    poster: "04-cave-a-vin.jpg",
    eyebrow: "LA CAVE À VIN",
    title: "Ici, le temps se compte en millésimes.",
    scrollVh: 280,
    transitionIn: "whip-pan"
  }

  /* Add future rooms here, e.g.:
  {
    number: "05",
    id: "cuisine",
    video: "05-cuisine.mp4",
    poster: "05-cuisine.jpg",
    eyebrow: "LA CUISINE",
    title: "Faite pour les matins tranquilles",
    caption: "Plans de travail en pierre, lumière du nord, et le doux cliquetis du café à l'aube.",
    scrollVh: 280,
    transitionIn: "whip-pan"
  },
  */
];
