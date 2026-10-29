# Compact layout and illustrated background

The existing side navigation, midnight teal palette and verified v0.8.55 content remain in place. This revision changes the layout through the existing CSS files; it does not introduce another styling framework or duplicate component tree.

- The homepage hero has a smaller headline and shorter composition. On desktop, its counts sit over a dark caption panel in the illustration area.
- Starter entries become three compact bordered cards. The main tools and three horizontal guide rows share a two-column desktop row.
- Latest news becomes a shallow full-width row above the introduction and FAQs, reducing the empty area alongside the introduction.
- Internal page introductions, Wiki navigation, toolbars, cards, Lab and achievement panels, leaderboard controls and update highlights have tighter spacing. The three-guide index uses three columns instead of leaving an unused fourth column.
- The only layout breakpoints remain 1024px and 768px. Tablet and mobile retain the hamburger menu; tool and guide columns stack at smaller widths.

`public/images/home/forest-ruins-background.webp` is a 1536×1024 decorative pixel-art image created with the built-in imagegen tool, delivered as a roughly 252 KB WebP. It is not a game screenshot or a data illustration. A fixed decorative CSS layer keeps the forest and stonework behind the page, with a dark tint and solid reading surfaces. Existing game imagery is unchanged. The full generation prompt is in `compact-layout-background.prompt.txt`.

Production builds and browser verification use the existing offline Playwright setup. No project service is required. CSS-only changes leave the persistent sitemap content dates unchanged.

Validation passed: production build / TypeScript, ESLint, 19 browser tests and the audit of all 21 published routes. The browser sweep covers 320, 390, 768, 769, 1024, 1025 and 1440px. Updated captures are `homepage-compact-desktop.png` and `homepage-compact-mobile.png`. At 1440px wide, the new homepage capture is 2134px high, compared with 2556px in the saved v4 implementation capture (about 16.5% shorter), with all introduction paragraphs and eight FAQs retained.
