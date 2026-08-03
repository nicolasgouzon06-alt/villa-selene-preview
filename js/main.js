/**
 * VILLA SELENE — cinematic scroll engine
 * ---------------------------------------------------------------------
 * Everything here is driven by window.CHAPTERS (see chapters.config.js).
 * No chapter-specific markup or logic lives in this file — adding a
 * room to the config is the only thing required to add a section.
 */
(function () {
  "use strict";

  var ROOT = document.documentElement;
  var IS_TOUCH = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  var PREFERS_REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IS_MOBILE = matchMedia("(max-width: 768px)").matches;
  var HAS_GSAP = !!window.gsap && !!window.ScrollTrigger;
  var HAS_LENIS = !!window.Lenis;

  if (IS_TOUCH) ROOT.classList.add("touch");
  if (PREFERS_REDUCED) ROOT.classList.add("reduced-motion");

  if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* =====================================================================
     0. ASSET RESOLUTION — graceful placeholders for missing files
     ===================================================================== */

  var VIDEO_BASE = "assets/video/";
  var missingAssets = [];

  function logMissing(kind, path) {
    missingAssets.push(path);
    console.warn("[Villa Selene] Missing " + kind + ": " + path + " — using placeholder.");
  }

  /* =====================================================================
     1. BUILD CHAPTER MARKUP FROM CONFIG
     ===================================================================== */

  var CHAPTERS = window.CHAPTERS || [];
  var chaptersRoot = document.getElementById("chapters");
  var navLinks = document.getElementById("navLinks");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Each word becomes its own masked "line" that rises into view — used
  // for the big Fraunces headlines (hero title + loop poetic title).
  function wrapWordLines(text) {
    return text
      .split(" ")
      .map(function (word) {
        return '<span class="line"><span>' + escapeHtml(word) + "</span></span>";
      })
      .join(" ");
  }

  // Greedily wraps body copy into ~42-char chunks, each its own masked line.
  function wrapPhraseLines(text, maxLen) {
    maxLen = maxLen || 42;
    var words = text.split(" ");
    var lines = [];
    var current = "";
    words.forEach(function (w) {
      var next = current ? current + " " + w : w;
      if (next.length > maxLen && current) {
        lines.push(current);
        current = w;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);
    return lines
      .map(function (line) {
        return '<span class="mask-line"><span>' + escapeHtml(line) + "</span></span>";
      })
      .join("");
  }

  function buildScrubbedChapter(chapter, idx) {
    return (
      '<section class="chapter chapter--scrubbed" id="' + chapter.id + '" data-chapter-number="' + chapter.number + '">' +
        '<div class="chapter__pin-wrap" data-pin-wrap>' +
          '<div class="media-frame" data-media-frame>' +
            '<div class="media-placeholder" data-placeholder></div>' +
            '<img class="chapter__poster" data-poster-img alt="" />' +
            '<video class="chapter__video" data-video muted playsinline preload="auto"></video>' +
            '<div class="chapter__scrim"></div>' +
          "</div>" +
          '<div class="chapter__overlay">' +
            '<span class="eyebrow eyebrow--light">' + escapeHtml(chapter.eyebrow) + "</span>" +
            '<h1 class="chapter__headline" data-headline>' + wrapWordLines(chapter.title) + "</h1>" +
            '<div class="progress-hairline" data-progress-hairline>' +
              '<div class="progress-hairline__fill" data-progress-fill></div>' +
            "</div>" +
            (chapter.cue
              ? '<div class="scroll-cue" data-scroll-cue><span class="scroll-cue__line"></span><span class="scroll-cue__label">' +
                escapeHtml(chapter.cue) +
                "</span></div>"
              : "") +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function buildLoopChapter(chapter, idx) {
    return (
      '<section class="chapter chapter--loop" id="' + chapter.id + '" data-chapter-number="' + chapter.number + '">' +
        '<div class="media-frame" data-media-frame data-parallax>' +
          '<div class="media-placeholder" data-placeholder></div>' +
          '<img class="chapter__poster" data-poster-img alt="" />' +
          '<video class="chapter__video" data-video muted loop playsinline preload="none"></video>' +
          '<div class="chapter__scrim"></div>' +
        "</div>" +
        '<div class="chapter__content">' +
          '<span class="eyebrow eyebrow--light" data-eyebrow>' + escapeHtml(chapter.number) + " — " + escapeHtml(chapter.eyebrow) + "</span>" +
          '<h2 class="chapter__poetic" data-poetic>' + wrapWordLines(chapter.title) + "</h2>" +
          (chapter.caption
            ? '<p class="chapter__body" data-body>' + wrapPhraseLines(chapter.caption) + "</p>"
            : "") +
        "</div>" +
      "</section>"
    );
  }

  var markup = CHAPTERS.map(function (chapter, idx) {
    return chapter.type === "scrubbed" ? buildScrubbedChapter(chapter, idx) : buildLoopChapter(chapter, idx);
  }).join("");

  chaptersRoot.innerHTML = markup;

  navLinks.innerHTML = CHAPTERS.map(function (chapter) {
    return '<a href="#' + chapter.id + '">' + escapeHtml(chapter.eyebrow) + "</a>";
  }).join("");

  document.querySelector(".chapter-index__total").textContent = String(CHAPTERS.length).padStart(2, "0");

  // "Back to top" targets point at whichever chapter is first in the
  // config, rather than a hardcoded id, so reordering CHAPTERS can't
  // silently break these links.
  if (CHAPTERS[0]) {
    document.getElementById("navMark").href = "#" + CHAPTERS[0].id;
    document.getElementById("footerCta").href = "#" + CHAPTERS[0].id;
  }

  /* =====================================================================
     2. MEDIA LOADING — poster/video with graceful fallback
     ===================================================================== */

  function wireMedia(section, chapter) {
    var frame = section.querySelector("[data-media-frame]");
    var placeholder = section.querySelector("[data-placeholder]");
    var posterImg = section.querySelector("[data-poster-img]");
    var video = section.querySelector("[data-video]");

    if (chapter.poster) {
      var probe = new Image();
      probe.onload = function () {
        posterImg.src = VIDEO_BASE + chapter.poster;
        frame.classList.add("poster-ready");
      };
      probe.onerror = function () {
        logMissing("poster", VIDEO_BASE + chapter.poster);
      };
      probe.src = VIDEO_BASE + chapter.poster;
    } else {
      posterImg.remove();
    }

    video.addEventListener("error", function () {
      logMissing("video", VIDEO_BASE + chapter.video);
      video.remove();
    });

    return { frame: frame, placeholder: placeholder, posterImg: posterImg, video: video };
  }

  // Scale 1.08 -> 1.0 as each chapter's media enters the viewport.
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-revealed");
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll("[data-media-frame]").forEach(function (frame) {
    revealObserver.observe(frame);
  });

  /* =====================================================================
     3. CUSTOM CURSOR — gold dot -> ring w/ label on interactive elements
     ===================================================================== */

  function setupCursor() {
    if (IS_TOUCH) return;
    var cursor = document.getElementById("cursor");
    var ringLabel = cursor.querySelector(".cursor__ring-label");
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var pos = { x: mouse.x, y: mouse.y };

    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    (function raf() {
      pos.x = lerp(pos.x, mouse.x, 0.18);
      pos.y = lerp(pos.y, mouse.y, 0.18);
      cursor.style.transform = "translate3d(" + pos.x + "px," + pos.y + "px,0)";
      requestAnimationFrame(raf);
    })();

    document.addEventListener("mouseover", function (e) {
      var target = e.target.closest("[data-cursor]");
      if (!target) return;
      ringLabel.textContent = target.getAttribute("data-cursor");
      cursor.classList.add("is-active");
    });

    document.addEventListener("mouseout", function (e) {
      var target = e.target.closest("[data-cursor]");
      if (!target) return;
      cursor.classList.remove("is-active");
    });

    // Tag interactive elements so the cursor knows what to say.
    document.querySelectorAll(".chapter--scrubbed").forEach(function (el) {
      el.setAttribute("data-cursor", "SCROLL");
    });
    document.querySelectorAll(".chapter--loop").forEach(function (el) {
      el.setAttribute("data-cursor", "VIEW");
    });
    document.querySelectorAll(".cta, .nav__links a").forEach(function (el) {
      el.setAttribute("data-cursor", "VIEW");
    });
  }

  /* =====================================================================
     4. PRELOADER — letterform reveal + curtain wipe
     ===================================================================== */

  function runPreloader(done) {
    var preloader = document.getElementById("preloader");
    var curtain = document.getElementById("curtain");
    var wordEl = document.getElementById("preloaderWord");
    var rule = preloader.querySelector(".preloader__rule");
    var text = wordEl.getAttribute("data-text") || "";

    wordEl.innerHTML = text
      .split("")
      .map(function (ch) {
        return ch === " "
          ? '<span class="char">&nbsp;</span>'
          : '<span class="char">' + escapeHtml(ch) + "</span>";
      })
      .join("");

    if (PREFERS_REDUCED || !HAS_GSAP) {
      preloader.style.display = "none";
      curtain.style.display = "none";
      done();
      return;
    }

    var chars = wordEl.querySelectorAll(".char");
    var tl = gsap.timeline({
      onComplete: function () {
        gsap.to(curtain, {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          onComplete: function () {
            preloader.remove();
            curtain.remove();
            done();
          },
        });
      },
    });

    tl.to(chars, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.035 })
      .to(rule, { width: 220, duration: 0.6, ease: "power2.out" }, "-=0.2")
      .to(preloader, { opacity: 0, duration: 0.35, ease: "power1.out" }, "+=0.35");

    // Hard cap: never let the preloader block the site past ~2.5s.
    gsap.delayedCall(2.5, function () {
      if (document.body.contains(preloader)) tl.progress(1);
    });
  }

  /* =====================================================================
     5. NAV — transparent, reveals after hero, hides on scroll-down
     ===================================================================== */

  function setupNav() {
    var nav = document.getElementById("siteNav");
    var hero = CHAPTERS[0] && document.getElementById(CHAPTERS[0].id);
    var lastY = window.scrollY;
    var pastHero = false;

    function onScroll(y) {
      if (y > 30) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");

      if (y > 400) nav.classList.add("is-shrink");
      else nav.classList.remove("is-shrink");

      if (pastHero) {
        if (y > lastY && y > 80) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
      }
      lastY = y;
    }

    if (HAS_GSAP && hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: "bottom top",
        onEnter: function () {
          pastHero = true;
          nav.classList.add("is-visible");
        },
        onLeaveBack: function () {
          pastHero = false;
          nav.classList.remove("is-visible");
          nav.classList.remove("is-hidden");
        },
      });
    } else {
      nav.classList.add("is-visible");
    }

    return onScroll;
  }

  /* =====================================================================
     6. FIXED CHAPTER INDEX — crossfades between chapters
     ===================================================================== */

  function setupChapterIndex() {
    if (!HAS_GSAP) return;
    var indexEl = document.getElementById("chapterIndex");
    var currentEl = indexEl.querySelector(".chapter-index__current");

    CHAPTERS.forEach(function (chapter) {
      var section = document.getElementById(chapter.id);
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: function () { swapNumber(chapter.number); },
        onEnterBack: function () { swapNumber(chapter.number); },
      });
    });

    var footer = document.getElementById("footer");
    ScrollTrigger.create({
      trigger: footer,
      start: "top 85%",
      onEnter: function () { indexEl.classList.remove("is-visible"); },
      onLeaveBack: function () { indexEl.classList.add("is-visible"); },
    });

    // Reveal once the user has scrolled past the very top of the hero.
    ScrollTrigger.create({
      trigger: CHAPTERS[0] && document.getElementById(CHAPTERS[0].id),
      start: "top top-=1",
      onEnterBack: function () { indexEl.classList.remove("is-visible"); },
      onLeave: function () { indexEl.classList.add("is-visible"); },
    });

    function swapNumber(number) {
      gsap.to(currentEl, {
        opacity: 0,
        duration: 0.18,
        onComplete: function () {
          currentEl.textContent = number;
          gsap.to(currentEl, { opacity: 1, duration: 0.25 });
        },
      });
    }
  }

  /* =====================================================================
     7. SCRUBBED CHAPTER — pin + rAF-lerped video scrub + text choreography
     ===================================================================== */

  var scrubStates = [];

  function wireScrubbedChapter(chapter) {
    var section = document.getElementById(chapter.id);
    var media = wireMedia(section, chapter);
    var pinWrap = section.querySelector("[data-pin-wrap]");
    var headline = section.querySelector("[data-headline]");
    // Outer .line wrappers carry the scroll-driven fade-OUT; the inner
    // spans carry the load-triggered entrance. Separate elements so the
    // two animations never fight over the same inline styles.
    var outerLines = headline.querySelectorAll(".line");
    var innerSpans = headline.querySelectorAll(".line span");
    var fill = section.querySelector("[data-progress-fill]");
    var cue = section.querySelector("[data-scroll-cue]");
    var hairline = section.querySelector("[data-progress-hairline]");

    if (chapter.video) {
      media.video.src = VIDEO_BASE + chapter.video;
      media.video.addEventListener("loadeddata", function () {
        media.frame.classList.add("video-ready");
      });
    } else {
      media.video.remove();
    }

    var state = {
      progress: 0,
      target: 0,
      video: media.video,
    };

    // Headline entrance: fades/rises in on load, as the descent plays —
    // independent of scroll position (spec: happens "as the video plays",
    // i.e. right away, not gated behind the user scrolling first).
    function playEntrance() {
      if (HAS_GSAP) {
        // gsap.set() first: GSAP's yPercent tracking needs an explicit
        // baseline — it can't infer the starting offset from the CSS
        // `transform: translateY(110%)` rule alone.
        gsap.set(innerSpans, { yPercent: 110, opacity: 0 });
        gsap.to(innerSpans, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.08, delay: 0.3 });
      } else {
        innerSpans.forEach(function (s) { s.style.transform = "none"; s.style.opacity = 1; });
      }
    }

    // Scroll-driven fade-out only: as the building is revealed (~30-46%
    // of the pin's progress) the headline lifts and dissolves.
    function applyChoreography(p) {
      var outT = Math.max(0, Math.min(1, (p - 0.3) / 0.16));
      outerLines.forEach(function (line, i) {
        var localOut = Math.max(0, Math.min(1, outT - i * 0.04));
        line.style.opacity = String(1 - localOut);
        line.style.transform = "translateY(" + -24 * localOut + "%)";
      });
      if (fill) fill.style.width = Math.round(p * 100) + "%";
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p / 0.05));
    }

    if (PREFERS_REDUCED || IS_MOBILE || !HAS_GSAP) {
      // Static fallback: poster/placeholder + simple fade choreography,
      // no pin, no scrub — mobile Ken Burns handled purely in CSS.
      section.classList.add("is-static");
      media.frame.classList.add("mobile-kenburns");
      if (hairline) hairline.style.display = "none";
      if (cue) cue.style.display = "none";
      if (media.video) media.video.remove();
      playEntrance();
      return;
    }

    playEntrance();
    applyChoreography(0);

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=" + (chapter.scrollVh || 300) + "%",
      pin: pinWrap,
      pinSpacing: true,
      onUpdate: function (self) {
        state.target = self.progress;
        applyChoreography(self.progress);
      },
    });

    scrubStates.push(state);
  }

  // Single shared rAF loop drives the weighted (lerped) video scrub for
  // every scrubbed chapter, so currentTime never jitters with scroll.
  function startScrubLoop() {
    function tick() {
      scrubStates.forEach(function (state) {
        state.progress = lerp(state.progress, state.target, 0.1);
        var video = state.video;
        if (video && isFinite(video.duration) && video.duration > 0) {
          var t = state.progress * video.duration;
          if (Math.abs(video.currentTime - t) > 0.01) {
            video.currentTime = t;
          }
        }
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* =====================================================================
     8. LOOP CHAPTER — lazy IO play/pause, parallax, masked reveal
     ===================================================================== */

  function wireLoopChapter(chapter) {
    var section = document.getElementById(chapter.id);
    var media = wireMedia(section, chapter);
    var frame = media.frame;
    var video = media.video;
    var content = section.querySelector(".chapter__content");
    var eyebrow = section.querySelector("[data-eyebrow]");
    var poeticLines = section.querySelectorAll("[data-poetic] .line span");
    var bodyLines = section.querySelectorAll("[data-body] .mask-line span");

    var loaded = false;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!video || !chapter.video) return;
          if (entry.isIntersecting) {
            if (!loaded) {
              loaded = true;
              video.src = VIDEO_BASE + chapter.video;
              video.addEventListener("loadeddata", function () {
                frame.classList.add("video-ready");
              });
            }
            if (entry.intersectionRatio >= 0.5) {
              video.play().catch(function () {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.5] }
    );
    io.observe(section);

    // Masked reveal of eyebrow + poetic title + body on scroll-into-view.
    // (caption/body is optional — guard against tweening an empty NodeList
    // when a chapter has no caption, which GSAP otherwise warns about.)
    if (HAS_GSAP) {
      gsap.set([eyebrow], { opacity: 0, y: 16 });
      gsap.set(poeticLines, { y: "105%", opacity: 0 });
      if (bodyLines.length) gsap.set(bodyLines, { y: "105%", opacity: 0 });
      ScrollTrigger.create({
        trigger: content,
        start: "top 78%",
        onEnter: function () {
          gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
          gsap.to(poeticLines, { y: "0%", opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.1 });
          if (bodyLines.length) gsap.to(bodyLines, { y: "0%", opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.05, delay: 0.35 });
        },
      });

      // Parallax: media travels at ~0.85x scroll speed (15% counter-drift).
      if (!PREFERS_REDUCED) {
        gsap.to(frame, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    } else {
      eyebrow.style.opacity = 1;
      poeticLines.forEach(function (s) { s.style.transform = "none"; s.style.opacity = 1; });
      bodyLines.forEach(function (s) { s.style.transform = "none"; s.style.opacity = 1; });
    }

    if (!chapter.video) video && video.remove();
  }

  /* =====================================================================
     9. CHAPTER TRANSITIONS — optional whip-pan between two adjacent chapters
     ===================================================================== */

  // Approximates a directional motion-blur whip pan with a synchronized
  // blur + horizontal snap on both chapters' media, right as scroll crosses
  // the boundary between them (either direction) — true anisotropic blur
  // needs an SVG filter and isn't worth the complexity for a 150-250ms cue.
  function setupChapterTransitions() {
    if (!HAS_GSAP || PREFERS_REDUCED) return;

    CHAPTERS.forEach(function (chapter, i) {
      if (chapter.transitionIn !== "whip-pan" || i === 0) return;

      var prevFrame = document.querySelector("#" + CHAPTERS[i - 1].id + " [data-media-frame]");
      var curFrame = document.querySelector("#" + chapter.id + " [data-media-frame]");
      var section = document.getElementById(chapter.id);
      if (!prevFrame || !curFrame || !section) return;

      // Animate the poster/placeholder/scrim layers, but never the
      // <video> element itself: transforming/filtering a video right as
      // it's loading and calling .play() for the first time — exactly
      // what's happening on the incoming chapter at this exact scroll
      // position — can make Safari drop that play attempt entirely, so
      // the video never starts. The other layers carry the same visual
      // weight without ever touching playback state. The
      // [data-media-frame] wrapper's "overflow: hidden" still keeps the
      // scale bump below from bleeding into neighboring chapters.
      var targets = [prevFrame, curFrame].reduce(function (acc, frame) {
        return acc.concat(Array.prototype.slice.call(frame.querySelectorAll(".chapter__poster, .media-placeholder, .chapter__scrim")));
      }, []);

      function whipPan() {
        // xPercent + a matching scale bump (rather than fixed px) so the
        // brief horizontal snap never reveals an edge gap, at any viewport
        // width — the 5%-per-side overscan from scale:1.1 comfortably
        // covers the 4% shift.
        gsap.killTweensOf(targets, "xPercent,scale,filter");
        gsap
          .timeline({
            // The poster/placeholder layers also carry a CSS
            // "transition: transform 1.4s" (the scroll-reveal zoom) —
            // left on, it would smear this fast whip into a slow 1.4s
            // drift. Suspend it for just this tween (a no-op on the
            // scrim, which has no such rule).
            onStart: function () { gsap.set(targets, { transition: "none" }); },
            onComplete: function () { gsap.set(targets, { transition: "" }); },
          })
          .to(targets, { xPercent: -4, scale: 1.1, filter: "blur(16px)", duration: 0.08, ease: "power1.in" })
          .to(targets, { xPercent: 0, scale: 1, filter: "blur(0px)", duration: 0.14, ease: "power2.out" });
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        onEnter: whipPan,
        onEnterBack: whipPan,
      });
    });
  }

  /* =====================================================================
     10. LENIS <-> SCROLLTRIGGER WIRING
     ===================================================================== */

  function setupScroll(onScrollForNav) {
    if (PREFERS_REDUCED || !HAS_LENIS) {
      window.addEventListener("scroll", function () {
        onScrollForNav(window.scrollY);
        if (HAS_GSAP) ScrollTrigger.update();
      });
      return;
    }

    var lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true,
    });

    lenis.on("scroll", function (e) {
      onScrollForNav(e.scroll);
      if (HAS_GSAP) ScrollTrigger.update();
    });

    if (HAS_GSAP) {
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      });
    }
  }

  /* =====================================================================
     INIT
     ===================================================================== */

  function init() {
    setupCursor();

    CHAPTERS.forEach(function (chapter) {
      if (chapter.type === "scrubbed") wireScrubbedChapter(chapter);
      else wireLoopChapter(chapter);
    });

    startScrubLoop();
    setupChapterTransitions();

    var onScrollForNav = setupNav();
    setupChapterIndex();
    setupScroll(onScrollForNav);

    document.querySelectorAll(".chapter--scrubbed").forEach(function (el) {
      el.setAttribute("data-cursor", "SCROLL");
    });
    document.querySelectorAll(".chapter--loop").forEach(function (el) {
      el.setAttribute("data-cursor", "VIEW");
    });

    window.addEventListener("resize", function () {
      if (HAS_GSAP) ScrollTrigger.refresh();
    });

    if (missingAssets.length) {
      console.info(
        "[Villa Selene] Running with " + missingAssets.length + " placeholder asset(s):\n  " + missingAssets.join("\n  ")
      );
    }
  }

  runPreloader(init);
})();
