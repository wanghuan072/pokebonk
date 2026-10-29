"use client";
const KEY = "pokebonk-wiki:achievements:v1";
const EVENT = "pokebonk-wiki:progress";
let fallback = "[]";
export function subscribeProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}
export function getProgressSnapshot() {
  try {
    return window.localStorage.getItem(KEY) || fallback;
  } catch {
    return fallback;
  }
}
export const getServerProgress = () => "[]";
export function parseProgress(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}
export function saveProgress(ids: string[]) {
  fallback = JSON.stringify(ids);
  let saved = true;
  try {
    window.localStorage.setItem(KEY, fallback);
  } catch {
    saved = false;
  }
  window.dispatchEvent(new Event(EVENT));
  return saved;
}
