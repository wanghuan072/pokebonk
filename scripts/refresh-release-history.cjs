// Manual, read-only discovery of the original game's public release history.
// Review the resulting version before publishing; never called by site builds.
const fs = require("node:fs/promises");
const vm = require("node:vm");
async function main() {
  const download = async (url) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw Error(`HTTP ${response.status}: ${url}`);
    return response.text();
  };
  const save = (name, text) => fs.writeFile("docs/research/" + name, text);
  await fs.mkdir("docs/research", { recursive: true });
  const html = await download("https://pokebonk.com/");
  const entryPath = [...html.matchAll(/src="([^"]+\.js[^"]*)"/g)]
    .map((m) => m[1])
    .find((p) => p.includes("/main-"));
  if (!entryPath) throw Error("Original entry module not found");
  const entry = await download(new URL(entryPath, "https://pokebonk.com/"));
  const newsPath = entry.match(/\.\/news-[A-Za-z0-9_-]+\.js/)?.[0];
  const englishPath = entry.match(/\.\/en-[A-Za-z0-9_-]+\.js/)?.[0];
  if (!newsPath || !englishPath)
    throw Error("Review changed original module structure");
  const [news, english] = await Promise.all([
    download(new URL(newsPath, "https://pokebonk.com/assets/")),
    download(new URL(englishPath, "https://pokebonk.com/assets/")),
  ]);
  await Promise.all([
    save("current-index.html", html),
    save("current-entry.js", entry),
    save("current-news.js", news),
    save("current-en.js", english),
  ]);
  const wordsContext = vm.createContext(
    {},
    { codeGeneration: { strings: false, wasm: false } },
  );
  vm.runInContext(
    english.replace(/export\{e as default\};?/, "globalThis.words=e"),
    wordsContext,
    { timeout: 5000 },
  );
  const context = vm.createContext(
    { words: wordsContext.words },
    { codeGeneration: { strings: false, wasm: false } },
  );
  const exportList = news.match(/export\{([^}]+)\}/)[1];
  const code = news
    .replace(
      /^import[^;]+;/,
      `const t=(s,p)=>{let v=words[s]||s;for(const k in p||{})v=v.replaceAll('{'+k+'}',p[k]);return v};const e=[];`,
    )
    .replace(
      /export\{[^}]+\};?/,
      `globalThis.result={${exportList
        .split(",")
        .map((x) => {
          const [a, b] = x.trim().split(" as ");
          return JSON.stringify(b) + ":" + a;
        })
        .join(",")}}`,
    );
  vm.runInContext(code, context, { timeout: 5000 });
  const history = Object.values(context.result).find(
    (value) => Array.isArray(value) && value[0]?.version,
  );
  if (!history) throw Error("Original release collection not found");
  await save(
    "current-english-strings.json",
    JSON.stringify(wordsContext.words),
  );
  await save("current-config.json", JSON.stringify(context.result, null, 2));
  await save(
    "current-releases.json",
    JSON.stringify(
      history.map((release) => ({ ...release, notes: release.notes() })),
      null,
      2,
    ),
  );
  console.log(
    `Discovered v${history[0].version}; review source stamps before publishing.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
