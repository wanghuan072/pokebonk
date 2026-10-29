export type Pokemon = {
  isDetails?: boolean;
  id: number;
  slug: string;
  name: string;
  types: string[];
  image: string;
  imageSource?: string;
  baseStats?: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  baseRunStats?: {
    hp: number;
    armor: number;
    regen: number;
    moveSpeed: number;
    physical: number;
    special: number;
  } | null;
  evolution?: { slug: string; name: string; level: number | null }[];
  ultimate?: {
    names: string[];
    descriptions?: string[];
    type?: string;
    durations?: number[];
  } | null;
  isPlayable: boolean;
  role: string;
  isStarter: boolean;
  description: string;
  unlockCondition: string | null;
  passive: string | null;
  moves: string[];
  evoFrom: number | null;
  family: number;
  evoLevels: number[] | null;
  gameVersion: string;
  lastVerified: string;
  source: string;
};
