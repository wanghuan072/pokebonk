# Original game media and content review — October 26, 2026

## Original assets

- All 151 Kanto species now play the original PokeBonk idle animation in the Pokédex, home roster, tier board, recommendations, fusion partners and guide rosters. Passive cards use the animation of their actual partner.
- The game supplies PNG atlases, not individual GIF files. `scripts/source-game-sprites.cjs` downloads the matching numbered atlas and portrait, losslessly extracts the idle row, and preserves the original per-frame durations at 60 ticks per second. It verifies the extracted pixels against the atlas. The original client’s menu sprite renderer provides the frame order and timing rule.
- The atlas metadata is `https://pokebonk.com/data/sprites.json?v=wXYqoD57`. Atlas and portrait URL versions are recorded individually in `src/data/media/game-sprite-sources.json`; 302 records cover 151 idle strips and 151 portraits.
- The homepage and background use the original game’s Tower event artwork, cached without alterations. Page overlays are CSS. The provenance is in `src/data/media/game-scenery-sources.json`.
- Navigation item icons now use matching original game icons. The previous external TM fallback was removed. Active media manifests no longer list the previous external Pokémon HOME/item illustrations. Those images are not used by the rendered pages.
- The site emblem and sharing image remain site branding. Guide menu captures remain captures of the original game interface, not illustrations of invented gameplay. The original game’s promotional image was separately checked byte for byte against its public URL.

## Content accuracy

- The reviewed active gameplay snapshot remains v0.8.55 / build `mvob1c8t`. This review did not invent numerical changes: 10,280 source comparisons passed for species, partner eligibility, kits, passives, evolution, baselines, effects, recipes, prices, achievements and image identity.
- All 95,790 ordered move pairs match the original fusion resolver’s priorities and eligibility rules. The existing 420 Archive capacity fixtures remain valid.
- Starter explanations now distinguish choosing the first partner from unlocking the two unchosen starters after two runs. This is stated in the guide caption and inline Pokédex explanations; the original challenge data remains intact.
- Species HP is explicitly labeled. Calculated run baselines are labeled as values before passives and upgrades, so Squirtle’s baseline armor is not mistaken for its armor after Torrent Shell. Opening move names use the actual English move names.
- Recommendation scores remain an editorial comparison of Classic opening kits, not claimed win rates. The leaderboard remains an explicitly dated historical snapshot; no authenticated live standings were invented.

## Verification

- 475 data and scenery image files passed remote source byte/pixel verification, including every extracted animation strip and original portrait. Zero failures. The separate original promotional-image byte check also passed.
- Production build, TypeScript and ESLint passed. The published-page audit checked 21 routes, 1,398 internal links and 2,366 rendered images.
- All 20 offline browser tests passed, including animation frame advancement, reduced-motion behavior, species-to-image matching, full-document navigation, filters, drag ranking, saved state and all seven viewport widths from 320 to 1440 pixels. The 320px guide roster overflow introduced by the new animation wrapper was corrected.
- All eight SEO/content-date tests passed. Animation metadata and asset bytes are included in the content fingerprints of the relevant pages; CSS alone does not refresh sitemap dates.

No project service was started, and nothing was deployed.
