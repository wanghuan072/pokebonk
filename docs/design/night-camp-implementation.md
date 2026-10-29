# Night Camp design implementation

The site now follows `homepage-redesign-v4.png`: a narrow desktop navigation rail, midnight teal surfaces, warm yellow actions, a moonlit campsite hero, a three-partner roster, paired fusion and Lab panels, and an asymmetric three-guide layout. At 1024px and below the rail becomes an expandable header menu. The only layout breakpoints remain 1024px and 768px.

The homepage uses the existing v0.8.25 records for counts, the Flower Beam recipe, Lab images, guides and patch notes. Starter links open the corresponding inline Pokédex anchors; no additional detail routes are enabled. The tier preview is an empty personal board, not an invented recommendation.

## Artwork

`public/images/home/night-camp.webp` is decorative artwork produced with the built-in imagegen tool using the approved v4 concept as a visual reference. It is not a game screenshot. The original generation is retained in the Codex generated-images folder. WebP encoding changes only the delivery format.

Final generation prompt:

> Use case: illustration-story. Create a wide 3:2 pixel-art decorative background for the PokeBonk fan website hero. Reference image is the approved website concept: extract its visual mood ONLY, create just its moonlit forest campsite illustration, no UI, no text, no typography, no logos, no Pokemon or other characters. Deep midnight teal and navy pine forest beside a still pond, large leafy tree overhanging upper left, small warm amber lantern hanging from tree near center, glowing canvas tent on the right bank, moon and sparse stars above, beautiful reflections in the pond below. Handcrafted crisp pixel art, rich layered scenery, readable silhouetted foreground, atmospheric but not blurry, restrained cyan highlights and warm gold light. Leave center bank open for separate actual game sprites to be placed later. Leftmost third fades naturally into extremely dark teal foliage and shadow so white website text can overlay; visual focus center-right. Full bleed illustration only. Match the reference campsite style and composition closely, without copying the page interface.

The three pixel Pokémon images are downloaded from the [PokéAPI sprites repository](https://github.com/PokeAPI/sprites), with exact URLs recorded in `src/data/media/sources.json`. They are separate from the generated landscape. Existing gameplay screenshots and data art remain in use.

## Verification

The existing offline Playwright setup serves production build files through request interception. It does not start a development or production server. Validation covers published pages, document navigation and history, search, filtering, local saved tools, image loading, metadata and responsive layouts.

Passed production build (including TypeScript), ESLint, eight SEO history tests, 18 browser tests, and the build audit of 21 published routes / 1,393 internal links / 2,015 rendered images. After the final CSS adjustments, the all-page responsive sweep and homepage screenshot test passed again. The responsive sweep covers 320, 390, 768, 769, 1024, 1025 and 1440px.

Review captures: `homepage-v4-implemented-desktop.png` and `homepage-v4-implemented-mobile.png`. Only the homepage content date changed; the other 20 dates were preserved.
