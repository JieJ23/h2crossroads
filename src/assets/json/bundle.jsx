import earlyAccess from "./P.json";
import v1 from "./V.json";
import src from "./srcData.json";

import { parseTimetoMs } from "../../util/misc";

const fixName = {
  hookiedookie: "HookieDookie",
  Foolish_: "Foolish",
  getcheckmated: "Checkmate",
  Fate00: "Fate",
  FreiTheTiefling: "Frei",
  kevuto: "Kevuto",
  ClearlyNotJao: "clearlyNotJao",
};

export const fixedSrc = src.map((obj) => ({
  ...obj,
  nam: fixName[obj.nam] ?? obj.nam,
}));

const mergedOrderData = [...earlyAccess, ...v1, ...fixedSrc].sort(
  (a, b) => new Date(b.dat) - new Date(a.dat),
  // const feaDiff = +b.fea - +a.fea;
  // if (feaDiff !== 0) return feaDiff;
  // return parseTimetoMs(a.tim) - parseTimetoMs(b.tim);
);

export default mergedOrderData;
