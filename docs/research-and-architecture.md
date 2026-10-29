# Research and architecture

## Research before implementation

The supplied design guides layout, navy/purple colors, golden buttons, card borders and section rhythm. Its fictional names, numbers and dates are not used as game data.

The [original game](https://pokebonk.com/) and its inspected v0.8.13 public resources are the primary source. They separately define Pokédex entries, League partners, move kits, game-specific passives, achievements, Lab upgrades and costs, fusion signatures and release history.

The requested [pokebonk-wiki.wiki](https://pokebonk-wiki.wiki/), [pokebonk.wiki](https://pokebonk.wiki/), [pokebonk.org](https://pokebonk.org/) and [pokebonk.cc](https://pokebonk.cc/) were inspected for information architecture. Starter comparisons, controls and progression were useful topic priorities. Their release references can lag the original client. No articles or screenshots were copied. [playpokebonk.com](https://playpokebonk.com/) returned HTTP 403; no content from that site is claimed to have been verified.

## Architecture

- `src/app`: small route boundaries, metadata and framework files.
- `src/page`: full page implementations and business-specific interaction components.
- `src/components`: stable shared header/footer, cards, breadcrumbs and tier rows.
- `src/data`: pure JSON; `src/lib`: data access, search, persistence and calculations.
- `src/style`: global, shared and separate page CSS, following the persistent global structure rule.
- `src/config` and `src/seo`: navigation, origin, versions and metadata generation.

All independent-page links use ordinary anchors for full-document navigation. Tabs, filters and accordions remain local interactions. There is no redundant `/wiki` landing page. The original Next.js 16.4.2 Cache Components configuration is retained and current local framework docs were consulted. No account, database or UI library is added.

## Scope and launch

The Play page links to the original game. The leaderboard contains October 23 official UI snapshots of 100 Global records in each of three modes. Tier recommendations compare all 79 League starting kits using a disclosed opening-comfort model; a separate draggable board includes all 151 species. There are three illustrated guides. Non-guide details are disabled through JSON flags and route guards. See [the current redesign](list-pages-redesign.md).

Set a real `NEXT_PUBLIC_SITE_URL` before deployment. Without it, localhost canonicals and noindex protect the preview from accidental indexing. Set a genuine optional `NEXT_PUBLIC_CONTACT_EMAIL` to enable the email-draft action. No remote repository, deployment or external-contact operation was performed.

The three guide details use Article schema; breadcrumbs use BreadcrumbList. FAQ rich-result eligibility is not claimed. The sitemap contains 18 general/list pages and three enabled guides.

## Verification scope

Build audits inspect generated HTML, SEO, links, assets and data associations. Offline Playwright tests fulfill test-origin browser requests from production files, so no project server is started. They can exercise hydration, interactions, document requests and responsive layout. They cannot validate a deployed host's CDN, image optimizer, unknown-route HTTP status, or original-game account flows.
