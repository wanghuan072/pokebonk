const {test}=require('node:test'),assert=require('node:assert/strict');
const {config,createManifest,diff,submit,validate}=require('../scripts/indexnow/lib.cjs');
const {eligible,matchesEvent}=require('../scripts/indexnow/notify.cjs');
const hash=n=>String(n).repeat(64),url=p=>config.siteUrl+p;
const make=(data,previous,day=1)=>createManifest(data,{},previous,`2026-10-${String(day).padStart(2,'0')}T12:00:00Z`,{environment:'production',id:'dpl_test',projectId:config.projectId,url:'pokebonk-test.vercel.app'});
test('unchanged builds keep dates; only actual changes notify',()=>{
 const a=make({'/':hash(1),'/a':hash(2)}),b=make({'/':hash(1),'/a':hash(2)},a,2);
 assert.deepEqual(b.entries,a.entries);assert.deepEqual(diff(a,b),[]);
 const c=make({'/':hash(1),'/a':hash(3),'/b':hash(4)},b,3);
 assert.deepEqual(diff(b,c),[url('/a'),url('/b')]);assert.equal(c.entries[0].lastModified,a.entries[0].lastModified);
});
test('new page removed before successful notification remains queued',()=>{
 const a=make({'/':hash(1)}),b=make({'/':hash(1),'/temporary':hash(2)},a,2),c=make({'/':hash(1)},b,3),d=make({'/':hash(1)},c,4);
 assert.deepEqual(diff(a,d),[url('/temporary')]);assert.equal(d.deletedAt[url('/temporary')],c.deletedAt[url('/temporary')]);assert.deepEqual(diff(d,d),[]);
});
test('restoration cancels old deletion; a second deletion has a new event',()=>{
 const a=make({'/a':hash(1)}),b=make({},a,2),c=make({'/a':hash(1)},b,3),d=make({},c,4);
 assert.equal(c.deletedAt[url('/a')],undefined);assert.notEqual(b.deletedAt[url('/a')],d.deletedAt[url('/a')]);assert.deepEqual(diff(b,d),[url('/a')]);
});
test('first run or expired state submits all live URLs and retained deletions',()=>{
 const a=make({'/old':hash(1)}),b=make({'/new':hash(2)},a,2);assert.deepEqual(diff(undefined,b),[url('/new'),url('/old')]);
});
test('all batches must succeed; a partial failure rejects and can be retried',async()=>{
 const urls=Array.from({length:10001},(_,i)=>url('/'+i));let calls=0;
 await assert.rejects(submit({},urls,async()=>({status:++calls===1?200:500})),/batch 2 failed/);assert.equal(calls,2);
 calls=0;await submit({},urls,async(_,init)=>{calls++;assert.ok(JSON.parse(init.body).urlList.length<=10000);return {status:202}});assert.equal(calls,2);
});
test('foreign origin, invalid dates and outdated state are rejected',()=>{
 const a=make({'/':hash(1)}),b=make({'/':hash(2)},a,2);
 assert.throws(()=>diff(b,a),/newer/);assert.throws(()=>validate({...a,siteUrl:'https://example.com'}),/Invalid/);
 assert.throws(()=>validate({...a,entries:[{...a.entries[0],canonicalUrl:'https://example.com/'}]}),/Invalid/);
});
test('untrusted, preview and failed events never authorize submission',()=>{
 const e={repository:{full_name:config.repository},sender:{login:'vercel[bot]'},action:'vercel.deployment.success',client_payload:{environment:'production',url:'https://pokebonk-test.vercel.app'}};
 assert.equal(eligible(e,'repository_dispatch'),true);
 assert.equal(eligible({...e,sender:{login:'someone'}},'repository_dispatch'),false);
 assert.equal(eligible({...e,client_payload:{environment:'preview'}},'repository_dispatch'),false);
 assert.equal(eligible({...e,action:'vercel.deployment.error'},'repository_dispatch'),false);
 assert.equal(matchesEvent(e,'repository_dispatch',make({'/':hash(1)})),true);
 assert.equal(matchesEvent(e,'repository_dispatch',{deployment:{url:'other.vercel.app'}}),false);
});
test('published key is exact UTF-8, and framework Sitemap reuses the manifest',()=>{
 const fs=require('fs');assert.equal(fs.readFileSync('public/'+config.key+'.txt','utf8'),config.key);
 assert.match(fs.readFileSync('src/app/sitemap.ts','utf8'),/manifest.entries/);
});

test('preview preparation sends nothing and publishes no indexable URLs',()=>{
 const fs=require('fs'),{spawnSync}=require('child_process');
 const files=['public/seo-manifest.json','src/seo/build-history.json'];const saved=files.map(f=>fs.readFileSync(f));
 try{
  const result=spawnSync(process.execPath,['scripts/prepare-seo.cjs'],{encoding:'utf8',env:{...process.env,VERCEL_ENV:'preview'}});
  assert.equal(result.status,0,result.stderr);const m=JSON.parse(fs.readFileSync(files[0]));assert.equal(m.entries.length,0);assert.equal(m.deployment.environment,'preview');
 }finally{files.forEach((f,i)=>fs.writeFileSync(f,saved[i]))}
});
test('production preparation refuses missing deployment identity',()=>{
 const {spawnSync}=require('child_process');const result=spawnSync(process.execPath,['scripts/prepare-seo.cjs'],{encoding:'utf8',env:{...process.env,VERCEL_ENV:'production',VERCEL_PROJECT_ID:'wrong'}});
 assert.notEqual(result.status,0);assert.match(result.stderr,/identity/);
});

test('metadata, robots and sitemap agree with preparation in every environment',()=>{
 const fs=require('node:fs'),{spawnSync}=require('node:child_process'),vm=require('node:vm'),ts=require('typescript');
 const files=['public/seo-manifest.json','src/seo/build-history.json','.indexnow/local-manifest.json'];
 const saved=files.map(file=>fs.existsSync(file)?fs.readFileSync(file):null);
 const evaluate=(file,env,imports)=>{
  const context={exports:{},process:{env},URL,require:name=>{
   assert.ok(Object.hasOwn(imports,name),'Unexpected import: '+name);
   return imports[name];
  }};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,context);return context.exports;
 };
 const baseline=make({});
 const script=`global.fetch=async()=>new Response(JSON.stringify(${JSON.stringify(baseline)}),{status:200});require('./scripts/prepare-seo.cjs').prepare().catch(e=>{console.error(e);process.exitCode=1})`;
 try{
  for(const environment of [undefined,'development','preview','production']){
   for(const override of [undefined,'false','true']){
    const env={...process.env,VERCEL_PROJECT_ID:config.projectId,VERCEL_GIT_COMMIT_REF:config.productionBranch,VERCEL_DEPLOYMENT_ID:'dpl_matrix',VERCEL_GIT_COMMIT_SHA:'a'.repeat(40)};
    delete env.VERCEL_ENV;delete env.SITE_INDEXABLE;
    if(environment!==undefined)env.VERCEL_ENV=environment;
    if(override!==undefined)env.SITE_INDEXABLE=override;
    const label=`${environment||'non-Vercel'} / ${override||'unset'}`;
    const expected=environment!=='preview'&&(override==='true'||environment==='production'&&override!=='false');
    const result=spawnSync(process.execPath,['-e',script],{encoding:'utf8',env});
    assert.equal(result.status,0,label+': '+result.stderr);
    const manifest=JSON.parse(fs.readFileSync(files[0],'utf8'));
    const {site}=evaluate('src/config/site.ts',env,{
     './indexability.cjs':require('../src/config/indexability.cjs'),
     '@/data/site/game-version.json':{default:{version:'test',checkedAt:'2026-10-28'}},
    });
    const robots=evaluate('src/app/robots.ts',env,{'@/config/site':{site}}).default();
    const sitemap=evaluate('src/app/sitemap.ts',env,{'../../public/seo-manifest.json':{default:manifest}}).default();
    const {pageMetadata}=evaluate('src/seo/metadata.ts',env,{
     './tdk':{default:{'/':{title:'PokeBonk',description:'Test'}}},
     '@/config/site':{site},'./history':{getPageModified:()=> '2026-10-28'},
    });
    assert.equal(site.configured,expected,label);
    assert.equal(pageMetadata('/').robots.index,expected,label);
    assert.equal(robots.rules.allow,expected?'/':undefined,label);
    assert.equal(robots.rules.disallow,expected?undefined:'/',label);
    assert.equal(robots.sitemap,expected?config.siteUrl+'/sitemap.xml':undefined,label);
    assert.equal(manifest.entries.length,expected?22:0,label);
    assert.equal(sitemap.length,manifest.entries.length,label);
    assert.ok(sitemap.every(entry=>entry.url.startsWith(config.siteUrl+'/')),label);
   }
  }
 }finally{
  files.forEach((file,i)=>{if(saved[i]===null)fs.rmSync(file,{force:true});else fs.writeFileSync(file,saved[i])});
 }
});
test('production preparation inherits the live manifest, not a new build time',()=>{
 const fs=require('fs'),{spawnSync}=require('child_process');const files=['public/seo-manifest.json','src/seo/build-history.json'];const saved=files.map(f=>fs.readFileSync(f));
 try{
  const old=createManifest(require('../scripts/lib/page-fingerprints.cjs').collectPages(),JSON.parse(fs.readFileSync('src/seo/page-history.json','utf8')),undefined,new Date().toISOString(),{environment:'production',projectId:config.projectId});
  const script=`global.fetch=async()=>new Response(JSON.stringify(${JSON.stringify(old)}),{status:200});require('./scripts/prepare-seo.cjs').prepare().catch(e=>{console.error(e);process.exitCode=1})`;
  const result=spawnSync(process.execPath,['-e',script],{encoding:'utf8',env:{...process.env,VERCEL_ENV:'production',SITE_INDEXABLE:'true',VERCEL_PROJECT_ID:config.projectId,VERCEL_GIT_COMMIT_REF:'main',VERCEL_DEPLOYMENT_ID:'dpl_new',VERCEL_GIT_COMMIT_SHA:'a'.repeat(40),VERCEL_URL:'pokebonk-new.vercel.app'}});
  assert.equal(result.status,0,result.stderr);const m=JSON.parse(fs.readFileSync(files[0]));assert.deepEqual(m.entries,old.entries);assert.equal(m.deployment.id,'dpl_new');
 }finally{files.forEach((f,i)=>fs.writeFileSync(f,saved[i]))}
});

test('built Sitemap matches canonical manifest and preserves authored dates',{skip:!require('fs').existsSync('.next/server/app/sitemap.xml.body')},()=>{
 const fs=require('fs'),m=JSON.parse(fs.readFileSync('public/seo-manifest.json','utf8'));
 const xml=fs.readFileSync('.next/server/app/sitemap.xml.body','utf8');
 const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);assert.deepEqual(locs,m.entries.map(e=>e.canonicalUrl));
 const history=JSON.parse(fs.readFileSync('src/seo/page-history.json','utf8'));
 for(const e of m.entries)assert.equal(e.lastModified.slice(0,10),history[e.path].modified);
});
