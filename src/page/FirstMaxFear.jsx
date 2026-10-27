import PageBlock from "../block/pageBlock";
import maxFearData from "../assets/json/V.json";
import { useData } from "../hooks/DataFetch";
import Loading from "../block/loading";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const biomesCategory = ["All", "Underworld", "Surface"];

export default function FirstMaxFear() {
  const { posts, loader } = useData();
  const [category, setCategory] = useState(0);
  const containerRef = useRef(null);

  const maxFearOnly = [...maxFearData, ...(posts || [])]
    .filter((obj) => obj.fea === 67 && obj.type === "Unseeded")
    .filter((obj) => {
      if (category == 1) return obj.loc === "Underworld";
      if (category == 2) return obj.loc === "Surface";
      return obj;
    })
    .sort((a, b) => new Date(a.dat) - new Date(b.dat));

  const maxFearFirstEntries = Array.from(
    maxFearOnly
      .reduce((map, obj) => {
        if (!map.has(obj.nam)) map.set(obj.nam, obj);
        return map;
      }, new Map())
      .values(),
  );

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".float-card");

      cards.forEach((card) => {
        // Subtle up/down float, random size, speed and start offset
        gsap.to(card, {
          y: -gsap.utils.random(8, 15),
          duration: gsap.utils.random(1.8, 3.2),
          delay: gsap.utils.random(0, 2),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Gentle left/right sway, independent timing
        gsap.to(card, {
          x: gsap.utils.random(5, 10) * (Math.random() > 0.5 ? 1 : -1),
          rotation: gsap.utils.random(-1.5, 1.5),
          duration: gsap.utils.random(0.8, 1.6),
          delay: gsap.utils.random(0, 2),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    },
    {
      scope: containerRef,
      dependencies: [maxFearFirstEntries.length],
      revertOnUpdate: true,
    },
  );

  return (
    <PageBlock>
      {loader ? (
        <Loading />
      ) : (
        <div className="my-4" ref={containerRef}>
          <div className="text-center font-[Mar] text-[20px] my-4">Player's First Max Fear</div>
          <div className="flex flex-wrap gap-2 p-2 justify-center text-center my-4">
            {biomesCategory.map((ite, index) => (
              <div
                className={`border border-white/10 cursor-pointer px-2 py-1 rounded min-w-20 ${category === index && `text-black bg-white`}`}
                key={index}
                onClick={() => setCategory(index)}
              >
                {ite}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {maxFearFirstEntries.map((obj, index) => (
              <div
                className="overflow-hidden min-w-30 min-h-40 border border-white/10 bg-black relative rounded flex flex-col items-center justify-top"
                key={obj.nam}
              >
                {/* Wrapper handles positioning, image handles animation */}
                <div
                  className="absolute inset-0 bg-cover bg-center brightness-25"
                  style={{ backgroundImage: `url(/Backgrounds/${obj.loc}.webp)` }}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[35%] z-10 w-22">
                  <img src={`/Cards/${obj.asp}.png`} alt="Aspects Card" className="float-card w-full h-auto" />
                </div>
                <div
                  className={`relative text-center py-1 ${obj.loc === "Surface" ? `text-yellow-300` : ` text-green-500`}`}
                >
                  <div>#{index + 1}</div>
                  <div className="font-semibold">{obj.nam}</div>
                  <div className="text-[12px]">{obj.dat.slice(0, 10)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageBlock>
  );
}
