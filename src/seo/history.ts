import authoredHistory from "./page-history.json";
import builtHistory from "./build-history.json";
const historyData = Object.keys(builtHistory).length ? builtHistory : authoredHistory;
type HistoryEntry = { fingerprint: string; modified: string };
export const pageHistory = historyData as Record<string, HistoryEntry>;
export function getPageModified(path: string) {
  return pageHistory[path]?.modified || "2026-10-23";
}
