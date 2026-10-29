import historyData from "./page-history.json";
type HistoryEntry = { fingerprint: string; modified: string };
export const pageHistory = historyData as Record<string, HistoryEntry>;
export function getPageModified(path: string) {
  return pageHistory[path]?.modified || "2026-10-23";
}
