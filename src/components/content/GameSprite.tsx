import Image from "next/image";
import type { CSSProperties } from "react";
import sprites from "@/data/media/game-sprites.json";
import "@/style/content/game-sprite.css";
import "@/style/content/game-sprite-frames.css";

export default function GameSprite({ id, alt = "", width = 96, height = 96, className = "" }: {
  id: number; alt?: string; width?: number; height?: number; className?: string;
}) {
  const sprite = sprites[String(id) as keyof typeof sprites];
  const duration = sprite.durations.reduce((total, ticks) => total + ticks, 0) / sprite.ticksPerSecond;
  return <span className={`game-sprite ${className}`} data-pokemon-id={id} style={{ width, height, "--frame-width":sprite.width,"--frame-height":sprite.height } as CSSProperties}>
    <span className="game-sprite-viewport">
      <Image className="game-sprite-sheet" src={sprite.src} alt={alt} width={sprite.width * sprite.frames} height={sprite.height} unoptimized draggable={false} style={{ width:`${sprite.frames*100}%`,height:"100%",animationName:`game-idle-${id}`,animationDuration:`${duration}s` }} />
    </span>
  </span>;
}
