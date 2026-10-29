# PokeBonk data review — October 26, 2026

The public English game was captured at 06:15 UTC / 14:15 Asia/Shanghai on October 26. Its reviewed version is **0.8.55**, build **mvob1c8t**. The latest release entry itself is dated October 25. The exact public module/data URLs, SHA-256 hashes and byte sizes are recorded in [the source manifest](recheck-2026-10-26-sources.json). The active reviewed mapping is `scripts/data/active-snapshot.json`; v0.8.25 audit files retain their historical meaning.

## What changed

| Collection | Published coverage and findings |
| --- | --- |
| Pokémon | 151 species, 79 starting League partners. Traditional stats, run baselines, kits, unlocks, evolution thresholds and Ultimate metadata were regenerated and compared with the original calculators. Numeric opening inputs remain unchanged. |
| Moves and passives | 310 kit moves and 79 associated passives. Twenty source passive descriptions replace ambiguous “Like” with “As” for evolved-form effects; current relevant descriptions were regenerated. These are wording corrections, not numerical buffs. The runtime diff is saved separately. |
| Fusions | The existing 79 signature pairs remain. Added all 27 previously omitted generic outcomes: 18 types, eight reactions and MissingNo. The finder now resolves all 106 records, following signature → reaction → same type → glitch priority. Weather, buff and existing fusion patterns remain ineligible; ingredients need level 8. |
| Items and vitamins | 126 items and 26 vitamins. Added the original Stardust unlock prices for 59 items. Unlocking, offer eligibility and archiving are distinguished; an unlock does not guarantee a drop. Existing cap-item removal checks remain valid. |
| Lab | 24 upgrades, now 111 next-level prices. Archive increases from max level 4 to 6, with added prices 3,400 and 4,675. Its six levels cost 13,855 total, or 8,075 for levels 4→6. After at least one Archive level, every two eligible purchased item unlocks add one slot: 30 paid slots plus up to 29 unlock slots, maximum 59. Corrected the fourth-move upgrade icon to the current TM Case asset. |
| Achievements | Increased from 70 to 228 with the 158 original Mastery Looks conditions, rewards and partner identifiers. The checklist explains the solo-only requirement. Existing saved IDs remain usable. |
| Progression | Stored six current Bag shop offers with original effects, prices and daily limits in `src/data/wiki/meta-progression.json`. Guides distinguish Stardust Shop purchases, permanent Lab progression and Bonkoin Treasures. No spin odds or guarantees are invented. |
| Updates | Expanded from 49 to 79 nonempty releases through v0.8.55. New typed note tuples are normalized into readable English strings; original categories are retained in `noteTypes`. Superseded co-op mechanics remain dated history, not current instructions. |
| Guides | Still three articles. Added current Archive examples, item eligibility, Build Plan limits and markers, per-move upgrade summaries, fusion component scaling, Mastery Looks and co-op rollback advice. Existing screenshots retain their original capture dates; they are not presented as new v0.8.55 captures. |
| Recommendations | Recalculated all 79 kits with the existing explicit solo Classic opening model. Scores do not change because the checked numerical inputs do not change. Community rankings use materially different numerical or type-coverage assumptions; they are not evidence of measured win rates or consensus. |

## Evidence and checks

- `npm run audit:content`: **10,129 source comparisons** passed, including original Lab cost functions, full move definitions, starter facts, current version identities, item effects and rewards.
- `node scripts/audit-fusion-resolver.cjs`: **95,790 ordered move pairs** agree with the original resolver and eligibility rules. The original resolver text and totals are in [the fusion report](v0855-fusion-resolver-verification.json).
- The enrichment extractor verifies **420 Archive fixtures**, covering levels 0–6 and 0–59 eligible item unlocks. See [the enrichment report](v0855-enrichment-verification.json).
- The [runtime comparison](v0855-runtime-diff.json) distinguishes the 20 translation corrections from numerical changes. It does not assert that every combat handler is unchanged: fusion repetition and other gameplay handlers have changed outside these baseline metadata checks.
- **323 used image files** passed identity checks against their recorded original URLs/encoding. A transient Grass icon download failure passed an isolated retry; the final image audit has zero failures.
- Production build, TypeScript, ESLint, route/link audit, eight SEO/date regression tests and all **19 browser tests** passed. The browser suite includes complete page hydration, images, document navigation/history, original tools, all seven viewport widths and the new generic-fusion / Archive / Looks flow.

The new data was not published or deployed. No project service was started.

## Leaderboard boundary

The original client exposes an authenticated `GET https://api.pokebonk.com/leaderboard?mode=kills&season=2&limit=100` request. A read-only request without a session returned **401**, so no new account or session was created and no fresh standings were claimed. The existing three complete top-100 tables remain explicitly dated **October 23, 2026 / v0.8.25**. Their content date was preserved. Current records must be checked inside the game.

## Maintenance

Run extraction only after reviewing an exact source snapshot and its identifiers. For this snapshot: `extract-reviewed-snapshot.cjs` → `extract-runtime-reference.cjs` → `extract-version-comparison.cjs` → `build-content.cjs` → `write-guides.cjs`, followed by the source, resolver, media, SEO and browser checks. The main content generator invokes `enrich-current-data.cjs`, so the additional unlock and generic fusion fields survive regeneration. Ordinary site builds do not fetch or execute game research code. Only changed page payloads refresh sitemap dates; six unrelated pages retain their earlier dates.
