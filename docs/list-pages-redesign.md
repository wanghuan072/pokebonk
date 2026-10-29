# List pages, tier workshop and official records

Updated October 23, 2026.

## Content and routes

All gameplay collections live in `src/data` as JSON. Pokédex, moves, items, fusions, achievements, Lab, mechanics, releases, leaderboard records and ranking records have `isDetails: false`. Only the three guide records currently have `isDetails: true`.

List information is available inline. Pokédex cards expose base stats, run baselines, passive, kit, unlock and next evolution. Move cards expose source-generated level-one values and partner portraits. Item cards expose effects and reference information. Fusion recipes remain searchable; achievements retain their personal checklist; Lab keeps the exact next-level cost calculator.

`src/lib/content-path.ts` resolves enabled detail links and disabled list anchors. Search and sitemap follow the flags. Reserved detail routes reject disabled records with Next.js `notFound()` and noindex; they do not publish the former detail content. Next.js Cache Components requires a non-empty static parameter set, so those route boundaries enumerate known slugs for validation, including records that resolve to 404. Seeing those paths in build output does not mean their details are enabled.

The current content sitemap has 21 URLs: 18 list/general pages and 3 guides. A future detail can be restored by verifying its content and changing its flag to true. Check its metadata, links and sitemap in the same change.

## Tier workshop

All 151 species are draggable. The desktop pool sits alongside the ranking rows; touch and keyboard users can select a species and place it using the row button. Dropping onto a species inserts before it. Reset and local JSON export are available. A versioned localStorage value is validated for every species exactly once; invalid values fall back to an unranked board. Storage failures retain an in-memory session board.

Our recommendations use a separate comparison layout with goal sorting, cards, meters and expandable evidence for all 79 selectable League kits. Evolved forms belong to these starting kits rather than representing extra starters. The original game provides stats and effects; the score weights and role assignments are editorial judgments. The model prioritizes Classic opening comfort (50%), offensive potential (30%) and utility (20%). It does not claim tested DPS, win rates or endgame rank.

Research compared the [community numerical model](https://poke-bonk.wiki/tier-list/) and [kit/coverage comparison](https://pokebonk.run/builds/tier-list/) against the [original client](https://pokebonk.com/). Recommendations for PokéSurvivor were excluded because it is a different game. Non-evolving PokeBonk partners still receive growth; the model does not apply a blanket no-evolution penalty.

The reproducible calculation and curated role lists are in `scripts/build-tier-analysis.cjs`; the emitted JSON is `src/data/tier-list/rankings.json`. All weights, limits and source links appear on the page.

## Three guides

1. Beginner: choosing a starter, movement, upgrades and reviewing a failed run.
2. Builds: class and pattern tradeoffs, Bulbasaur/Squirtle/Machop plans and fusion investment.
3. Lab: price curves, slots versus stats, offer-control tools and concrete Stardust budgets.

Each article contains more than 800 words, genuine game screenshots or relevant HOME portraits, tables, callouts and related references. Source text is authored in `scripts/guide-*.cjs`; `scripts/write-guides.cjs` emits the three JSON records and artwork mapping. Gameplay values were subsequently reverified against v0.8.25, build mvjzbutg; see the v0.8.25 upgrade audit for the field comparison and behavior corrections.

## Official leaderboard capture

`src/data/leaderboard/snapshot.json` contains 100 official Global records for each of KOs, Survival and Time attack, captured on October 23 from the original v0.8.25 game's visible Ranking menu. Names include clan tags exactly as displayed. Regional contributions and official ordering are preserved, without recalculating ranks from rounded display values.

- KOs: sum of best regional KO runs, on any difficulty.
- Survival: sum of best regional survival times; KOs break ties.
- Time attack: regions won first, then the sum of fastest regional wins.
- KO and Survival prizes: top 100, 1500 / 900 / 500 / 300 / 180 / 100 Stardust by rank band.
- Time attack prizes: top 50, 1000 / 600 / 300 / 180 / 100 Stardust.

These are dated snapshots, not a live feed. The unauthenticated API returns a session error, so no private credential, account creation or undocumented API bypass was used. The source interface was read through the normal guest UI. Raw accessibility captures and an official-screen screenshot are in ignored `docs/research`; `scripts/build-leaderboard-snapshots.cjs` validates 100 unique ranks per board and emits the records. Keep the capture date when refreshing them.

## Updates and verification

All 49 non-empty published release records through v0.8.25 appear in the redesigned searchable archive, with full inline notes. Topic filters are explicitly editorial; release text and dates are source records.

Verification uses a production build and offline browser request interception. It checks all 21 public content pages, images, actual full-document navigation, controls, drag/drop, persistence, board mode changes, mobile overflow and screenshots. It starts no project server and cannot certify a deployed host's HTTP/CDN behavior.
