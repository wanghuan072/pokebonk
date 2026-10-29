const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const profile = require("./data/active-snapshot.json");
const { source, map } = require("./lib/official-client.cjs").loadClient();
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const write = (path, value) => fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
const words = read("docs/research/english-strings.json");
const config = read("docs/research/official-config.json");
const stamp = { gameVersion: profile.version, lastVerified: profile.checkedAt, source: "https://pokebonk.com/", isDetails: false };
const variables = new Map(source.statements.filter(ts.isVariableStatement).flatMap((s) => s.declarationList.declarations).map((d) => [d.name.getText(source), d.initializer]));
function literal(n) {
  if (ts.isStringLiteralLike(n)) return n.text;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(literal);
  if (ts.isCallExpression(n) && n.expression.getText(source) === "c") return words[literal(n.arguments[0])] || literal(n.arguments[0]);
  throw Error("Unreviewed generic fusion metadata expression: " + n.getText(source).slice(0,80));
}
const collections = variables.get(map.variables.db).elements;
const generic = [];
for (const item of collections) {
  const name = (ts.isSpreadElement(item) ? item.expression : item).getText(source);
  const definition = variables.get(name);
  if (ts.isArrayLiteralExpression(definition)) {
    for (const call of definition.elements) {
      const args = call.arguments;
      // Only literal metadata arguments are read. Cast and sound functions are
      // neither evaluated nor called.
      const reaction = ts.isArrayLiteralExpression(args[1]);
      const v = Array.from(args).slice(0, reaction ? 9 : 6).map(literal);
      generic.push(reaction ? { key:"fu-r-"+v[0], kind:"reaction", pair:v[1], type:v[2], type2:v[3], name:v[4], desc:v[5], cls:v[6], cd:v[7], hits:v[8] } : { key:"fu-t-"+v[0], kind:"type", pair:null, type:v[0], name:v[1], desc:v[2], cls:v[3], cd:v[4], hits:v[5] });
    }
  } else {
    const wanted = new Set(["key","kind","type","type2","cls","name","desc","cd","power","hits"]);
    generic.push(Object.fromEntries(definition.properties.filter((p) => ts.isPropertyAssignment(p) && wanted.has(p.name.text)).map((p) => [p.name.text,literal(p.initializer)])));
  }
}
assert.equal(generic.length, 27);
write("src/data/wiki/generic-fusions.json", generic.map((f) => ({slug:f.key,name:f.name,description:f.desc,moves:[],member:null,kind:f.kind,type:f.type,secondaryType:f.type2||null,damageClass:f.cls,cooldown:f.cd,power:f.power||1,hits:f.hits,range:null,status:null,image:`/images/types/game/${f.type}.png`,typeImage:`/images/types/game/${f.type}.png`,pair:f.pair||null,...stamp})));
const unlocks = Object.values(config).find((v) => Array.isArray(v) && v[0]?.key === "soda-pop" && v[0]?.price);
assert.equal(unlocks.length,59);
const pool = new Map(unlocks.map((u) => [u.key,u.price]));
const bag = Object.values(config).find((v)=>Array.isArray(v)&&v[0]?.id==="rare-candy"&&v[0]?.name);
const shop = Object.values(config).find((v)=>Array.isArray(v)&&v[0]?.id==="rare-candy"&&v[0]?.daily);
write("src/data/wiki/meta-progression.json",{bagShop:shop.map((offer)=>({...offer,...bag.find((b)=>b.id===offer.id),image:`/images/items/pokebonk/${offer.id}.png`})),...stamp});
const items = read("src/data/wiki/items.json");
for (const item of items) if (item.category === "Item") {
  item.unlockCost = pool.get(item.slug) ?? null;
  item.archiveEligible = true;
}
write("src/data/wiki/items.json",items);
write("src/data/wiki/mechanics.json",read("src/data/wiki/mechanics.json").map((entry)=>({...entry,...stamp})));
const rules = read("src/data/wiki/rules.json");
rules.fusionPriority = ["signature","reaction","type","glitch"];
rules.archive = { maxLevel:6, slotsPerLevel:5, unlockableItems:59, unlockedItemsPerBonusSlot:2, maxCapacity:59, requiresLabLevel:true, currency:"Stardust" };
// Run only the two reviewed Archive capacity functions in isolated fixtures.
const newsSource = ts.createSourceFile("news.js",fs.readFileSync("docs/research/official-news.js","utf8"),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const newsVariables = newsSource.statements.filter(ts.isVariableStatement).flatMap((s)=>s.declarationList.declarations).map((d)=>[d.name.getText(newsSource),d.initializer]);
const bonus = newsVariables.find(([,n]) => ts.isArrowFunction(n) && n.getText(newsSource).includes("itemsOwned.filter") && n.getText(newsSource).includes("/2"));
const capacity = newsVariables.find(([,n]) => ts.isArrowFunction(n) && n.getText(newsSource).startsWith("e=>5*(e.lab.archive"));
const poolName = bonus[1].getText(newsSource).match(/filter\(e=>([\w$]+)\.has/)[1];
const context = vm.createContext({ keys:unlocks.map((u)=>u.key) },{codeGeneration:{strings:false,wasm:false}});
vm.runInContext(`const ${poolName}=new Set(keys);const ${bonus[0]}=${bonus[1].getText(newsSource)};const ${capacity[0]}=${capacity[1].getText(newsSource)};`,context);
for(let level=0;level<=6;level++) for(let owned=0;owned<=59;owned++) {
  context.fixture={lab:{archive:level},itemsOwned:unlocks.slice(0,owned).map((u)=>u.key)};
  assert.equal(vm.runInContext(`${capacity[0]}(fixture)`,context),5*level+(level>0?Math.floor(owned/2):0));
}
write("src/data/wiki/rules.json",rules);
write("docs/audits/v0855-enrichment-verification.json",{version:profile.version,checkedAt:profile.checkedAt,genericFusions:generic.length,types:generic.filter(f=>f.kind==="type").length,reactions:generic.filter(f=>f.kind==="reaction").length,glitch:generic.filter(f=>f.kind==="glitch").length,archiveFixtures:420,archiveBonusSource:bonus[1].getText(newsSource),archiveCapacitySource:capacity[1].getText(newsSource),unlockableItems:unlocks});
console.log("Added 27 generic fusions, 59 unlock prices and verified all 420 Archive capacity fixtures.");
