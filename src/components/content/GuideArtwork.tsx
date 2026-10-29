import GameSprite from "./GameSprite";
import Image from "next/image";
import visuals from "@/data/media/guide-visuals.json";

export function getGuideVisual(slug: string) {
  return visuals[slug as keyof typeof visuals];
}

export default function GuideArtwork({
  slug,
  sizes = "(max-width:768px) 90vw, 30vw",
}: {
  slug: string;
  sizes?: string;
}) {
  const visual = getGuideVisual(slug);
  if (slug === "endless-mode-guide" || slug === "coop-mode-guide") return <div className={`mode-guide-art ${slug === "endless-mode-guide" ? "mode-guide-survival" : "mode-guide-coop"}`} role="img" aria-label={slug === "endless-mode-guide" ? "Original Pokémon sprites for the Survival guide" : "Original Pokémon sprites for the co-op guide"}><span>{slug === "endless-mode-guide" ? "SURVIVAL" : "CO-OP"}</span><div>{(slug === "endless-mode-guide" ? [1,7,150] : [1,7,66]).map(id=><GameSprite key={id} id={id} width={70} height={85}/>)}</div><b>{slug === "endless-mode-guide" ? "BUILD FOR THE LONG RUN" : "PLAY AS A TEAM"}</b></div>;
  return (
    <Image
      src={visual.src}
      alt={visual.alt}
      fill
      sizes={sizes}
      className={
        visual.kind === "screenshot"
          ? "guide-source-screenshot"
          : "guide-source-symbol"
      }
      unoptimized={visual.kind !== "screenshot"}
    />
  );
}
