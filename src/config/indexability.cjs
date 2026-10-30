/** Shared by page metadata, robots.txt and the build-time SEO manifest. */
function isSiteIndexable(env = process.env) {
  return (
    env.VERCEL_ENV !== "preview" &&
    (env.SITE_INDEXABLE === "true" ||
      (env.VERCEL_ENV === "production" && env.SITE_INDEXABLE !== "false"))
  );
}

module.exports = { isSiteIndexable };
