import PageBlock from "../block/pageBlock";
import { useState } from "react";
import { allAspectsInOrder } from "../util/misc";
import Loading from "../block/loading";
import { hammerID } from "../util/hammerId";

import {
  allBiomes,
  bAttack,
  bSpecial,
  bCast,
  bSprint,
  bMagick,
  bKeep,
  bAxe,
  bDagger,
  bLob,
  bStaff,
  bSuit,
  bTorch,
} from "../util/formData";

const allHammerArray = [bStaff, bDagger, bAxe, bTorch, bLob, bSuit];
const coreOrder = ["Attack", "Special", "Cast", "Sprint", "Magick"];

const sortByCoreOrder = (array) => {
  return array.sort((a, b) => {
    const aIndex = coreOrder.findIndex((item) => a.includes(item));
    const bIndex = coreOrder.findIndex((item) => b.includes(item));

    return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
  });
};

const findHammerArray = (num) => {
  switch (num) {
    case 0:
    case 1:
    case 2:
    case 3:
      return 0;

    case 4:
    case 5:
    case 6:
    case 7:
      return 1;

    case 8:
    case 9:
    case 10:
    case 11:
      return 2;

    case 12:
    case 13:
    case 14:
    case 15:
      return 3;

    case 16:
    case 17:
    case 18:
    case 19:
      return 4;

    case 20:
    case 21:
    case 22:
    case 23:
      return 5;

    default:
      return undefined;
  }
};

export default function Submit() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState([]);
  const [fear, setFear] = useState(1);
  const [aspect, setAspect] = useState(0);
  const [coreBoon, setCoreBoons] = useState(["Attack", "Special", "Cast", "Sprint", "Magick"]);
  const [hammers, setHammers] = useState([]);
  const [keepsakes, setKeepsakes] = useState([]);
  const [gameType, setGameType] = useState("Hi");

  async function Submit(e) {
    e.preventDefault();

    const formEle = e.target;
    const formDatab = new FormData(formEle);

    const minutes = parseInt(formDatab.get("min"), 10);
    const seconds = parseInt(formDatab.get("sec"), 10).toString().padStart(2, "0");
    const milliseconds = parseInt(formDatab.get("mls"), 10).toString().padStart(2, "0");
    const tim = `${minutes}:${seconds}.${milliseconds}`;
    formDatab.append("tim", tim);

    const currentAspect = allAspectsInOrder[aspect];
    formDatab.append("asp", currentAspect);
    formDatab.append("fea", fear);
    formDatab.append("type", gameType);

    setLoading(true);
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbxrCfT4prHWH3laRraafqkyljE2jToUbNd0J-DQtUhUO1GvZnsyD81CWfWpASSTbw6-/exec",
        {
          method: "POST",
          body: formDatab,
        },
      );
      formEle.reset();
      setLocation([]);
      setAspect(0);
      setCoreBoons(["Attack", "Special", "Cast", "Sprint", "Magick"]);
      setHammers([]);
      setKeepsakes([]);
      setGameType([]);
      console.log(`good`);
      alert("Form submitted successfully!");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <PageBlock>
      <div className="my-4 select-none overflow-hidden">
        <form onSubmit={Submit}>
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              placeholder="Name"
              className="input w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              name="nam"
              required
            />
            <input
              type="date"
              className="input w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0 active:outline-0 focus:ring-0 ring-0"
              name="dat"
              defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
                2,
                "0",
              )}-${String(new Date().getDate()).padStart(2, "0")}`}
              required
            />
            <select
              value={allAspectsInOrder[aspect]}
              className="select w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              onChange={(e) => setAspect(+e.target.value)}
            >
              {allAspectsInOrder.map((ite, index) => (
                <option key={index} value={index}>
                  {ite}
                </option>
              ))}
            </select>
            <select
              defaultValue="Frog"
              className="select w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              required
              name="fam"
              onChange={(e) => setFam(e.target.value)}
            >
              <option value={"Frog"}>Frog</option>
              <option value={"Cat"}>Cat</option>
              <option value={"Polecat"}>Polecat</option>
              <option value={"Hound"}>Hound</option>
              <option value={"Raven"}>Raven</option>
              <option value={""}>None</option>
            </select>
            <div>* Select All Biomes for Dream Dive</div>
            <input
              className="input w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              required
              value={location.join(",")}
              placeholder="Region"
              name="loc"
            />
            <div className="flex flex-wrap gap-1">
              {allBiomes.map((item) => {
                const selected = location.includes(item);

                return (
                  <div
                    key={item}
                    className={`border px-2 py-1 rounded cursor-pointer flex gap-0.5 ${
                      selected ? "bg-white text-black" : "border-white/10"
                    }`}
                    onClick={() =>
                      setLocation((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 4) {
                          return prev;
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img draggable={false} src={`/Biome/${item}.png`} alt="Biome Icon" className="size-6" />
                    {item}
                  </div>
                );
              })}
            </div>
            <input
              type="number"
              value={fear}
              className="input w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              onChange={(e) => setFear(e.target.value)}
              max={67}
              min={1}
              required
            />
            <input
              type="text"
              placeholder="Gameplay / Discord Link"
              className="input w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              name="src"
              required
            />
            <div className="flex gap-2 w-full max-w-125">
              <input
                type="number"
                min="0"
                max="99"
                placeholder="Minutes"
                className="input w-full rounded bg-[#0e0c12] flex-1 focus:outline-0"
                name="min"
                onChange={(e) => (e.target.value = e.target.value.slice(0, 2))}
                required
              />
              <input
                type="number"
                min="0"
                max="59"
                placeholder="Seconds"
                className="input w-full rounded bg-[#0e0c12] flex-1 focus:outline-0"
                name="sec"
                onChange={(e) => (e.target.value = e.target.value.slice(0, 2))}
                required
              />
              <input
                type="number"
                min="0"
                max="99"
                placeholder="Centiseconds"
                className="input w-full rounded bg-[#0e0c12] flex-1 focus:outline-0"
                name="mls"
                onChange={(e) => (e.target.value = e.target.value.slice(0, 2))}
                required
              />
            </div>
            <div>* Unseeded, otherwise, leave blank</div>
            <select
              value={gameType}
              className="select w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              onChange={(e) => setGameType(e.target.value)}
            >
              <option value={""}>{""}</option>
              <option key="Unseeded" value={"Unseeded"}>
                Unseeded
              </option>
            </select>
            <input
              className="select w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              placeholder="Core Boons"
              name="cor"
              value={sortByCoreOrder(coreBoon).join(",")}
              required={true}
            />
            <div className="flex gap-1">
              <div className="flex flex-col gap-1">
                {bAttack.map((item) => (
                  <div
                    className={`cursor-pointer border border-white/10 min-w-18 sm:min-w-25 rounded flex items-center gap-1 ${coreBoon.includes(item) ? `bg-white text-black` : ``}`}
                    onClick={() =>
                      setCoreBoons((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 5) {
                          return [...prev.slice(1), item];
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img
                      draggable={false}
                      src={`/Boons/${item}.png`}
                      alt="Core Boon"
                      className="size-7 hidden sm:block"
                    />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {bSpecial.map((item) => (
                  <div
                    className={`cursor-pointer border border-white/10 min-w-18 sm:min-w-25 rounded flex items-center gap-1 ${coreBoon.includes(item) ? `bg-white text-black` : ``}`}
                    onClick={() =>
                      setCoreBoons((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 5) {
                          return [...prev.slice(1), item];
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img
                      draggable={false}
                      src={`/Boons/${item}.png`}
                      alt="Core Boon"
                      className="size-7 hidden sm:block"
                    />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {bCast.map((item) => (
                  <div
                    className={`cursor-pointer border border-white/10 min-w-18 sm:min-w-25 rounded flex items-center gap-1 ${coreBoon.includes(item) ? `bg-white text-black` : ``}`}
                    onClick={() =>
                      setCoreBoons((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 5) {
                          return [...prev.slice(1), item];
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img
                      draggable={false}
                      src={`/Boons/${item}.png`}
                      alt="Core Boon"
                      className="size-7 hidden sm:block"
                    />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {bSprint.map((item) => (
                  <div
                    className={`cursor-pointer border border-white/10 min-w-18 sm:min-w-25 rounded flex items-center gap-1 ${coreBoon.includes(item) ? `bg-white text-black` : ``}`}
                    onClick={() =>
                      setCoreBoons((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 5) {
                          return [...prev.slice(1), item];
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img
                      draggable={false}
                      src={`/Boons/${item}.png`}
                      alt="Core Boon"
                      className="size-7 hidden sm:block"
                    />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {bMagick.map((item) => (
                  <div
                    className={`cursor-pointer border border-white/10 min-w-18 sm:min-w-25 rounded flex items-center gap-1 ${coreBoon.includes(item) ? `bg-white text-black` : ``}`}
                    onClick={() =>
                      setCoreBoons((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 5) {
                          return [...prev.slice(1), item];
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img
                      draggable={false}
                      src={`/Boons/${item}.png`}
                      alt="Core Boon"
                      className="size-7 hidden sm:block"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <input
              className="select w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              placeholder="Hammer"
              value={hammers.join(",")}
              name="ham"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
              {allHammerArray[findHammerArray(aspect)].map((item) => {
                const selected = hammers.includes(item);
                return (
                  <div
                    key={item}
                    className={`border px-2 py-1 rounded cursor-pointer flex gap-0.5 ${
                      selected ? "bg-white text-black" : "border-white/10"
                    }`}
                    onClick={() =>
                      setHammers((prev) => {
                        if (prev.includes(item)) {
                          return prev.filter((arr) => arr !== item);
                        }
                        if (prev.length >= 4) {
                          return prev;
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img draggable={false} src={`/Hammers/${hammerID[item]}.png`} alt="Hammer" className="size-6" />
                    {item}
                  </div>
                );
              })}
            </div>
            <input
              className="select w-full rounded bg-[#0e0c12] max-w-125 focus:outline-0"
              placeholder="Keepsakes"
              name="ks"
              value={keepsakes.join(",")}
              required={true}
            />
            <div className="underline cursor-pointer" onClick={() => setKeepsakes([])}>
              Reset Keepsakes Field
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
              {bKeep.map((item) => {
                const selected = keepsakes.includes(item);

                return (
                  <div
                    key={item}
                    className={`border px-2 py-1 rounded cursor-pointer flex gap-0.5 ${
                      selected ? "bg-white text-black" : "border-white/10"
                    }`}
                    onClick={() =>
                      setKeepsakes((prev) => {
                        if (prev.length >= 4) {
                          return prev;
                        }
                        return [...prev, item];
                      })
                    }
                  >
                    <img draggable={false} src={`/Keepsakes/${item}.png`} alt="Biome Icon" className="size-6" />
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center my-4">
            <button
              className="bg-white text-black rounded text-[18px] font-medium px-2 py-1 w-40 cursor-pointer"
              type="submit"
              name="Submit"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </PageBlock>
  );
}
