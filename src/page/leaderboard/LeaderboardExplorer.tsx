"use client";
import {useState} from "react";
import Image from "next/image";
import {leaderboardSnapshot as snapshot} from "@/lib/data/leaderboard";
import TrainerAvatar from "@/components/content/TrainerAvatar";
const regionNames:Record<string,string>={VIRIDIAN:"Viridian Forest",ROCKY:"Rocky Desert",STORM:"Storm Coast",CELESTIAL:"Celestial Glacier"};
export default function LeaderboardExplorer(){
 const [mode,setMode]=useState('kos'),[q,setQ]=useState(''),[limit,setLimit]=useState(25);
 const board=snapshot.boards.find(b=>b.id===mode)!;
 const shown=board.entries.filter(e=>`${e.player} ${e.clan||''}`.toLowerCase().includes(q.trim().toLowerCase()));
 const tableRows=q.trim()?shown:shown.filter(e=>e.rank>3);
 const unit=mode==='kos'?'KOs':'min:sec';
 return <div className="record-book">
  <div className="record-tabs" role="group" aria-label="Leaderboard category">{snapshot.boards.map(b=><button key={b.id} aria-pressed={mode===b.id} onClick={()=>{setMode(b.id);setLimit(25);setQ('')}}><b>{b.label}</b><span>{b.id==='kos'?'Total enemies defeated':b.id==='survival'?'Longest regional runs':'Regional clear times'}</span></button>)}</div>
  <div className="rank-banner"><div><span>{board.label.toUpperCase()} LEADERBOARD</span><h2>Global</h2><p>{board.rule}</p></div><div><b>Season {snapshot.season} · October 28, 2026</b><small>{board.trainerCount} trainers at capture</small></div></div>
  <div className="rank-snapshot-controls"><p>All 100 places · captured {snapshot.verifiedAt}. Scores, regional results and gaps follow the official English display. Season standings can change after this capture.</p></div>
  <div className="record-podium">{[board.entries[1],board.entries[0],board.entries[2]].map(e=><article className={`podium-${e.rank}`} key={e.rank}>
   <div className="podium-medal"><TrainerAvatar entry={e} size={e.rank===1?88:70}/>{e.badgeImage?<Image className="podium-placement" src={e.badgeImage} alt={`${e.badge} season placement`} width={32} height={32} unoptimized/>:null}</div>
   <h3>{e.clan?<small>{e.clan} </small>:null}{e.player}</h3>
   {e.title?<span className="trainer-title">{e.titleImage?<Image src={e.titleImage} alt="" width={12} height={12} unoptimized/>:null}{e.title}</span>:null}
   <span>{e.regions.length} regions</span><div className="podium-regions">{e.regions.map(r=><span key={r.region}><i>{regionNames[r.region]}</i><b>{r.value}</b></span>)}</div>
   <strong>{e.value} <small>{unit}</small></strong>{mode==='survival'?<span>{e.secondary}</span>:null}<span className="rank-dust">◆ {e.reward.stardust} Stardust</span><div className="podium-step">{e.rank}</div>
  </article>)}</div>
  <div className="record-table-head"><h2>Top 100 trainers</h2><label className="field">Find trainer / clan tag<input type="search" value={q} onChange={e=>{setQ(e.target.value);setLimit(25)}} placeholder="Search trainer or clan…"/></label></div>
  <p className="result-count" role="status">{shown.length} records · captured {snapshot.verifiedAt} · {board.label}</p>
  <div className="table-scroll"><table className="data-table record-table"><thead><tr><th>#</th><th>Trainer</th><th>Regions</th><th>Gap to #1</th><th>Season reward</th><th>{mode==='kos'?'KOs':'Total time'}</th></tr></thead><tbody>{tableRows.slice(0,limit).map(e=><tr key={e.rank}>
   <td><span className={`record-rank rank-${e.rank}`}>{e.rank}</span></td><td><div className="record-trainer"><TrainerAvatar entry={e}/><div><strong>{e.clan?<em>{e.clan} </em>:null}{e.player}</strong>{e.title?<small className="trainer-title">{e.titleImage?<Image src={e.titleImage} alt="" width={12} height={12} unoptimized/>:null}{e.title}</small>:null}</div></div></td>
   <td><div className="rank-regions">{e.regions.map(r=><span key={r.region}><i>{regionNames[r.region]}</i><b>{r.value}</b></span>)}</div></td><td>{e.gap}</td>
   <td>{e.badgeImage?<div className="record-reward"><Image src={e.badgeImage} alt={`${e.badge} season placement`} width={28} height={28} unoptimized/><span><b>{e.badge}</b><small className="rank-dust">◆ {e.reward.stardust} Stardust</small></span></div>:<span className="source-note">Outside prize places</span>}</td>
   <td><b>{e.value}</b><small>{mode==='survival'?e.secondary:unit}</small></td>
  </tr>)}</tbody></table></div>
  {!shown.length?<div className="empty-state">No trainer or clan matches this leaderboard.</div>:null}{limit<tableRows.length?<button className="button record-load" onClick={()=>setLimit(n=>Math.min(n+25,100))}>Show next 25 ↓</button>:null}
  <section className="season-prizes"><h2>Season rewards</h2><p>KOs and Survival reward the top 100 with separate prizes. Time attack rewards the top 50. These are projected rewards if the season ends at the captured positions, rather than badges already claimed by each trainer.</p><div className="prize-grid">{snapshot.rewards.filter(r=>mode!=='time'||r.time>0).map(r=>{const e=board.entries.find(e=>e.badge===r.badge);return <article key={r.rank}>{e?.badgeImage?<Image src={e.badgeImage} alt={r.badge} width={40} height={40} unoptimized/>:null}<b>{r.badge}</b><span>{r.rank}</span><strong>◆ {mode==='time'?r.time:r.kos} Stardust</strong></article>})}</div><p>Each placement badge unlocks its matching avatar frame and lower frames. {mode==='kos'?'Global KO places #1, top 3, top 10 and top 50 also unlock exclusive trainer avatars.':mode==='time'?'The #1 Time attack trainer also wins the title “Kanto Speedster”.':'Survival prizes are awarded separately from the KO leaderboard.'}</p><p className="source-note">The portrait and equipped frame shown beside each name are that trainer’s public appearance at capture. The separate placement badge shows their position on this specific board. Rounded regional values may not add up exactly to the displayed total; original ordering and gaps are preserved.</p><a href="/play" className="button button-gold">Open the game from the Play page</a></section>
 </div>;
}
