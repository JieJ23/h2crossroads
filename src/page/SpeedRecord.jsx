import { useData } from "../hooks/DataFetch";
import { usePfp } from "../hooks/PfpFetch";
import Loading from "../block/loading";
import mergedOrderData from "../assets/json/bundle";
import PageBlock from "../block/pageBlock";
import { memo, useMemo, useState } from "react";
import { parseTimetoMs } from "../util/misc";
import MarqueeModule from "react-fast-marquee";
const Marquee = MarqueeModule.default;

// Order matches the order of the arrays returned by buildDisplayCategory
const CATEGORY_REGION = ["Underworld", "Surface"];
const REGION_INDEX = { Underworld: 0, Surface: 1, Dream: 2 };

// Fastest first. Each row is a clear-time limit in minutes.
const TIME_LIMITS_MIN = [4, 5, 6];
const MS_PER_MIN = 6000;
const TIER_LIMITS = TIME_LIMITS_MIN.map((m) => m * MS_PER_MIN);
const SUB_CATEGORY = TIME_LIMITS_MIN.map((m) => `${m} Minutes`);

const addCategoryClasses = (region) => {
  switch (region) {
    case "Surface":
      return `hue-rotate-100`;
    case "Underworld":
      return `hue-rotate-140`;
  }
};

const addTextColor = (region) => {
  switch (region) {
    case "Surface":
      return `[#00ffaa]`;
    case "Underworld":
      return `text-green-300`;
  }
};

/* -------------------------------------------------------------------------- */
/*  Data pipeline                                                             */
/* -------------------------------------------------------------------------- */

const collator = new Intl.Collator();
const byName = (a, b) => collator.compare(a.nam, b.nam);

/**
 * Finds each player's fastest run per region (obj.tim via parseTimetoMs), then
 * places the player in the fastest time tier that run qualifies for.
 * Returns [underworld, surface, dream], each being one array per entry of
 * TIME_LIMITS_MIN ([3 min, 4 min, ... 8 min]) of rows { nam } sorted by name.
 * A player appears only in the fastest tier where they qualify, and runs
 * slower than the largest limit (or with an invalid time) are ignored.
 */
function buildDisplayCategory(entries) {
  // best[region] = Map<playerName, fastest time in ms>
  const best = CATEGORY_REGION.map(() => new Map());

  for (const e of entries) {
    const ms = parseTimetoMs(e.tim);
    if (!(ms > 0)) continue; // missing or unparseable time
    const players = best[REGION_INDEX[e.loc] ?? 2]; // anything else = Dream
    const current = players.get(e.nam);
    if (current === undefined || ms < current) players.set(e.nam, ms);
  }

  return best.map((players) => {
    const tiers = TIER_LIMITS.map(() => []);
    for (const [nam, ms] of players) {
      const t = TIER_LIMITS.findIndex((limit) => ms <= limit);
      if (t !== -1) tiers[t].push({ nam });
    }
    return tiers.map((rows) => rows.sort(byName));
  });
}

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

const AvatarItem = memo(function AvatarItem({ name, ind, region, profileImg }) {
  const bgClasses = addCategoryClasses(region);
  return (
    <div
      className={`rounded-none ${profileImg ? "aura" : ""}`}
      style={profileImg && profileImg[3] != "" ? { color: profileImg[3] } : { color: "fff" }}
    >
      <div
        className={`rounded  bg-[#0e0c12] flex flex-col justify-center items-center pt-4 w-full h-full ${ind < 4 ? `min-w-44 min-h-35` : `min-w-40 min-h-25`} relative overflow-hidden`}
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
export default function SpeedRecord() {
  const { posts, loader } = useData();
  const { pfp, pfploader } = usePfp();
  const [category, setCategory] = useState(0);

  // Single pass over all entries; only recomputed when `posts` changes,
  // not when `category` changes.
  const displayCategory = useMemo(
    () =>
      buildDisplayCategory(
        [...mergedOrderData, ...posts].filter((obj) => (obj.patch && obj.patch == "v1.0") || obj.patch == "v1.13x"),
      ),
    [posts],
  );

  const displayCurrentCategory = displayCategory[category];
  const region = CATEGORY_REGION[category];

  const PfpObjects = useMemo(
    () =>
      Object.fromEntries(pfp.map((item) => [item.Pfp, [item.ImgLink, item.Tag, item.Aspect, item.Colors, item.Fami]])),
    [pfp],
  );

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
              {(category === 0 ? displayCurrentCategory.slice(0, 2) : displayCurrentCategory).map((arr, ind) => (
                <div className="mb-16 rounded px-2" key={SUB_CATEGORY[ind]}>
                  <div className="px-4 md:text-start text-center">
                    <div className={`font-[Mar] text-[20px] md:text-[24px] leading-none ${addTextColor(region)}`}>
                      Sub {SUB_CATEGORY[ind]}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-1 p-1">
                    {arr.map((obj, index) => (
                      <AvatarItem
                        key={obj.nam}
                        name={obj.nam}
                        ind={ind}
                        region={region}
                        profileImg={PfpObjects[obj.nam]}
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
