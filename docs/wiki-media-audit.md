# Wiki image audit — October 23, 2026

The missing-image issue was structural: moves were text-only table rows, fusion cards had no partner artwork, and achievements used a CSS medal instead of the original game's state icons. Existing item and Lab illustrations were also checked against the original asset paths.

| Collection | Entries with images | Illustration |
| --- | ---: | --- |
| Moves and passives | 389 | Original elemental icon for attacks; the owning partner's sourced portrait for passives; linked partner thumbnails |
| Signature fusions | 79 | Correct signature partner portrait, result type and input move type icons |
| Items and vitamins | 152 | Exact original-game item sprites |
| Achievements | 70 | Original game's Great Ball / Poké Ball state convention, plus the Stardust reward icon |
| Lab upgrades | 24 | Matching item icons; sourced TM illustration for the fourth move slot |

## Sources checked

- [Original PokeBonk game](https://pokebonk.com/): the public client uses `ui/types/{type}.png` for move symbols and `items/{key}.png` for item illustrations. Its achievements renderer uses Great Ball for unfinished challenges and Poké Ball for completed challenges. The wiki uses those visuals for its own local checklist, without representing an official account record.
- [Original Grass symbol](https://pokebonk.com/assets/ui/types/grass.png?v=B21hKCIf) and [original Charcoal sprite](https://pokebonk.com/assets/items/charcoal.png?v=Kgc19xzJ): examples of the exact downloaded asset paths.
- [PokeAPI sprites](https://github.com/PokeAPI/sprites): existing Pokémon HOME portraits identify the related species. The original `items/tm.png` path returns 404, so the fourth-slot upgrade uses a [sourced Normal TM sprite](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png), explicitly recorded as an illustration rather than an original game icon.
- [Moves comparison](https://pokebonk.games/moves/) and [fusion coverage comparison](https://pokebonk-wiki.wiki/move-fusions/): used to check presentation and coverage. Their text and screenshots are not copied. The current database's 79 signature recipes are explicitly distinguished from the game's additional generic/reaction/glitch outcomes.

No separate original attack artwork was established for every named move. Element symbols and named partner portraits are labeled for what they represent; unrelated art is not presented as a move screenshot.

## Reproduction and checks

`node scripts/source-wiki-media.cjs` caches the original asset files and writes `src/data/media/wiki-sources.json` with original URLs, retrieval dates and providers. The checked run downloaded 180 valid PNGs with no failed requests. `node scripts/build-content.cjs` writes explicit image associations into every Wiki dataset. Both are manual maintenance steps, not production build network dependencies.

`npm run audit` requires every entry in all five collections to have a real image file and verifies downloaded PNG signatures. Offline browser tests decode all images across the five collection pages, verify their counts, follow a passive detail link, check six mobile Wiki routes and save desktop/mobile screenshots. No project server is started.
