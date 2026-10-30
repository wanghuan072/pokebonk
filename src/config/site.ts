import gameVersion from "@/data/site/game-version.json";
import { isSiteIndexable } from "./indexability.cjs";
export const site = {
  name: "PokéBonk",
  url: "https://pokebonkdb.org",
  configured: isSiteIndexable(process.env),
  contactEmail: "support@pokebonkdb.org",
  gameUrl: "https://pokebonk.com/?lang=en",
  gameVersion: gameVersion.version,
  currentGameVersion: gameVersion.version,
  releaseHistoryChecked: gameVersion.checkedAt,
  contentUpdated: gameVersion.checkedAt,
  verified: gameVersion.checkedAt,
};
