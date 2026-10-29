export type SearchEntry = { name: string; href: string; category: string };
export type LabUpgrade = {
  id: string;
  name: string;
  desc: string;
  max: number;
  costsByLevel: number[];
  category: string;
};
