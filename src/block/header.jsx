import { Link } from "react-router-dom";

function Header() {
  return (
    <>
      <button className="btn sm:hidden bg-[#0e0c12] border-0" popoverTarget="my-megamenu-1">
        Menu
      </button>

      <div
        className="megamenu max-sm:megamenu-vertical p-2 bg-black sm:bg-transparent rounded mx-auto"
        id="my-megamenu-1"
        popover="auto"
      >
        <span className="megamenu-active"></span>

        <button popoverTarget="a1" className="text-gray-300 text-[16px] uppercase px-2">
          <div className="flex justify-center items-center gap-0.5">
            <img src="/Icon.png" alt="Title Icon" width={16} height={16} />
            Home
          </div>
        </button>
        <div id="a1" popover="auto" className="w-full sm:w-auto rounded">
          <ul className="menu bg-black w-full">
            <li>
              <Link to={"/"}>Home</Link>
            </li>
          </ul>
        </div>

        <button popoverTarget="a2" className="text-gray-300 text-[16px] uppercase px-2">
          <div className="flex justify-center items-center gap-0.5">
            <img src="/Icon.png" alt="Title Icon" width={16} height={16} />
            Runs
          </div>
        </button>
        <div id="a2" popover="auto" className="w-full sm:w-auto rounded">
          <ul className="menu bg-black w-full">
            <li>
              <Link to={"/Run"}>Hades 2 Runs</Link>
            </li>
            <li>
              <Link to={"/FearLadder"}>Fear Ladder</Link>
            </li>
            <li>
              <Link to={"/FearRecord"}>Fear Record</Link>
            </li>
            <li>
              <Link to={"/SpeedLadder"}>Speed Ladder</Link>
            </li>
            <li>
              <Link to={"/SpeedRecord"}>Speed Record</Link>
            </li>
          </ul>
        </div>
        <button popoverTarget="a4" className="text-gray-300 text-[16px] uppercase px-2">
          <div className="flex justify-center items-center gap-0.5">
            <img src="/Icon.png" alt="Title Icon" width={16} height={16} />
            Stats
          </div>
        </button>
        <div id="a4" popover="auto" className="w-full sm:w-auto rounded">
          <ul className="menu bg-black w-full">
            <li>
              <Link to={"/Stats"}>Total Stats</Link>
            </li>
            <li>
              <Link to={"/FirstMaxFear"}>First Max Fear</Link>
            </li>
            <li>
              <Link to={"/Player"}>Player Stats</Link>
            </li>
          </ul>
        </div>
        <button popoverTarget="a3" className="text-gray-300 text-[16px] uppercase px-2">
          <div className="flex justify-center items-center gap-0.5">
            <img src="/Icon.png" alt="Title Icon" width={16} height={16} />
            Tool
          </div>
        </button>
        <div id="a3" popover="auto" className="w-full sm:w-auto rounded">
          <ul className="menu bg-black w-full">
            <li>
              <Link to={"/ArcanaVow"}>Fear Calculator & Arcana</Link>
            </li>
            <li>
              <Link to={"/BiomeMap"}>Biome Room Map</Link>
            </li>
          </ul>
        </div>

        <button popoverTarget="a5" className="text-gray-300 text-[16px] uppercase px-2">
          <div className="flex justify-center items-center gap-0.5">
            <img src="/Icon.png" alt="Title Icon" width={16} height={16} />
            Submit
          </div>
        </button>
        <div id="a5" popover="auto" className="w-full sm:w-auto rounded">
          <ul className="menu bg-black w-full">
            <li>
              <Link to={"/Submit"}>Run Submisson</Link>
            </li>
            <li>
              <Link
                to={"https://docs.google.com/document/d/1hhMu0jR8lSzZ2mtyteqW7NDy9wpIbra3d2RJkmYFhAI/edit?tab=t.0"}
                target="_blank"
              >
                Submisson Rules
              </Link>
            </li>
            <li>
              <Link to={"https://www.speedrun.com/hades2"} target="_blank">
                Speedrun Submission
              </Link>
            </li>
          </ul>
        </div>

        {/*  */}
      </div>
    </>
  );
}

export default Header;
