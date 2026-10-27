export const numObs = {
  0: "G",
  1: "p",
  2: "B",
  3: "t",
  4: "Z",
  5: "k",
  6: "X",
  7: "a",
  8: "Q",
  9: "m",
  10: "L",
  11: "f",
  12: "R",
  13: "d",
  14: "N",
  15: "y",
  16: "H",
  17: "c",
  18: "V",
  19: "j",
  20: "E",
  21: "s",
  22: "T",
  23: "u",
  24: "W",
  25: "o",
};

export const letterObs = {
  a: "G",
  b: "x",
  c: "7",
  d: "M",
  e: "k",
  f: "2",
  g: "p",
  h: "V",
  i: "s",
  j: "B",
  k: "0",
  l: "n",
  m: "Z",
  n: "d",
  o: "R",
  p: "f",
  q: "8",
  r: "Y",
  s: "j",
  t: "C",
};

// Vows
export const vowid = {
  Pain: 1,
  Grit: 2,
  Wards: 3,
  Frenzy: 4,
  Hordes: 5,
  Menace: 6,
  Return: 7,
  Fangs: 8,
  Scars: 9,
  Debt: 10,
  Shadow: 11,
  Forfeit: 12,
  Time: 13,
  Void: 14,
  Hubris: 15,
  Denial: 16,
  Rivals: 17,
};
export const vowOrder = [
  `Pain`,
  `Grit`,
  `Wards`,
  `Frenzy`,
  `Hordes`,
  `Menace`,
  `Return`,
  `Fangs`,
  `Scars`,
  `Debt`,
  `Shadow`,
  `Forfeit`,
  `Time`,
  `Void`,
  `Hubris`,
  `Denial`,
  `Rivals`,
];
export const idvow = Object.fromEntries(Object.entries(vowid).map(([key, value]) => [value, key]));
export const vowArray = (vow) => {
  switch (vow) {
    case `Debt`:
      return [0, 1, 2];
    case `Denial`:
      return [0, 2];
    case `Fangs`:
      return [0, 2, 5];
    case `Forfeit`:
      return [0, 3];
    case `Frenzy`:
      return [0, 3, 6];
    case `Grit`:
      return [0, 1, 2, 3];
    case `Hordes`:
      return [0, 1, 2, 3];
    case `Hubris`:
      return [0, 1, 2];
    case `Menace`:
      return [0, 1, 3];
    case `Pain`:
      return [0, 1, 3, 5];
    case `Return`:
      return [0, 1, 2];
    case `Scars`:
      return [0, 1, 2, 4];
    case `Shadow`:
      return [0, 2];
    case `Time`:
      return [0, 1, 3, 6];
    case `Void`:
      return [0, 1, 2, 3, 5];
    case `Wards`:
      return [0, 1, 2];
    case `Rivals`:
      return [0, 2, 5, 8, 12];
    default:
      return [];
  }
};
export const defineVow = (vow) => {
  switch (vow) {
    case `Debt`:
      return {
        d: `All items that cost Gold are more expensive.`,
        rank: [`+40%`, `+80%`],
      };
    case `Denial`:
      return {
        d: `After you choose a Boon, unpicked blessing(s) will not appear again this night.`,
        rank: [`2`],
      };
    case `Fangs`:
      return {
        d: `Most foes with Armor also have random Perk(s).`,
        rank: [`1`, `2`],
      };
    case `Forfeit`:
      return {
        d: `The first 1 Boon(s) in each Region become Red Onion instead.`,
        rank: [`1`],
      };
    case `Frenzy`:
      return {
        d: `All foes are faster.`,
        rank: [`+20%`, `+40%`],
      };
    case `Grit`:
      return {
        d: `All foes have more Health.`,
        rank: [`+10%`, `+20%`, `+30%`],
      };
    case `Hordes`:
      return {
        d: `Most encounters have more foes.`,
        rank: [`+20%`, `+40%`, `+60%`],
      };
    case `Hubris`:
      return {
        d: `After you choose a Boon, Prime Magick for each Rarity greater than Common.`,
        rank: [`3`, `6`],
      };
    case `Menace`:
      return {
        d: `Most foes have a chance to be from the next Region (if there is one.)`,
        rank: [`+10%`, `+25%`],
      };
    case `Pain`:
      return {
        d: `All foes deal more damage.`,
        rank: [`+20%`, `+60%`, `+100%`],
      };
    case `Return`:
      return {
        d: `Most slain foes have a chance to become a Revenant.`,
        rank: [`+25%`, `+50%`],
      };
    case `Scars`:
      return {
        d: `Any Health effects are less effective.	`,
        rank: [`75%`, `50%`, `0%`],
      };
    case `Shadow`:
      return {
        d: `All Encounters with Wardens contain no fewer than a certain number of Shadow Servant(s).`,
        rank: [`1`],
      };
    case `Time`:
      return {
        d: `You have a certain minutes to fight through each Region (or else...).`,
        rank: [`9:00`, `7:00`, `5:00`],
      };
    case `Void`:
      return {
        d: `You have access to a certain number of your Grasp for your Arcana.`,
        rank: [`60%`, `40%`, `20%`, `0%`],
      };
    case `Wards`:
      return {
        d: `All foes have Shielded Health.`,
        rank: [`1`, `2`],
      };
    case `Rivals`:
      return {
        d: `The boss shall be stronger in various ways.`,
        rank: [`Hecate/Polyphemus`, `Scylla/Eris`, `Cerberus/Prometheus`, `Chronos/Typhon`],
      };
    default:
      return {};
  }
};

// Arcana
export const idarcana = {
  1: `Sorceress`,
  2: `Wayward`,
  3: `Huntress`,
  4: `Eternity`,
  5: `Moon`,
  6: `Furies`,
  7: `Persistence`,
  8: `Messenger`,
  9: `Unseen`,
  10: `Night`,
  11: `Swift`,
  12: `Death`,
  13: `Centaur`,
  14: `Origination`,
  15: `Lovers`,
  16: `Enchantress`,
  17: `Boatman`,
  18: `Artificer`,
  19: `Excellence`,
  20: `Queen`,
  21: `Fates`,
  22: `Champions`,
  23: `Strength`,
  24: `Divinity`,
  25: `Judgment`,
};
export const defineArcana = (num) => {
  switch (num) {
    case `1`:
      return {
        card: `I - The Sorceress`,
        d: `Your Omega Moves are 30% Faster.`,
        g: 1,
      };
    case `2`:
      return {
        card: `II - The Wayward Son`,
        d: `After you exit a Location, restore 5 Health.`,
        g: 1,
      };
    case `3`:
      return {
        card: `III - The Huntress`,
        d: `While you have less than 100% Magick your Attack and Special deal +50% damage.`,
        g: 2,
      };
    case `4`:
      return {
        card: `IV - Eternity`,
        d: `While you Channel your Omega Moves, everything moves slower for 1.2 Sec.`,
        g: 3,
      };
    case `5`:
      return {
        card: `V - The Moon`,
        d: `Your Hex also charges up automatically as though you used 3 Magick every 1 Sec.`,
        g: 0,
      };
    case `6`:
      return {
        card: `VI - The Furies`,
        d: `You deal +30% damage to foes in your Casts.`,
        g: 2,
      };
    case `7`:
      return {
        card: `VII - Persistence`,
        d: `You have +80 Max Life and Max Magick.`,
        g: 2,
      };
    case `8`:
      return {
        card: `VIII - The Messenger`,
        d: `Your Casts momentarily make you Impervious and move 70% faster.`,
        g: 1,
      };
    case `9`:
      return {
        card: `IX - The Unseen`,
        d: `You restore 10 Magick every 1 Sec.`,
        g: 5,
      };
    case `10`:
      return {
        card: `X - Night`,
        d: `You have +15% chance to deal Critical damage with each move in an Omega Combo.`,
        g: 2,
      };
    case `11`:
      return {
        card: `XI - The Swift Runner`,
        d: `Your Sprint is 10% faster and lets you pass right through most dangers in your way.`,
        g: 1,
      };
    case `12`:
      return {
        card: `XII - Death`,
        d: `You have +3 Death Defiance.`,
        g: 4,
      };
    case `13`:
      return {
        card: `XIII - The Centaur`,
        d: `You have +5 Max Life and +5 Max Magick whenever you pass through 5 Locations.`,
        g: 0,
      };
    case `14`:
      return {
        card: `XIV - Origination`,
        d: `You deal +50% damage to foes with at least 2 Curses from different Olympians.`,
        g: 5,
      };
    case `15`:
      return {
        card: `XV - The Lovers`,
        d: `You take 0 damage the first 3 time(s) you are hit in Guardian Encounters.`,
        g: 3,
      };
    case `16`:
      return {
        card: `XVI - The Enchantress`,
        d: `You have +3 Change of Fate, and can alter Location Rewards.`,
        g: 3,
      };
    case `17`:
      return {
        card: `XVII - The Boatman`,
        d: `You have +300 Gold Crowns.`,
        g: 5,
      };
    case `18`:
      return {
        card: `XVIII - The Artificer`,
        d: `You have 3 chance(s) this night to turn any Minor Find into a random Major Find.`,
        g: 3,
      };
    case `19`:
      return {
        card: `XIX - Excellence`,
        d: `Any Boons you are offered have +50% chance to include Legendary or at least Rare blessings.`,
        g: 5,
      };
    case `20`:
      return {
        card: `XX - The Queen`,
        d: `Any Boons you are offered have a +10% chance to include Duo blessings.`,
        g: 0,
      };
    case `21`:
      return {
        card: `XXI - The Fates`,
        d: `You have +4 Change of Fate.`,
        g: 0,
      };
    case `22`:
      return {
        card: `XXII - The Champions`,
        d: `You have +3 Change of Fate, and can alter Boons and certain other choices.`,
        g: 4,
      };
    case `23`:
      return {
        card: `XXIII - Strength`,
        d: `While you have no Death Defiance effects, you take -40% damage and deal +20%.`,
        g: 4,
      };
    case `24`:
      return {
        card: `XXIV - Divinity`,
        d: `Any Boons you are offered have a +15% chance to be improved to Epic.`,
        g: 0,
      };
    case `25`:
      return {
        card: `XXV - Judgment`,
        d: `You activate 5 random inactive Arcana Cards whenever you vanquish a Guardian.`,
        g: 0,
      };
    default:
      return {};
  }
};
