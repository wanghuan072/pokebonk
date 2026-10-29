const fs = require("node:fs");
const vm = require("node:vm");
const dir = "docs/research/";
const english = {};
vm.createContext(english);
vm.runInContext(
  fs
    .readFileSync(dir + "official-en.js", "utf8")
    .replace(/export\{e as default\};?/, "globalThis.words=e"),
  english,
);
fs.writeFileSync(dir + "english-strings.json", JSON.stringify(english.words));
const context = { words: english.words };
vm.createContext(context);
let source = fs
  .readFileSync(dir + "official-news.js", "utf8")
  .replace(
    /^import[^;]+;/,
    `const t=(s,p)=>{let v=words[s]||s;for(let k in p||{})v=v.replaceAll('{'+k+'}',p[k]);return v};const e=[];`,
  );
const exportNames = source.match(/export\{([^}]+)\}/)[1];
source = source.replace(
  /export\{[^}]+\};?/,
  "globalThis.result={" +
    exportNames
      .split(",")
      .map((x) => {
        const [a, b] = x.trim().split(" as ");
        return JSON.stringify(b) + ":" + a;
      })
      .join(",") +
    "}",
);
vm.runInContext(source, context, { timeout: 5000 });
fs.writeFileSync(
  dir + "official-config.json",
  JSON.stringify(context.result, null, 2),
);
fs.writeFileSync(dir+'official-asset-urls.json',JSON.stringify(Object.fromEntries(['pokemon.json','moves.json','items.json','i18n/en.json'].map(file=>[file,context.result.g(file)])),null,2)+'\n');
fs.writeFileSync(
  dir + "releases.json",
  JSON.stringify(
    context.result.xr.map((x) => ({ ...x, notes: x.notes() })),
    null,
    2,
  ),
);
fs.writeFileSync(
  dir + "lab-costs.json",
  JSON.stringify(
    context.result.Gt.map((x) => ({
      ...x,
      costsByLevel: Array.from({ length: x.max }, (_, i) => x.cost(i)),
    })),
    null,
    2,
  ),
);
console.log(
  "Extracted the inspected public configuration, release notes and full Lab cost tables.",
);
