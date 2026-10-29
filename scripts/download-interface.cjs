const fs=require('node:fs/promises');
const names=['news','map-bill','champion','research','crown','stardust','map-portal','map-boss','mission','record','gold','shiny-charm','egg','torre','megaphone','lab','dex','league','play','trophy','book','settings','fullscreen','map','upgrade'];
async function main(){await fs.mkdir('public/images/icons/game',{recursive:true});let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<names.length){const n=names[cursor++];try{const r=await fetch(`https://pokebonk.com/assets/ui/icons/${n}.png`,{signal:AbortSignal.timeout(15000)});if(r.ok)await fs.writeFile(`public/images/icons/game/${n}.png`,Buffer.from(await r.arrayBuffer()));}catch{}}}));console.log(await fs.readdir('public/images/icons/game'));}
main();
