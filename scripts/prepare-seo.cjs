const fs=require('fs'),path=require('path');
const {collectPages}=require('./lib/page-fingerprints.cjs');
const {config,createManifest,fetchPublic,validate}=require('./indexnow/lib.cjs');
async function prepare(){
 const production=process.env.VERCEL_ENV==='production';
 if(!fs.readFileSync('src/config/site.ts','utf8').includes('"'+config.siteUrl+'"'))throw Error('IndexNow origin differs from site canonical');
 const fingerprints=collectPages(),history=JSON.parse(fs.readFileSync('src/seo/page-history.json'));
 // Detect a new static URL missing SEO rather than quietly dropping it.
 const redirects=[...fs.readFileSync('next.config.ts','utf8').matchAll(/source:\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.name==='page.tsx'){const route='/'+path.relative('src/app',dir).split(path.sep).filter(s=>!s.startsWith('(')).join('/');if(!route.includes('[')&&!redirects.includes(route)&&!fingerprints[route])throw Error('New page missing SEO/canonical data: '+route)}}}walk('src/app');
 const now=new Date().toISOString();let previous;
 if(!production&&process.env.VERCEL_ENV!=="preview"&&fs.existsSync(".indexnow/local-manifest.json"))previous=validate(JSON.parse(fs.readFileSync(".indexnow/local-manifest.json","utf8")));
 if(production){
  if(process.env.VERCEL_PROJECT_ID!==config.projectId||process.env.VERCEL_GIT_COMMIT_REF!==config.productionBranch||!process.env.VERCEL_DEPLOYMENT_ID||!process.env.VERCEL_GIT_COMMIT_SHA)throw Error('Missing or mismatched production deployment identity');
  const r=await fetchPublic(config.siteUrl+'/seo-manifest.json');
  if(r.ok){previous=validate(await r.json());if(previous.deployment?.projectId!==config.projectId||previous.deployment?.environment!=='production')throw Error('Previous manifest is not this project production')}
  else if(r.status===404){
   const sitemap=await fetchPublic(config.siteUrl+'/sitemap.xml');if(!sitemap.ok)throw Error('Cannot migrate existing production dates: sitemap HTTP '+sitemap.status);
   const xml=await sitemap.text();if(!xml.includes('<urlset'))throw Error('Invalid initial sitemap');
   const entries=[...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/g)].map(m=>{const url=new URL(m[1]);if(url.origin!==config.siteUrl)throw Error('Foreign canonical in production sitemap');return {path:url.pathname,canonicalUrl:url.href,indexable:true,contentFingerprint:'sha256:'+(fingerprints[url.pathname]||'0'.repeat(64)),lastModified:m[2]||history[url.pathname]?.modified||now.slice(0,10)}});
   if(!entries.length)throw Error('Production sitemap has no pages; migration refused');
   previous={schemaVersion:1,fingerprintVersion:'semantic-v2',siteUrl:config.siteUrl,generatedAt:now,entries,deletedAt:{}};
  }else throw Error('Cannot read production SEO baseline: HTTP '+r.status);
 }
 const deployment={projectId:process.env.VERCEL_PROJECT_ID||config.projectId,id:process.env.VERCEL_DEPLOYMENT_ID||'local',url:process.env.VERCEL_URL||'',commit:process.env.VERCEL_GIT_COMMIT_SHA||'local',branch:process.env.VERCEL_GIT_COMMIT_REF||'local',environment:production?'production':process.env.VERCEL_ENV||'local'};
 const indexable=process.env.VERCEL_ENV!=="preview"&&(!production||process.env.SITE_INDEXABLE!=="false");
 const manifest=createManifest(indexable?fingerprints:{},history,previous,now,deployment);
 const runtime=Object.fromEntries(manifest.entries.map(e=>[e.path,{fingerprint:e.contentFingerprint.slice(7),modified:e.lastModified.slice(0,10)}]));
 fs.writeFileSync('src/seo/build-history.json',JSON.stringify(runtime,null,2)+'\n');
 fs.writeFileSync('public/seo-manifest.json',JSON.stringify(manifest,null,2)+'\n');
 if(!production&&process.env.VERCEL_ENV!=="preview"){fs.mkdirSync('.indexnow',{recursive:true});fs.writeFileSync('.indexnow/local-manifest.json',JSON.stringify(manifest));}
 const keyFile='public/'+config.key+'.txt';if(fs.readFileSync(keyFile,'utf8')!==config.key)throw Error('IndexNow verification key file mismatch');
 console.log('SEO prepared: '+manifest.entries.length+' URLs; '+Object.keys(manifest.deletedAt).length+' pending deletions; '+deployment.environment+'. No notifications sent.');
}
if(require.main===module)prepare().catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={prepare};
