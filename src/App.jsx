import PageBlock from "./block/pageBlock";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

import { allAspectsInOrder } from "./util/misc";

// Replace with your real list / import it from wherever it lives
const P9_KEYS = [...allAspectsInOrder];

const SPAWN_EVERY_MS = 1000; // ms between each rain slot's first drop, higher = slower
const RAIN_COUNT = 7; // number of reusable rain icons (~ fall time / SPAWN_EVERY); raise for denser rain
const ICON_SIZE = 32; // matches w-8 / h-8

// Icons that run around the edge of the page. Image files live in ./Misc/.
// CHASE_ICONS: the front runners. The last one (Melinoe) is the one the followers trail.
const CHASE_ICONS = ["Chronos", "Melinoe"];
// CHASE_FOLLOWERS: icons running behind Melinoe. Add or remove names freely;
// the first name is closest to Melinoe, the last is at the back.
const CHASE_FOLLOWERS = ["Zagreus"];
const CHASE_DURATION = 10; // seconds to cross the page's width (top and bottom edges)
const CHASE_DURATION_VERTICAL = 4; // seconds to cross the page's height (left and right edges)
const CHASE_DELAY = 1; // seconds between each front runner
const TRAIL_DELAY = 1; // seconds between Melinoe and the first follower, and between followers (smaller = tighter)
const CHASE_SHAKE = 1; // px of side-to-side shake

// Every icon in running order (front to back) with its start delay
const CHASERS = [
  ...CHASE_ICONS.map((icon, i) => ({ icon, delay: i * CHASE_DELAY })),
  ...CHASE_FOLLOWERS.map((icon, k) => ({
    icon,
    delay: (CHASE_ICONS.length - 1) * CHASE_DELAY + (k + 1) * TRAIL_DELAY,
  })),
];

// Same pages as header.jsx (Home is left out since this is the home page).
// Set `external: true` for links that open in a new tab.
const LINK_GROUPS = [
  {
    title: "Runs",
    links: [
      { label: "Hades 2 Runs", to: "/Run" },
      { label: "Fear Ladder", to: "/FearLadder" },
      { label: "Fear Record", to: "/FearRecord" },
      // { label: "Speed Ladder", to: "/SpeedLadder" },
      // { label: "Speed Record", to: "/SpeedRecord" },
    ],
  },
  {
    title: "Stats",
    links: [
      { label: "Total Stats", to: "/Stats" },
      // { label: "First Max Fear", to: "/FirstMaxFear" },
      // { label: "Player Stats", to: "/Player" },
    ],
  },
  {
    title: "Tool",
    links: [
      { label: "Fear Calculator & Arcana", to: "/ArcanaVow" },
      { label: "Biome Room Map", to: "/BiomeMap" },
    ],
  },
  {
    title: "Submit",
    links: [
      { label: "Run Submission", to: "/Submit" },
      // {
      //   label: "Submission Rules",
      //   to: "https://docs.google.com/document/d/1hhMu0jR8lSzZ2mtyteqW7NDy9wpIbra3d2RJkmYFhAI/edit?tab=t.0",
      //   external: true,
      // },
      // { label: "Speedrun Submission", to: "https://www.speedrun.com/hades2", external: true },
    ],
  },
];

const buttonClass =
  "rounded border border-white/20 bg-black/50 px-5 py-2 text-gray-300 transition-colors hover:border-white/60 hover:bg-black/80";

// One flat list of cards for the carousel (the group title becomes a small label on each card)
const CARDS = LINK_GROUPS.flatMap((group) => group.links.map((link) => ({ ...link, group: group.title })));

const VISIBLE_CARDS = 5; // how many cards are on screen at once; the rest stay hidden (scale 0, opacity 0) until scrolled onto
const CARD_SPACING = 0.1; // stagger between cards: smaller = cards bunch closer together
const CARD_REACH = 240; // how far the outer cards travel from the center, in % of a card's width: smaller = closer
const CARD_CURVE = 3; // 1 = evenly spaced; higher = bigger gap beside the center card and tighter outer cards

// Maps the card's travel (0 to 1) to its position: it leaps away from the center quickly, then the outer cards bunch up.
const spreadEase = (p) => {
  const u = Math.abs(2 * p - 1); // 1 at either end, 0 at the center
  const o = 1 - Math.pow(1 - u, CARD_CURVE);
  return p < 0.5 ? (1 - o) / 2 : (1 + o) / 2;
};
const LOOP_AT_ENDS = true; // true: scrolling past the last card wraps to the first (and back). false: it just stops at the ends
const SCROLL_PER_CARD = 350; // px of scrolling needed to move from one card to the next: higher = slower, less sensitive

const cardClass =
  "relative flex h-full w-full flex-col items-center justify-end gap-1 rounded-lg border border-white/10 px-3 pb-5 text-gray-200 transition-colors hover:border-white/50";

// Each card flies in from the right, grows to full size in the middle, and shrinks away to the left.
// Only the middle of that trip is visible: the card VISIBLE_CARDS / 2 + 1 steps from the center is fully hidden, so
// exactly VISIBLE_CARDS cards show at rest and the next one grows in as you scroll toward it.
const CARD_LIFE = 1; // seconds a card's timeline spans (buildSeamlessLoop below assumes 1)
const CARD_HALF_WINDOW = ((VISIBLE_CARDS + 1) / 2) * CARD_SPACING; // seconds either side of the center where a card is visible
const WIN_START = CARD_LIFE / 2 - CARD_HALF_WINDOW;
const WIN_END = CARD_LIFE / 2 + CARD_HALF_WINDOW;
const spreadStart = spreadEase(WIN_START);
const spreadEnd = spreadEase(WIN_END);
// Card position (xPercent) at a point in its trip; same path as before, just only the visible part of it is animated.
const xAt = (p) => CARD_REACH * (1 - 2 * spreadEase(p));
const windowEase = (q) => (spreadEase(WIN_START + q * (WIN_END - WIN_START)) - spreadStart) / (spreadEnd - spreadStart);

// Size/opacity ramp: 0 at the edge of the window, 1 at the center. Tuned so the cards beside the center are ~80% and the
// outer visible ones ~55% (fixed points of this curve at 1/3 and 2/3 of the way in).
const fadeEase = (q) => 2.35 * q - 2.475 * q * q + 1.125 * q * q * q;

const animateCard = (el) => {
  const tl = gsap.timeline();
  tl.fromTo(
    el,
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      zIndex: 100,
      duration: CARD_HALF_WINDOW,
      yoyo: true,
      repeat: 1,
      ease: fadeEase,
      immediateRender: false,
    },
    WIN_START,
  )
    .fromTo(
      el,
      { xPercent: xAt(WIN_START) },
      { xPercent: xAt(WIN_END), duration: WIN_END - WIN_START, ease: windowEase, immediateRender: false },
      WIN_START,
    )
    .set({}, {}, CARD_LIFE); // pad the timeline to CARD_LIFE
  return tl;
};

// GreenSock's seamless-loop helper (from the pen): builds a timeline whose playhead can wrap forever.
function buildSeamlessLoop(items, spacing, animateFunc) {
  const overlap = Math.ceil(1 / spacing);
  const startTime = items.length * spacing + 0.5;
  const loopTime = (items.length + overlap) * spacing + 1;
  const rawSequence = gsap.timeline({ paused: true });
  const seamlessLoop = gsap.timeline({ paused: true, repeat: -1 });
  const l = items.length + overlap * 2;

  for (let i = 0; i < l; i++) {
    rawSequence.add(animateFunc(items[i % items.length]), i * spacing);
  }

  rawSequence.time(startTime);
  seamlessLoop
    .to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: "none" })
    .fromTo(
      rawSequence,
      { time: overlap * spacing + 1 },
      { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" },
    );
  return seamlessLoop;
}

const NO_REDUCED_MOTION = "(prefers-reduced-motion: no-preference)";
// Rain and chasers are decorative and costly, so they only run on tablet/desktop widths (matches Tailwind's `md` breakpoint).
const DESKTOP_MOTION = `${NO_REDUCED_MOTION} and (min-width: 768px)`;

function App() {
  const containerRef = useRef(null);
  const cardsRef = useRef(null);
  const proxyRef = useRef(null);
  const draggedRef = useRef(false); // true while a drag is happening, so a drag doesn't also click a link
  const [showCacheAlert, setShowCacheAlert] = useState(true); // dismissible hint to hard-refresh the cache
  const [motionOn, setMotionOn] = useState(false); // rain + chasers on/off

  // Rain: a fixed pool of icons that loop forever. Each one is re-randomized
  // (image, glow color, position, size, tilt) every time it starts a new fall,
  // so nothing is created, appended or removed while the page is open.
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || P9_KEYS.length === 0 || !motionOn) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        let w = container.offsetWidth;
        let h = container.offsetHeight;
        const ro = new ResizeObserver(() => {
          w = container.offsetWidth;
          h = container.offsetHeight;
        });
        ro.observe(container);

        const randomize = (img) => {
          const color = `hsl(${gsap.utils.random(0, 360)} 100% 60%)`;
          img.src = `./Boons/${gsap.utils.random(P9_KEYS)}.png`;
          img.style.filter = `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 14px ${color})`;
        };

        gsap.utils.toArray(".rain-icon").forEach((img, i) => {
          randomize(img);
          gsap.fromTo(
            img,
            {
              x: () => gsap.utils.random(0, w), // spawn anywhere along the top edge
              y: -ICON_SIZE,
              xPercent: -50, // center the icon on the spawn point
              yPercent: -50,
              scale: () => gsap.utils.random(0.6, 1.2), // different sizes = depth
              rotation: () => gsap.utils.random(-15, 15),
            },
            {
              x: () => `+=${gsap.utils.random(-15, 15)}`, // tiny sideways drift
              y: () => h + ICON_SIZE,
              rotation: () => gsap.utils.random(-30, 30),
              // Speed-based duration so drops fall at a similar pace on any height.
              // Fixed per slot (GSAP can't re-randomize duration on repeat).
              duration: (h + ICON_SIZE * 2) / gsap.utils.random(150, 250),
              ease: "power1.in", // speeds up slightly like gravity
              repeat: -1,
              repeatRefresh: true, // re-runs the random functions on every loop
              delay: (i * SPAWN_EVERY_MS) / 1000, // stagger the slots
              onRepeat: () => randomize(img),
            },
          );
        });

        return () => ro.disconnect();
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [motionOn], revertOnUpdate: true },
  );

  // Hero entrance timeline
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-title", { y: 40, opacity: 0, duration: 0.8 });
    },
    { scope: containerRef },
  );

  // Infinite scroll / drag / snap carousel (GreenSock pen RwKwLWK)
  useGSAP(
    () => {
      const container = containerRef.current;
      const cards = gsap.utils.toArray(".carousel-card");
      if (!container || !cardsRef.current || cards.length === 0) return;

      let iteration = 0; // bumps each time we wrap past the start/end of the scroll range
      gsap.set(cards, { xPercent: CARD_REACH, opacity: 0, scale: 0 });

      const count = cards.length;
      // The scroll range runs from the first card to the LAST card (not back to the first again),
      // so one scroll lap covers count - 1 steps. Scrolling past the last card wraps to the first.
      const lapLength = (count - 1) * CARD_SPACING;
      // One full turn of the carousel is exactly count * spacing. Using this instead of the loop timeline's own
      // duration() keeps every lap aligned with the cards (the timeline reports a longer duration than one turn,
      // which made the wrap sweep through extra cards).
      const loopSpan = count * CARD_SPACING;
      const seamlessLoop = buildSeamlessLoop(cards, CARD_SPACING, animateCard);
      const playhead = { offset: 0 };
      const wrapTime = gsap.utils.wrap(0, loopSpan);

      // Reused tween that smoothly scrubs the loop's playhead
      const scrub = gsap.to(playhead, {
        offset: 0,
        onUpdate() {
          seamlessLoop.time(wrapTime(playhead.offset));
        },
        duration: 0.5,
        ease: "power3",
        paused: true,
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 0,
        end: `+=${(count - 1) * SCROLL_PER_CARD}`,
        pin: container,
        onUpdate(self) {
          const scroll = self.scroll();
          if (LOOP_AT_ENDS && scroll > self.end - 1) {
            wrap(1, 3);
          } else if (LOOP_AT_ENDS && scroll < 1 && self.direction < 0) {
            wrap(-1, self.end - 3);
          } else {
            scrub.vars.offset = iteration * loopSpan + self.progress * lapLength;
            scrub.invalidate().restart();
          }
        },
      });

      // Snapped positions stay 2px away from either end; only real scrolling reaches the last 1px, which triggers a wrap.
      // (A 1px margin can round down to 0 on some screens/zoom levels and trigger a second, unwanted wrap.)
      const progressToScroll = (progress) => gsap.utils.clamp(2, trigger.end - 2, progress * trigger.end);

      function wrap(iterationDelta, scrollTo) {
        iteration += iterationDelta;
        // Jump instantly, even if the site has CSS smooth scrolling (which would sweep through every card)
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        trigger.scroll(scrollTo);
        trigger.update();
        root.style.scrollBehavior = previous;
      }

      function scrollToOffset(offset) {
        let step = Math.round(offset / CARD_SPACING); // nearest card, counted from the very first lap
        if (!LOOP_AT_ENDS) step = gsap.utils.clamp(0, count - 1, step); // stop at the first / last card
        const lap = Math.floor(step / count);
        const index = step - lap * count; // 0 = first card, count - 1 = last card
        const scroll = progressToScroll(count > 1 ? index / (count - 1) : 0);
        if (lap !== iteration) return wrap(lap - iteration, scroll);
        trigger.scroll(scroll);
      }

      // Snap to the nearest card when scrolling stops
      const onScrollEnd = () => scrollToOffset(scrub.vars.offset);
      ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

      const prev = container.querySelector(".carousel-prev");
      const next = container.querySelector(".carousel-next");
      const onPrev = () => scrollToOffset(scrub.vars.offset - CARD_SPACING);
      const onNext = () => scrollToOffset(scrub.vars.offset + CARD_SPACING);
      prev.addEventListener("click", onPrev);
      next.addEventListener("click", onNext);

      // Dragging (mouse + touch)
      Draggable.create(proxyRef.current, {
        type: "x",
        trigger: cardsRef.current,
        dragClickables: true,
        allowContextMenu: true,
        onPress() {
          this.startOffset = scrub.vars.offset;
        },
        onDragStart() {
          draggedRef.current = true;
        },
        onDrag() {
          scrub.vars.offset = this.startOffset + (this.startX - this.x) * (CARD_SPACING / 100); // same drag distance per card at any spacing
          scrub.invalidate().restart();
        },
        onDragEnd() {
          scrollToOffset(scrub.vars.offset);
        },
        onRelease() {
          // Let the click event (if any) fire first, then allow links to work again
          setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        },
      });

      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
        prev.removeEventListener("click", onPrev);
        next.removeEventListener("click", onNext);
      };
    },
    { scope: containerRef },
  );

  // Icons chasing each other around the edge of the page:
  // bottom (left to right), right side (up), top (right to left), left side (down), repeat.
  // Uses x/y transforms (compositor-friendly) instead of left/top (layout every frame).
  useGSAP(
    () => {
      if (!motionOn) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const timelines = gsap.utils.toArray(".chaser").map((el, i) => {
          const img = el.querySelector("img");
          const track = el.parentElement;

          // Function-based values are re-read whenever the timeline is invalidated
          const maxX = () => track.clientWidth - el.offsetWidth;
          const maxY = () => track.clientHeight - el.offsetHeight;

          // Hidden until it's its turn to run (otherwise it would sit and shake in a corner)
          gsap.set(el, { autoAlpha: 0 });
          gsap.to(el, { autoAlpha: 1, duration: 0.3, delay: CHASERS[i].delay });

          const tl = gsap.timeline({
            repeat: -1,
            delay: CHASERS[i].delay, // each icon starts later than the one in front
            defaults: { ease: "none" },
          });

          tl.set(el, { x: 0, y: maxY })
            .set(img, { scaleX: -1 }) // facing right
            // bottom edge, left to right
            .to(el, { x: maxX, duration: CHASE_DURATION })
            // right edge, upward
            .to(el, { y: 0, duration: CHASE_DURATION_VERTICAL })
            .set(img, { scaleX: 1 }) // facing left
            // top edge, right to left
            .to(el, { x: 0, duration: CHASE_DURATION })
            // left edge, downward
            .to(el, { y: maxY, duration: CHASE_DURATION_VERTICAL });

          // Shake: runs on the inner image so it doesn't fight the travel tweens
          gsap.fromTo(
            img,
            { x: -CHASE_SHAKE, rotation: -6 },
            {
              x: CHASE_SHAKE,
              rotation: 6,
              duration: 0.25,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: CHASERS[i].delay + i * 0.05, // offset so icons don't shake in lockstep
            },
          );

          return tl;
        });

        // Re-measure the track when the window size changes (debounced)
        let t;
        const onResize = () => {
          clearTimeout(t);
          t = setTimeout(() => timelines.forEach((tl) => tl.invalidate()), 150);
        };
        window.addEventListener("resize", onResize);

        return () => {
          clearTimeout(t);
          window.removeEventListener("resize", onResize);
        };
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [motionOn], revertOnUpdate: true },
  );

  return (
    <div className="relative h-screen overflow-hidden text-center font-[Dos] text-[15px]" ref={containerRef}>
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh bg-cover bg-center bg-[url('/mainBg.jpg')] brightness-25 hue-rotate-20" />
      {/* Dismissible hint: hard refresh to clear the cache */}
      {showCacheAlert && (
        <div
          role="alert"
          className="absolute inset-x-0 top-0 z-50 flex items-center justify-center gap-3 border-b border-white/20 bg-black/80 px-4 py-2 text-sm text-gray-200 backdrop-blur text-[16px]"
        >
          <p>
            Not seeing the latest changes? Hard refresh to clear your cache:{" "}
            <kbd className="rounded border border-[yellow] text-[13px] px-1.5 py-0.5">Cmd</kbd> +{" "}
            <kbd className="rounded border border-[yellow] text-[13px] px-1.5 py-0.5">Shift</kbd> +{" "}
            <kbd className="rounded border border-[yellow] text-[13px] px-1.5 py-0.5">R</kbd> on Mac, or{" "}
            <kbd className="rounded border border-[yellow] text-[13px] px-1.5 py-0.5">Ctrl</kbd> +{" "}
            <kbd className="rounded border border-[yellow] text-[13px] px-1.5 py-0.5">Shift</kbd> +{" "}
            <kbd className="rounded border border-[yellow] text-[13px] px-1.5 py-0.5">R</kbd> on Windows.
          </p>
          <button
            type="button"
            aria-label="Close alert"
            onClick={() => setShowCacheAlert(false)}
            className="shrink-0 rounded px-2 text-lg leading-none text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Rain icon pool (positioned and animated by GSAP) */}
      {Array.from({ length: RAIN_COUNT }, (_, i) => (
        <img
          key={i}
          alt=""
          decoding="async"
          className={`rain-icon pointer-events-none absolute left-0 top-0 h-8 w-8 will-change-transform max-md:hidden ${motionOn ? "" : "hidden"}`}
        />
      ))}

      {/* Content */}
      <h1 className="hero-title absolute inset-x-0 top-10 z-10 text-5xl font-bold">H2Crossroads</h1>

      {/* Carousel: cards are positioned and animated by GSAP */}
      <ul
        ref={cardsRef}
        className="absolute left-1/2 top-1/2 z-20 h-64 w-44 md:h-80 md:w-54 -translate-x-1/2 -translate-y-1/2 select-none bg-[#0e0c12]"
        style={{
          borderStyle: "solid",
          borderWidth: "15px",
          borderImage: "url('/Misc/frame.webp') 50 stretch",
        }}
      >
        {CARDS.map((link, index) => {
          const content = (
            <>
              <span className="text-sm text-gray-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">{link.group}</span>
              <span className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{link.label}</span>
            </>
          );
          const onClick = (e) => {
            if (draggedRef.current) e.preventDefault(); // a drag shouldn't open the link
          };
          return (
            <li key={link.to} className={`carousel-card absolute inset-0`}>
              <div
                className="absolute inset-0 overflow-hidden rounded-lg bg-center bg-cover"
                style={{ backgroundImage: `url("/Arcana/c${index + 1}.png")` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 via-40% to-transparent" />
              </div>
              {link.external ? (
                <a
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  onClick={onClick}
                  className={cardClass}
                >
                  {content}
                </a>
              ) : (
                <Link to={link.to} draggable={false} onClick={onClick} className={cardClass}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
          Scroll, drag, or use the buttons
        </p>
        <div className="flex gap-4">
          <button type="button" className={`carousel-prev ${buttonClass}`}>
            Prev
          </button>
          <button type="button" className={`carousel-next ${buttonClass}`}>
            Next
          </button>
          <button type="button" aria-pressed={motionOn} onClick={() => setMotionOn((v) => !v)} className={buttonClass}>
            Effects: {motionOn ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Invisible element Draggable moves around to track the drag distance */}
      <div ref={proxyRef} className="invisible absolute" />

      {/* Chase track around the edge of the page */}
      <div className={`pointer-events-none absolute inset-2 z-10 max-md:hidden ${motionOn ? "" : "hidden"}`}>
        {CHASERS.map(({ icon }, i) => (
          <div key={`${icon}-${i}`} className="chaser absolute left-0 top-0 h-10 w-10 will-change-transform">
            <img src={`./Misc/${icon}.png`} alt="" className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
