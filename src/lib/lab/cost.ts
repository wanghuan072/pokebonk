import type { LabUpgrade } from "@/types/wiki";
export function labCost(
  upgrade: LabUpgrade,
  start: number,
  target: number,
): number | null {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(target) ||
    start < 0 ||
    target <= start ||
    target > upgrade.max
  )
    return null;
  const costs = upgrade.costsByLevel.slice(start, target);
  return costs.length === target - start && costs.every(Number.isFinite)
    ? costs.reduce((sum, cost) => sum + cost, 0)
    : null;
}
