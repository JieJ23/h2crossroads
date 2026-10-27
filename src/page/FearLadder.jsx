import PageBlock from "../block/pageBlock";
import highFearData from "../assets/json/V.json";
import { useState, useMemo } from "react";
import { useData } from "../hooks/DataFetch";
import { Link } from "react-router-dom";
import Loading from "../block/loading";
import { allAspectsInOrder, parseTimetoMs, sToA } from "../util/misc";

const unseededData = highFearData.filter((obj) => obj.type && obj.type == "Unseeded");

const FEAR_OPTIONS = [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67];
const LOCATIONS = ["Underworld", "Surface"];

export default function FearLadder() {
  const { posts, loader } = useData();
  const [location, setLocation] = useState(`Underworld`);
  const [maxFear, setMaxFear] = useState(67);

  const allRuns = useMemo(() => [...unseededData, ...(posts || [])], [posts]);

  const fullData = useMemo(() => {
    const TOP_N = 10;

    return allAspectsInOrder.map((aspect) => {
      const sorted = allRuns
        .filter(
          (obj) =>
            obj.asp === aspect &&
            obj.loc === location && // only Underworld or Surface, anything else is dropped
            Number(obj.fea) <= maxFear,
        )
        .sort((a, b) => b.fea - a.fea || parseTimetoMs(a.tim) - parseTimetoMs(b.tim));

      const seen = new Set();
      const top = [];

      for (const entry of sorted) {
        if (seen.has(entry.nam)) continue; // keep only each player's best run
        seen.add(entry.nam);
        top.push({ ...entry, lineGraph: parseTimetoMs(entry.tim) });
        if (top.length === TOP_N) break; // stop at 10
      }

      return top;
    });
  }, [allRuns, location, maxFear]);

  return (
    <div>
      <PageBlock>
        {loader ? (
          <Loading />
        ) : (
          <div className="my-4">
            <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
              <select
                className="select bg-[#1e123c] border-none rounded outline-none w-40"
                value={location}
                aria-label="Location"
                onChange={(e) => setLocation(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                className="select bg-[#1e123c] border-none rounded outline-none w-32"
                value={maxFear}
                aria-label="Max fear"
                onChange={(e) => setMaxFear(Number(e.target.value))}
              >
                {FEAR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    Max {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-2">
              {fullData.map((arr, oi) => (
                <div
                  key={allAspectsInOrder[oi]}
                  className={`rounded-sm px-2 py-1 relative bg-linear-to-b from-[#0e0c12] to-transparent border border-white/10`}
                >
                  <div className="text-center font-[Mar] text-[16px] text-white mb-2">{allAspectsInOrder[oi]}</div>
                  {arr.slice(0, 10).map((obj, index) => (
                    <div className="grid grid-cols-3 relative text-gray-300 items-center" key={index}>
                      <div
                        className={`text-start truncate ${obj.fea == 67 ? `text-[yellow]` : obj.fea >= 65 ? `text-[#00ffaa]` : `text-gray-300`}`}
                      >
                        <Link to={obj.src} target="_blank">
                          {`${obj.fea} ${obj.nam}`}
                        </Link>
                      </div>
                      <div className="text-end sm:text-center order-3 sm:order-2">{obj.tim}</div>

                      <div className="w-full flex justify-end order-2 sm:order-3">
                        {sToA(obj.cor).map((ite, index) => (
                          <img
                            draggable={false}
                            src={`/Boons/${ite}.png`}
                            alt="Core Boon"
                            className="size-7 sm:size-6"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </PageBlock>
    </div>
  );
}
