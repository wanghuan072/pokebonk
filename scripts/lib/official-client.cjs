// Rebind only top-level client symbols. Local variables, property names and
// calculator bodies retain their original meaning; game handlers are not run.
const fs = require("node:fs"),
  ts = require("typescript");
const crypto = require("node:crypto");
const profile = require("../data/active-snapshot.json");
function loadClient() {
  const file = "docs/research/official-game.js";
  const manifest = JSON.parse(
    fs.readFileSync(profile.manifest, "utf8"),
  );
  if (
    crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") !==
    manifest.files.find((f) => f.file === profile.gameFile).sha256
  )
    throw Error(
      "Official client differs from the active reviewed build; review symbols and behavior before extracting.",
    );
  const program = ts.createProgram([file], {
    allowJs: true,
    noLib: true,
    noResolve: true,
  });
  const source = program.getSourceFile(file),
    checker = program.getTypeChecker();
  const map = JSON.parse(
    fs.readFileSync(profile.symbols, "utf8"),
  );
  const aliases = {
    ...Object.fromEntries(
      Object.entries({ ...map.variables, ...map.functions }).map(
        ([old, fresh]) => [fresh, old],
      ),
    ),
    ...profile.aliases,
  };
  const numeric = new Set(
    source.statements
      .filter(ts.isVariableStatement)
      .flatMap((s) => s.declarationList.declarations)
      .filter(
        (n) =>
          ts.isNumericLiteral(n.initializer) ||
          (ts.isPrefixUnaryExpression(n.initializer) &&
            ts.isNumericLiteral(n.initializer.operand)),
      )
      .map((n) => n.name.getText(source)),
  );
  for (const name of numeric)
    aliases[name] = "official_number_" + name.replaceAll("$", "_dollar_");
  function emit(node) {
    const r = ts.transform(node, [
      (context) => (root) => {
        function visit(n) {
          if (ts.isIdentifier(n) && aliases[n.text]) {
            const symbol = checker.getSymbolAtLocation(n);
            if (
              symbol?.declarations?.some(
                (d) =>
                  (ts.isVariableDeclaration(d) &&
                    d.parent?.parent?.parent === source) ||
                  (ts.isFunctionDeclaration(d) && d.parent === source) ||
                  ts.isImportSpecifier(d),
              )
            )
              return ts.factory.createIdentifier(aliases[n.text]);
          }
          return ts.visitEachChild(n, visit, context);
        }
        return ts.visitNode(root, visit);
      },
    ]);
    const text = ts
      .createPrinter({ removeComments: true })
      .printNode(ts.EmitHint.Unspecified, r.transformed[0], source);
    r.dispose();
    return text;
  }
  return { source, emit, map, numeric };
}
module.exports = { loadClient };
