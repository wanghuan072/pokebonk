const fs=require('fs');
const {config,validate,diff,fetchPublic,submit,signature}=require('./lib.cjs');
function eligible(event,name){
 if(event.repository?.full_name!==config.repository)return false;
 if(name==='workflow_dispatch')return process.env.GITHUB_REF==='refs/heads/'+config.productionBranch;
 return name==='repository_dispatch'&&event.sender?.login==='vercel[bot]'&&['vercel.deployment.success','vercel.deployment.promoted'].includes(event.action)&&event.client_payload?.environment==='production';
}
function matchesEvent(event,name,current){
 if(name==='workflow_dispatch')return true;
 const url=event.client_payload?.url;
 if(!url||!current.deployment.url)return false;
 try{return new URL(url.startsWith('https://')?url:'https://'+url).host===current.deployment.url}catch{return false}
}
async function readCurrent(){const r=await fetchPublic(config.siteUrl+'/seo-manifest.json');if(!r.ok)throw Error('Published manifest HTTP '+r.status);const m=validate(await r.json());if(m.deployment?.environment!=='production'||m.deployment?.projectId!==config.projectId||m.deployment?.branch!==config.productionBranch||!m.deployment.id?.startsWith('dpl_')||!/^[a-f0-9]{40}$/.test(m.deployment.commit))throw Error('Published version is not identified production');return m}
async function notify(){
 if(process.env.GITHUB_ACTIONS!=='true')throw Error('Real notification is allowed only in the production-success workflow');
 const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')),name=process.env.GITHUB_EVENT_NAME;
 if(!eligible(event,name)){console.log('Skipped: not a trusted production-success event.');return}
 const current=await readCurrent();if(!matchesEvent(event,name,current)){console.log('Skipped: event does not match the currently published version.');return}
 const previous=fs.existsSync('.indexnow/previous/accepted.json')?JSON.parse(fs.readFileSync('.indexnow/previous/accepted.json','utf8')):undefined;
 const urls=diff(previous,current);
 const key=await fetchPublic(config.siteUrl+'/'+config.key+'.txt');if(!key.ok||(await key.text())!==config.key)throw Error('Published key verification file is missing or incorrect');
 const live=new Set(current.entries.map(e=>e.canonicalUrl));
 for(const url of urls.filter(u=>!live.has(u))){
  const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  const removed=[404,410].includes(r.status)||[301,308].includes(r.status)&&!!r.headers.get('location')||r.status===200&&(r.headers.get('x-robots-tag')?.includes('noindex')||(await r.text()).match(/<meta[^>]+(?:name=["']robots["'][^>]+content=["'][^"']*noindex|content=["'][^"']*noindex[^>]+name=["']robots["'])/i));
  if(!removed)throw Error('Deleted URL is still indexable or unavailable: '+url+' HTTP '+r.status);
 }
 // Do not submit an obsolete build, or acknowledge it after a promotion raced the batches.
 if(signature(await readCurrent())!==signature(current))throw Error('Production changed before notification; retry the current version');
 await submit(current,urls);
 if(signature(await readCurrent())!==signature(current))throw Error('Production changed during notification; acknowledgement not advanced');
 fs.mkdirSync('.indexnow',{recursive:true});fs.writeFileSync('.indexnow/accepted.json',JSON.stringify(current,null,2)+'\n');
 const message='IndexNow accepted '+urls.length+' changed URLs for '+current.deployment.id+'. Acceptance is not an indexing guarantee.';
 console.log(message);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,message+'\n');
}
if(require.main===module)notify().catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={eligible,matchesEvent};
