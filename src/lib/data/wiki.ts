import movesData from "@/data/wiki/moves.json";
import itemsData from "@/data/wiki/items.json";
import fusionsData from "@/data/wiki/fusions.json";
import genericFusionsData from "@/data/wiki/generic-fusions.json";
import achievementsData from "@/data/wiki/achievements.json";
import labData from "@/data/wiki/lab.json";
export const moves = movesData;
export const items = itemsData;
export const fusions = fusionsData;
export const genericFusions = genericFusionsData;
type FusionRecipe = Omit<(typeof fusionsData)[number], "moves" | "pair" | "member" | "range"> & {
  moves: string[]; pair: string[][] | null; member: number | null; range: number | null;
};
export const allFusions: FusionRecipe[] = [...fusionsData, ...genericFusionsData];
export const achievements = achievementsData;
export const lab = labData;

export {default as attacks} from "@/data/wiki/attacks.json";
export {default as catalogItems} from "@/data/wiki/catalog-items.json";
export {default as vitamins} from "@/data/wiki/vitamins.json";
