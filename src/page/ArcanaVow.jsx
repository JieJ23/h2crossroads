import { vowOrder, vowArray, idvow, vowid, defineVow, idarcana, defineArcana, numObs } from "../util/logicArcVow";
import { useState, useEffect } from "react";
import PageBlock from "../block/pageBlock";

const numObsR = Object.fromEntries(Object.entries(numObs).map(([key, value]) => [value, key]));

export default function ArcanaVow() {
  const [arc, setArc] = useState("");
  const [vow, setVow] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [shareableURL, setShareableURL] = useState("");

  useEffect(() => {
    const searchParam = new URLSearchParams(window.location.search);
    const url = new URL(window.location.origin);
    const paramVow = searchParam.get("vow");
    const paramArc = searchParam.get("arc");

    if (paramVow) {
      url.searchParams.set("vow", paramVow);
      setVow(paramVow.match(/[a-zA-Z]\d+/g) ?? []);
    }

    if (paramArc) {
      url.searchParams.set("arc", paramArc);
      setArc(paramArc);
    }
  }, []);

  // Tool Selection Functions
  function addCard(value, prev) {
    const key = value.toString();

    if (prev.includes(numObs[key])) {
      return setArc((prev) => prev.replace(numObs[key], ""));
    }
    return setArc(prev.concat(numObs[key]));
  }

  function addVow(value) {
    setVow((prev) => {
      const vow = idvow[value];
      const vowLength = vowArray(vow).length;
      const obsId = numObs[String(vowid[vow])];
      const targetVow = prev.find((item) => item.startsWith(`${obsId}`));
      if (targetVow) {
        const level = +targetVow.replace(`${obsId}`, "");
        const currentIndex = vowArray(vow).indexOf(level);
        const nextIndex = (currentIndex + 1) % vowLength;
        const currentIndexValue = vowArray(vow)[nextIndex];
        const removeItemArray = prev.slice().filter((item) => !item.startsWith(`${obsId}`));
        if (currentIndexValue === 0) return [...removeItemArray];
        return [...removeItemArray, `${obsId}${currentIndexValue}`];
      } else {
        const currentIndexValue = vowArray(vow)[1];
        return [...prev, `${obsId}${currentIndexValue}`];
      }
    });
  }

  // Sharebale Functions
  const generateShareableURL = () => {
    const url = new URL(`${window.location.origin}/ArcanaVow`);
    if (vow.length > 0) {
      const vowString = vow.join("");
      url.searchParams.set("vow", vowString);
    }
    if (arc !== "") {
      url.searchParams.set("arc", arc);
    }

    const newURL = url.toString();
    setShareableURL(newURL);
  };
  const copyURLToClipboard = () => {
    navigator.clipboard.writeText(shareableURL).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset "Copied!" message after 2 seconds
    });
  };

  // Display Variables
  const totalFearCount = vow.reduce((acc, item) => {
    const value = +item.slice(1);
    return (acc += value);
  }, 0);

  const totalArcCount = arc.split("").reduce((acc, item) => {
    const arcValue = +numObsR[item] + 1;
    return (acc += defineArcana(arcValue.toString()).g || 0);
  }, 0);

  return (
    <>
      <PageBlock>
        <div className="text-gray-300 select-none my-4">
          {/* Shareable Header */}
          <div className="max-w-250 mx-auto p-2">
            <div className="flex flex-wrap gap-1 font-[Ale] text-[14px]">
              <button
                className="bg-[#0e0c12] border border-white/10 rounded px-2 py-1 text-center cursor-pointer"
                onClick={generateShareableURL}
              >
                Generate URL
              </button>
              <button
                className="bg-[#0e0c12] border border-white/10 rounded px-2 py-1 text-center cursor-pointer"
                onClick={copyURLToClipboard}
              >
                {isCopied ? "Copied!" : "Copy URL"}
              </button>
              <button
                className="bg-[#0e0c12] border border-white/10 rounded px-2 py-1 text-center cursor-pointer"
                onClick={() => {
                  setArc("");
                  setVow([]);
                  setShareableURL("");
                }}
              >
                Reset
              </button>
            </div>
            <div className="w-full max-w-250 bg-[#0e0c12] border border-white/10 overflow-hidden p-2 truncate text-[14px] rounded my-2">
              {shareableURL || "No URL Generated Yet"}
            </div>
          </div>
          {/* Body Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 max-w-250 mx-auto lg:items-start">
            {/* Arcana Deck */}
            <div className="p-2 grid grid-cols-5 gap-1 w-full mx-auto max-w-125 min-w-0">
              <div className="text-[24px] font-bold text-center col-span-5">{totalArcCount} Grasp</div>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="relative min-w-0">
                  <div className="absolute top-0.5 right-0 h-5 w-5 bg-blue-400 text-black rounded-full text-center z-40 flex items-center justify-center">
                    <span className="font-[Ale]">{defineArcana((i + 1).toString()).g}</span>
                  </div>
                  <img
                    src={arc.includes(numObs[i.toString()]) ? `/Arcana/c${i + 1}.png` : `/Arcana/c0.png`}
                    alt="Arcana Cards"
                    className="w-full h-auto cursor-pointer hover:scale-95 active:scale-105 transition-transform duration-150"
                    draggable="false"
                    onClick={() => addCard(i, arc)}
                  />
                  <div className="font-[Ale] text-center">{idarcana[(i + 1).toString()]}</div>
                </div>
              ))}
            </div>
            {/* Vows Calculator */}
            <div className="p-2 grid grid-cols-4 gap-1 w-full mx-auto max-w-125 min-w-0 borde relative">
              <div className="text-[24px] font-bold text-center col-span-4">{totalFearCount} Fear</div>
              {Array.from({ length: 17 }).map((_, i) => {
                const target = numObs[String(vowid[vowOrder[i]])];
                const hasVow = vow.find((ite) => ite.startsWith(target));
                const findIndexCurrent = Number(hasVow?.replace(`${target}`, ""));
                const valueIndex = vowArray(vowOrder[i]).indexOf(findIndexCurrent);
                return (
                  <div
                    key={i}
                    className={`min-h-30 group cursor-pointer ${i === 16 ? "col-span-2 col-start-2" : ""}`}
                    onClick={() => addVow(i + 1)}
                  >
                    <div
                      className={`bg-[#0e0c12] border border-white/10 rounded-lg flex flex-col h-full text-center items-center justify-center relative `}
                    >
                      <div className="absolute top-1 left-1">
                        {vowArray(vowOrder[i])
                          .slice(1)
                          .map((item, idx) => (
                            <div className="text-[10px]" key={idx}>
                              {item}
                            </div>
                          ))}
                      </div>
                      <img
                        src={`/Vows/${vowOrder[i]}.png`}
                        alt="Vows"
                        draggable="false"
                        className={`size-10 group-active:scale-150 transition-all duration-200 ${findIndexCurrent ? `drop-shadow-[0_0_8px_#00ffaa]` : `opacity-50`}`}
                      />
                      <div className="font-[Ale] my-0.5">{vowOrder[i]}</div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: vowArray(vowOrder[i]).length - 1 }).map((_, index) => {
                          return (
                            <div
                              key={index}
                              className={`h-1 w-4 rounded-xs ${index < valueIndex ? `bg-[#00ffaa]` : `bg-gray-300`}`}
                            />
                          );
                        })}
                      </div>
                      <div className="font-[Ale] my-0.5">{findIndexCurrent || "-"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PageBlock>
    </>
  );
}
