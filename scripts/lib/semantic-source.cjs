const ts=require('typescript');
// Hash displayed meaning, not JSX wrappers, CSS classes, handlers or state machinery.
module.exports=function semanticSource(file,reader,route){
 const tree=ts.createSourceFile(file,reader(file),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const kind=route==='/wiki/attacks'?'attacks':route==='/wiki/items'?'items':route==='/wiki/vitamins'?'vitamins':undefined;
 const values=new Set(),seen=new Set();
 const bindings=new Map();
 function findBindings(n){if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer)bindings.set(n.name.text,n.initializer);ts.forEachChild(n,findBindings)}findBindings(tree);
 function truth(n){
  if(ts.isParenthesizedExpression(n))return truth(n.expression);
  if(ts.isBinaryExpression(n)){
   const op=n.operatorToken.kind;
   if(kind&&[ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(op)&&ts.isIdentifier(n.left)&&n.left.text==='kind'&&ts.isStringLiteral(n.right))return op===ts.SyntaxKind.EqualsEqualsEqualsToken?kind===n.right.text:kind!==n.right.text;
   const a=truth(n.left),b=truth(n.right);
   if(op===ts.SyntaxKind.AmpersandAmpersandToken)return a===false||b===false?false:a===true&&b===true?true:undefined;
   if(op===ts.SyntaxKind.BarBarToken)return a===true||b===true?true:a===false&&b===false?false:undefined;
  }
 }
 function add(v){v=v.replace(/\s+/g,' ').trim();if(v)values.add(v)}
 function expression(n){
  if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){add(n.text);return}
  if(ts.isConditionalExpression(n)){const t=truth(n.condition);if(t!==false)expression(n.whenTrue);if(t!==true)expression(n.whenFalse);return}
  if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken){if(truth(n.left)!==false)expression(n.right);return}
  if(ts.isIdentifier(n)&&bindings.has(n.text)&&!seen.has(n.text)){seen.add(n.text);expression(bindings.get(n.text));return}
  if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)||ts.isJsxFragment(n)){jsx(n);return}
  // Local handlers and anonymous callbacks do not contribute unless they render JSX.
  if(ts.isArrowFunction(n)||ts.isFunctionExpression(n)){scan(n.body);return}
  ts.forEachChild(n,expression);
 }
 function jsx(n){
  if(ts.isJsxText(n)){add(n.text);return}
  if(ts.isJsxAttribute(n)){
   const key=n.name.getText(tree);if(!['src','href','alt','title','placeholder','aria-label'].includes(key))return;
   if(n.initializer)expression(n.initializer);return;
  }
  if(ts.isJsxExpression(n)){if(n.expression)expression(n.expression);return}
  ts.forEachChild(n,jsx);
 }
 function scan(n){
  if(kind&&kind!=='vitamins'&&ts.isFunctionDeclaration(n)&&n.name?.text==='VitaminPlan')return;
  if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)||ts.isJsxFragment(n)){jsx(n);return}
  ts.forEachChild(n,scan);
 }
 scan(tree);
 return [...values].sort();
};
