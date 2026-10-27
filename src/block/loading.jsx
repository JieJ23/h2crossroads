import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { allAspectsInOrder } from "../util/misc";

export default function Loading() {
  const spinRef = useRef(null);
  const flipRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const indexRef = useRef(0);

  useGSAP(() => {
    gsap.set(backRef.current, { rotationY: 180 });
    gsap.set(flipRef.current, { transformPerspective: 600 });

    const tl = gsap.timeline({ repeat: -1 });

    tl
      // 1. Flat spin
      .to(spinRef.current, {
        rotation: "+=360",
        duration: 1.2,
        ease: "power2.inOut",
      })
      // 2. Pause
      .to({}, { duration: 0.5 })
      // 3. Flip to show c0.png
      .to(flipRef.current, {
        rotationY: 180,
        duration: 0.8,
        ease: "power2.inOut",
      })
      // 4. Card is face-down: swap the front to the next item
      .call(() => {
        indexRef.current = (indexRef.current + 1) % allAspectsInOrder.length;
        frontRef.current.src = `/Cards/${allAspectsInOrder[indexRef.current]}.png`;
      })
      // 5. Hold on c0.png
      .to({}, { duration: 0.8 })
      // 6. Keep rotating the same way to land on the new front
      .to(flipRef.current, {
        rotationY: 360,
        duration: 0.8,
        ease: "power2.inOut",
      })
      // 7. Reset (visually identical) so the next flip starts from 0
      .set(flipRef.current, { rotationY: 0 })
      // 8. Rest before looping
      .to({}, { duration: 0.5 });
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-1">
      <div ref={spinRef} style={{ width: 100 }}>
        <div ref={flipRef} className="relative" style={{ transformStyle: "preserve-3d" }}>
          {/* Front face */}
          <img
            ref={frontRef}
            src={`/Cards/${allAspectsInOrder[0]}.png`}
            alt="Loading Cards"
            className="block w-full h-auto"
            style={{ backfaceVisibility: "hidden" }}
          />
          {/* Back face */}
          <img
            ref={backRef}
            src="/Arcana/c0.png"
            alt="Card back"
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: "hidden" }}
          />
        </div>
      </div>
      <span className="loading loading-spinner loading-xl"></span>
    </div>
  );
}
