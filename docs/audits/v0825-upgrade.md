# Gameplay verification and migration to v0.8.25

Checked October 23, 2026 against the public English game at https://pokebonk.com/?lang=en, version **0.8.25**, build **mvjzbutg**. This supersedes the earlier v0.8.13 gameplay coverage. No project server was started, no deployment was made, and no game account or outside party was contacted.

## Official material and verification method

The public entry module, game module, English translations, configuration/news module and four public data files were downloaded again. Their exact URLs, byte lengths and SHA-256 identities are recorded in [the source manifest](v0825-official-sources.json). The configuration’s version and all seven gameplay data/module identities are checked by the content audit.

The v0.8.13 client and pre-migration site records were preserved locally before changing inputs. The version-specific symbol mapping is pinned in `scripts/data/official-v0825-symbols.json`. Extraction uses TypeScript symbol bindings to rebind top-level references while preserving local variables. It evaluates original data calculators with controlled inputs, never the game entry point or combat handlers.

Checked coverage:

| Collection | Checked records | What was checked |
|---|---:|---|
| Pokémon | 151 species / 79 League partners | Names, types, species stats, starting eligibility, kits and levels, passives, unlocks, in-run evolution and Ultimate metadata; run baselines against the original calculator |
| Moves and passives | 310 moves / 79 partner passives | Full level-one move calculator results, names, types, class, patterns, effects, status properties, owners and illustration associations |
| Signature fusions | 79 | Ingredients, partner, name, effect, primary/secondary type, class, base cooldown, power, internal hit weighting, range and status; original selection in both ingredient orders |
| Items and vitamins | 126 items / 26 vitamins | English names, game effects, rarity, stack caps, vitamin increments and corresponding icons |
| Lab | 24 upgrades / 109 level prices | Name, effect, cap and every next-level cost evaluated from the original price functions |
| Achievements | 70 | Goals, counters, rewards, categories and current version stamps |
| Recommendations | 79 kits | Regenerated from the verified roster, baseline stats, passives and move kits, retaining the existing editorial opening model |
| Guides | 3 | Current starter facts, passive names, generated move/recipe/Lab tables and advice affected by cap items and fusion fixes |

The fusion checks execute 79 forward and 79 reverse ingredient matches, plus **316 level cases** covering 7/8, 8/7, 8/8 and 9/8. The original eligibility function excludes weather, buff and existing fusion patterns. The original cap getters and item-removal method are exercised with controlled inventories, including the actual move-level trimming function.

## Findings and changes

The published Pokémon baseline values, kit assignments, level-one move definitions, passive metadata, signature recipe metadata and Lab prices are unchanged between the archived v0.8.13 material and the inspected v0.8.25 material. This does **not** mean all attack handlers or gameplay behavior are unchanged.

TM Case’s old item description omitted the fusion ceiling. The current official description explicitly includes **normal moves to level 10 and fusions to ★6**. Both archived and current cap getters already return ★6 with TM Case, so this is a description correction rather than a new buff. The item list and all relevant guides now explain the complete rule.

Actual behavior differs when a cap item is removed. The original v0.8.13 removal method leaves over-cap levels intact. The v0.8.25 method trims ordinary moves back to 8 and fusions to ★5 when TM Case is removed; removing Max Ether trims vitamins back to 10 and removes the corresponding extra increments. The current method was executed to verify these results. Item cards and the Lab guide now warn players before selling either item. Official v0.8.17 notes identify the cap-removal correction.

Official v0.8.17 notes also report fusion fixes for ignored extra projectiles. The build guide now accounts for this when comparing older footage or damage reports and explains using the pause menu’s recent 15-second damage window. No simulated damage number is presented as a measured result.

The beginner/build guides used “Photosynthesis” and “Blaze” in places where the official English interface displays **Synthesis** and **Sea of Flames**. These names were corrected. Starter tables now derive names, HP and passive descriptions directly from the checked records.

All 79 fusion records now also retain the original class, cooldown, secondary type, power, internal hit weighting, range and status fields. The list displays class and base cooldown. These are newly exposed fields, not newly changed balance values. Internal fractional hit weights are not displayed as observed hit counts or measured DPS.

The recommendation generator was run again against v0.8.25. Its opening baseline and kit inputs are unchanged, so the existing scores and order remain unchanged. The page records the current version and review scope. Later fusion/item behavior does not justify inventing new opening scores or measured win rates.

All active gameplay version labels, About coverage, README, mechanics explanations and three article records now describe v0.8.25. Persistent sitemap fingerprints were synchronized for affected routes; a subsequent synchronization preserves all dates.

The full machine-readable difference report, including before/after cap and item-removal outcomes, is [v0825-data-diff.json](v0825-data-diff.json). Its empty extracted-definition difference list is scoped to the checked metadata/calculators and must not be interpreted as a claim that all game behavior stayed the same.

## Validation

- Production build, TypeScript and ESLint pass.
- **9,023** content/source comparisons pass, including current version and source identity checks, complete move results, fusion metadata, cap/removal fixtures, guide starter tables and recommendation inputs.
- **324** used illustration files match their recorded original image bytes or documented image encoding/pixels; no failures.
- All **18 browser tests** pass, including v0.8.25 item rules, fusion class/cooldown, corrected guide names, projectile advice and the current recommendation view.
- All eight SEO/date/asset regression tests pass. The 21 enabled pages still fit the seven tested widths from 320 through 1440px. Non-guide detail records remain disabled.
- The generated-page audit passes for 21 routes, 1,617 internal links and 1,964 image occurrences.

These checks establish the published data and the specified client rules. They do not claim measured win rates, endgame DPS, backend reward verification or a new live leaderboard capture.
