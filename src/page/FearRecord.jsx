import { useData } from "../hooks/DataFetch";
import { usePfp } from "../hooks/PfpFetch";
import Loading from "../block/loading";
import earlyAccessData from "../assets/json/P.json";
import highFearData from "../assets/json/V.json";
import PageBlock from "../block/pageBlock";
import { memo, useMemo, useState, useRef } from "react";
import MarqueeModule from "react-fast-marquee";
const Marquee = MarqueeModule.default;

const ASPECT_COUNT = 24;

// Order matches the order of the arrays returned by buildDisplayCategory
const CATEGORY_REGION = ["Underworld", "Surface", "Dream"];
const REGION_INDEX = { Underworld: 0, Surface: 1, Dream: 2 };

const SUB_CATEGORY = [
  "Max Fear",
  "Max Fear All Aspects",
  "65 Fear All Aspects",
  "62 Fear All Aspects",
  "50 Fear All Aspects",
  "65 Fear",
  "62 Fear",
];

const addCategoryClasses = (region) => {
  switch (region) {
    case "Surface":
      return `hue-rotate-100`;
    case "Underworld":
      return `hue-rotate-140`;
    case "Dream":
      return `hue-rotate-0`;
  }
};

const addTextColor = (region) => {
  switch (region) {
    case "Surface":
      return `[#00ffaa]`;
    case "Underworld":
      return `text-green-300`;
    case "Dream":
      return `text-purple-400`;
  }
};

/* -------------------------------------------------------------------------- */
/*  Data pipeline                                                             */
/* -------------------------------------------------------------------------- */

// Highest tier first. Each tier is a subset of the ones below it.
const TIERS = [
  (fea, e) => fea >= 67 && e.type && e.type === "Unseeded", // 0: Max
  (fea) => fea >= 65, //                               1: 65
  (fea) => fea >= 62, //                               2: 62
  (fea) => fea >= 50, //                               3: 50
];

const collator = new Intl.Collator();
const byName = (a, b) => collator.compare(a.nam, b.nam);

/**
 * One pass over the entries, then one pass over the (small) per-player maps.
 * Returns [underworld, surface, dream], each being:
 *   [Max Fear, Max Fear AA, 65 AA, 62 AA, 50 AA, 65 Fear, 62 Fear]
 * Rows are { nam } and already sorted by name.
 * A player appears only in the highest tier where they qualify.
 */
function buildDisplayCategory(entries) {
  // buckets[region][tier] = Map<playerName, Set<aspect>>
  const buckets = CATEGORY_REGION.map(() => TIERS.map(() => new Map()));

  for (const e of entries) {
    const regionBuckets = buckets[REGION_INDEX[e.loc] ?? 2]; // anything else = Dream
    const fea = +e.fea;
    for (let t = 0; t < TIERS.length; t++) {
      if (!TIERS[t](fea, e)) continue;
      const players = regionBuckets[t];
      let aspects = players.get(e.nam);
      if (!aspects) players.set(e.nam, (aspects = new Set()));
      aspects.add(e.asp);
    }
  }
  4;
  return buckets.map((tiers) => {
    const claimedAny = new Set(); // had any run at a higher tier
    const claimedAA = new Set(); // completed all aspects at a higher tier
    const any = [];
    const aa = [];

    tiers.forEach((players) => {
      const anyRows = [];
      const aaRows = [];
      for (const [nam, aspects] of players) {
        const row = { nam };
        const completed = aspects.size === ASPECT_COUNT;
        if (!claimedAny.has(nam)) anyRows.push(row);
        if (completed && !claimedAA.has(nam)) aaRows.push(row);
        claimedAny.add(nam);
        if (completed) claimedAA.add(nam);
      }
      any.push(anyRows.sort(byName));
      aa.push(aaRows.sort(byName));
    });

    return [any[0], aa[0], aa[1], aa[2], aa[3], any[1], any[2]];
  });
}

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

const AvatarItem = memo(function AvatarItem({ name, ind, region, profileImg, func }) {
  const bgClasses = addCategoryClasses(region);
  return (
    <div
      className={`rounded-none ${profileImg ? "aura" : ""}`}
      style={profileImg && profileImg[3] != "" ? { color: profileImg[3] } : { color: "fff" }}
    >
      <div
        className={`rounded bg-[#0e0c12] flex flex-col justify-center items-center pt-4 w-full h-full ${ind < 4 ? `min-w-44 min-h-35` : `min-w-40 min-h-25`} relative overflow-hidden`}
      >
        <div
          className={`absolute top-0 right-0 h-full w-full bg-no-repeat bg-top bg-cover scale-[105%] ${bgClasses}`}
          style={{ backgroundImage: `url(/red.png)` }}
        />
        <div
          className={`absolute rotate-180 top-0 right-0 h-full w-full bg-no-repeat bg-top bg-cover scale-[105%] ${bgClasses}`}
          style={{ backgroundImage: `url(/red.png)` }}
        />

        <div className="grid grid-cols-2 items-center absolute w-full h-full left-0 top-0 opacity-35 p-1">
          {profileImg && profileImg[2] && (
            <img src={`/Cards/${profileImg[2]}.png`} alt="backgorund" className={`w-full translate-x-1`} />
          )}
          {profileImg && profileImg[4] && (
            <img src={`/Cards/${profileImg[4]}.png`} alt="backgorund" className={`w-full -translate-x-1`} />
          )}
        </div>
        <div className={`relative w-10 h-10 shrink-0`}>
          {profileImg ? (
            <img
              src={`${profileImg[0]}`}
              alt="Avatar"
              loading="lazy"
              className="w-10 h-10 rounded-full p-1 egg"
              draggable={false}
            />
          ) : (
            <img
              src="/placeholder_icon.png"
              alt="Avatar"
              loading="lazy"
              className="w-10 h-10 rounded-full p-1 egg drop-shadow-[0_0_6px_black]"
              draggable={false}
            />
          )}
        </div>
        <div
          className={`truncate z-20 ${profileImg && profileImg[2] && profileImg[4] && `bg-black/50 px-0.5`} rounded font-[Ale]`}
        >
          {name}
        </div>
        {profileImg && (
          <div
            className={` text-[13px] font-[Ale] my-1 mb-4 z-40 max-w-33 w-full text-center ${profileImg && profileImg[2] && profileImg[4] && `bg-black/50 px-0.5`} rounded`}
          >
            <Marquee speed={20}>{profileImg[1].replace("$#c!", "")}</Marquee>
          </div>
        )}
      </div>
    </div>
  );
});
export default function FearRecord() {
  const { posts, loader } = useData();
  const { pfp, pfploader } = usePfp();
  const [category, setCategory] = useState(0);

  // Single pass over all entries; only recomputed when `posts` changes,
  // not when `category` changes.
  const displayCategory = useMemo(() => buildDisplayCategory([...earlyAccessData, ...highFearData, ...posts]), [posts]);

  const displayCurrentCategory = displayCategory[category];
  const region = CATEGORY_REGION[category];

  const PfpObjects = useMemo(
    () =>
      Object.fromEntries(pfp.map((item) => [item.Pfp, [item.ImgLink, item.Tag, item.Aspect, item.Colors, item.Fami]])),
    [pfp],
  );

  // Players

  const maxFearRuns = [...earlyAccessData, ...highFearData, , ...posts].filter(
    (objs) => objs.type && objs.type === "Unseeded" && objs.fea == 67,
  );

  const firstMaxAspect = {};
  const earliestDate = {};

  for (const run of maxFearRuns) {
    const time = new Date(run.dat).getTime();
    if (!(run.nam in earliestDate) || time < earliestDate[run.nam]) {
      earliestDate[run.nam] = time;
      firstMaxAspect[run.nam] = run.asp;
    }
  }

  return (
    <div className="h-full min-h-lvh relative text-[12px] md:text-[14px] select-none overflow-x-hidden">
      <div>
        <PageBlock>
          {/*  */}
          {loader || pfploader ? (
            <Loading />
          ) : (
            <div>
              <div className="flex gap-2 justify-center my-10">
                {CATEGORY_REGION.map((r, index) => (
                  <img
                    key={r}
                    src={`/Biome/${r}.png`}
                    className={`border border-white/10 size-12 p-1 rounded-xl cursor-pointer ${category === index ? `bg-[#00ffaa]` : `bg-black`}`}
                    alt={r}
                    onClick={() => setCategory(index)}
                  />
                ))}
              </div>
              {/* ------------------------------- */}
              {displayCurrentCategory.map((arr, ind) => (
                <div className="mb-16 rounded px-2" key={SUB_CATEGORY[ind]}>
                  <div className="px-4 md:text-start text-center">
                    <div className={`font-[Mar] text-[20px] md:text-[24px] leading-none ${addTextColor(region)}`}>
                      {SUB_CATEGORY[ind]}
                    </div>
                    {ind === 0 && <div className=" text-gray-300">Unseeded and Unmodded</div>}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-1 p-1">
                    {arr.map((obj) => (
                      <AvatarItem
                        key={obj.nam}
                        name={obj.nam}
                        ind={ind}
                        region={region}
                        profileImg={PfpObjects[obj.nam]}
                        func={firstMaxAspect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageBlock>
      </div>
    </div>
  );
}
