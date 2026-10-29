import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
const sourced: Record<string, string> = {
  ball: "items/pokebonk/poke-ball",
  book: "icons/game/research",
  trophy: "icons/game/gold",
  flask: "items/pokebonk/calcium",
  fusion: "icons/game/map-bill",
  gem: "icons/game/stardust",
  star: "items/pokebonk/star-piece",
  compass: "icons/game/map-portal",
  map: "icons/game/map-portal",
  crown: "icons/game/crown",
};
const symbols: Record<string, ReactNode> = {
  home: <path d="m3 15 13-11 13 11h-4v15h-7v-10h-5v10H7V15z" fill="currentColor" />,
  chart: <path d="M5 17h5v13H5zm9-10h5v23h-5zm9-5h5v28h-5z" fill="currentColor" />,
  calendar: <><rect x="5" y="7" width="24" height="23" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M5 14h24M11 3v8M23 3v8M11 19h3m6 0h3m-12 6h3m6 0h3" stroke="currentColor" strokeWidth="2" /></>,
  info: <><circle cx="17" cy="17" r="14" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M17 15v10m0-17v3" stroke="currentColor" strokeWidth="3" /></>,
  bolt: (
    <>
      <path d="m19 2-13 17h9l-2 12 14-19h-9z" fill="#ffd34f" stroke="#fff1aa" />
      <path d="m19 4-9 13h7" fill="none" stroke="#fff5c1" />
    </>
  ),
  ball: (
    <>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="#eaf5ff"
        stroke="#172f51"
        strokeWidth="2"
      />
      <path d="M3 16a13 13 0 0 1 26 0z" fill="#ff6572" />
      <path d="M3 16h26" stroke="#203b5b" strokeWidth="3" />
      <circle
        cx="16"
        cy="16"
        r="5"
        fill="white"
        stroke="#203b5b"
        strokeWidth="2"
      />
      <path
        d="M9 7q4-3 8-2"
        fill="none"
        stroke="#ffdce0"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  book: (
    <>
      <path
        d="M16 8Q8 2 2 6v22q7-4 14 1 7-5 14-1V6q-6-4-14 2z"
        fill="#24b6ed"
        stroke="#c3f4ff"
        strokeWidth="1.4"
      />
      <path
        d="M16 9v18M5 8q4-1 8 2v13q-4-3-8-2zm22 0q-4-1-8 2v13q4-3 8-2z"
        fill="#5cd1f7"
        stroke="#b9edff"
      />
      <path
        d="m7 12 4 1m-4 4 4 1m10-5 4-1m-4 6 4-1"
        stroke="#dcf9ff"
        strokeLinecap="round"
      />
    </>
  ),
  trophy: (
    <>
      <path
        d="M8 5H3v7q0 7 9 7m12-14h5v7q0 7-9 7"
        fill="none"
        stroke="#ffcf47"
        strokeWidth="3"
      />
      <path d="M7 3h18l-2 11q-1 7-7 7t-7-7z" fill="#ffcd43" stroke="#fff0a2" />
      <path d="M11 5h4l-1 10q-4-2-3-10" fill="#fff4af" />
      <path d="M14 21h4v6h7v3H7v-3h7z" fill="#e8a932" stroke="#ffe782" />
    </>
  ),
  flask: (
    <>
      <path
        d="M11 3h10v3h-2v8l9 14q1 3-4 3H8q-5 0-4-3l9-14V6h-2z"
        fill="#9a9fff"
        fillOpacity=".2"
        stroke="#bdefff"
        strokeWidth="1.8"
      />
      <path d="m11 20-5 8q0 1 3 1h14q3 0 3-1l-5-8q-5 3-10 0" fill="#a964ff" />
      <path d="M11 3h10v3H11z" fill="#69d6f5" />
      <path
        d="m13 14-5 10m8-4 1-2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="19" cy="25" r="1.5" fill="#e3bfff" />
    </>
  ),
  fusion: (
    <>
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="7"
        transform="rotate(40 16 16)"
        fill="none"
        stroke="#b98bff"
        strokeWidth="2.5"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="7"
        transform="rotate(-40 16 16)"
        fill="none"
        stroke="#63d9fa"
        strokeWidth="2.5"
      />
      <circle cx="16" cy="16" r="6" fill="#b184ff" stroke="#ebd2ff" />
      <circle cx="7" cy="8" r="3" fill="#ffe391" />
      <circle cx="25" cy="24" r="3" fill="#8eeef9" />
    </>
  ),
  gem: (
    <>
      <path d="m9 3 15 2 6 10-14 16L2 15z" fill="#5ce1bd" stroke="#b5ffe1" />
      <path
        d="m9 3 3 12L2 15m10 0L24 5l-3 11 9-1m-18 0 4 16 5-15-9-1z"
        fill="#24bcad"
        stroke="#9cf9da"
      />
      <path d="m9 3 3 12L24 5" fill="#a5ffe4" />
    </>
  ),
  star: (
    <path
      d="m16 2 4 10 11 4-11 4-4 11-4-11L1 16l11-4z"
      fill="#ffdb65"
      stroke="#fff0ac"
    />
  ),
  compass: (
    <>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="#183955"
        stroke="#ffdc79"
        strokeWidth="2"
      />
      <path d="m22 8-3 12-10 4 4-12z" fill="#70ddf3" stroke="#c7fbff" />
      <path d="m22 8-9 4 6 8z" fill="#ffcf69" />
      <circle cx="16" cy="16" r="2" fill="#efffff" />
    </>
  ),
  controller: (
    <>
      <path
        d="M10 8h12q5 0 7 9l1 5q0 6-5 3l-6-4h-6l-6 4q-5 3-5-3l1-5q2-9 7-9z"
        fill="currentColor"
      />
      <path d="M8 12v8m-4-4h8" stroke="#ffe17a" strokeWidth="2" />
      <circle cx="23" cy="13" r="1.6" fill="#ffe17a" />
      <circle cx="26" cy="17" r="1.6" fill="#ffe17a" />
    </>
  ),
  shield: (
    <>
      <path
        d="m16 2 12 5v10q-1 9-12 14C5 26 4 22 4 17V7z"
        fill="#377fb4"
        stroke="#abedff"
        strokeWidth="2"
      />
      <path d="m16 6 8 3v9q-2 6-8 9z" fill="#20588e" />
      <path d="m9 16 5 5 9-10" fill="none" stroke="#93f5dc" strokeWidth="2.5" />
    </>
  ),
  gear: (
    <>
      <path
        d="m12 2 8 0 1 5 4 2 5-1 2 7-4 3-1 4 1 5-7 3-3-4-4-1-5 1-3-7 4-3 1-4-1-5z"
        fill="#2baedc"
        stroke="#8ee9ff"
      />
      <circle
        cx="17"
        cy="16"
        r="6"
        fill="#163c61"
        stroke="#6edaff"
        strokeWidth="2"
      />
    </>
  ),
  map: (
    <>
      <path
        d="m3 6 9-3 9 4 9-3v23l-9 3-9-4-9 3z"
        fill="#f4d590"
        stroke="#ffebb4"
      />
      <path d="M12 4v22m9-18v20" stroke="#d39c57" />
      <path
        d="m7 18 3-5 7 8 8-9"
        fill="none"
        stroke="#8aa868"
        strokeWidth="2"
        strokeDasharray="2 2"
      />
      <circle cx="23" cy="11" r="3" fill="#f37769" />
      <path d="m5 7 3-1" stroke="#fff2cf" strokeWidth="2" />
    </>
  ),
  arrow: (
    <path
      d="M4 16h24m-9-9 9 9-9 9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    />
  ),
  crown: (
    <>
      <path
        d="M3 8 10 15 16 3 22 15 29 8 26 27H6z"
        fill="#ffc83e"
        stroke="#fff2a6"
        strokeWidth="1.4"
      />
      <path d="M7 22h18v5H7z" fill="#ed9c29" />
      <path d="m16 11 3 6-3 4-3-4z" fill="#6fd8ff" stroke="#e2fbff" />
      <circle cx="3" cy="7" r="2" fill="#fff0a3" />
      <circle cx="16" cy="3" r="2" fill="#fff0a3" />
      <circle cx="29" cy="7" r="2" fill="#fff0a3" />
    </>
  ),
  search: (
    <>
      <circle
        cx="13"
        cy="13"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="m19 19 9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
};
export default function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`game-icon icon-${name} ${className}`}
      style={style}
    >
      {sourced[name] ? (
        <Image
          src={`/images/${sourced[name]}.png`}
          width={64}
          height={64}
          alt=""
          unoptimized
        />
      ) : (
        <svg viewBox="0 0 34 34" width="1em" height="1em" focusable="false">
          {symbols[name] || symbols.star}
        </svg>
      )}
    </span>
  );
}
