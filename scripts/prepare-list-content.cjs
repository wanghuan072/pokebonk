const fs=require('node:fs');
const root='src/data/';
for(const path of ['pokedex/pokemon.json','wiki/moves.json','wiki/items.json','wiki/fusions.json','wiki/achievements.json','wiki/lab.json','updates/releases.json']) {
 const data=JSON.parse(fs.readFileSync(root+path,'utf8'));
 for(const entry of data) entry.isDetails=false;
 fs.writeFileSync(root+path,JSON.stringify(data,null,2)+'\n');
}
