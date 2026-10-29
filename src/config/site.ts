import gameVersion from "@/data/site/game-version.json";
export const site = {
  name: "PokéBonk",
  url: "https://pokebonkdb.org",
  configured:
    process.env.VERCEL_ENV !== "preview" &&
    (process.env.SITE_INDEXABLE === "true" ||
      (process.env.VERCEL_ENV === "production" &&
        process.env.SITE_INDEXABLE !== "false")),
  contactEmail: "support@pokebonkdb.org",
  gameUrl: "https://pokebonk.com/?lang=en",
  gameVersion: gameVersion.version,
  currentGameVersion: gameVersion.version,
  releaseHistoryChecked: gameVersion.checkedAt,
  contentUpdated: gameVersion.checkedAt,
  verified: gameVersion.checkedAt,
};
