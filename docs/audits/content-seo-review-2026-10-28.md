# Content and SEO review — October 28, 2026

Reviewed 18 ordinary pages and three enabled guides. This review keeps the current layout, official gameplay assets and disabled-detail policy. It does not claim a search ranking, E-E-A-T certification or unrecorded gameplay testing.

## Page inventory

| Route | Visible H1 | Title characters | Description characters |
|---|---|---:|---:|
| `/` | PokeBonk - Plan Your Next Run | 47 | 148 |
| `/play` | PokeBonk - Start Playing & Learn the Controls | 54 | 151 |
| `/pokedex` | PokeBonk Pokédex - Compare Partners, Kits & Unlocks | 47 | 149 |
| `/wiki/items` | PokeBonk Wiki - Compare Item Effects & Unlocks | 53 | 152 |
| `/wiki/achievements` | PokeBonk Achievements - Find Your Next Unlock | 55 | 155 |
| `/wiki/lab` | PokeBonk Lab - Plan Your Next Stardust Purchase | 52 | 157 |
| `/tier-list` | PokeBonk Tier List - Compare Partners & Build Your Ranking | 48 | 151 |
| `/guides` | PokeBonk Guides - First Clears, Survival & Co-op | 51 | 153 |
| `/wiki/leaderboard` | PokeBonk Leaderboard - Compare Season Standings | 51 | 152 |
| `/updates` | PokeBonk Updates - Check What Changed | 54 | 147 |
| `/about` | About Us | 51 | 154 |
| `/privacy-policy` | Privacy Policy | 51 | 151 |
| `/terms` | Terms of Service | 48 | 151 |
| `/copyright` | Copyright | 48 | 150 |
| `/contact` | Contact Us | 48 | 160 |
| `/events` | PokeBonk Events - Check Challenges, Dates & Rewards | 52 | 155 |
| `/wiki/attacks` | PokeBonk Wiki - Compare Attacks & Find Fusions | 49 | 149 |
| `/wiki/vitamins` | PokeBonk Wiki - Choose Vitamins for Your Build | 54 | 152 |

## Changes

- Directory introductions now use the canonical page copy instead of hard-coded titles. Home has a single Home breadcrumb without BreadcrumbList markup.
- Guide H1s remain article names. Beginner fusion advice now points to all 106 fusion outcomes inside Attacks; retired Moves terminology is removed.
- Home About and eight FAQs explain game/site boundaries, kits, planning, versions and dated standings. Privacy includes three-slot vitamin plans and removal instructions.
- README covers all current navigation destinations, first runs, Survival, co-op and common player questions.
- Original impact emblem, SVG wordmark, PNG icons, ICO and Apple icon replace the lightning branding. The 1200×630 share image uses the castle setting and clearly identifies the fan guide.
- Route fingerprints use displayed semantic copy and route-specific catalogue branches rather than whole shared component files. Styling and handler-only changes preserve dates.

## Validation

- Production build, TypeScript and ESLint passed.
- All 31 offline browser tests passed, including every published route, canonical/TDK/schema checks, original animations, full leaderboards, local storage, long headings and widths 320/390/768/769/1024/1025/1440.
- Twelve SEO/date tests passed; body-only edits, related card changes and branch-local copy changes are covered.
- Content audit: 10,501 source comparisons passed. Media audit: 479 original assets checked without failures.
- Build audit: 21 published routes, 1,354 internal links and 1,992 image references passed.
- A final wording correction in the beginner article was followed by a fresh build and focused verification.

## Maintenance

Use `npm run seo:sync` after a content update. Production builds check the saved manifest rather than setting dates to build time. Historical generators that would restore old copy are blocked. No service was started or deployment performed.
