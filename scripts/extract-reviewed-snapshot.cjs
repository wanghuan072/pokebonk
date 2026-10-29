// Extract the reviewed public data/configuration only. No game boot, account,
// rendering, combat or network handlers are invoked by this extractor.
const fs = require("node:fs");
const vm = require("node:vm");
const profile = require("./data/active-snapshot.json");
const directory = process.argv[2] || profile.directory;
const read = (file) => fs.readFileSync(directory + "/" + file, "utf8");
const run = (code, values = {}) => {
  const context = vm.createContext(values, { codeGeneration: { strings: false, wasm: false } });
  vm.runInContext(code, context, { timeout: 5000 });
  return context;
};
const words = run(read("en.js").replace(/export\{e as default\};?/, "globalThis.words=e")).words;
let code = read("news.js");
const exportsList = code.match(/export\{([^}]+)\}/)[1];
code = code.replace(/^import[^;]+;/, "const t=(s,p)=>{let v=words[s]||s;for(const k in p||{})v=v.replaceAll('{'+k+'}',p[k]);return v};const e=[];");
code = code.replace(/export\{[^}]+\};?/, "globalThis.result={" + exportsList.split(",").map((entry) => {
  const [local, exported = local] = entry.trim().split(" as ");
  return JSON.stringify(exported) + ":" + local;
}).join(",") + "}");
const original = run(code, { words }).result;
const config = { ...original };
// Reviewed semantic aliases retain the established generator schema despite
// the official bundler renaming its exports between builds.
const select = (predicate, label) => {
  const matches = Object.entries(original).filter(([, value]) => predicate(value));
  if (matches.length !== 1) throw Error("Ambiguous original configuration: " + label);
  return matches[0];
};
const expected = {
  m: (v) => v === profile.version,
  p: (v) => v === profile.build,
  ot: (v) => Array.isArray(v) && v[0]?.kit && v[0]?.passive,
  rr: (v) => Array.isArray(v) && v[0]?.key === "charcoal" && v[0]?.mods,
  cr: (v) => Array.isArray(v) && v[0]?.key === "protein" && v[0]?.per,
  or: (v) => Array.isArray(v) && v[0] === "Common",
  Jt: (v) => Array.isArray(v) && v[0]?.id === "k100",
  Yt: (v) => Array.isArray(v) && v[0]?.id === "progress",
  Gt: (v) => Array.isArray(v) && v[0]?.id === "slot-move",
  xr: (v) => Array.isArray(v) && v[0]?.version === profile.version,
  it: (v) => Array.isArray(v) && v.join(",") === "0,2,4,7",
};
for (const [key, predicate] of Object.entries(expected)) {
  const [exported, value] = select(predicate, key);
  profile.exports[key] = exported;
  config[key] = value;
}
const write = (name, value) => fs.writeFileSync("docs/research/" + name, JSON.stringify(value, null, 2) + "\n");
write("english-strings.json", words);
write("official-config.json", config);
write("current-releases.json", config.xr.map((r) => {
  const notes = r.notes();
  return { ...r, title: r.title?.(), noteTypes: notes.map((n) => Array.isArray(n) ? n[0] : null), notes: notes.map((n) => (Array.isArray(n) ? n[1] : n).replace(/\*\*/g, "")) };
}));
write("lab-costs.json", config.Gt.map((u) => ({ ...u, costsByLevel: Array.from({ length: u.max }, (_, level) => u.cost(level)) })));
fs.writeFileSync("scripts/data/active-snapshot.json", JSON.stringify(profile, null, 2) + "\n");
for (const [from, to] of [["game.js", "official-game.js"], ["news.js", "official-news.js"], ["en.js", "official-en.js"], ["pokemon.json", "pokemon.json"], ["moves.json", "moves.json"], ["items.json", "items.json"], ["i18n-en.json", "i18n-en.json"]])
  fs.copyFileSync(directory + "/" + from, "docs/research/" + to);
console.log({ version: config.m, build: config.p, partners: config.ot.length, achievements: config.Jt.length, lab: config.Gt.length, releases: config.xr.length, exports: profile.exports });
