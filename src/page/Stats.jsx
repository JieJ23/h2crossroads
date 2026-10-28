import PageBlock from "../block/pageBlock";
import { allAspectsInOrder } from "../util/misc";

import highFearData from "../assets/json/V.json";
import { hammerID } from "../util/hammerId";

import { bAxe, bStaff, bDagger, bLob, bSuit, bTorch } from "../util/formData";

import { useData } from "../hooks/DataFetch";
import Loading from "../block/loading";
import { useState, useMemo } from "react";

const types = [`Attack`, `Special`, `Cast`, `Sprint`, `Magick`];
const regions = [`Underworld`, `Surface`];

export default function Stats() {
  const { posts, loader } = useData();
  const [aspect, setAspect] = useState([]);
  const [region, setRegion] = useState([]);
  const [player, setPlayer] = useState("All Player");

  const fullData = [...highFearData, ...(posts || [])];

  const filterData = fullData.filter((obj) => {
    const currentAspect = aspect.length === 0 || aspect.includes(obj.asp);

    const currentRegion = region.length === 0 || region.includes(obj.loc);

    const currentPlayer = player === "All Player" ? obj : obj.nam === player;

    return currentAspect && currentRegion && currentPlayer;
  });

  const allAvailablePlayers = useMemo(() => [...new Set(fullData.map((obj) => obj.nam))]).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  const boonStore = Object.entries(
    filterData.reduce((acc, arr) => {
      if (arr.cor) {
        const arrayItem = arr.cor.split(",");
        arrayItem.forEach((item) => {
          acc[item] = (acc[item] || 0) + 1;
        });
      }
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const grouped = Object.entries(
    boonStore.reduce((acc, [name, count]) => {
      const type = types.find((t) => name.includes(t));
      if (!type) return acc;

      (acc[type] ??= []).push([name, count]);
      return acc;
    }, {}),
  ).sort(([a], [b]) => types.indexOf(a) - types.indexOf(b));

  const hammerStore = Object.entries(
    filterData.reduce((acc, arr) => {
      if (arr.ham) {
        const arrayItem = arr.ham.split(",");
        arrayItem.forEach((item) => {
          acc[item] = (acc[item] || 0) + 1;
        });
      }
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const hammerGroups = [
    ["Axe", bAxe],
    ["Staff", bStaff],
    ["Dagger", bDagger],
    ["Lob", bLob],
    ["Suit", bSuit],
    ["Torch", bTorch],
  ];

  // hammerStore is already sorted by count, so filtering keeps each group sorted too
  const groupedHammers = hammerGroups
    .map(([label, items]) => [label, hammerStore.filter(([name]) => items.includes(name))])
    .filter(([, entries]) => entries.length > 0); // hide weapons with no hammers picked

  const famStore = Object.entries(
    filterData.reduce((acc, arr) => {
      const familiar = arr.fam;

      acc[familiar] = (acc[familiar] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  function findBiomeKeepData(biomeNum) {
    const keepStore = Object.entries(
      filterData.reduce((acc, arr) => {
        if (arr.ks) {
          const arrayItem = arr.ks.split(",");
          const biome = arrayItem[biomeNum];
          acc[biome] = (acc[biome] || 0) + 1;
        }
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);
    return keepStore;
  }

  const ksStore = [findBiomeKeepData(0), findBiomeKeepData(1), findBiomeKeepData(2), findBiomeKeepData(3)];

  return (
    <PageBlock>
      {/* Table */}
      {loader ? (
        <Loading />
      ) : (
        <div className="w-full my-4">
          <div className="flex flex-col gap-2">
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
            <div className="flex justify-start flex-wrap gap-2 px-2">
              {regions.map((item) => (
                <div
                  className={`relative size-12 shrink-0 ${region.includes(item) ? `bg-[#00ffaa]` : `bg-[#0e0c12]`}  rounded`}
                  onClick={() =>
                    setRegion((prev) => {
                      if (prev.includes(item)) return prev.filter((ite) => ite !== item);
                      return [...prev, item];
                    })
                  }
                >
                  <img
                    src="/Boons/Border.png"
                    alt="Border"
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                  />
                  <img
                    src={`/Biome/${item}.png`}
                    alt="Core Boon"
                    className="absolute inset-0 w-full h-full p-1.5 object-contain"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-start flex-wrap gap-2 px-2">
              {allAspectsInOrder.map((item) => (
                <div
                  className={`relative size-12 shrink-0 ${aspect.includes(item) ? `bg-[#00ffaa]` : `bg-[#0e0c12]`} rounded`}
                  onClick={() =>
                    setAspect((prev) => {
                      if (prev.includes(item)) return prev.filter((ite) => ite !== item);
                      return [...prev, item];
                    })
                  }
                >
                  <img
                    src="/Boons/Border.png"
                    alt="Border"
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                  />
                  <img
                    src={`/Boons/${item}.png`}
                    alt="Core Boon"
                    className="absolute inset-0 w-full h-full p-1.5 object-contain"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Core */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-6">
            {grouped.map((array, index) => (
              <div className="flex flex-col gap-2 w-full bg-linear-to-t from-[#0e0c12] to-transparent rounded p-2 border border-white/10">
                <div className="flex flex-wrap gap-1">
                  {array[1].map((arr) => (
                    <div className="bg-[#0e0c12] p-1 px-2 border border-white/10 gap-2 rounded flex items-end">
                      <img src={`/Boons/${arr[0]}.png`} alt="Boons" className="size-5" />
                      <div>{arr[0].slice(0, 3)}:</div>
                      <div>{arr[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2 w-full bg-linear-to-t from-[#0e0c12] to-transparent rounded p-2 border border-white/10">
              <div className="flex flex-wrap gap-1">
                {famStore.map((arr) => (
                  <div className="bg-[#0e0c12] p-1 px-2 border border-white/10 gap-2 rounded flex items-end">
                    <img src={`/Boons/${arr[0]}.png`} alt="Boons" className="size-5" />
                    <div>{arr[0]}:</div>
                    <div>{arr[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Hammer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-6">
            {groupedHammers.map(([label, entries]) => (
              <div
                key={label}
                className="flex flex-col gap-2 w-full bg-linear-to-t from-[#0e0c12] to-transparent rounded p-2 border border-white/10"
              >
                <div className="flex flex-wrap gap-1">
                  {entries.map(([name, count]) => (
                    <div
                      key={name}
                      className="bg-[#0e0c12] p-1 px-2 gap-2 rounded flex items-center border border-white/10"
                    >
                      <div className="flex gap-1 items-center">
                        <img src={`/Hammers/${hammerID[name]}.png`} alt="Hammers" className="size-5 md:size-7" />
                        <div>{name}</div>
                      </div>
                      <div>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* KS */}
          <div className="flex gap-2 overflow-x-scroll py-2 my-6">
            {ksStore.map((array, idx) => (
              <div className="bg-linear-to-t from-black/50 to-[#0e0c12] p-2 rounded w-full min-w-60 border border-white/10">
                <div className="text-center text-[16px] font-[Mar]">Biome #{idx + 1}</div>
                {array.slice(0, 15).map((arr, index) => (
                  <div className="flex justify-between items-center px-4 my-1" key={index}>
                    <div className="flex items-center gap-1">
                      <img src={`/Keepsakes/${arr[0]}.png`} alt="Keepsake Icon" className="size-5" />
                      {arr[0]}
                    </div>
                    <div>{arr[1]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </PageBlock>
  );
}
