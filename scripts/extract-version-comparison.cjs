const fs = require("node:fs"),
  ts = require("typescript"),
  vm = require("node:vm");
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const fields = new Set([
  "key",
  "name",
  "desc",
  "member",
  "moves",
  "kind",
  "type",
  "type2",
  "pair",
  "cls",
  "cd",
  "power",
  "hits",
  "range",
  "status",
]);
function extract(dir, names) {
  const source = ts.createSourceFile(
    "game.js",
    fs.readFileSync(dir + "/official-game.js", "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const variables = new Map(
    source.statements
      .filter(ts.isVariableStatement)
      .flatMap((s) => s.declarationList.declarations)
      .map((n) => [n.name.getText(source), n.initializer]),
  );
  const context = vm.createContext(
    { words: read(dir + "/english-strings.json") },
    { codeGeneration: { strings: false, wasm: false } },
  );
  const run = (text) => vm.runInContext(text, context, { timeout: 5000 });
  run(
    'const c=(s,p)=>{let t=words[s]||s;for(const k in p||{})t=t.replaceAll("{"+k+"}",p[k]);return t};',
  );
  const fusions = [];
  for (const name of names) {
    const array = variables.get(name);
    for (const object of array.elements) {
      const text = object.properties
        .filter((p) => ts.isPropertyAssignment(p) && fields.has(p.name.text))
        .map((p) => p.getText(source))
        .join(",");
      fusions.push(JSON.parse(JSON.stringify(run("({" + text + "})"))));
    }
  }
  let cap, move, vit, eligible, remove;
  function visit(n) {
    if (ts.isMethodDeclaration(n) && n.name?.getText(source) === "capOf")
      cap = n;
    if (ts.isMethodDeclaration(n) && n.name?.getText(source) === "removeItem")
      remove = n;
    if (ts.isGetAccessorDeclaration(n) && n.name.getText(source) === "moveCap")
      move = n;
    if (ts.isGetAccessorDeclaration(n) && n.name.getText(source) === "vitCap")
      vit = n;
    ts.forEachChild(n, visit);
  }
  visit(source);
  const caps = {};
  for (const tmCase of [false, true])
    for (const maxEther of [false, true]) {
      context.items = new Map([
        ...(tmCase ? [["tm-case", 1]] : []),
        ...(maxEther ? [["max-ether", 1]] : []),
      ]);
      caps[`tmCase=${tmCase},maxEther=${maxEther}`] = run(
        `(()=>{const p={items,${move.getText(source)},${cap.getText(source)},${vit.getText(source)}};return {move:p.capOf({def:{fusion:false}}),fusion:p.capOf({def:{fusion:true}}),vitamin:p.vitCap}})()`,
      );
    }
  const resolver = source.statements.find(
    (n) =>
      ts.isFunctionDeclaration(n) &&
      n.getText(source).includes("kind===`signature`") &&
      n.getText(source).includes("kind===`glitch`"),
  );
  const dependencies = [
    ...resolver.body.getText(source).matchAll(/([A-Za-z_$][\w$]*)\.find/g),
  ].map((m) => m[1]);
  const all = fusions.concat([]); // Signature priority is checked using the original resolver.
  context.recipes = all;
  run("const " + dependencies[0] + "=recipes;" + resolver.getText(source));
  const resolved = [];
  for (const f of fusions.filter((f) => f.moves)) {
    context.left = { key: f.moves[0], type: f.type };
    context.right = { key: f.moves[1], type: f.type };
    resolved.push(run(`${resolver.name.text}(left,right).key`));
    context.left = { key: f.moves[1], type: f.type };
    context.right = { key: f.moves[0], type: f.type };
    if (run(`${resolver.name.text}(left,right).key`) !== f.key)
      throw Error("Fusion reverse order mismatch " + f.key);
  }
  for (const [name, node] of variables) {
    const t = node.getText(source);
    if (
      t.includes("`fusion`") &&
      t.includes("`weather`") &&
      t.includes("`buff`") &&
      ts.isArrowFunction(node)
    ) {
      eligible = { name, source: t };
      break;
    }
  }
  const candidate = source.statements.find(
    (n) =>
      ts.isFunctionDeclaration(n) &&
      n.getText(source).includes(".level<8") &&
      n.getText(source).includes("ready:!"),
  );
  const candidateText = candidate.getText(source),
    format = candidateText.match(/\.level<8&&\w+\.push\((\w+)\(/)[1];
  run(
    `const ${eligible.name}=${eligible.source};const ${format}=(name,level)=>name+level;${candidateText}`,
  );
  const readiness = [];
  for (const f of fusions) {
    for (const [left, right, expected] of [
      [7, 8, false],
      [8, 7, false],
      [8, 8, true],
      [9, 8, true],
    ]) {
      context.runFixture = {
        player: {
          moves: f.moves.map((key, i) => ({
            def: { key, name: key, type: f.type, arch: "bolt" },
            level: i ? right : left,
          })),
        },
      };
      const result = run(`${candidate.name.text}(runFixture)`);
      if (result[0]?.ready !== expected || result[0]?.r.key !== f.key)
        throw Error("Fusion level requirement mismatch " + f.key);
      readiness.push({ key: f.key, left, right, ready: result[0].ready });
    }
  }
  const exclusions = {};
  for (const arch of ["weather", "buff", "fusion", "bolt"]) {
    context.definition = { arch };
    exclusions[arch] = run(`${eligible.name}(definition)`);
  }
  const removeText = remove.getText(source),
    clampName = removeText.match(
      /for\(let \w+ of this\.moves\)\w+&&(\w+)\(/,
    )?.[1];
  if (clampName)
    run(
      source.statements
        .find((n) => ts.isFunctionDeclaration(n) && n.name.text === clampName)
        .getText(source),
    );
  const removal = {};
  for (const item of ["tm-case", "max-ether"]) {
    context.itemToRemove = item;
    removal[item] = run(
      `(()=>{const p={items:new Map([['tm-case',1],['max-ether',1]]),moves:[{def:{fusion:false},level:10,extra:Array.from({length:9},()=>[]),mods:{dmg:1}},{def:{fusion:true},level:6,extra:Array.from({length:5},()=>[]),mods:{dmg:1}}],vitamins:new Map([['protein',{level:12,extra:[1,1],acc:12,rolls:Array(12).fill(1)}]]),recompute(){},${removeText}};p.removeItem(itemToRemove);return {normalMove:p.moves[0].level,fusion:p.moves[1].level,vitamin:p.vitamins.get('protein').level}})()`,
    );
  }
  return {
    fusions,
    caps,
    resolved,
    readiness,
    exclusions,
    removal,
    capSource: cap.getText(source),
    moveCapSource: move.getText(source),
    vitCapSource: vit.getText(source),
    removeItemSource: removeText,
    eligibility: eligible,
    candidateSource: candidateText,
  };
}
const profile = require("./data/active-snapshot.json");
const map = read(profile.symbols);
const oldNames = ["Ly", "zy", "Hy", "Xy", "nb"];
const old = fs.existsSync("docs/research/v0.8.13/official-game.js")
    ? extract("docs/research/v0.8.13", oldNames)
    : null,
  current = extract(
    "docs/research",
    oldNames.map((n) => map.variables[n]),
  );
fs.writeFileSync(
  "docs/research/current-rule-comparison.json",
  JSON.stringify({ old, current }, null, 2) + "\n",
);
const rules = {
  gameVersion: profile.version,
  build: profile.build,
  lastVerified: profile.checkedAt,
  source: "https://pokebonk.com/",
  moveLevelCap: current.caps["tmCase=false,maxEther=false"].move,
  moveLevelCapWithTmCase: current.caps["tmCase=true,maxEther=false"].move,
  fusionStarCap: current.caps["tmCase=false,maxEther=false"].fusion,
  fusionStarCapWithTmCase: current.caps["tmCase=true,maxEther=false"].fusion,
  vitaminLevelCap: current.caps["tmCase=false,maxEther=false"].vitamin,
  vitaminLevelCapWithMaxEther:
    current.caps["tmCase=false,maxEther=true"].vitamin,
  fusionIngredientLevel: 8,
  excludedFusionPatterns: Object.entries(current.exclusions)
    .filter(([, allowed]) => !allowed)
    .map(([arch]) => arch),
};
rules.sellingTmCaseClampsLevels =
  current.removal["tm-case"].normalMove === 8 &&
  current.removal["tm-case"].fusion === 5;
rules.sellingMaxEtherClampsLevels = current.removal["max-ether"].vitamin === 10;
fs.writeFileSync(
  "src/data/wiki/rules.json",
  JSON.stringify(rules, null, 2) + "\n",
);
console.log(
  "Fusions:",
  old?.fusions.length,
  current.fusions.length,
  "metadata identical:",
  old
    ? JSON.stringify(old.fusions) === JSON.stringify(current.fusions)
    : "historical source not available",
);
console.log("Old caps", old?.caps, "v25 caps", current.caps);
console.log("eligibility", current.eligibility);
