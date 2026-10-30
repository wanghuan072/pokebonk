# Content and SEO review — October 23, 2026

The approved content and SEO revision is implemented for 21 published content routes: 18 ordinary pages and three guide articles. Other detail records remain disabled. The 741 existing disabled detail addresses return generated 404 responses. The sitemap contains only the 21 enabled routes.

## Content and identity

Hero copy and search metadata are maintained separately. All published titles have 40–60 characters, all descriptions 140–160, with the PokeBonk keyword and self-referencing canonicals on `https://pokebonkdb.org`. Ordinary metadata is centralized in `src/seo/tdk.js`; each guide has its own JSON `seo` object.

Home contains a game/site introduction and eight rewritten FAQs. Three detailed illustrated guides remain, with version-specific examples and tables. The recommendation model is described as an editorial Classic-opening comparison, not a measured win-rate ranking. Official season standings retain their capture date. No fictional author experience or official affiliation has been introduced.

Gameplay values cover v0.8.13. Release history extends through v0.8.25, and official leaderboard standings are dated October 23, 2026. The newer patch-history version does not imply that all gameplay values have been checked against that version.

Five text-only Legal pages use the existing public URLs plus `/copyright`; `/disclaimer` redirects permanently to `/copyright`. The contact address is support@pokebonkdb.org. Legal navigation uses normal internal links. The footer has separate copyright and independent fan-site lines.

Original impact-emblem branding replaces the previous header/footer icon and framework tab icon. Assets include the SVG and PNG emblem, 1200 × 630 sharing image, ICO and Apple icon. The cover was generated with built-in imagegen; its final prompt and saved asset paths are recorded in `docs/seo-maintenance.md`. Game portraits, icons and interface screenshots retain their corresponding game identities.

## Verification

- Production build, TypeScript and ESLint pass.
- All 17 browser test cases have passed, including the final targeted rerun for responsive layout and branding after the narrow-header correction.
- All 21 published pages were checked at 320, 390, 768, 769, 1024, 1025 and 1440px without document overflow. Tablet and mobile use the hamburger menu; desktop navigation remains visible above 1024px.
- Layout media queries use only 1024px and 768px. At 320px the header controls stay on one line, Hero actions stack, and quick links form two columns.
- Browser tests cover full-document navigation/history, search, filters, fusion recipes, achievement persistence, Lab arithmetic, tier dragging/keyboard placement/local persistence, official top-100 pagination and release expansion.
- Metadata, Canonical, Open Graph, Twitter Card, structured data, sitemap dates, redirect configuration, Legal links and the absence of a contact form were checked.
- The generated-page audit verifies 1,615 internal links and 1,962 image occurrences across the 21 pages.
- The existing primary-data audit passes 6,566 comparisons across content collections.
- Eight SEO/history/asset regression tests pass, including unchanged rebuilds, isolated article updates, isolated metadata changes, CSS/year exclusions, same-URL image replacements, preview noindex and icon dimensions.
- Repeating the date synchronization after the final changes reports zero modified pages and preserves all 21 dates.

Browser verification uses production files intercepted through Playwright, without an HTTP or project server. Runtime responses from a deployed host and live game accounts are outside this check. No server was started or restarted, no deployment or remote repository operation was performed, and no external party was contacted.

For later content edits, run `npm run seo:sync` and save the resulting date manifest with the changes. A production build verifies that manifest and stops if it is stale; it never replaces every lastmod with the deployment date.
