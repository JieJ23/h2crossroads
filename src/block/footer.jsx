const moderators = [
  "Aki",
  "Frei",
  "Vangetsu",
  "Andrw",
  "Purple",
  "Mininet"
]

function Footer() {
  return (
    <div className="text-center px-2 my-4 mt-8">
      <div>H2Crossroads Verification Team & Contributors</div>
      <div className="flex flex-wrap gap-4 justify-center my-2">
        {moderators.sort().map(p => (
          <div className="min-w-22 aura aura-rainbow rounded">
            <div className="p-2 bg-[#0e0c12] rounded">{p}</div>
          </div>
        ))}
      </div>
      <div>Website has no affiliation with Supergiant Games</div>
    </div >
  );
}

export default Footer;
