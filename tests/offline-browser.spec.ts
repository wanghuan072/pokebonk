/**
 * Tests production HTML and real hydration without starting a project server.
 * Every request to the test origin is fulfilled from .next and public files.
 */
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";
import pokemonRecords from "../src/data/pokedex/pokemon.json";
import moveRecords from "../src/data/wiki/moves.json";
import attackRecords from "../src/data/wiki/attacks.json";
import itemRecords from "../src/data/wiki/items.json";
import guideRecords from "../src/data/guides/guides.json";
import releaseRecords from "../src/data/updates/releases.json";
import officialBoards from "../src/data/leaderboard/snapshot.json";
import tierAnalysis from "../src/data/tier-list/rankings.json";

const root = process.cwd();
const origin = "http://pokebonk.test";
let documentRequests: string[] = [];
test.beforeEach(async ({ context }) => {
  documentRequests = [];
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) {
      await route.abort();
      return;
    }
    let relative = decodeURIComponent(url.pathname);
    let file: string;
    if (relative === "/_next/image")
      file = path.join(root, "public", url.searchParams.get("url") || "");
    else if (relative.startsWith("/_next/static/"))
      file = path.join(
        root,
        ".next/static",
        relative.slice("/_next/static/".length),
      );
    else if (relative.startsWith("/images/") || relative.startsWith("/fonts/"))
      file = path.join(root, "public", relative);
    else if (relative === "/icon.svg")
      file = path.join(root, "public/images/logo/crest.svg");
    else if (relative === "/favicon.ico")
      file = path.join(root, "public/favicon.ico");
    else if (relative === "/icon.png" || relative === "/apple-icon.png")
      file = path.join(root, "src/app", relative);
    else {
      if (request.isNavigationRequest()) documentRequests.push(relative);
      relative = relative.replace(/\/$/, "") || "/index";
      file = path.join(root, ".next/server/app", relative + ".html");
    }
    try {
      await route.fulfill({ path: file });
    } catch {
      await route.fulfill({
        status: 404,
        body: "Offline fixture not found: " + url.pathname,
      });
    }
  });
});

const fixedRoutes = [
  "/",
  "/play",
  "/pokedex",
  "/wiki/attacks",
  "/wiki/vitamins",
  "/wiki/items",
  "/wiki/achievements",
  "/wiki/lab",
  "/tier-list",
  "/builds",
  "/guides",
  "/wiki/leaderboard",
  "/updates",
  "/events",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/copyright",
];
async function readyImages(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((i) => i.decode().catch(() => {})),
    );
  });
}
test("all 22 published pages load, hydrate and have no broken images", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(r.url());
  });
  for (const route of [
    ...fixedRoutes,
    ...guideRecords.map((g) => "/guides/" + g.slug),
  ]) {
    await page.goto(origin + route);
    await expect(page.locator("h1")).toHaveCount(1);
    await readyImages(page);
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter((i) => !(i as HTMLImageElement).naturalWidth)
            .map((i) => (i as HTMLImageElement).src),
        ),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("detail flags, only three substantial guides, complete official boards", async () => {
  expect(tierAnalysis.entries).toHaveLength(79);
  expect(new Set(tierAnalysis.entries.map((e) => e.slug))).toEqual(
    new Set(pokemonRecords.filter((p) => p.isPlayable).map((p) => p.slug)),
  );
  for (const board of officialBoards.boards) {
    expect(board.entries).toHaveLength(100);
    expect(board.entries.map((e) => e.rank)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
  }
  expect(officialBoards.boards.map((b) => b.entries[0].value)).toEqual([
    "19.6M",
    "1440:00",
    "13:08.2",
  ]);
  for (const data of [pokemonRecords, moveRecords, itemRecords, releaseRecords])
    expect(data.every((e) => e.isDetails === false)).toBe(true);
  expect(guideRecords).toHaveLength(3);
  for (const g of guideRecords) {
    expect(g.isDetails).toBe(true);
    expect(
      g.sections
        .flatMap((s) => [s.text, ...s.paragraphs])
        .join(" ")
        .split(/\s+/).length,
    ).toBeGreaterThan(800);
  }
});
test("all disabled detail addresses have generated 404 responses", async () => {
  for (const [prefix, records] of [
    ["/pokedex", pokemonRecords],
    ["/wiki/attacks", attackRecords],
    ["/wiki/items", itemRecords],
    ["/updates", releaseRecords],
  ] as const) {
    for (const entry of records.filter((e) => !e.isDetails)) {
      const output = path.join(root, ".next/server/app", prefix, entry.slug);
      const metaText = await fs.readFile(output + ".meta", "utf8").catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
        return null;
      });
      if (metaText) expect(JSON.parse(metaText).status, `${prefix}/${entry.slug}`).toBe(404);
      else await expect(fs.access(output + ".html")).rejects.toMatchObject({code: "ENOENT"});
    }
  }
});
test("search performs document navigation to list anchors and history works", async ({
  page,
}) => {
  await page.goto(origin);
  await page
    .getByRole("searchbox", { name: "Search Pokémon, attacks, items and guides" })
    .fill("Pikachu");
  await page.locator(".search-results a").first().click();
  await expect(page).toHaveURL(origin + "/pokedex#pikachu");
  expect(documentRequests).toContain("/pokedex");
  await expect(page.locator("#pikachu .pokemon-tile-name")).toHaveText("Pikachu");
  await page.goBack();
  await expect(page).toHaveURL(origin + "/");
  await expect(page.getByRole("searchbox", { name: "Search Pokémon, attacks, items and guides" })).toHaveValue("");
});
test("Pokédex data remains available inline with working filters", async ({
  page,
}) => {
  await page.goto(origin + "/pokedex");
  await expect(page.locator(".pokedex-grid .pokemon-tile")).toHaveCount(151);
  await page.getByRole("button", { name: /Playable League Partners/ }).click();
  await expect(page.locator(".pokedex-grid .pokemon-tile")).toHaveCount(79);
  await page.getByLabel("Find your Pokémon").fill("squirtle");
  await page.locator("#squirtle").hover();
  await expect(page.locator("#pokemon-preview")).toContainText("+15 armor");
  await expect(page.locator(".pokemon-preview-stats>div")).toHaveCount(6);
  await expect(page.locator("#squirtle a")).toHaveCount(0);
});
test("official attack and item grids show their exact inspector values",async({page})=>{
 await page.goto(origin+'/wiki/attacks');
 await expect(page.locator('.catalog-card')).toHaveCount(493);
 await page.getByLabel('Search attacks').fill('vine whip');
 await expect(page.locator('.catalog-card')).toHaveCount(1);
 await page.locator('#vine-whip').click();
 await expect(page.locator('.catalog-inspector h2')).toHaveText('Vine Whip');
 await expect(page.locator('.catalog-facts')).toContainText('24.8');
 await expect(page.locator('.catalog-inspector')).toContainText('Bulbasaur');
 await page.goto(origin+'/wiki/items');
 await expect(page.locator('.catalog-card')).toHaveCount(126);
 await page.getByLabel('Search items').fill('charcoal');
 await page.locator('#charcoal').click();
 await expect(page.locator('.catalog-inspector')).toContainText('+30% Fire-type move damage');
 await expect(page.locator('#charcoal img')).toHaveAttribute('src',/charcoal.png/);
});

test("fusion entries are part of Attacks and achievement notes persist",async({page})=>{
 await page.goto(origin+'/wiki/attacks#fu-1');
 await expect(page.locator('.catalog-inspector h2')).toHaveText('Flower Beam');
 await expect(page.locator('.catalog-recipe')).toContainText('Razor Leaf');
 await expect(page.locator('.catalog-recipe')).toContainText('Solar Beam');
 await page.locator('.catalog-recipe').getByRole('button',{name:'Solar Beam',exact:true}).click();
 await expect(page.locator('.catalog-inspector h2')).toHaveText('Solar Beam');
 await page.goto(origin+'/wiki/achievements');
 await page.locator('#achievement-k100 input').check();
 await page.reload();
 await expect(page.locator('#achievement-k100 input')).toBeChecked();
 await expect(page.locator('.achievement-row.complete')).toHaveCount(1);
});

test("Lab calculator sums the original cost curve", async ({ page }) => {
  await page.goto(origin + "/wiki/lab");
  await expect(page.locator(".lab-calculator-result strong")).toHaveText(
    "◆ 1,275",
  );
  await page
    .getByRole("combobox", { name: "Upgrade", exact: true })
    .selectOption("dmg");
  await page.getByLabel("Target level").fill("3");
  await expect(page.locator(".lab-calculator-result strong")).toHaveText(
    "◆ 370",
  );
  await page.getByLabel("Starting level").fill("2");
  await expect(page.locator(".lab-calculator-result strong")).toHaveText(
    "◆ 165",
  );
});
test("all 151 can be dragged, reordered, placed by keyboard and persisted", async ({
  page,
}) => {
  await page.goto(origin + "/tier-list");
  await expect(page.locator(".board-mon")).toHaveCount(151);
  const mon = page.getByRole("button", {
    name: "Select Bulbasaur",
    exact: true,
  });
  // Start the native drag before scrolling to a rank above the bottom pool.
  await mon.scrollIntoViewIfNeeded();
  const source=await mon.boundingBox();
  await page.mouse.move(source!.x+source!.width/2,source!.y+source!.height/2);
  await page.mouse.down();
  await page.mouse.move(source!.x+source!.width/2+12,source!.y+source!.height/2-12,{steps:4});
  await page.locator(".board-S .board-row-members").scrollIntoViewIfNeeded();
  const target=await page.locator(".board-S .board-row-members").boundingBox();
  await page.mouse.move(target!.x+target!.width/2,target!.y+target!.height/2,{steps:8});
  await page.mouse.up();
  await expect(page.locator(".board-S .board-mon")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Select Charmander", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Move selected Pokémon to A", exact: true })
    .press("Enter");
  await expect(page.locator(".board-A")).toContainText("Charmander");
  await page.locator(".board-S").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/tier-board-customized.png" });
  await page
    .getByRole("button", { name: "Select Pikachu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Move selected Pokémon to S", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Select Pikachu", exact: true })
    .dragTo(
      page.getByRole("button", { name: "Select Bulbasaur", exact: true }),
    );
  await expect(page.locator(".board-S .board-mon").first()).toHaveAttribute(
    "aria-label",
    "Select Pikachu",
  );
  await page.reload();
  await expect(page.locator(".board-S")).toContainText("Bulbasaur");
  await expect(page.locator(".board-A")).toContainText("Charmander");
  await expect(page.locator(".board-mon")).toHaveCount(151);
  await page.getByRole("button", { name: /Our recommendations/ }).click();
  await expect(page.locator(".recommendation-row")).toHaveCount(79);
  await page.locator(".tier-workshop .recommended-leaders").scrollIntoViewIfNeeded();
  await readyImages(page);
  await page.screenshot({
    path: "test-results/tier-recommendations-desktop.png",
  });
  await page.locator(".recommendation-row summary").first().click();
  await expect(page.locator(".rec-evidence").first()).toContainText(
    "Unmodified baseline",
  );
  await page.getByRole("button", { name: /Your tier board/ }).click();
  await page.getByRole("button", { name: "Reset board" }).click();
  await expect(page.locator(".board-Unranked .board-mon")).toHaveCount(151);
});
test("official board mode changes, search and top-100 pagination", async ({
  page,
}) => {
  await page.goto(origin + "/wiki/leaderboard");
  await expect(page.locator(".podium-1")).toContainText("19.6M");
  await expect(page.locator(".record-table tbody tr")).toHaveCount(25);
  await expect(page.locator(".podium-1")).toContainText("SR_SSRR");
  await page.getByRole("button", { name: /Show next 25/ }).click();
  await expect(page.locator(".record-table tbody tr")).toHaveCount(50);
  await page.getByLabel("Find trainer / clan tag").fill("L0vekiss");
  await expect(page.locator(".record-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".record-table")).toContainText("100");
  await page.getByRole("button", { name: /Survival Longest/ }).click();
  await expect(page.locator(".podium-1")).toContainText("1440:00");
  await page.getByRole("button", { name: /Time attack Regional/ }).click();
  await expect(page.locator(".podium-1")).toContainText("13:08.2");
  await expect(page.locator(".prize-grid article")).toHaveCount(5);
});
test("updates filter and expand full notes without detail navigation", async ({
  page,
}) => {
  await page.goto(origin + "/updates");
  await expect(page.locator(".release-card")).toHaveCount(releaseRecords.length);
  await page.getByLabel("Search version or change").fill("0.8.25");
  await expect(page.locator(".release-card")).toHaveCount(1);
  await expect(page.locator(".release-card details")).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".release-card a")).toHaveCount(0);
});
test("desktop and mobile redesigned pages fit and are reviewable", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      "/wiki/attacks",
      "/wiki/vitamins",
      "/wiki/items",
      "/wiki/achievements",
      "/wiki/lab",
      "/tier-list",
      "/wiki/leaderboard",
      "/updates",
      "/guides/endless-mode-guide",
    ]) {
      await page.goto(origin + route);
      await readyImages(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${width} ${route}`,
      ).toBe(true);
      await page.screenshot({
        path: `test-results/${route.replaceAll("/", "-")}-${width}.png`,
        fullPage: false,
      });
      if (route === "/guides/endless-mode-guide") {
        await page.locator(".prose>section").nth(2).scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `test-results/guide-build-content-${width}.png`,
        });
      }
    }
  }
});
test("mobile menu changes documents and local tabs do not", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.locator(".wiki-menu summary").click();
  await page
    .locator(".wiki-menu a[href=\"/wiki/attacks\"]")
    .click();
  await expect(page).toHaveURL(origin + "/wiki/attacks");
  expect(documentRequests).toContain("/wiki/attacks");
  const before = documentRequests.length;
  await page.getByRole("button", { name: "Fusions", exact:true }).click();
  expect(documentRequests.length).toBe(before);
  await expect(page.locator(".catalog-card")).toHaveCount(106);
});

test("all published pages fit both breakpoint boundaries and narrow screens", async ({
  page,
}) => {
  test.setTimeout(180000);
  const failures: { width: number; route: string; elements: unknown[] }[] = [];
  for (const width of [320, 390, 768, 769, 1024, 1025, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      ...fixedRoutes,
      ...guideRecords.map((g) => "/guides/" + g.slug),
    ]) {
      await page.goto(origin + route);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({
        width: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      if (overflow.scroll > width) {
        failures.push({
          width,
          route,
          elements: await page.locator("body *").evaluateAll((els) =>
            els
              .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
              .slice(0, 12)
              .map((e) => ({
                tag: e.tagName,
                class: e.className,
                right: e.getBoundingClientRect().right,
                width: e.getBoundingClientRect().width,
              })),
          ),
        });
        if (route === "/")
          await page.screenshot({ path: `test-results/home-${width}.png` });
      }
      if (width <= 1024) {
        await expect(
          page.getByRole("button", { name: "Toggle navigation" }),
        ).toBeVisible();
        await expect(page.locator("#main-navigation")).toBeHidden();
      } else
        await expect(
          page.getByRole("button", { name: "Toggle navigation" }),
        ).toBeHidden();
    }
  }
  await fs.writeFile(
    "test-results/layout-diagnostics.json",
    JSON.stringify(failures, null, 2),
  );
  expect(failures.map((f) => `${f.width} ${f.route}`)).toEqual([]);
});

test("tablet menu and mobile search remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(origin);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .locator("#main-navigation")
    .getByRole("link", { name: "Guides", exact: true })
    .click();
  await expect(page).toHaveURL(origin + "/guides");
  expect(documentRequests).toContain("/guides");
  await page.setViewportSize({ width: 320, height: 800 });
  const search = page.getByRole("searchbox", {
    name: "Search Pokémon, attacks, items and guides",
  });
  await search.focus();
  await search.fill("Pikachu");
  await expect(page.locator(".search-results")).toBeVisible();
  expect(
    await page
      .locator(".search-results")
      .evaluate((e) => e.getBoundingClientRect().left),
  ).toBeGreaterThanOrEqual(0);
  await page.locator(".search-results a").first().click();
  await expect(page).toHaveURL(origin + "/pokedex#pikachu");
});

test("metadata, structured data, sitemap and Legal links match published content", async ({
  page,
}) => {
  const history = JSON.parse(
    await fs.readFile("src/seo/page-history.json", "utf8"),
  );
  for (const route of Object.keys(history)) {
    await page.goto(origin + route);
    const title = await page.title();
    expect(title.length).toBeGreaterThanOrEqual(40);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain("PokeBonk");
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description!.length).toBeGreaterThanOrEqual(140);
    expect(description!.length).toBeLessThanOrEqual(160);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).href).toBe(
      new URL(route, "https://pokebonkdb.org").href,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://pokebonkdb.org/images/og-image.png",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    for (const text of schemas) {
      const schema = JSON.parse(text);
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).not.toBe("FAQPage");
      if (schema["@type"] === "Article") {
        expect(schema.headline).toBe(await page.locator("h1").innerText());
        expect(schema.dateModified).toBe(history[route].modified);
      }
    }
    for (const link of await page.locator(".app-footer a[href]").all())
      expect((await link.getAttribute("rel")) || "").not.toContain("nofollow");
  }
  const sitemap = await fs.readFile(
    ".next/server/app/sitemap.xml.body",
    "utf8",
  );
  expect([...sitemap.matchAll(/<loc>/g)]).toHaveLength(
    Object.keys(history).length,
  );
  for (const [route, value] of Object.entries(history) as [
    string,
    { modified: string },
  ][])
    expect(sitemap).toContain(
      `<loc>https://pokebonkdb.org${route}</loc>\n<lastmod>${value.modified}</lastmod>`,
    );
  expect(sitemap).not.toContain("/disclaimer");
  const redirects = JSON.parse(
    await fs.readFile(".next/routes-manifest.json", "utf8"),
  ).redirects;
  expect(
    redirects.some(
      (r: { source: string; destination: string; statusCode: number }) =>
        r.source === "/disclaimer" &&
        r.destination === "/copyright" &&
        r.statusCode === 308,
    ),
  ).toBe(true);
  await page.goto(origin + "/contact");
  await expect(page.locator("main form")).toHaveCount(0);
  await expect(
    page.locator('main a[href="mailto:support@pokebonkdb.org"]'),
  ).toHaveCount(1);
  await expect(page.locator(".footer-bottom p").first()).toHaveText(
    `Copyright © ${new Date().getUTCFullYear()} pokebonkdb.org. All rights reserved.`,
  );
});

test("home introduction, eight FAQs and branding are ready for review", async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin);
    await readyImages(page);
    await expect(page.locator(".home-faq-grid details")).toHaveCount(8);
    await expect(
      page.getByRole("heading", { name: "PokéBonk", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".brand img").first()).toHaveAttribute(
      "src",
      /logo-mark/,
    );
    const brandTop = await page
      .locator(".header-content > .brand")
      .evaluate((e) => e.getBoundingClientRect().top);
    if (width <= 1024) {
      const menuTop = await page
        .getByRole("button", { name: "Toggle navigation" })
        .evaluate((e) => e.getBoundingClientRect().top);
      expect(
        Math.abs(menuTop - brandTop),
        JSON.stringify(
          await page.locator(".header-content > *").evaluateAll((els) =>
            els.map((e) => ({
              class: e.className,
              width: e.getBoundingClientRect().width,
              top: e.getBoundingClientRect().top,
              gap: getComputedStyle(e).gap,
            })),
          ),
        ),
      ).toBeLessThan(20);
    } else {
      const rail = await page.locator("#main-navigation").boundingBox();
      expect(rail?.x).toBe(0);
      expect(rail?.width).toBe(88);
      await expect(page.locator(".home-pokemon-grid > a")).toHaveCount(32);
      await expect(page.locator(".home-guide-grid > a")).toHaveCount(3);
    }
    await page.screenshot({
      path: `test-results/home-final-${width}.png`,
      fullPage: width === 1440,
    });
    await page
      .getByRole("heading", { name: "PokéBonk 3D", exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/home-about-${width}.png` });
  }
});

test("official item limits and fusion comparison context reach the pages",async({page})=>{
 await page.goto(origin+'/wiki/items#tm-case');
 await expect(page.locator('.catalog-inspector')).toContainText('up to ★6');
 await expect(page.locator('.catalog-facts')).toContainText('Max per run');
 await page.goto(origin+'/wiki/attacks#fu-1');
 await expect(page.locator('.catalog-inspector')).toContainText('2.9 s');
 await expect(page.locator('.catalog-basis')).toContainText('Bulbasaur');
 await expect(page.locator('.catalog-inspector')).toContainText('★5');
 await page.goto(origin+'/guides/beginners-guide');
 await expect(page.locator('main')).toContainText('Synthesis');
 await expect(page.locator('main')).not.toContainText('Photosynthesis');
 await page.goto(origin+'/guides/endless-mode-guide');
 await expect(page.locator('main')).toContainText('minute 45');
 await page.goto(origin+'/guides/coop-mode-guide');
 await expect(page.locator('main')).toContainText('hold E to revive');
});

test("all fusion categories, Lab costs and Looks are usable",async({page})=>{
 await page.goto(origin+'/wiki/attacks#fusions');
 await expect(page.locator('.catalog-card')).toHaveCount(106);
 await page.getByLabel('Search attacks').fill('Scorching Sun');
 await expect(page.locator('.catalog-card')).toHaveCount(1);
 await page.getByRole('button',{name:'Select Scorching Sun',exact:true}).click();
 await expect(page.locator('.catalog-inspector')).toContainText('fire attack + fire attack');
 await page.goto(origin+'/wiki/lab');
 await expect(page.locator('.lab-upgrade-grid:visible .lab-upgrade')).toHaveCount(24);
 await page.getByLabel('Training preview level',{exact:true}).selectOption('1');
 await expect(page.getByLabel('Training next level cost',{exact:true})).not.toHaveText('85');
 await page.getByRole('combobox',{name:'Upgrade',exact:true}).selectOption('archive');
 await page.getByLabel('Starting level',{exact:true}).fill('4');
 await page.getByLabel('Target level',{exact:true}).fill('6');
 await expect(page.locator('.lab-calculator-result strong')).toHaveText('◆ 8,075');
 await page.getByRole('button',{name:'Items · 126 in the pool',exact:true}).click();
 await expect(page.locator('.lab-upgrade-grid:visible .lab-upgrade')).toHaveCount(126);
 await page.goto(origin+'/wiki/achievements');
 await expect(page.locator('.achievement-row')).toHaveCount(70);
 await page.getByRole('button',{name:'Looks',exact:true}).click();
 await expect(page.locator('.achievement-row')).toHaveCount(158);
 await expect(page.locator('#achievement-lk1_1')).toContainText('Solo or co-op');
 await expect(page.locator('#achievement-lk1_1 .trainer-avatar-picture img')).toHaveAttribute('src',/lk1_1.png/);
 await readyImages(page);
 expect(await page.locator('.q-look img').evaluateAll(images=>images.filter(i=>(i as HTMLImageElement).naturalWidth===0).map(i=>i.getAttribute('src')))).toEqual([]);
 await page.goto(origin+'/updates');
 await expect(page.locator('.latest-release')).toContainText('0.8.62');
});

test("original game frames animate, match every species and respect reduced motion", async ({page}) => {
  await page.goto(origin + "/pokedex");
  await expect(page.locator(".pokemon-tile")).toHaveCount(151);
  for (const p of pokemonRecords) {
    await expect(page.locator(`#${p.slug} img`)).toHaveAttribute("src", `/images/pokemon/game/portraits/${p.id}.png`);
  }
  await readyImages(page);
  await page.locator("#bulbasaur").hover();
  const image = page.locator("#pokemon-preview .game-sprite-sheet");
  const bounds = await page.locator("#pokemon-preview .game-sprite-viewport").boundingBox();
  expect(bounds!.width).toBeGreaterThan(30);
  expect(bounds!.height).toBeGreaterThan(30);
  await image.evaluate((el) => el.getAnimations()[0].pause());
  const lefts = [];
  for (const time of [0, 680, 790]) {
    lefts.push(await image.evaluate((el, time) => {el.getAnimations()[0].currentTime=time;return getComputedStyle(el).left;}, time));
  }
  expect(new Set(lefts).size).toBe(3);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(image).toHaveCSS("animation-name", "none");
  await expect(image).toHaveCSS("left", "0px");
});


test("game-style Pokédex previews follow hover, keyboard and touch", async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin + "/pokedex");
  await page.locator("#charizard").hover();
  await expect(page.locator(".pokemon-preview-name h3")).toHaveText("Charizard");
  await expect(page.locator("#pokemon-preview .game-sprite-sheet")).toHaveAttribute("src", "/images/pokemon/game/idle/6.png");
  await page.locator("#squirtle").focus();
  await expect(page.locator(".pokemon-preview-name h3")).toHaveText("Squirtle");
  await expect(page.locator(".pokemon-preview-passive")).toContainText("+15 armor");
  await page.locator("#bulbasaur").hover();
  await page.locator("#charizard").hover();
  await expect(page.locator(".pokemon-preview-name h3")).toHaveText("Charizard");
  await page.locator("#charizard").click();
  await page.mouse.move(1350, 650);
  await readyImages(page);
  await page.screenshot({path:"test-results/pokedex-game-desktop.png",fullPage:true});
  await page.locator(".pokedex-workspace").screenshot({path:"test-results/pokedex-game-panel.png"});
  await page.setViewportSize({width:390,height:844});
  await page.reload();
  await expect(page.locator("#pokemon-preview")).toBeHidden();
  await page.locator("#charmander").click();
  await expect(page.locator("#pokemon-preview")).toBeVisible();
  await expect(page.locator(".pokemon-preview-name h3")).toHaveText("Charmander");
  await expect(page.locator("#pokemon-preview")).toBeFocused();
  await readyImages(page);
  await page.screenshot({path:"test-results/pokedex-game-mobile.png"});
  await page.keyboard.press("Escape");
  await expect(page.locator("#pokemon-preview")).toBeHidden();
  await expect(page.locator("#charmander")).toBeFocused();
});


test("compact home keeps container width and its roster links work", async ({page}) => {
  await page.setViewportSize({width:1600,height:1000});
  await page.goto(origin);
  const home=await page.locator(".home-layout").boundingBox();
  const header=await page.locator(".header-content").boundingBox();
  expect(home!.width).toBeLessThanOrEqual(1320);
  expect(Math.abs(home!.width-header!.width)).toBeLessThan(1);
  const primary=await page.locator(".home-primary-grid>section").evaluateAll(els=>els.map(el=>el.getBoundingClientRect().top));
  expect(new Set(primary).size).toBe(1);
  await page.getByRole("searchbox",{name:"Find a Pokémon"}).fill("#025");
  await expect(page.locator(".home-pokemon-grid>a")).toHaveCount(1);
  await page.locator(".home-pokemon-grid>a").click();
  await expect(page).toHaveURL(origin+"/pokedex#pikachu");
  expect(documentRequests).toContain("/pokedex");
  await page.goBack();
  await page.getByRole("group",{name:"Home roster filter"}).getByRole("button",{name:"Starters",exact:true}).click();
  await expect(page.locator(".home-pokemon-grid>a")).toHaveCount(3);
});


test("new mode guides, event rewards and bottom tier pool are complete",async({page})=>{
 await page.goto(origin+"/events");
 await expect(page.locator(".event-card")).toHaveCount(2);
 await expect(page.locator(".event-quests>div")).toHaveCount(7);
 await expect(page.locator(".event-board-prizes article")).toHaveCount(4);
 await expect(page.locator("#halloween26")).toContainText("2,500");
 await page.screenshot({path:"test-results/events-desktop.png",fullPage:true});
 for(const slug of ["endless-mode-guide","coop-mode-guide"]){await page.goto(origin+"/guides/"+slug);await expect(page.locator(".prose>section")).toHaveCount(10);}
 await page.goto(origin+"/tier-list");
 const lastRow=await page.locator(".board-D").boundingBox(),pool=await page.locator(".board-Unranked").boundingBox();
 expect(pool!.y).toBeGreaterThan(lastRow!.y+lastRow!.height-1);
 await expect(page.locator(".player-pick-grid>article")).toHaveCount(79);
 await expect(page.locator(".player-picks")).toContainText("not measured win rates");
 await page.goto(origin);
 await expect(page.locator(".home-game-menu .menu-survival")).toHaveAttribute("href","/guides/endless-mode-guide");
 await expect(page.locator(".home-game-menu .menu-coop")).toHaveAttribute("href","/guides/coop-mode-guide");
 await expect(page.locator(".menu-season-player")).toHaveCount(5);
});


test("complete official top 100 preserves every player appearance and placement reward",async({page})=>{
 test.setTimeout(60000);
 await page.goto(origin+"/wiki/leaderboard");
 for(const board of officialBoards.boards){
  await page.getByRole("button",{name:board.id==='kos'?/KOs Total/:board.id==='survival'?/Survival Longest/:/Time attack Regional/}).click();
  while(await page.getByRole("button",{name:/Show next 25/}).count())await page.getByRole("button",{name:/Show next 25/}).click();
  await expect(page.locator(".record-table tbody tr")).toHaveCount(97);
  const actual=await page.locator(".record-table tbody tr").evaluateAll(rows=>rows.map(row=>({rank:Number(row.querySelector('.record-rank')?.textContent),avatar:row.querySelector('.trainer-avatar-picture img')?.getAttribute('src'),frame:row.querySelector('.trainer-avatar-frame')?.getAttribute('src')||null,badge:row.querySelector('.record-reward img')?.getAttribute('src')||null,regions:[...row.querySelectorAll('.rank-regions b')].map(e=>e.textContent),gap:row.querySelectorAll('td')[3].textContent,score:row.querySelector('td:last-child>b')?.textContent})));
  expect(actual).toEqual(board.entries.slice(3).map(e=>({rank:e.rank,avatar:e.avatar,frame:e.frame,badge:e.badgeImage,regions:e.regions.map(r=>r.value),gap:e.gap,score:e.value})));
  if(board.id==='time')await expect(page.locator('.record-table tbody tr').last()).toContainText('Outside prize places');
  for(let i=0;i<97;i+=8)await page.locator('.record-table tbody tr').nth(i).scrollIntoViewIfNeeded();
  await page.locator('.record-table tbody tr').last().scrollIntoViewIfNeeded();
  await page.locator('.record-podium').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('.record-book img').evaluateAll(imgs=>imgs.filter(img=>!(img as HTMLImageElement).complete||(img as HTMLImageElement).naturalWidth===0).map(img=>img.getAttribute('src')))).toEqual([]);
 }
 await page.getByRole("button",{name:/KOs Total/}).click();
 await page.setViewportSize({width:1440,height:1100});
 await page.screenshot({path:'test-results/leaderboard-complete-2026-10-28.png',fullPage:true});
});


test("v0.8.62 official unlock, co-op eligibility and Daily Mutation rules reach players",async({page})=>{
 await page.goto(origin+"/pokedex#lickitung");
 await page.getByLabel("Find your Pokémon").fill("Lickitung");
 await page.getByRole("button",{name:"Inspect Lickitung, number 108",exact:true}).click();
 await page.locator('.pokemon-preview-unlock summary').click();
 await expect(page.locator('.pokemon-preview-unlock')).toContainText('7,000');
 await page.goto(origin+"/wiki/achievements#achievement-lk1_1");
 await expect(page.locator('#achievement-lk1_1')).toContainText('Solo or co-op');
 await expect(page.locator('#achievement-lk1_2')).toContainText('Solo play required');
 await page.goto(origin+"/guides/coop-mode-guide");
 await expect(page.locator('.prose')).toContainText('Choose your Bag items in the lobby');
 await expect(page.locator('.prose')).toContainText('Most Mastery Look challenges now count in co-op');
 await page.goto(origin+"/events");
 await expect(page.locator('#daily-mutations .event-quests article')).toHaveCount(4);
 for(const title of ['Metronome','Dynamax Wilds','Candy Fever','Crystal'])await expect(page.locator('#daily-mutations').getByRole('heading',{name:title,exact:true})).toBeVisible();
 await expect(page.locator('#daily-mutations')).toContainText('00:00 UTC');
 await expect(page.locator('#daily-mutations')).toContainText('300 per day');
 await expect(page.locator('#daily-mutations')).toContainText('Mutation King');
 await readyImages(page);
 await page.screenshot({path:'test-results/events-daily-mutations-2026-10-28.png',fullPage:true});
});


test("official Vitamins have per-level and rarity tables, and retired Wiki URLs return 404",async({page})=>{
 await page.goto(origin+'/wiki/vitamins');
 await expect(page.locator('.catalog-card')).toHaveCount(26);
 await page.getByRole('button',{name:'Select Protein',exact:true}).click();
 await expect(page.locator('.catalog-inspector h2')).toHaveText('Protein');
 await expect(page.locator('.catalog-inspector')).toContainText('+100%');
 await expect(page.locator('.catalog-inspector')).toContainText('+21%');
 await page.getByLabel('Search vitamins').fill('Loaded Dice');
 await page.getByRole('button',{name:'Select Loaded Dice',exact:true}).click();
 await expect(page.locator('.catalog-inspector')).toContainText('50% more');
 await page.goto(origin+'/wiki/items');
 await page.getByRole('button',{name:'Lab unlocks',exact:true}).click();
 await expect(page.locator('.catalog-card')).toHaveCount(59);
 await page.getByRole('button',{name:'Starting pool',exact:true}).click();
 await expect(page.locator('.catalog-card')).toHaveCount(67);
 for(const route of ['/wiki/moves','/wiki/fusions','/wiki/mechanics']){const response=await page.goto(origin+route);expect(response?.status()).toBe(404);expect(response?.headers()['location']).toBeUndefined();}
});

test("achievement cards follow the official three-column layout",async({page})=>{
 for(const [width,columns] of [[1440,3],[1024,2],[768,1],[390,1],[320,1]]){
  await page.setViewportSize({width,height:950});
  await page.goto(origin+'/wiki/achievements');
  await expect(page.locator('.achievement-row')).toHaveCount(70);
  expect(await page.locator('.achievement-list').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(columns);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const first=await page.locator('.achievement-row').first().boundingBox();
  expect(first?.height).toBeLessThan(155);
  if(width===1440||width===390){await readyImages(page);await page.screenshot({path:`test-results/achievement-grid-${width}.png`});}
 }
 await page.getByLabel('Mark First steps complete',{exact:true}).check();
 await expect(page.locator('#achievement-k100')).toHaveClass(/complete/);
 await page.reload();
 await expect(page.getByLabel('Mark First steps complete',{exact:true})).toBeChecked();
});

test("vitamin inspector uses level tiles, rarity pills and a persistent local plan",async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin+'/wiki/vitamins');
 await expect(page.locator('.catalog-levels .catalog-fact-row')).toHaveCount(10);
 await expect(page.locator('.catalog-rarities .catalog-fact-row')).toHaveCount(5);
 expect(await page.locator('.catalog-levels').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(5);
 expect(await page.locator('.catalog-rarities').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
 await page.getByRole('button',{name:'Select Protein',exact:true}).click();
 await page.getByRole('button',{name:'Add to plan'}).click();
 await expect(page.locator('.catalog-plan-count')).toHaveText('1 of 3 in the plan');
 await page.reload();
 await expect(page.locator('.catalog-plan-count')).toHaveText('1 of 3 in the plan');
 await page.getByRole('button',{name:'Edit plan',exact:true}).click();
 await page.getByRole('button',{name:'Remove Protein from plan',exact:true}).click();
 await expect(page.locator('.catalog-plan-count')).toHaveText('0 of 3 in the plan');
 await page.getByRole('button',{name:'Done editing',exact:true}).click();
 await readyImages(page);
 await page.screenshot({path:'test-results/vitamin-inspector-1440.png'});
 await page.getByLabel('Search vitamins').fill('Loaded Dice');
 await expect(page.locator('.catalog-levels')).toHaveCount(0);
 await expect(page.locator('.catalog-inspector')).toContainText('50% more');
 await page.setViewportSize({width:390,height:950});
 await page.goto(origin+'/about');
 await page.goto(origin+'/wiki/vitamins#protein');
 await expect(page.locator('.catalog-inspector')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await readyImages(page);await page.screenshot({path:'test-results/vitamin-inspector-390.png'});
});

test("every recommended kit has its own ranking explanation and all species are covered",async({page})=>{
 await page.setViewportSize({width:1440,height:1050});
 await page.goto(origin+'/tier-list#our-ranking');
 const recommendations=page.locator('.player-ranking-group .player-pick-grid>article');
 await expect(recommendations).toHaveCount(79);
 await expect(page.locator('.player-ranking-group')).toHaveCount(4);
 const links=await page.locator('.player-ranking-family a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
 expect(new Set(links).size).toBe(151);
 const explanations=await recommendations.evaluateAll(cards=>cards.map(c=>c.querySelector(':scope>p')?.textContent));
 expect(new Set(explanations).size).toBe(79);
 expect(explanations.every(text=>text&&text.split(/\s+/).length>=20)).toBe(true);
 await page.locator('#recommend-slowpoke details summary').click();
 await expect(page.locator('#recommend-slowpoke')).toContainText('The speed penalty');
 await expect(page.locator('#recommend-magikarp')).toContainText('Gyarados');
 await page.locator('#recommend-slowpoke details summary').click();
 await page.locator('#recommended-s').evaluate(el=>el.scrollIntoView({block:'start'}));
 await readyImages(page);await page.screenshot({path:'test-results/tier-recommendations-1440.png'});
 await page.setViewportSize({width:390,height:950});
 await page.locator('#recommended-s').evaluate(el=>el.scrollIntoView({block:'start'}));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/tier-recommendations-390.png'});
});

test("tier page carries the home game-menu palette and keeps hero actions usable",async({page})=>{
 await page.setViewportSize({width:1440,height:1050});
 await page.goto(origin+'/tier-list');
 await expect(page.locator('.tier-list-content h1')).toContainText('PokeBonk Tier List');
 await expect(page.locator('.page-intro .recommended-leaders>a:not(.button)')).toHaveCount(3);
 await readyImages(page);await page.screenshot({path:'test-results/tier-game-style-1440.png'});
 await page.locator('#recommended-s').evaluate(el=>{document.documentElement.style.scrollBehavior='auto';el.scrollIntoView({block:'start',behavior:'instant'})});
 await page.screenshot({path:'test-results/tier-game-style-ranking-1440.png'});
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.locator('.hero-buttons a[href="#our-ranking"]').click();
 await expect(page).toHaveURL(/#our-ranking$/);
 await page.setViewportSize({width:390,height:950});
 await page.goto(origin+'/tier-list');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await readyImages(page);await page.screenshot({path:'test-results/tier-game-style-390.png'});
});

test("reviewed headings, descriptions, breadcrumbs and storage disclosure stay consistent",async({page})=>{
 const copy=JSON.parse(await fs.readFile(path.join(root,'src/data/content/pages.json'),'utf8'));
 for(const route of fixedRoutes){
  await page.goto(origin+route);
  await expect(page.locator('h1')).toHaveText(copy[route].h1);
  await expect(page.getByRole('navigation',{name:'Breadcrumb',exact:true})).toHaveCount(1);
  if(route==='/'){
   const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();
   expect(schemas.some(s=>s.includes('BreadcrumbList'))).toBe(false);
  }
 }
 await page.goto(origin+'/privacy-policy');
 await expect(page.locator('.prose')).toContainText('vitamin plans');
 await expect(page.locator('.prose')).toContainText('three base vitamin slots');
 await page.goto(origin+'/wiki/attacks');
 await readyImages(page);await page.screenshot({path:'test-results/copy-review-attacks-1440.png'});
 await page.setViewportSize({width:390,height:950});
 await page.goto(origin+'/wiki/attacks');await readyImages(page);
 await page.screenshot({path:'test-results/copy-review-attacks-390.png'});
});
