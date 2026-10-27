import PageBlock from "../block/pageBlock";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fixedSrc } from "../assets/json/bundle.jsx";
import { allAspectsInOrder, parseTimetoMs, parsemstoTime } from "../util/misc";

const MS_PER_MIN = 60000;
const TIME_OPTIONS = [4, 5, 6, 7, 8, 9, 10]; // max time, in minutes
const LOCATIONS = ["Underworld", "Surface"];

export default function SpeedLadder() {
  const [location, setLocation] = useState(`Underworld`);
  const [maxTime, setMaxTime] = useState(10);

  const allRuns = useMemo(() => [...fixedSrc], []);

  const fullData = useMemo(() => {
    const TOP_N = 10;

    return allAspectsInOrder.map((aspect) => {
      const sorted = allRuns
        .filter((obj) => obj.asp === aspect && obj.loc === location) // only Underworld or Surface, anything else is dropped
        .filter((obj) => parseTimetoMs(obj.tim) < parseTimetoMs(`${maxTime}:00.00`))
        .sort((a, b) => parseTimetoMs(a.tim) - parseTimetoMs(b.tim)); // fastest first, higher fear breaks ties

      const seen = new Set();
      const top = [];

      for (const entry of sorted) {
        if (seen.has(entry.nam)) continue; // keep only each player's fastest run
        seen.add(entry.nam);
        top.push(entry);
        if (top.length === TOP_N) break; // stop at 10
      }

      return top;
    });
  }, [allRuns, location, maxTime]);

  return (
    <div>
      <PageBlock>
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
              value={maxTime}
              aria-label="Max time"
              onChange={(e) => setMaxTime(Number(e.target.value))}
            >
              {TIME_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  Max {m}:00
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
                        {`${obj.nam}`}
                      </Link>
                    </div>
                    {arr[index + 1] ? (
                      <div className="text-end text-green-300">
                        +{parsemstoTime(parseTimetoMs(arr[index + 1].tim) - parseTimetoMs(arr[index].tim))}
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <div className="text-end">{obj.tim}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </PageBlock>
    </div>
  );
}
