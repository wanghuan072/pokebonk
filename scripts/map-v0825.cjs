const fs = require("node:fs"),
  ts = require("typescript");
function parse(file) {
  const s = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  return {
    s,
    vars: new Map(
      s.statements
        .filter(ts.isVariableStatement)
        .flatMap((s) => s.declarationList.declarations)
        .map((n) => [n.name.getText(s), n.initializer]),
    ),
    functions: new Map(
      s.statements
        .filter(ts.isFunctionDeclaration)
        .map((n) => [n.name.text, n]),
    ),
  };
}
function canonical(n) {
  const r = ts.transform(n, [
    (ctx) => (root) => {
      function visit(node) {
        if (
          ts.isIdentifier(node) &&
          !(
            (ts.isPropertyAccessExpression(node.parent) &&
              node.parent.name === node) ||
            (ts.isPropertyAssignment(node.parent) &&
              node.parent.name === node) ||
            (ts.isMethodDeclaration(node.parent) && node.parent.name === node)
          )
        )
          return ts.factory.createIdentifier("_");
        return ts.visitEachChild(node, visit, ctx);
      }
      return ts.visitNode(root, visit);
    },
  ]);
  const result = ts
    .createPrinter({ removeComments: true })
    .printNode(ts.EmitHint.Unspecified, r.transformed[0], n.getSourceFile());
  r.dispose();
  return result;
}
const old = parse("docs/research/v0.8.13/official-game.js"),
  fresh = parse("docs/research/current-game.js");
const names = [
  "Gh",
  "Eh",
  "Dh",
  "Kh",
  "qh",
  "Jh",
  "Yh",
  "Xh",
  "Zh",
  "Qh",
  "jh",
  "Mh",
  "Ph",
  "Fh",
  "Lh",
  "Rh",
  "Bh",
  "Vh",
  "Uh",
  "Wh",
  "Cm",
  "Cp",
  "Ep",
  "Lp",
  "Up",
  "Yp",
  "uh",
  "kg",
  "zm",
  "Km",
  "Qm",
  "sh",
  "fh",
  "Ly",
  "zy",
  "Hy",
  "Xy",
  "nb",
  "db",
];
const result = { variables: {}, functions: {}, comparisons: {} };
for (const [kind, nameset] of [
  ["vars", names],
  ["functions", ["Oh", "tg", "ng", "rg", "Cg", "eA"]],
]) {
  const candidates = [...fresh[kind]].map(([name, n]) => ({
    name,
    n,
    text: canonical(n),
  }));
  for (const name of nameset) {
    const n = old[kind].get(name);
    if (!n) {
      console.log("missing old", name);
      continue;
    }
    const text = canonical(n);
    const exact = candidates.filter((c) => c.text === text);
    const tokens = new Set(text.match(/\b[\w-]+\b/g));
    const best =
      exact.length === 1
        ? exact[0]
        : candidates
            .map((c) => {
              const t = new Set(c.text.match(/\b[\w-]+\b/g));
              return {
                ...c,
                score:
                  [...tokens].filter((x) => t.has(x)).length /
                  new Set([...tokens, ...t]).size,
              };
            })
            .sort((a, b) => b.score - a.score)[0];
    result[kind === "vars" ? "variables" : "functions"][name] = best.name;
    result.comparisons[name] = {
      name: best.name,
      exact: exact.length === 1,
      similarity: best.score,
    };
    console.log(
      kind,
      name,
      "=>",
      best.name,
      exact.length === 1 ? "EXACT" : best.score.toFixed(4),
    );
    if (exact.length !== 1) {
      fs.writeFileSync(
        "docs/research/compare-" + name + "-old.js",
        ts.createPrinter().printNode(ts.EmitHint.Unspecified, n, old.s),
      );
      fs.writeFileSync(
        "docs/research/compare-" + name + "-new.js",
        ts.createPrinter().printNode(ts.EmitHint.Unspecified, best.n, fresh.s),
      );
    }
  }
}
fs.writeFileSync(
  "docs/research/v0825-symbol-map.json",
  JSON.stringify(result, null, 2) + "\n",
);
