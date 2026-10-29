# Data maintenance

## Current verified version

Gameplay data was rechecked on October 28, 2026 against [the original game](https://pokebonk.com/), version `0.8.62`, build `mvr5gbc0`. The v0.8.13 and v0.8.25 material remains historical evidence. The current manifest is `docs/research/recheck-2026-10-28/sources.json`; the reviewed symbol map, semantic export aliases and source hashes are selected by `scripts/data/active-snapshot.json`. Public client values establish client facts, not playtested DPS, win rates or backend guarantees. See `docs/audits/v0862-data-review.json` for the field comparison and reviewed source scope.

Generated collections in `src/data/pokedex`, `src/data/wiki` and `src/data/updates` must be changed through their source/extraction process. Guide prose is authored in `scripts/guide-*.cjs` and emitted by `scripts/write-guides.cjs`. Tier recommendations are calculated by `scripts/build-tier-analysis.cjs`, called by the main content generator. The leaderboard capture parser is `scripts/build-leaderboard-snapshots.cjs`. See [the current list-page design](list-pages-redesign.md) for flags, routes, methodology and capture scope.

## Recreate research material

`docs/research` is ignored and is never served as game code. The active raw files are stored in the directory named by the snapshot profile. To recreate them, download only the exact URLs in its manifest, checking every SHA-256 before extraction. `scripts/research-source.cjs` and `scripts/extract-research.cjs` remain historical v0.8.25 utilities and must not replace the current reviewed input. Run `node scripts/extract-reviewed-snapshot.cjs`, then `node scripts/extract-runtime-reference.cjs` for current configuration, full Lab prices, move/evolution calculators and Ultimate/passive metadata. The client helper checks the reviewed game hash and uses TypeScript binding information to preserve local bindings. It never boots the game or invokes combat handlers.

Run `node scripts/extract-version-comparison.cjs` to check cap getters, all 79 signature pairs in both orders, 316 ingredient-level fixtures and cap-item removal; its working report is now `docs/research/current-rule-comparison.json`. Then run `node scripts/build-content.cjs` and `node scripts/write-guides.cjs`. Content generation also extracts 27 generic fusion records and 59 item unlock prices, verifies 420 Archive fixtures, and writes the six Bag shop offers. `node scripts/audit-fusion-resolver.cjs` checks all 95,790 ordered move pairs against the official resolver. Do not overwrite the pinned module files merely to discover a newer version: capture a separate directory, review the mapping and hash together, and only then change the active profile.

Run `node scripts/build-content.cjs`, then `node scripts/write-guides.cjs` to emit data and articles. The main generator also recalculates recommendations. The migration comparison script `scripts/compare-v0825.cjs` needs the pre-migration records preserved by `scripts/fetch-v0825.cjs`; do not overwrite historical baselines with current data. None of these scripts runs during production builds. Finally run `npm run seo:sync` to update only affected content dates.

Bundler identifiers are snapshot-specific. For a new game build, review source URLs, hashes, identifiers, behavior and version stamps together. Downloading a new file is not evidence that every game behavior has been reverified. Update visible dates only after review.

## Rules

- Pokédex membership and selectable League configuration are separate.
- Traditional base stats, PP and move power are not displayed as actual run stats.
- Evolution families do not prove live evolution thresholds.
- Merge final passive overrides in the original client order.
- Lab prices include the source price factor and rounding. The calculator adds each intervening next-level cost.
- The finder covers all 106 original outcomes: 79 signatures, eight reactions, 18 same-type results and MissingNo. Priority and eligible ingredients must match the original resolver.
- Empty release entries are omitted; current client version and latest detailed notes are separate.
- No player scores, achievement difficulty ratings, unknown unlock gates or tested endgame rankings are invented.
- All 151 Pokémon use original PokeBonk idle frames and portraits. Run `node scripts/source-game-sprites.cjs` only during a reviewed source update; it extracts lossless idle rows and preserves the 60-tick frame durations. Provenance: `src/data/media/game-sprite-sources.json`. Never substitute another game’s artwork.
- Wiki illustration associations are explicit in each JSON dataset. Cache matching assets with `node scripts/source-wiki-media.cjs` before regenerating data; this writes `src/data/media/wiki-sources.json`. See [Wiki image audit](wiki-media-audit.md) for sources, icon semantics and the TM exception.

After changes run lint, typecheck, build, audit and offline browser tests. Inspect changed records and prices against the original game before publishing.

`npm run audit:content` independently compares every data collection with source records and the original calculators. `npm run audit:media` re-downloads the original asset URLs to verify image identity; it is a manual network check, never a build dependency. The October 23 full review is recorded in [the full-site audit](audits/full-site-audit.md).

The v0.8.25 audit also validates every source-file identity, complete move calculator result, signature metadata, item name, level cap/removal behavior, guide starter table and recommendation kit. Signature `hits` values are internal weighting metadata, not an observed hit count or measured DPS. The v0.8.17 projectile-fusion and item-removal fixes are relevant even though the published base values and Lab prices remain unchanged.

The reviewed current pipeline also runs `scripts/sync-current-features.cjs` to preserve official seasonal and Daily Mutation configuration, update co-op/Looks eligibility and retain original mutation icons. `scripts/research-current-features.cjs`, `scripts/extract-current-features.cjs` and `scripts/build-current-feature-data.cjs` are historical October 27 utilities; do not use them to overwrite the active snapshot. `scripts/audit-leaderboard.cjs` verifies the separately captured official standings and appearance assets.

The public Wiki was rebuilt from the official Pokédex UI: `src/data/wiki/attacks.json` has 493 entries (387 ordinary attacks plus 106 fusions), `catalog-items.json` has 126 items and `vitamins.json` has 26 vitamins. Starting-kit metadata in `wiki/moves.json` remains an internal input for partner kits and recommendations, not the public attack list. The UI captures in `docs/research/official-ui-2026-10-28/` include zero-Lab comparison stats with each selected partner basis, level charts, learners, item limits and vitamin rarity tables. `node scripts/build-official-catalogs.cjs` checks the reviewed UI version before generating public records and original Look artwork; `node scripts/audit-official-catalogs.cjs` compares them with every captured row. No game progress or claimed rewards is copied into the fan-site tools.

Public Wiki routes are `/wiki/attacks`, `/wiki/vitamins`, `/wiki/items`, `/wiki/lab`, `/wiki/achievements` and `/wiki/leaderboard`. `/wiki/moves`, `/wiki/fusions` and `/wiki/mechanics` are removed without redirects. Fusion recipes now live inside Attacks.

## Copy, brand and page dates (October 28 review)

Visible introductions are edited in `src/data/content/pages.json`; search metadata is edited independently in `src/seo/tdk.js`. Guide metadata remains in each guide's `seo` object. The old `write-site-copy.cjs` entrypoint now validates canonical files without rewriting them. The old three-guide and October 27 feature generators refuse to overwrite the reviewed snapshot. Current data extraction and original UI audits remain available.

`npm run seo:sync` compares route-specific data and displayed semantic copy, then persists dates in the page-history manifest. Shared catalogue branches are evaluated per route; class names, wrappers and event handlers are excluded. A guide body change affects its article; changing a card summary also affects Home, Guides and related guide cards that display it. `npm run build` checks the manifest without updating dates. The twelve date/SEO tests include these cases.

The original impact emblem and wordmark are vector assets. `node scripts/create-brand.cjs` exports the PNG sizes, multi-size ICO, Apple icon and 1200×630 sharing artwork. It uses the current game castle scenery as the backdrop and the independent PokeBonk.me brand as the foreground. Do not replace gameplay illustrations with the brand artwork.
