import PageBlock from "../block/pageBlock";
import mergedOrderData from "../assets/json/bundle";

import { Link } from "react-router-dom";
import { getYTid, sToA } from "../util/misc";
import { hammerID } from "../util/hammerId";
import { allAspectsInOrder, parseTimetoMs } from "../util/misc";

import { useReducer, useMemo, useState, useEffect, useCallback } from "react";
import FilterDrawer from "../block/filterDrawer";
import { useData } from "../hooks/DataFetch";
import Loading from "../block/loading";

// Util Func
const videoLinks = ["yout", "bilib", "twitch"];
const biomeColor = (biome) => {
  switch (biome) {
    case "Underworld":
      return "#50C878";
    case "Surface":
      return "#FFEA00";
    case "Dream":
      return "#BF40BF";
    default:
      return "green";
  }
};

function findLoc(loc) {
  if (loc !== "Surface" && loc !== "Underworld") {
    return "Dream";
  } else {
    return loc;
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
// One object holds every piece of UI state that used to live in useState.
//   aspect   : "" = all, otherwise an aspect name (compared to obj.asp)
//   category : "" = all, otherwise "Underworld" | "Surface" | "Dream"
//   sort     : "" = original order, otherwise "Latest" | "Oldest" | "Fear" | "Speed"
//   player   : "" = all, otherwise a player name (compared to obj.nam)
//   minFear  : lowest fear to include (obj.fea >= minFear)
//   maxFear  : highest fear to include (obj.fea <= maxFear)
//   minTime  : minimum time as selected, in minutes (0-30)
//   maxTime  : maximum time as selected, in minutes (0-30)
//   unseeded : true = only entries where obj.type === "Unseeded"
//   videoOnly: true = only entries whose obj.src is a video link (videoLinks)
//   unique   : true = keep only one entry per player (obj.nam)
//   page     : 1-based current page
const FEAR_MIN = 0;
const FEAR_MAX = 67;
const FEAR_OPTIONS = Array.from({ length: FEAR_MAX - FEAR_MIN + 1 }, (_, i) => FEAR_MIN + i);

// Unique player names from the data, A-Z ignoring capitalization.
// Built once at module level since the data never changes.
const PLAYERS = [...new Set(mergedOrderData.map((obj) => obj.nam).filter(Boolean))].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: "base" }),
);

// Time selects offer whole minutes 0 to 30 (default 0 and 30). At filter time the
// selected minutes are turned into ms, and each entry's obj.tim (mm:ss.ms) is
// turned into ms with parseTimetoMs, so the comparison is exact, not rounded.
const MS_PER_MIN = 6000;
const TIME_MIN = 0;
const TIME_MAX = 30;
const TIME_OPTIONS = Array.from({ length: TIME_MAX - TIME_MIN + 1 }, (_, i) => TIME_MIN + i);

const initialState = {
  aspect: "",
  player: "",
  category: "",
  sort: "",
  minFear: FEAR_MIN,
  maxFear: FEAR_MAX,
  minTime: TIME_MIN,
  maxTime: TIME_MAX,
  unseeded: false,
  videoOnly: false,
  unique: false,
  page: 1,
};

function runsReducer(state, action) {
  switch (action.type) {
    // Changing a filter or the sort order can shrink the result list,
    // so every one of them sends the user back to page 1.
    case "SET_ASPECT":
      return { ...state, aspect: action.payload, page: 1 };
    case "SET_PLAYER":
      return { ...state, player: action.payload, page: 1 };
    case "SET_CATEGORY":
      return { ...state, category: action.payload, page: 1 };
    case "SET_SORT":
      return { ...state, sort: action.payload, page: 1 };
    // Keep min <= max: if the user pushes one past the other, drag the other along.
    case "SET_MIN_FEAR":
      return {
        ...state,
        minFear: action.payload,
        maxFear: Math.max(state.maxFear, action.payload),
        page: 1,
      };
    case "SET_MAX_FEAR":
      return {
        ...state,
        maxFear: action.payload,
        minFear: Math.min(state.minFear, action.payload),
        page: 1,
      };
    case "SET_MIN_TIME":
      return {
        ...state,
        minTime: action.payload,
        maxTime: Math.max(state.maxTime, action.payload),
        page: 1,
      };
    case "SET_MAX_TIME":
      return {
        ...state,
        maxTime: action.payload,
        minTime: Math.min(state.minTime, action.payload),
        page: 1,
      };
    case "SET_UNSEEDED":
      return { ...state, unseeded: action.payload, page: 1 };
    case "SET_VIDEO_ONLY":
      return { ...state, videoOnly: action.payload, page: 1 };
    case "SET_UNIQUE":
      return { ...state, unique: action.payload, page: 1 };
    case "RESET_ALL":
      return initialState;
    case "NEXT_PAGE":
      return { ...state, page: state.page + 1 };
    case "PREV_PAGE":
      return { ...state, page: Math.max(1, state.page - 1) };
    default:
      return state;
  }
}

// Date helper. Assumes obj.dat is something Date can parse (e.g. "2025-03-14").
// If your dates are DD/MM/YYYY, convert them here.
const toTime = (d) => {
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const DEFAULT_CORES = ["Attack", "Special", "Cast", "Sprint", "Magick"];

// View toggle icons
function GridIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M3 10h18M3 15h18M9 10v10" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
    </svg>
  );
}

// Tooltip bubble that shows a run's description (obj.des)
const DesTip = ({ text }) => (
  <div className="tooltip-content p-0 rounded">
    <div className="bg-white text-black p-1 px-2 rounded font-semibold text-[14px] max-w-64 whitespace-normal text-left">
      {text}
    </div>
  </div>
);

// Small bordered icon used by the table view
function BoonIcon({ src, alt, border = "/Boons/Border.png", name }) {
  return (
    <div className={`relative size-9 shrink-0 ${name ? "tooltip z-20" : ""}`}>
      {name && (
        <div className="tooltip-content p-0 rounded">
          <div className=" bg-white text-black p-1 px-2 rounded font-semibold text-[14px]">{name}</div>
        </div>
      )}
      <img src={border} alt="Border" className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full p-1 object-contain" loading="lazy" />
    </div>
  );
}

const ITEMS_PER_PAGE = 20;

export default function Run() {
  const { posts, loader } = useData();
  const [state, dispatch] = useReducer(runsReducer, initialState);
  const { aspect, player, category, sort, minFear, maxFear, minTime, maxTime, unseeded, videoOnly, unique, page } =
    state;

  const allRuns = useMemo(() => [...mergedOrderData, ...(posts || [])], [posts]);

  // Filter -> Sort (derived data, so it's computed, not stored in state)
  const filterData = useMemo(() => {
    const result = allRuns.filter((obj) => {
      const fear = Number(obj.fea) || 0;
      const ms = parseTimetoMs(obj.tim);
      return (
        (aspect === "" || obj.asp === aspect) &&
        (player === "" || obj.nam === player) &&
        (category === "" || findLoc(obj.loc) === category) &&
        (!unseeded || obj.type === "Unseeded") &&
        (!videoOnly || videoLinks.some((link) => (obj.src || "").includes(link))) &&
        fear >= minFear &&
        fear <= maxFear &&
        ms >= minTime * MS_PER_MIN &&
        ms <= maxTime * MS_PER_MIN
      );
    }); // already a new array, safe to sort

    switch (sort) {
      case "Oldest":
        result.sort((a, b) => toTime(a.dat) - toTime(b.dat));
        break;
      case "Fear":
        result.sort((a, b) => {
          const feaDiff = +b.fea - +a.fea;
          if (feaDiff !== 0) return feaDiff;
          return parseTimetoMs(a.tim) - parseTimetoMs(b.tim);
        });
        break;
      case "Speed":
        result.sort((a, b) => parseTimetoMs(a.tim) - parseTimetoMs(b.tim));
        break;
      case "Latest":
      default: // "" also means newest first
        result.sort((a, b) => toTime(b.dat) - toTime(a.dat));
    }

    // Unique players: runs after filtering and sorting, so the entry kept for each
    // player is the first one in the current order (e.g. their best run when sorted
    // by Fear or Speed, their newest run by default).
    if (unique) {
      const seen = new Set();
      return result.filter((obj) => {
        if (seen.has(obj.nam)) return false;
        seen.add(obj.nam);
        return true;
      });
    }
    return result;
  }, [allRuns, aspect, player, category, sort, minFear, maxFear, minTime, maxTime, unseeded, videoOnly, unique]);

  //   Pages
  const TOTAL_Page = Math.max(1, Math.ceil(filterData.length / ITEMS_PER_PAGE));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filterData.slice(start, end);
  }, [filterData, page]);
  //

  // ---- Mobile drawer ----
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  // ---- View toggle: "grid" | "table" ----
  const [view, setView] = useState("grid");

  // ---- Smooth scroll to top ----
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // If the screen grows past the md breakpoint, close the drawer (inline bar takes over)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => e.matches && setFiltersOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // The same controls are used by the inline bar and by the drawer.
  // inDrawer = true -> full-width, stacked, labelled fields.
  const renderFilters = (inDrawer) => {
    const selectCls = "select bg-[#1e123c] border-none rounded outline-none";
    const w = (wide) => (inDrawer ? "w-full" : wide);

    const field = (label, node) =>
      inDrawer ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-70">{label}</span>
          {node}
        </div>
      ) : (
        node
      );

    const pair = (label, a, b) =>
      inDrawer ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-70">{label}</span>
          <div className="grid grid-cols-2 gap-2">
            {a}
            {b}
          </div>
        </div>
      ) : (
        <>
          {a}
          {b}
        </>
      );

    return (
      <div className={inDrawer ? "flex flex-col gap-5" : "contents"}>
        {/* Reset everything (in the drawer it lives in the footer) */}
        {!inDrawer && (
          <button type="button" className="btn bg-[#1e123c] rounded" onClick={() => dispatch({ type: "RESET_ALL" })}>
            Reset
          </button>
        )}

        {/* 1. Aspect */}
        {field(
          "Aspect",
          <select
            className={`${selectCls} ${w("w-50")}`}
            value={aspect}
            aria-label="Aspect"
            onChange={(e) => dispatch({ type: "SET_ASPECT", payload: e.target.value })}
          >
            <option value={""}>All Aspect</option>
            {allAspectsInOrder.map((ite) => (
              <option key={ite} value={ite}>
                {ite}
              </option>
            ))}
          </select>,
        )}

        {/* 2. Sort (obj.dat / fear / speed) */}
        {field(
          "Sort by",
          <form className="filter py-1" onReset={() => dispatch({ type: "SET_SORT", payload: "" })}>
            <input className="btn bg-[#1e123c] rounded btn-square" type="reset" value="×" />
            {["Latest", "Oldest", "Fear", "Speed"].map((opt) => (
              <input
                key={opt}
                className="btn bg-[#1e123c] font-normal rounded"
                type="radio"
                name="DataSort"
                aria-label={opt}
                checked={sort === opt}
                onChange={() => dispatch({ type: "SET_SORT", payload: opt })}
              />
            ))}
          </form>,
        )}

        {/* 3. Category */}
        {field(
          "Category",
          <form className="filter py-1" onReset={() => dispatch({ type: "SET_CATEGORY", payload: "" })}>
            <input className="btn bg-[#1e123c] rounded btn-square" type="reset" value="×" />
            {["Underworld", "Surface", "Dream"].map((cat) => (
              <input
                key={cat}
                className="btn bg-[#1e123c] font-normal  rounded"
                type="radio"
                name="Category"
                aria-label={cat}
                checked={category === cat}
                onChange={() => dispatch({ type: "SET_CATEGORY", payload: cat })}
              />
            ))}
          </form>,
        )}

        {/* 4. Player */}
        {field(
          "Player",
          <select
            className={`${selectCls} ${w("w-50")}`}
            value={player}
            aria-label="Player"
            onChange={(e) => dispatch({ type: "SET_PLAYER", payload: e.target.value })}
          >
            <option value={""}>All Players</option>
            {PLAYERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>,
        )}

        {/* 5. Fear range */}
        {pair(
          "Fear",
          <select
            className={`${selectCls} ${w("w-28")}`}
            value={minFear}
            aria-label="Minimum fear"
            onChange={(e) => dispatch({ type: "SET_MIN_FEAR", payload: Number(e.target.value) })}
          >
            {FEAR_OPTIONS.map((n) => (
              <option key={n} value={n}>
                Min {n}
              </option>
            ))}
          </select>,
          <select
            className={`${selectCls} ${w("w-28")}`}
            value={maxFear}
            aria-label="Maximum fear"
            onChange={(e) => dispatch({ type: "SET_MAX_FEAR", payload: Number(e.target.value) })}
          >
            {FEAR_OPTIONS.map((n) => (
              <option key={n} value={n}>
                Max {n}
              </option>
            ))}
          </select>,
        )}

        {/* 6. Time range, 0-30 min (obj.tim via parseTimetoMs) */}
        {pair(
          "Time",
          <select
            className={`${selectCls} ${w("w-32")}`}
            value={minTime}
            aria-label="Minimum time"
            onChange={(e) => dispatch({ type: "SET_MIN_TIME", payload: Number(e.target.value) })}
          >
            {TIME_OPTIONS.map((m) => (
              <option key={m} value={m}>
                Min {m}:00
              </option>
            ))}
          </select>,
          <select
            className={`${selectCls} ${w("w-32")}`}
            value={maxTime}
            aria-label="Maximum time"
            onChange={(e) => dispatch({ type: "SET_MAX_TIME", payload: Number(e.target.value) })}
          >
            {TIME_OPTIONS.map((m) => (
              <option key={m} value={m}>
                Max {m}:00
              </option>
            ))}
          </select>,
        )}

        {/* 7. Unseeded only (obj.type === "Unseeded") */}
        {field(
          "Seed",
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm rounded"
              checked={unseeded}
              onChange={(e) => dispatch({ type: "SET_UNSEEDED", payload: e.target.checked })}
            />
            <span>Unseeded only</span>
          </label>,
        )}

        {/* 8. Video only (obj.src is YouTube / Bilibili / Twitch, not a Drive image) */}
        {field(
          "Media",
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm rounded"
              checked={videoOnly}
              onChange={(e) => dispatch({ type: "SET_VIDEO_ONLY", payload: e.target.checked })}
            />
            <span>Video only</span>
          </label>,
        )}

        {/* 9. One entry per player (obj.nam) */}
        {field(
          "Players",
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm rounded"
              checked={unique}
              onChange={(e) => dispatch({ type: "SET_UNIQUE", payload: e.target.checked })}
            />
            <span>Unique players</span>
          </label>,
        )}
      </div>
    );
  };

  return (
    <PageBlock>
      <div className="my-4 select-none">
        {loader ? (
          <Loading />
        ) : (
          <>
            {/* Filters: inline bar on md+ screens */}
            <div className="hidden md:flex my-4 px-2 flex-wrap items-center gap-2">{renderFilters(false)}</div>

            {/* Filters: button + drawer on small screens */}
            <div className="md:hidden my-4 px-2">
              <button
                type="button"
                className="btn bg-[#ffffff] text-black rounded w-full"
                onClick={() => setFiltersOpen(true)}
              >
                Filters
              </button>

              <FilterDrawer
                open={filtersOpen}
                onClose={closeFilters}
                title="Filters"
                footer={
                  <>
                    <button
                      type="button"
                      className="btn bg-[#ffffff] text-black rounded flex-1"
                      onClick={() => dispatch({ type: "RESET_ALL" })}
                    >
                      Reset
                    </button>
                    <button type="button" className="btn bg-[#ffffff] text-black rounded flex-1" onClick={closeFilters}>
                      Show {filterData.length}
                    </button>
                  </>
                }
              >
                {renderFilters(true)}
              </FilterDrawer>
            </div>
            {/* Info Display */}
            <div className="px-2 flex flex-wrap my-4 text-black">
              <div className="border p-1 px-2 border-white/10 rounded bg-white hidden md:block">
                {filterData.length} Entries
              </div>
              <div className="join ml-auto" role="group" aria-label="View mode">
                {[
                  ["grid", "Grid view", <GridIcon key="g" />],
                  ["table", "Table view", <TableIcon key="t" />],
                ].map(([key, label, icon]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={view === key}
                    aria-label={label}
                    title={label}
                    className={`join-item btn btn-sm btn-square border-none ${
                      view === key ? "bg-white text-black" : "bg-[#1e123c] text-white"
                    }`}
                    onClick={() => setView(key)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            {/* Entry Display */}
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4 select-none">
                {paginatedData.map((obj, index) => (
                  <div className="rounded-lg scale-90 sm:scale-100" key={index}>
                    <Link
                      to={obj.src || "#"}
                      target="_blank"
                      aria-disabled={!obj.src}
                      tabIndex={obj.src ? undefined : -1}
                      className={!obj.src ? "cursor-default" : ""}
                      onClick={(e) => {
                        // No source available: block the redirect
                        if (!obj.src) e.preventDefault();
                      }}
                    >
                      {videoLinks.some((link) => obj.src.includes(link)) ? (
                        <img
                          src={`https://img.youtube.com/vi/${getYTid(obj.src)}/maxresdefault.jpg`}
                          alt="Video Thumbnail"
                          className="aspect-video relative border border-white/10 rounded-lg"
                          loading="lazy"
                          draggable={false}
                          onLoad={(e) => {
                            if (e.currentTarget.naturalWidth === 120 && e.currentTarget.naturalHeight === 90) {
                              e.currentTarget.src = `/Misc/${findLoc(obj.loc)}.webp`;
                            }
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `/Backgrounds/gameplay.webp`;
                            e.currentTarget.classList.add("brightness-75");
                          }}
                        />
                      ) : (
                        <div className="relative">
                          <img
                            src={`/Backgrounds/${findLoc(obj.loc)}.webp`}
                            alt="Victory Screen"
                            className="aspect-video w-full rounded border border-black/50 brightness-75"
                            loading="lazy"
                            draggable={false}
                          />
                          <div className="absolute inset-0 flex justify-center items-center">
                            <img
                              src={`/Backgrounds/${obj.asp}.webp`}
                              alt="Aspects"
                              className="w-[50%] h-auto translate-x-3 drop-shadow-[0_0_5px_blue]"
                              loading="lazy"
                            />
                          </div>
                          <img
                            src={`/Cards/${obj.asp}.png`}
                            alt="Familiar"
                            className="absolute bottom-2 left-2 w-15 sm:w-12 h-auto"
                            loading="lazy"
                          />
                          {obj.fam && (
                            <img
                              src={`/Cards/${obj.fam}.png`}
                              alt="Familiar"
                              className="absolute bottom-2 right-2 w-15 sm:w-12 h-auto"
                              loading="lazy"
                            />
                          )}
                        </div>
                      )}
                    </Link>
                    <div className="p-0.5 px-2 text-[18px] sm:text-[15px]">
                      <div className="p-0.5 px-2 text-center">
                        {obj.fea !== 0 && obj.fea} - {findLoc(obj.loc)} - {obj.tim}
                      </div>
                      <div className="flex">
                        <div className="relative size-10 md:size-8 shrink-0">
                          <img
                            src="/Boons/Border.png"
                            alt="Border"
                            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                          />
                          <img
                            src={`/Boons/${obj.asp}.png`}
                            alt="Core Boons"
                            className="absolute inset-0 w-full h-full p-1 object-contain"
                          />
                        </div>
                        {obj.fam && (
                          <div className="relative size-10 md:size-8 shrink-0">
                            <img
                              src="/Boons/Border.png"
                              alt="Border"
                              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                            />
                            <img
                              src={`/Boons/${obj.fam}.png`}
                              alt="Core Boons"
                              className="absolute inset-0 w-full h-full p-1 object-contain"
                            />
                          </div>
                        )}
                        {obj.cor
                          ? sToA(obj.cor).map((ite) => (
                              <div key={ite} className="relative size-11 md:size-9 shrink-0">
                                <img
                                  src="/Boons/Border.png"
                                  alt="Border"
                                  className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                                />
                                <img
                                  src={`/Boons/${ite}.png`}
                                  alt="Core Boons"
                                  className="absolute inset-0 w-full h-full p-1 object-contain"
                                />
                              </div>
                            ))
                          : [`Attack`, `Special`, `Cast`, `Sprint`, `Magick`].map((ite) => (
                              <div key={ite} className="relative size-11 md:size-9 shrink-0">
                                <img
                                  src="/Boons/Border.png"
                                  alt="Border"
                                  className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                                />
                                <img
                                  src={`/Boons/${ite}.png`}
                                  alt="Core Boons"
                                  className="absolute inset-0 w-full h-full p-1 object-contain"
                                />
                              </div>
                            ))}
                      </div>
                      <div className="flex">
                        {obj.ham &&
                          sToA(obj.ham).map((ite) => (
                            <div key={ite} className="tooltip z-20">
                              <div className="tooltip-content p-0 rounded">
                                <div className=" bg-white text-black p-1 px-2 rounded font-semibold text-[14px]">
                                  {ite}
                                </div>
                              </div>
                              <div className="relative size-10 md:size-8 shrink-0">
                                <img
                                  src="/Boons/HamBorder.png"
                                  alt="Border"
                                  className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                                />
                                <img
                                  src={`/Hammers/${hammerID[ite]}.png`}
                                  alt="Hammers"
                                  className="absolute inset-0 w-full h-full p-1 object-contain"
                                />
                              </div>
                            </div>
                          ))}
                        {obj.ks &&
                          sToA(obj.ks).map((item) => (
                            <div key={item} className="tooltip z-20">
                              <div className="tooltip-content p-0 rounded">
                                <div className=" bg-white text-black p-1 px-2 rounded font-semibold text-[14px]">
                                  {item}
                                </div>
                              </div>
                              <div className="relative size-10 md:size-8 shrink-0">
                                <img
                                  src="/Boons/Border.png"
                                  alt="Border"
                                  className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                                />
                                <img
                                  src={`/Keepsakes/${item}.png`}
                                  alt="Keepsakes"
                                  className="absolute inset-0 w-full h-full p-1 object-contain"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="p-0.5 px-2 flex justify-between">
                        <div className="flex items-center gap-1">
                          <div
                            className="cursor-pointer"
                            onClick={() => dispatch({ type: "SET_PLAYER", payload: obj.nam })}
                          >
                            {obj.nam}
                          </div>
                          {obj.des ? (
                            <div className="tooltip tooltip-top z-20 text-blue-400">
                              <DesTip text={obj.des} />
                              <InfoIcon />
                            </div>
                          ) : null}
                        </div>
                        <div>
                          {obj.dat.slice(0, 10)} /{" "}
                          <span
                            style={{
                              color: biomeColor(findLoc(obj.loc)),
                            }}
                          >
                            {obj.src !== ""
                              ? videoLinks.some((link) => obj.src.includes(link))
                                ? `Video`
                                : `Image`
                              : `-`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto px-2 mb-4">
                <table className="table">
                  <thead>
                    <tr className="text-white/80 border-white/10">
                      <th>Fear</th>
                      <th>Player</th>
                      <th>Biome</th>
                      <th>Time</th>
                      <th>Aspect</th>
                      <th>Core Boons</th>
                      <th>Hammers</th>
                      <th>Keepsakes</th>
                      <th>Date</th>
                      <th>Source</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody className="text-[16px]">
                    {paginatedData.map((obj, index) => {
                      const biome = findLoc(obj.loc);
                      const isVideo = videoLinks.some((link) => obj.src.includes(link));
                      return (
                        <tr key={`${obj.nam}-${obj.dat}-${obj.tim}`} className="hover:bg-white/5 border-white/10">
                          <td>{obj.fea !== 0 && obj.fea}</td>
                          <td>
                            <span
                              className="cursor-pointer hover:underline"
                              onClick={() => dispatch({ type: "SET_PLAYER", payload: obj.nam })}
                            >
                              {obj.nam}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: biomeColor(biome) }}>{biome}</span>
                          </td>
                          <td className="whitespace-nowrap">{obj.tim}</td>
                          <td>
                            <div className="flex">
                              <BoonIcon src={`/Boons/${obj.asp}.png`} alt={obj.asp} />
                              {obj.fam && <BoonIcon src={`/Boons/${obj.fam}.png`} alt={obj.fam} />}
                            </div>
                          </td>
                          <td>
                            <div className="flex">
                              {(obj.cor ? sToA(obj.cor) : DEFAULT_CORES).map((ite) => (
                                <BoonIcon key={ite} src={`/Boons/${ite}.png`} alt={ite} />
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="flex">
                              {obj.ham &&
                                sToA(obj.ham).map((ite) => (
                                  <BoonIcon
                                    key={ite}
                                    name={ite}
                                    border="/Boons/HamBorder.png"
                                    src={`/Hammers/${hammerID[ite]}.png`}
                                    alt={ite}
                                  />
                                ))}
                            </div>
                          </td>
                          <td>
                            <div className="flex">
                              {obj.ks &&
                                sToA(obj.ks).map((item) => (
                                  <BoonIcon key={item} name={item} src={`/Keepsakes/${item}.png`} alt={item} />
                                ))}
                            </div>
                          </td>
                          <td className="whitespace-nowrap">{obj.dat.slice(0, 10)}</td>
                          <td>
                            {obj.src !== "" ? (
                              <a
                                href={obj.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                style={{ color: biomeColor(biome) }}
                              >
                                {isVideo ? "Video" : "Image"}
                              </a>
                            ) : (
                              <div>-</div>
                            )}
                          </td>
                          <td>
                            {obj.des ? (
                              <div className="tooltip tooltip-left z-20 text-blue-400">
                                <DesTip text={obj.des} />
                                <InfoIcon />
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pag. */}
            <div className="join flex justify-center">
              <button
                className="join-item bg-white text-black btn"
                disabled={page === 1}
                onClick={() => dispatch({ type: "PREV_PAGE" })}
              >
                «
              </button>
              <button className="join-item bg-white text-black btn">
                {page}/{TOTAL_Page}
              </button>
              <button
                className="join-item bg-white text-black btn"
                disabled={page * ITEMS_PER_PAGE >= filterData.length}
                onClick={() => dispatch({ type: "NEXT_PAGE" })}
              >
                »
              </button>
            </div>
          </>
        )}
      </div>

      {/* Scroll to top */}
      <button
        type="button"
        aria-label="Scroll to top"
        onClick={scrollToTop}
        className="btn btn-circle bg-white text-black shadow-lg fixed bottom-4 right-4 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </PageBlock>
  );
}
