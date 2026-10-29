const fs = require("node:fs");
const { collectPages, reconcile } = require("./lib/page-fingerprints.cjs");
const file = "src/seo/page-history.json";
const history = JSON.parse(fs.readFileSync(file, "utf8"));
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const next = reconcile(collectPages(), history, date);
const changed = Object.keys(next).filter(
  (route) => next[route].fingerprint !== history[route]?.fingerprint,
);
const removed = Object.keys(history).filter((route) => !next[route]);
if (process.argv.includes("--check")) {
  if (changed.length || removed.length) {
    console.error(
      "Content dates need updating. Run npm run seo:sync. Changed:",
      changed,
      "Removed:",
      removed,
    );
    process.exitCode = 1;
  } else
    console.log(
      `Content dates verified for ${Object.keys(next).length} pages.`,
    );
} else {
  fs.writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
  console.log(
    `Updated ${changed.length} content dates; preserved ${Object.keys(next).length - changed.length}. Removed ${removed.length} routes.`,
  );
}
