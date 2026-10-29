const fs = require("node:fs");
function save(path, body) {
  fs.mkdirSync("public/images/" + path.substring(0, path.lastIndexOf("/")), {
    recursive: true,
  });
  fs.writeFileSync("public/images/" + path, body);
}
const wrap = (color, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><defs><radialGradient id="halo"><stop stop-color="${color}" stop-opacity=".42"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><linearGradient id="body" x2=".7" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".65"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#020b23" flood-opacity=".5"/></filter></defs><ellipse cx="120" cy="95" rx="114" ry="84" fill="url(#halo)"/><g stroke="#081b36" stroke-width="2.5" stroke-linejoin="round" filter="url(#shadow)">${body}</g><g fill="white" opacity=".7"><path d="m30 47 2-6 2 6 6 2-6 2-2 6-2-6-6-2z"/><path d="m201 101 2-6 2 6 6 2-6 2-2 6-2-6-6-2z"/></g></svg>`;
const eyes = (left = 95, right = 143, y = 88) =>
  `<ellipse cx="${left}" cy="${y}" rx="7" ry="11" fill="#09213a"/><ellipse cx="${right}" cy="${y}" rx="7" ry="11" fill="#09213a"/><circle cx="${left - 2}" cy="${y - 4}" r="2.5" fill="white" stroke="none"/><circle cx="${right - 2}" cy="${y - 4}" r="2.5" fill="white" stroke="none"/>`;
save(
  "pokemon/pikachu.svg",
  wrap(
    "#ffd447",
    `<path d="m164 115 25-28-12-12 29-16 9 34-20 4 2 28-31 13" fill="#ffce38"/><ellipse cx="121" cy="130" rx="36" ry="34" fill="url(#body)"/><path d="M77 63 65 12q25 8 36 43M145 52q5-35 29-44l-7 59" fill="#ffd64b"/><path d="m65 12 7 28 14-7q-8-15-21-21m109-4-3 26-13-4q6-14 16-22" fill="#19223b"/><path d="M76 67q42-29 82-3l13 26q9 34-34 38l-43-3q-31-6-26-28z" fill="url(#body)"/>${eyes()}<circle cx="80" cy="106" r="10" fill="#f76850" stroke="none"/><circle cx="157" cy="106" r="10" fill="#f76850" stroke="none"/><path d="m114 100 6 3 6-3m-17 14q12 12 24-1" fill="none"/><ellipse cx="91" cy="151" rx="17" ry="9" fill="#ffcf40"/><ellipse cx="148" cy="151" rx="17" ry="9" fill="#ffcf40"/><path d="m94 128-13 10m65-10 12 9"/>`,
  ),
);
save(
  "pokemon/charmander.svg",
  wrap(
    "#ff9251",
    `<path d="M150 143q46 14 43-37l-13-9q6 47-33 31" fill="#f4853f"/><path d="M180 113q-20-16-3-35 0 14 10 8 10-12 9-23 28 33 1 51z" fill="#ff633c"/><path d="M185 108q-7-10 6-23 11 14 0 26" fill="#ffe176" stroke="none"/><ellipse cx="118" cy="127" rx="34" ry="37" fill="url(#body)"/><ellipse cx="115" cy="135" rx="22" ry="28" fill="#ffe4a0" stroke="none"/><path d="M81 62q4-25 35-26 36-1 44 30l-2 27q-2 27-39 29-38-3-42-29z" fill="url(#body)"/>${eyes(95, 142, 76)}<path d="m98 99 17 6 19-8" fill="none"/><path d="m104 102 6 8 4-6" fill="white"/><path d="m91 125-17 9m65-10 16 8"/><ellipse cx="91" cy="155" rx="19" ry="10" fill="#ff974b"/><ellipse cx="142" cy="155" rx="19" ry="10" fill="#ff974b"/>`,
  ),
);
save(
  "pokemon/squirtle.svg",
  wrap(
    "#61d4f6",
    `<path d="M151 133q34-28 43-7 7 23-15 24-13-1-8-13 4-8 10-1" fill="#64d4ed"/><ellipse cx="129" cy="125" rx="43" ry="39" fill="#ad734c"/><path d="m126 91-11 22 9 31 26 12m-34-43 36 4 15 22m-43 5-25 6" fill="none" stroke="#f8d9a2"/><ellipse cx="110" cy="125" rx="28" ry="35" fill="#ffdfa0"/><path d="M77 60q12-25 41-21 36 3 39 33l-3 22q-9 23-43 21-37-3-38-31z" fill="url(#body)"/>${eyes(93, 137, 73)}<path d="m100 95q13 11 26 0m-40 25-19 9m84-8 14 9" fill="none"/><ellipse cx="88" cy="154" rx="18" ry="11" fill="#65ceea"/><ellipse cx="142" cy="155" rx="18" ry="11" fill="#65ceea"/>`,
  ),
);
save(
  "pokemon/bulbasaur.svg",
  wrap(
    "#77dab0",
    `<path d="m117 89-5-35 23-28 5 19 17-12 13 25-4 36" fill="#69b953"/><path d="m135 45 4 40m19-33-9 38m-30-26 12 25" fill="none" stroke="#2d794c"/><ellipse cx="135" cy="121" rx="46" ry="30" fill="url(#body)"/><path d="m68 80-2-27 25 15q24-7 48 6l19-11-1 30q7 43-42 44-53-3-53-33z" fill="url(#body)"/><path d="m78 85 14-4 6 8-17 6m43-12 9-5 11 10-14 3m-23 29 10-6 10 10" fill="#359a83" stroke="none"/>${eyes(86, 135, 100)}<path d="m99 120q13 9 25-2" fill="none"/><path d="m93 123 5 8 5-6" fill="white"/><path d="m78 134-3 17 23 1 5-18m44-4 1 21 23-1-1-20" fill="#70cda6"/>`,
  ),
);
save(
  "pokemon/gengar.svg",
  wrap(
    "#aa7cef",
    `<path d="m78 63-8-35 32 22 17-24 16 20 30-19-4 41 22 19-9 47-37 25-44-7-28-28 1-34z" fill="url(#body)"/><path d="m78 85 30 10-6 9-22-3m49-6 29-12-3 19-21 3" fill="#ff6a7d"/><path d="m80 114q39 27 78-4-20 47-69 24z" fill="#fff4e8"/><path d="m100 121-2 19m18-15-1 20m19-24 1 17m-65-9-16 9 24 8m87-22 18 10-20 10" fill="none"/><path d="m93 149-5 15 24-2m29-13 11 15 17-8" fill="#9368d8"/>`,
  ),
);
save(
  "pokemon/eevee.svg",
  wrap(
    "#ce9974",
    `<path d="M149 129q18-43 51-44-1 45-37 56" fill="#ad7957"/><path d="m183 94 17-9q2 24-14 37l-13-14" fill="#fff0cc"/><ellipse cx="122" cy="134" rx="34" ry="29" fill="#bc8860"/><path d="m77 62-7-47q26 6 34 42m37 0q5-35 34-47l-10 54" fill="#bf8b65"/><path d="m79 30 16 25-12-1m79-21-13 21 10 1" stroke="#5b3f39" stroke-width="7"/><path d="M78 66q38-22 77 0l9 32q-12 29-48 27-37 1-48-25z" fill="url(#body)"/>${eyes(94, 140, 85)}<path d="m113 102 6 4 6-4m-21 14 15 5 14-6" fill="none"/><path d="m82 121 13-4 9 9 15-7 14 9 15-8 13 11-12 23-19-9-15 12-16-12-17 4z" fill="#fff0c9"/><ellipse cx="95" cy="159" rx="15" ry="8" fill="#b4815d"/><ellipse cx="143" cy="159" rx="15" ry="8" fill="#b4815d"/>`,
  ),
);
const types = {
  normal: "#b4b1a0",
  fire: "#ff9855",
  water: "#66c5ff",
  grass: "#78db99",
  electric: "#ffda52",
  ice: "#91e5e8",
  fighting: "#f19a81",
  poison: "#cc95e9",
  ground: "#dbb283",
  flying: "#a3c7f4",
  psychic: "#f690c2",
  bug: "#b4d75b",
  rock: "#bca886",
  ghost: "#ac92df",
  dragon: "#9a91ff",
  dark: "#ab9fbe",
  steel: "#9dc6ce",
  fairy: "#f2aed6",
};
for (const [type, color] of Object.entries(types))
  save(
    `pokemon/type-${type}.svg`,
    wrap(
      color,
      `<path d="m120 24 57 32v65l-57 34-57-34V56z" fill="#142c4c" stroke="${color}" stroke-width="3"/><path d="m120 49 27 40-27 40-27-40z" fill="url(#body)"/><path d="m100 89 20 10 20-10m-20-37v77" fill="none" stroke="#fff" opacity=".5"/><circle cx="120" cy="89" r="7" fill="#fff" stroke="none"/>`,
    ),
  );
save(
  "logo/crest.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#fff5a9"/><stop offset="1" stop-color="#ffb624"/></linearGradient></defs><path d="m32 2 8 10 13-1-1 14 10 8-10 8 1 13-14-1-7 10-8-10-13 1 1-14L2 32l10-8-1-13 14 1z" fill="url(#g)" stroke="#cd7b10" stroke-width="2"/><circle cx="32" cy="32" r="21" fill="#0e315b"/><path d="m28 15-9 22h12l-3 13 18-25H33l5-10z" fill="#ffd44c"/><path d="m15 25 5-5m24 24 5-5" stroke="#57d8ff" stroke-width="3" stroke-linecap="round"/></svg>`,
);
console.log(
  "Created original SVG fan illustrations, type placeholders and brand crest.",
);
