import Image from "next/image";
import type { CSSProperties } from "react";
import "@/style/content/trainer-avatar.css";
export type TrainerAppearance={player:string;avatar:string;avatarFilter:string|null;frame:string|null;frameX:number;frameY:number;trainerAvatar:boolean};
export default function TrainerAvatar({entry,size=44,label}:{entry:TrainerAppearance;size?:number;label?:string}){
 return <span className={`trainer-avatar${entry.frame?' has-frame':''}`} style={{'--avatar-size':`${size}px`,'--frame-x':entry.frameX,'--frame-y':entry.frameY} as CSSProperties}>
  <span className="trainer-avatar-picture"><Image src={entry.avatar} alt={label||`${entry.player}'s equipped avatar`} width={size} height={size} unoptimized style={entry.avatarFilter?{filter:entry.avatarFilter}:undefined}/></span>
  {entry.frame?<Image className="trainer-avatar-frame" src={entry.frame} alt={label?`${label} frame`:`${entry.player}'s equipped frame`} width={Math.ceil(size*1.56)} height={Math.ceil(size*1.56)} unoptimized/>:null}
 </span>;
}
