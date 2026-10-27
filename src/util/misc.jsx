export const allAspectsInOrder = [
  `Melinoe Staff`,
  `Circe`,
  `Momus`,
  `Anubis`,
  `Melinoe Blades`,
  `Artemis`,
  `Pan`,
  `Morrigan`,
  `Melinoe Axe`,
  `Charon`,
  `Thanatos`,
  `Nergal`,
  `Melinoe Flames`,
  `Eos`,
  `Moros`,
  `Supay`,
  `Melinoe Skull`,
  `Medea`,
  `Persephone`,
  `Hel`,
  `Melinoe Coat`,
  `Nyx`,
  `Selene`,
  `Shiva`,
];

export function getYTid(text) {
  const match = text.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function sToA(string) {
  const array = string.split(`,`);
  return array;
}

export function parseTimetoMs(timeStr) {
  const [minPart, rest] = timeStr.split(":");
  const [secPart, hundredthsPart] = rest.split(".");

  const minutes = parseInt(minPart, 10);
  const seconds = parseInt(secPart, 10);
  const hundredths = parseInt(hundredthsPart.padEnd(2, "0"), 10); // Ensure 2 digits

  const totalMs = (minutes * 60 + seconds) * 100 + hundredths;
  return totalMs;
}

export function parseMstoTime(ms) {
  const totalSeconds = Math.floor(ms / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor(ms % 100); // get hundredths (2 digits)

  // Pad with leading zeros if necessary
  const minStr = String(minutes);
  const secStr = String(seconds).padStart(2, "0");
  const hundredthsStr = String(hundredths).padStart(2, "0");

  return `${minStr}:${secStr}.${hundredthsStr}`;
}

export function parseSectoTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centiseconds = Math.floor((seconds - Math.floor(seconds)) * 100); // <--- floor

  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  const cs = String(centiseconds).padStart(2, "0");

  return `${mm}:${ss}.${cs}`;
}

export function parsemstoTime(ms) {
  const totalSeconds = Math.floor(ms / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor(ms % 100); // get hundredths (2 digits)

  // Pad with leading zeros if necessary
  const minStr = String(minutes);
  const secStr = String(seconds).padStart(2, "0");
  const hundredthsStr = String(hundredths).padStart(2, "0");

  return `${minStr}:${secStr}.${hundredthsStr}`;
}
