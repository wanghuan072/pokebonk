// Evaluate only inspected, data-only calculators from the pinned public client.
// No game entry point, browser code, rendering, account or network code is run.
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const read = (name) =>
  JSON.parse(fs.readFileSync(`docs/research/${name}.json`, "utf8"));
const { source, emit, map, numeric } =
  require("./lib/official-client.cjs").loadClient();
const originalVariables = new Map(
  source.statements
    .filter(ts.isVariableStatement)
    .flatMap((s) => s.declarationList.declarations)
    .map((n) => [n.name.getText(source), n.initializer]),
);
const variables = new Map(
  Object.entries(map.variables).map(([old, fresh]) => [
    old,
    originalVariables.get(fresh),
  ]),
);
const originalFunctions = new Map(
  source.statements
    .filter(ts.isFunctionDeclaration)
    .map((n) => [n.name?.text, n]),
);
const functions = new Map(
  Object.entries(map.functions).map(([old, fresh]) => [
    old,
    originalFunctions.get(fresh),
  ]),
);
const words = read("english-strings"),
  english = read("i18n-en");
const raw = read("pokemon").filter((p) => p.id <= 151),
  config = read("official-config");
const context = vm.createContext(
  { raw, config, words, english, rawMoves: read("moves") },
  { codeGeneration: { strings: false, wasm: false } },
);
const run = (code) => vm.runInContext(code, context, { timeout: 5000 });
run(`
  const c=(key,params)=>{let result=words[key]||key;for(const k in params||{}) result=result.replaceAll('{'+k+'}',params[k]);return result;};
  const hs=(value,min,max)=>Math.max(min,Math.min(max,value));
  const O={
    moves:new Map(rawMoves.map(m=>[m.id,{...m,name:english.moves[m.id]||m.name}])),
    get(id){return raw.find(p=>p.id===id)},
    evolutionsOf(id){return raw.filter(p=>p.evoFrom===id)}
  };
  const $h=new Map(),eg=new Map();
`);
for (const name of [
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
]) {
  if (!variables.has(name))
    throw Error("Missing inspected calculator dependency " + name);
  run(`var ${name}=${emit(variables.get(name))};`);
}
run("Object.assign(Yh,jh,Ph,Lh,Bh,Uh);Object.assign(Xh,Mh,Fh,Rh,Vh,Wh);");
for (const name of ["Oh", "tg", "ng", "rg", "Cg", "eA"])
  run(emit(functions.get(name)));
let method;
function visit(n) {
  if (ts.isMethodDeclaration(n) && n.name?.getText(source) === "runEvolution")
    method = n;
  ts.forEachChild(n, visit);
}
visit(source);
if (!method) throw Error("Missing original run-evolution calculator");
run(
  `O.runEvolution=function(${method.parameters.map((p) => p.getText(source)).join(",")})${emit(method.body)};`,
);
// Define metadata objects without ever invoking their cast/tick handlers.
for (const [name, node] of originalVariables)
  if (numeric.has(name))
    run(
      `var official_number_${name.replaceAll("$", "_dollar_")}=${node.getText(source)};`,
    );
for (const name of ["Cm", "Cp", "Ep", "Lp", "Up", "Yp"])
  run(`var ${name}=${emit(variables.get(name))};`);
function appendUlt(n) {
  if (
    ts.isBinaryExpression(n) &&
    n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    ts.isElementAccessExpression(n.left) &&
    n.left.expression.getText(source) === map.variables.Cm
  )
    run(emit(n) + ";");
  ts.forEachChild(n, appendUlt);
}
appendUlt(source);
run("Object.assign(Cm,Cp,Ep,Lp,Up,Yp);");
for (const name of ["uh", "kg", "zm", "Km", "Qm", "sh", "fh"])
  run(`var ${name}=${emit(variables.get(name))};`);
run("Object.assign(kg,zm,Km,Qm,sh,fh);");
const fusionMetadata = [];
for (const name of ["Ly", "zy", "Hy", "Xy", "nb"]) {
  const fields = new Set([
    "key",
    "name",
    "desc",
    "member",
    "moves",
    "kind",
    "type",
    "pair",
    "type2",
    "cls",
    "cd",
    "power",
    "hits",
    "range",
    "status",
  ]);
  for (const object of variables.get(name).elements) {
    const metadata = object.properties
      .filter((p) => ts.isPropertyAssignment(p) && fields.has(p.name.text))
      .map((p) => emit(p))
      .join(",");
    run(`globalThis.fusionRecord={${metadata}};`);
    fusionMetadata.push(context.fusionRecord);
  }
}
context.fusionMetadata = fusionMetadata;
run(`globalThis.reference={
  ultimates:Cm,
  passives:kg,
  fusions:fusionMetadata,
  moves:config.ot.flatMap(p=>p.kit).filter((key,index,all)=>all.indexOf(key)===index).map(key=>{
    const raw=rawMoves.find(m=>m.key===key);return {key,definition:ng(raw.id)};
  }),
  evolutions:config.ot.map(p=>({id:p.id,...eA(p)})),
  baselines:raw.map(p=>({id:p.id,stats:Cg(p,0,{})})),
};`);
fs.writeFileSync(
  "docs/research/runtime-reference.json",
  JSON.stringify(context.reference, null, 2) + "\n",
);
console.log({
  moves: context.reference.moves.length,
  unusable: context.reference.moves
    .filter((m) => !m.definition)
    .map((m) => m.key),
  evolutionPaths: context.reference.evolutions.length,
});
