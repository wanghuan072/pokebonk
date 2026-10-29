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

const before=require("./data/official-v0855-symbols.json");
const old=parse("docs/research/recheck-2026-10-26/game.js"),fresh=parse("docs/research/recheck-2026-10-28/game.js");
const result={variables:{},functions:{},comparisons:{}};
for(const [kind,maps]of [["vars",before.variables],["functions",before.functions]]){
 const candidates=[...fresh[kind]].map(([name,n])=>({name,n,text:canonical(n)}));
 for(const [semantic,previous]of Object.entries(maps)){
  const node=old[kind].get(previous);if(!node)throw Error(previous);
  const text=canonical(node),exact=candidates.filter(c=>c.text===text),tokens=new Set(text.match(/\b[\w-]+\b/g));
  const best=exact.length===1?exact[0]:candidates.map(c=>{const t=new Set(c.text.match(/\b[\w-]+\b/g));return{...c,score:[...tokens].filter(x=>t.has(x)).length/new Set([...tokens,...t]).size}}).sort((a,b)=>b.score-a.score)[0];
  result[kind==='vars'?'variables':'functions'][semantic]=best.name;
  result.comparisons[semantic]={previous,name:best.name,exact:exact.length===1,similarity:best.score};
  console.log(semantic,previous,'=>',best.name,exact.length===1?'EXACT':best.score.toFixed(4));
  if(exact.length!==1)for(const [label,n,source]of [['old',node,old.s],['new',best.n,fresh.s]])fs.writeFileSync('docs/research/recheck-2026-10-28/compare-'+semantic+'-'+label+'.js',ts.createPrinter().printNode(ts.EmitHint.Unspecified,n,source));
 }
}
fs.writeFileSync('scripts/data/official-v0862-symbols.json',JSON.stringify(result,null,2)+'\n');
