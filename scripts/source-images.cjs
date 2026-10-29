// Download source artwork, retaining provenance. No generated or traced characters.
const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const pokemon=require('../src/data/pokedex/pokemon.json');
const rawItems=require('../docs/research/items.json');
const config=require('../docs/research/official-config.json');
const jobs=[];
for(const p of pokemon)jobs.push({url:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png`,file:`public/images/pokemon/home/${p.id}.webp`,name:p.name,kind:'Pokémon HOME artwork'});
const itemKeys=new Set([...Object.keys(rawItems),...config.cr.map(i=>i.icon),...config.Gt.map(i=>i.icon), 'poke-ball','great-ball','ultra-ball','kings-rock','town-map','rare-candy','star-piece','trophy','soul-dew','ability-capsule']);
for(const key of itemKeys)jobs.push({url:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${key}.png`,file:`public/images/items/game/${key}.png`,name:key,kind:'PokéAPI item sprite'});
const records=[];let cursor=0,done=0;
async function worker(){
 while(cursor<jobs.length){const job=jobs[cursor++];await fs.mkdir(path.dirname(job.file),{recursive:true});
 try{
  try{await fs.access(job.file);}catch{
   let response;
   for(let attempt=0;attempt<3;attempt++){
    try{response=await fetch(job.url,{signal:AbortSignal.timeout(20000)});if(response.ok)break;if(response.status===404)break;}catch{if(attempt===2)throw new Error('Download timeout');}
   }
   if(!response?.ok)throw new Error('HTTP '+response?.status);
   const buffer=Buffer.from(await response.arrayBuffer());
   if(job.file.endsWith('.webp'))await sharp(buffer).webp({quality:90}).toFile(job.file);else await fs.writeFile(job.file,buffer);
  }
  records.push({...job,file:job.file.replace('public',''),retrieved:'2026-10-22',provider:'PokeAPI/sprites',copyright:'The Pokémon Company; Nintendo / Creatures / GAME FREAK'});
 }catch(error){console.log('Unavailable:',job.name,error.message);}
 if(++done%40===0)console.log(`Images ${done}/${jobs.length}`);
 }
}
async function main(){await Promise.all(Array.from({length:6},worker));await fs.mkdir('src/data/media',{recursive:true});await fs.writeFile('src/data/media/sources.json',JSON.stringify(records.sort((a,b)=>a.file.localeCompare(b.file)),null,2));console.log('Saved',records.length,'source images');}
main().catch(error=>{console.error(error);process.exitCode=1;});
