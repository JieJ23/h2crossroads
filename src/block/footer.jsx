import { usePfp } from "../hooks/PfpFetch";

function Footer() {
  const { pfp, pfploader } = usePfp();

  const modImg = pfp.filter((obj) => obj.Tag.includes("$#c!"));

  return (
    <div className="text-center px-2 my-4 mt-8">
      <div>H2Crossroads Verification Team & Contributors</div>
      {!pfploader && (
        <div className="flex flex-wrap gap-4 justify-center my-2">
          {modImg.sort().map((p) => (
            <div className="min-w-22 aura aura-silver rounded">
              <div className="p-2 bg-[#0e0c12] rounded flex items-center gap-2">
                <img src={p.ImgLink} alt="Pfp" className="rounded-full w-8 h-auto" />
                {p.Pfp}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>Website has no affiliation with Supergiant Games</div>
    </div>
  );
}

export default Footer;
