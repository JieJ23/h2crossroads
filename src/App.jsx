import PageBlock from "./block/pageBlock";
import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { allAspectsInOrder } from "./util/misc";

// Replace with your real list / import it from wherever it lives
const P9_KEYS = [...allAspectsInOrder];

const SPAWN_EVERY_MS = 750; // ms between each rain slot's first drop, higher = slower
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
const CHASE_DELAY = 0.6; // seconds between each front runner
const TRAIL_DELAY = 0.3; // seconds between Melinoe and the first follower, and between followers (smaller = tighter)
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
      { label: "Speed Ladder", to: "/SpeedLadder" },
      { label: "Speed Record", to: "/SpeedRecord" },
    ],
  },
  {
    title: "Stats",
    links: [
      { label: "Total Stats", to: "/Stats" },
      { label: "First Max Fear", to: "/FirstMaxFear" },
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
      {
        label: "Submission Rules",
        to: "https://docs.google.com/document/d/1hhMu0jR8lSzZ2mtyteqW7NDy9wpIbra3d2RJkmYFhAI/edit?tab=t.0",
        external: true,
      },
      { label: "Speedrun Submission", to: "https://www.speedrun.com/hades2", external: true },
    ],
  },
];

const cardClass =
  "quick-card block rounded-lg border border-white/20 bg-black/60 px-4 py-3 text-gray-200 transition-colors hover:border-white/60 hover:bg-black/80";

const NO_REDUCED_MOTION = "(prefers-reduced-motion: no-preference)";

function App() {
  const containerRef = useRef(null);

  // Rain: a fixed pool of icons that loop forever. Each one is re-randomized
  // (image, glow color, position, size, tilt) every time it starts a new fall,
  // so nothing is created, appended or removed while the page is open.
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || P9_KEYS.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
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
    { scope: containerRef },
  );

  // Hero entrance timeline
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-title", { y: 40, opacity: 0, duration: 0.8 })
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.3")
        .from(".quick-card", { y: 30, opacity: 0, stagger: 0.12, duration: 0.5 }, "-=0.2");
    },
    { scope: containerRef },
  );

  // Icons chasing each other around the edge of the page:
  // bottom (left to right), right side (up), top (right to left), left side (down), repeat.
  // Uses x/y transforms (compositor-friendly) instead of left/top (layout every frame).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
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
    { scope: containerRef },
  );

  return (
    <div
      className="relative min-h-screen text-center flex flex-col justify-center items-center p-14 gap-4 overflow-hidden font-[Dos] text-[15px]"
      ref={containerRef}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh bg-cover bg-center bg-[url('/mainBg.jpg')] brightness-20 hue-rotate-20" />

      {/* Rain icon pool (positioned and animated by GSAP) */}
      {Array.from({ length: RAIN_COUNT }, (_, i) => (
        <img
          key={i}
          alt=""
          decoding="async"
          className="rain-icon pointer-events-none absolute left-0 top-0 h-8 w-8 rounded-full will-change-transform"
        />
      ))}

      {/* Content */}
      <h1 className="hero-title relative z-10 text-5xl font-bold">H2Crossroads</h1>

      <div className="relative z-10 mt-6 flex w-full max-w-4xl flex-col gap-6">
        {LINK_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <h2 className="text-lg text-gray-300">{group.title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.links.map((link) =>
                link.external ? (
                  <a key={link.to} href={link.to} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.to} to={link.to} className={cardClass}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Chase track around the edge of the page */}
      <div className="pointer-events-none absolute inset-2 z-10">
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
