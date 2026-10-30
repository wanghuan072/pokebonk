const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const {
  collectPages,
  reconcile,
  getTdk,
} = require("../scripts/lib/page-fingerprints.cjs");
const first = collectPages();
const history = reconcile(first, {}, "2026-10-23");
test("repeat build preserves dates and enabled route count", () => {
  assert.deepEqual(reconcile(collectPages(), history, "2026-10-24"), history);
  assert.equal(Object.keys(history).length, 22);
  assert.equal(first["/pokedex/pikachu"], undefined);
});
test("one guide body changes only its own content date", () => {
  const guides = JSON.parse(
    fs.readFileSync("src/data/guides/guides.json", "utf8"),
  );
  guides[0].sections[0].paragraphs.push("A specific new gameplay explanation.");
  const next = reconcile(
    collectPages({ "guides/guides": guides }),
    history,
    "2026-10-24",
  );
  assert.deepEqual(
    Object.keys(next).filter((k) => next[k].modified !== history[k].modified),
    ["/guides/" + guides[0].slug],
  );
});
test("new pages get a date; removed pages disappear", () => {
  const next = reconcile(
    { ...first, "/new-page": "new" },
    history,
    "2026-10-24",
  );
  assert.equal(next["/new-page"].modified, "2026-10-24");
  assert.equal(reconcile({}, history, "2026-10-24")["/"], undefined);
});
test("one page metadata change does not refresh unrelated pages", () => {
  const tdk = getTdk();
  tdk["/wiki/lab"].description = tdk["/wiki/lab"].description.replace(
    "Compare",
    "Explore",
  );
  const changed = collectPages({ tdk });
  assert.deepEqual(
    Object.keys(changed).filter((k) => changed[k] !== first[k]),
    ["/wiki/lab"],
  );
});
test("CSS imports and footer year do not refresh content dates", () => {
  const reader = (file) => {
    if (file.endsWith(".css")) return "body { color: red; }";
    if (file.endsWith("AppFooter.tsx")) return "Copyright 2027";
    return fs
      .readFileSync(file, "utf8")
      .replace(/import ["'][^"']+\.css["'];/g, 'import "new-layout.css";');
  };
  assert.deepEqual(
    reconcile(collectPages({}, reader), history, "2027-01-01"),
    history,
  );
});

test("previews cannot become indexable through a production override", () => {
  const code = ts.transpileModule(
    fs.readFileSync("src/config/site.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  function configured(env) {
    const context = { exports: {}, process: { env }, require: (name) => {
      if (name === "./indexability.cjs") return require("../src/config/indexability.cjs");
      assert.equal(name, "@/data/site/game-version.json");
      return { default: JSON.parse(fs.readFileSync("src/data/site/game-version.json", "utf8")) };
    } };
    vm.runInNewContext(code, context);
    return context.exports.site.configured;
  }
  assert.equal(configured({}), false);
  assert.equal(
    configured({ VERCEL_ENV: "preview", SITE_INDEXABLE: "true" }),
    false,
  );
  assert.equal(configured({ VERCEL_ENV: "production" }), true);
  assert.equal(
    configured({ VERCEL_ENV: "production", SITE_INDEXABLE: "false" }),
    false,
  );
  assert.equal(configured({ SITE_INDEXABLE: "true" }), true);
});

test("brand exports have the declared sharing and icon dimensions", async () => {
  const sharp = require("sharp");
  for (const [file, width, height] of [
    ["public/images/og-image.png", 1200, 630],
    ["src/app/icon.png", 96, 96],
    ["src/app/apple-icon.png", 180, 180],
    ["public/images/logo-mark.png", 512, 512],
  ]) {
    const meta = await sharp(file).metadata();
    assert.equal(meta.format, "png");
    assert.equal(meta.width, width);
    assert.equal(meta.height, height);
  }
  const ico = fs.readFileSync("public/favicon.ico");
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 4);
});

test("replacing an image at the same URL updates affected content", () => {
  const changed = collectPages({}, undefined, (file) =>
    file === "public/images/home/game/starters.webp"
      ? Buffer.from("replacement image")
      : fs.readFileSync(file),
  );
  assert.notEqual(
    changed["/guides/beginners-guide"],
    first["/guides/beginners-guide"],
  );
  assert.notEqual(changed["/guides"], first["/guides"]);
  assert.equal(changed["/wiki/lab"], first["/wiki/lab"]);
});

test("shared catalogue copy only updates its displayed branch",()=>{
 const reader=file=>fs.readFileSync(file,'utf8').replace('What each level gives','Gains at every level');
 const changed=collectPages({},reader);
 assert.deepEqual(Object.keys(changed).filter(k=>changed[k]!==first[k]),['/wiki/vitamins']);
});
test("layout classes and event-handler edits preserve content dates",()=>{
 const reader=file=>fs.readFileSync(file,'utf8').replaceAll('className="catalog-inspector-head"','className="catalog-inspector-head layout-adjustment"').replace('setEditing(!editing)','setEditing(value=>!value)');
 assert.deepEqual(collectPages({},reader),first);
});
test("vitamin plan help only updates Vitamins",()=>{
 const reader=file=>fs.readFileSync(file,'utf8').replace('Saved in this browser · 3 base vitamin slots.','Saved locally · three vitamin slots.');
 const changed=collectPages({},reader);
 assert.deepEqual(Object.keys(changed).filter(k=>changed[k]!==first[k]),['/wiki/vitamins']);
});
test("guide card copy updates its article and the lists that display it",()=>{
 const guides=JSON.parse(fs.readFileSync('src/data/guides/guides.json','utf8'));
 guides[0].summary+=' Keep a clear escape route.';
 const changed=collectPages({'guides/guides':guides});
 assert.deepEqual(Object.keys(changed).filter(k=>changed[k]!==first[k]).sort(),['/','/guides',...guides.map(g=>'/guides/'+g.slug)].sort());
});
