const crypto=require('crypto');
const config=require('./config.json');
function validate(m){
 if(m?.schemaVersion!==1||m.siteUrl!==config.siteUrl||m.fingerprintVersion!=='semantic-v2'||!Number.isFinite(Date.parse(m.generatedAt))||!Array.isArray(m.entries))throw Error('Invalid SEO manifest or fingerprint version');
 const seen=new Set();for(const e of m.entries){const u=new URL(e.canonicalUrl);if(u.origin!==config.siteUrl||u.hash||u.search||u.pathname!==e.path||!e.indexable||seen.has(e.canonicalUrl)||!/^sha256:[a-f0-9]{64}$/.test(e.contentFingerprint)||!Number.isFinite(Date.parse(e.lastModified))||Date.parse(e.lastModified)>Date.parse(m.generatedAt))throw Error('Invalid canonical entry: '+e.path);seen.add(e.canonicalUrl)}
 for(const [url,stamp] of Object.entries(m.deletedAt||{})){if(new URL(url).origin!==config.siteUrl||new URL(url).hash||new URL(url).search||seen.has(url)||!Number.isFinite(Date.parse(stamp))||Date.parse(stamp)>Date.parse(m.generatedAt))throw Error('Invalid deletion event: '+url)}
 return m;
}
function createManifest(fingerprints,history,previous,now,deployment){
 if(previous){validate(previous);if(Date.parse(previous.generatedAt)>Date.parse(now))throw Error('Previous production record is newer than this build')}
 const old=new Map((previous?.entries||[]).map(e=>[e.path,e]));
 const deletedAt={...previous?.deletedAt};
 const entries=Object.entries(fingerprints).map(([path,hash])=>{
  const canonicalUrl=config.siteUrl+path,prior=old.get(path),contentFingerprint='sha256:'+hash;
  const unchanged=prior?.contentFingerprint===contentFingerprint;
  const authored=history[path]?.fingerprint===hash?history[path].modified:undefined;
  const lastModified=unchanged?prior.lastModified:authored&&(!prior||Date.parse(authored)>=Date.parse(prior.lastModified))?authored:now.slice(0,10);
  delete deletedAt[canonicalUrl];return {path,canonicalUrl,indexable:true,contentFingerprint,lastModified:new Date(lastModified).toISOString()};
 });
 for(const e of previous?.entries||[])if(!fingerprints[e.path])deletedAt[e.canonicalUrl]=now;
 return validate({schemaVersion:1,fingerprintVersion:'semantic-v2',siteUrl:config.siteUrl,generatedAt:now,deployment,entries,deletedUrls:Object.keys(deletedAt),deletedAt});
}
function diff(previous,current){
 validate(current);if(previous){validate(previous);if(Date.parse(previous.generatedAt)>Date.parse(current.generatedAt))throw Error('Refusing to overwrite newer notification state')}
 const old=new Map((previous?.entries||[]).map(e=>[e.canonicalUrl,e.contentFingerprint]));
 const live=new Set(current.entries.map(e=>e.canonicalUrl));
 const urls=new Set(current.entries.filter(e=>old.get(e.canonicalUrl)!==e.contentFingerprint).map(e=>e.canonicalUrl));
 for(const url of old.keys())if(!live.has(url))urls.add(url);
 for(const [url,at] of Object.entries(current.deletedAt||{}))if(previous?.deletedAt?.[url]!==at&&!live.has(url))urls.add(url);
 return [...urls].sort();
}
async function fetchPublic(url){
 const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
 return r;
}
async function submit(current,urls,request=fetch){
 for(let i=0;i<urls.length;i+=10000){
  const body=JSON.stringify({host:new URL(config.siteUrl).host,key:config.key,keyLocation:config.siteUrl+'/'+config.key+'.txt',urlList:urls.slice(i,i+10000)});
  for(let attempt=0;;attempt++){
   const r=await request('https://api.indexnow.org/indexnow',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json; charset=utf-8'},body,signal:AbortSignal.timeout(20000)});
   if(r.status===200||r.status===202)break;
   if(r.status===429&&attempt<2){await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));continue}
   throw Error('IndexNow batch '+(1+i/10000)+' failed: HTTP '+r.status);
  }
 }
}
function signature(m){return crypto.createHash('sha256').update(JSON.stringify(m)).digest('hex')}
module.exports={config,validate,createManifest,diff,fetchPublic,submit,signature};
