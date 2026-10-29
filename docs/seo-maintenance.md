# Content dates and indexing

The canonical origin is always `https://pokebonk.me`. Builds remain noindex unless `SITE_INDEXABLE=true`, or `VERCEL_ENV=production` with no explicit false override. `VERCEL_ENV=preview` always stays noindex, including when an indexing override is inherited. Copying `.env.example` keeps indexing off until production is ready.

Edit ordinary page metadata in `src/seo/tdk.js`; Hero copy is separate in `src/data/content/pages.json`. The three guide records carry their own `seo` objects. Titles use 40–60 characters and descriptions 140–160 as editorial limits, not Google ranking requirements.

After changing content, run `npm run seo:sync`. Save `src/seo/page-history.json` with the content. `npm run build` checks that the manifest matches content and stops on stale entries; it does not change dates. Repeated builds keep the same dates.

Fingerprints include each route's metadata, copy, rendered article or related data, page implementation and the bytes of referenced local images. Replacing an image at the same address is detected. Shared metadata and Hero datasets are resolved by route entry rather than hashing the entire file. Guide list cards use summaries and titles, so changing one article's body does not change an unaffected index. CSS files, build output, clock values and footer copyright years are excluded. Comments, imports and ordinary code formatting are normalized with TypeScript. Metadata character limits and the PokeBonk keyword are checked before a build.

When adding an ordinary page, add its metadata, Hero copy and dependencies to `scripts/lib/page-fingerprints.cjs`. A detail record is collected only when `isDetails` is true. Do not enable non-guide detail records without a separate editorial decision. If shared structured-data behavior changes materially, update the fingerprint schema version. Review route dependencies when changing data imports.

Run `npm run test:seo`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run audit` and `npm run test:browser` before publishing. Browser tests fulfill production files locally through Playwright request interception; they do not start a project server.

The sitemap is generated at `/sitemap.xml`, with persistent per-page lastmod dates. `/disclaimer` redirects permanently to `/copyright`; the old address is excluded from the sitemap.

## Brand assets

`scripts/create-brand.cjs` exports the original code-native impact emblem to SVG, PNG, favicon and Apple icon. The sharing cover is `public/images/og-image.png`, exported at 1200 × 630. It was made with the built-in imagegen tool, then resized for the standard sharing format. It is decorative site branding, not a gameplay screenshot.

Saved assets: `public/images/logo-mark.svg`, `public/images/logo-mark.png`, `public/images/og-image.png`, `public/favicon.ico`, `src/app/icon.png` and `src/app/apple-icon.png`. The header and footer pair the emblem with the existing PokeBonk wordmark text.

Final generation prompt: “Use case: ads-marketing. Create a polished social sharing cover for the independent PokeBonk fan guide website, wide landscape 1200 by 630 composition. Deep midnight navy background, luminous cyan and rich golden yellow accents, premium game guide visual style, sharp legible friendly bold lettering. Main text exactly ‘PokeBonk’, second line exactly ‘Plan Your Next Run’, small footer text exactly ‘pokebonk.me’. Original angular golden Bonk impact star emblem with a navy lightning-shaped cutout, cyan concentric energy arcs, tiny glowing golden and cyan gems and abstract adventure silhouettes along the right edge. Generous negative space around typography, tasteful depth, warm gold light versus cool cyan edge light. Crisp editorial design, no screenshots, no fake game interface, no additional text, no official Pokemon logo. All text within generous safe margins. Opaque background.”
