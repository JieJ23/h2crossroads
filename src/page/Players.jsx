import PageBlock from "../block/pageBlock";
import highFearData from "../assets/json/V.json";
import { allAspectsInOrder } from "../util/misc";
import Loading from "../block/loading";
import { useData } from "../hooks/DataFetch";

import { useState, useMemo } from "react";

const REGIONS = ["Underworld", "Surface"];
const ASPECT_KEY = "asp"; // field on a run that holds the aspect
const FEAR_KEY = "fea"; // field on a run that holds the fear

const ASPECT_SET = new Set(allAspectsInOrder);

const makeEmptyPlayer = () =>
  Object.fromEntries(allAspectsInOrder.map((aspect) => [aspect, REGIONS.map((region) => ({ [region]: null }))]));

export default function Player() {
  const { posts, loader } = useData();
  const [player, setPlayer] = useState("");

  const allRuns = useMemo(() => [...highFearData, ...(posts || [])], [posts]);



  const { bestRuns, overallBest } = useMemo(() => {
    const byPlayer = {};
    const overall = makeEmptyPlayer();

    const isBetter = (candidate, current) =>
      current === null || Number(candidate[FEAR_KEY]) > Number(current[FEAR_KEY]);

    for (const run of allRuns) {
      const regionIndex = REGIONS.indexOf(run.loc);
      const aspect = run[ASPECT_KEY];
      if (regionIndex === -1 || !ASPECT_SET.has(aspect)) continue;

      // per player
      const playerEntry = (byPlayer[run.nam] ??= makeEmptyPlayer())[aspect][regionIndex];
      if (isBetter(run, playerEntry[run.loc])) playerEntry[run.loc] = run;

      // across everyone
      const overallEntry = overall[aspect][regionIndex];
      if (isBetter(run, overallEntry[run.loc])) overallEntry[run.loc] = run;
    }

    return { bestRuns: byPlayer, overallBest: overall };
  }, [allRuns]);

  const allAvailablePlayers = useMemo(() => Object.keys(bestRuns), [bestRuns]).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
  // Safely get current player data or fallback to empty structure
  const currentPlayerRuns = player ? (bestRuns[player] ?? makeEmptyPlayer()) : overallBest;


  return (
    <PageBlock>
      {loader ? (
        <Loading />
      ) : (
        <div className="my-4">
          <div className="my-4 text-center font-[Mar] text-[20px]">
            {player ? `${player}'s Entries` : "All Entries"}
          </div>
          <div className="flex justify-center my-4">
            <select
              className={`w-50 text-center select bg-[#1e123c] border-none rounded outline-none`}
              value={player}
              aria-label="Player"
              onChange={(e) => setPlayer(e.target.value)}
            >
              <option value={""}>All Players</option>
              {allAvailablePlayers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-250 mx-auto">
            {allAspectsInOrder.map((ite) => {
              const aspectData = currentPlayerRuns[ite];
              // Underworld is index 0, Surface is index 1 based on your makeEmptyPlayer setup
              const underworldRun = aspectData?.[0]?.["Underworld"];
              const surfaceRun = aspectData?.[1]?.["Surface"];

              const isMaxFear = (fear) => Number(fear) === 67;

              return (
                <div
                  key={ite}
                  className="h-30 border border-white/10 rounded flex items-center bg-linear-to-t from-[#0e0c12] to-black/50"
                >
                  <img src={`/Cards/${ite}.png`} alt="Aspect Cards" className="aspect-card h-full w-auto" />
                  <div className="flex flex-col w-full h-full">
                    {/* Surface Section (Index 1) */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <img src="/Biome/Surface.png" alt="Biome" className="size-8" />
                      <div className={`flex flex-col text-start`}>

                        <div className={`${isMaxFear(surfaceRun?.[FEAR_KEY]) ? "text-yellow-300 font-semibold" : ""}`}>{Number(surfaceRun?.[FEAR_KEY]) === 67 ? "Max Fear" : (surfaceRun?.[FEAR_KEY] ?? "")}</div>
                        <div>{surfaceRun?.tim ?? ""}</div>
                      </div>
                    </div>
                    {/* Underworld Section (Index 0) */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <img src="/Biome/Underworld.png" alt="Biome" className="size-8" />
                      <div className={`flex flex-col text-start`}>

                        <div className={`${isMaxFear(underworldRun?.[FEAR_KEY]) ? "text-green-400 font-semibold" : ""}`}>{Number(underworldRun?.[FEAR_KEY]) === 67 ? "Max Fear" : (underworldRun?.[FEAR_KEY] ?? "")}</div>
                        <div>{underworldRun?.tim ?? ""}</div>
                      </div>
                    </div>
                  </div>
                  <img src={`/Cards/${ite}.png`} alt="Aspect Cards" className="h-full w-auto block md:hidden" />
                </div>
              );
            })}
          </div>
        </div>
      )
      }
    </PageBlock >
  );
}
