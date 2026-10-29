import Image from "next/image";
import GameSprite from "./GameSprite";
export default function GameBackdrop(){return <div className="game-menu-backdrop" aria-hidden="true"><Image src="/images/home/game-tower.jpg" alt="" fill preload sizes="(max-width:1024px) 100vw, 1320px"/><div className="menu-mist"/>{[92,93,94].map((id,i)=><div className={`menu-ghost menu-ghost-${i}`} key={id}><GameSprite id={id} width={i===2?140:90} height={i===2?140:90}/></div>)}</div>}
