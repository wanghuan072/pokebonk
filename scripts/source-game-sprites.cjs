// Preserve the game's own idle row and original frame timings. This only
// extracts existing pixels from the public atlas; it draws no replacement art.
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const sharp = require("sharp");
const ts = require("typescript");
const profile = require("./data/active-snapshot.json");
const hash = (b) => crypto.createHash("sha256").update(b).digest("hex");
async function main() {
  const text = await fs.readFile("docs/research/official-news.js","utf8");
  const ast = ts.createSourceFile("news.js",text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const object = ast.statements.filter(ts.isVariableStatement).flatMap((s)=>s.declarationList.declarations).map((d)=>d.initializer).find((n)=>ts.isObjectLiteralExpression(n)&&n.properties.some((p)=>p.name?.text==="data/sprites.json"));
  const versions = Object.fromEntries(object.properties.map((p)=>[p.name.text,p.initializer.text]));
  const get = async (url) => { let failure;for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status+" "+url);return Buffer.from(await r.arrayBuffer());}catch(error){failure=error;}}throw failure; };
  const metadataUrl="https://pokebonk.com/data/sprites.json?v="+versions["data/sprites.json"];
  const rawMetadata=await get(metadataUrl), metadata=JSON.parse(rawMetadata);
  await fs.mkdir("docs/research/game-sprite-atlases",{recursive:true});
  await fs.writeFile("docs/research/game-sprite-atlases/sprites.json",rawMetadata);
  await fs.mkdir("public/images/pokemon/game/idle",{recursive:true});
  await fs.mkdir("public/images/pokemon/game/portraits",{recursive:true});
  let cursor=1; const records=[], sprites={}, failures=[];
  await Promise.all(Array.from({length:6},async()=>{while(cursor<=151){const id=cursor++;try{
    const meta=metadata[id], idle=meta.anims.idle;
    if(idle.d.length!==idle.n||idle.d.some((n)=>n<=0))throw Error("Unreviewed timing for "+id);
    const sourceUrl=`https://pokebonk.com/assets/pmd/${id}.png?v=${versions.pmd}`;
    const portraitUrl=`https://pokebonk.com/assets/portraits/${id}.png?v=${versions.portraits}`;
    const [atlas,portrait]=await Promise.all([get(sourceUrl),get(portraitUrl)]);
    await fs.writeFile(`docs/research/game-sprite-atlases/${id}.png`,atlas);
    const crop={left:0,top:idle.y,width:idle.fw*idle.n,height:idle.fh};
    const strip=await sharp(atlas).extract(crop).png().toBuffer();
    const pixels=await sharp(atlas).extract(crop).ensureAlpha().raw().toBuffer();
    if(!pixels.equals(await sharp(strip).ensureAlpha().raw().toBuffer()))throw Error("Pixel change "+id);
    const file=`/images/pokemon/game/idle/${id}.png`, portraitFile=`/images/pokemon/game/portraits/${id}.png`;
    await Promise.all([fs.writeFile("public"+file,strip),fs.writeFile("public"+portraitFile,portrait)]);
    sprites[id]={src:file,portrait:portraitFile,width:idle.fw,height:idle.fh,frames:idle.n,durations:idle.d,ticksPerSecond:60};
    records.push({file,url:sourceUrl,kind:"Original PokeBonk idle animation, lossless atlas extraction",provider:"pokebonk.com",retrieved:profile.checkedAt,sourceSha256:hash(atlas),sha256:hash(strip),crop,frameDurations:idle.d,ticksPerSecond:60,pixelSha256:hash(pixels)});
    records.push({file:portraitFile,url:portraitUrl,kind:"Original PokeBonk portrait",provider:"pokebonk.com",retrieved:profile.checkedAt,sha256:hash(portrait)});
  }catch(e){failures.push({id,error:e.message});}}}));
  if(failures.length)throw Error(JSON.stringify(failures));
  await fs.writeFile("src/data/media/game-sprites.json",JSON.stringify(sprites,null,2)+"\n");
  await fs.writeFile("src/data/media/game-sprite-sources.json",JSON.stringify({version:profile.version,metadataUrl,metadataSha256:hash(rawMetadata),records:records.sort((a,b)=>a.file.localeCompare(b.file))},null,2)+"\n");
  const css=["/* Original idle frame durations at 60 game ticks per second. */"];
  for(const[id,s]of Object.entries(sprites)){const total=s.durations.reduce((n,d)=>n+d,0);let t=0;const frames=[];for(let i=0;i<s.frames;i++){frames.push(`${(t/total*100).toFixed(7)}%{left:${-100*i}%}`);t+=s.durations[i];}frames.push("100%{left:0}");css.push(`@keyframes game-idle-${id}{${frames.join("")}}`);}
  await fs.writeFile("src/style/content/game-sprite-frames.css",css.join("\n")+"\n");
  console.log("151 original idle animations and portraits verified; "+records.length+" source records.");
}
main().catch((e)=>{console.error(e);process.exitCode=1;});
