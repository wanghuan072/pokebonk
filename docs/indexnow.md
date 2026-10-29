# Sitemap and IndexNow

The existing Sitemap is retained. `npm run build` now prepares SEO dates and a public `/seo-manifest.json`, then builds Next.js. Sitemap and IndexNow use the same canonical page list. The production origin is `https://pokebonkdb.org`.

## Normal use

Commit content changes as usual and let the connected Vercel project publish `main`. After a successful production deployment, `.github/workflows/indexnow.yml` submits only added, changed and deleted URLs. The first successful notification submits all current URLs. Local builds and Preview do not notify. No database, Bing API key, personal access token or custom GitHub Secret is required.

The verification key is public by design, stored in `scripts/indexnow/config.json` and its matching root text file. The notification checks the live key before submission. `200`/`202` means accepted, not guaranteed indexing.

## Dates and retries

Production builds read the last live manifest. The initial migration preserves dates from the existing live Sitemap. Network errors fail the preparation rather than pretending this is a new site. Local builds retain their own ignored baseline. Content changes receive dates; unchanged pages retain dates. Fingerprint-version mismatches require an explicit migration, not a full date reset.

Removed URLs leave Sitemap but remain in versioned deletion events until a complete notification acknowledges them. Restoring a URL cancels its old deletion; removing it again creates a new event. Partial failure does not advance the successful state. Historical deletion events remain in the production manifest so an expired Actions artifact can be recovered safely.

Successful notification manifests are Actions artifacts retained for 90 days, using built-in Actions permissions. If no retained state exists, current URLs and retained deletions are resubmitted without refreshing page dates. Use **Actions → IndexNow after production → Run workflow** on `main` to retry the current live version. No URL or token input is needed.

## Release order and activation

Vercel project `pokebonk` (`prj_rNtDi95m2VU0zjCj4mLSNJlcr9Jv`) is connected to `wanghuan072/pokebonk`, with a verified `pokebonkdb.org` custom domain and a production deployment from `main`. Build command was set to `npm run build`; automatic system deployment identifiers were enabled. Deployment protection remains enabled for Vercel domains and unchanged for the public custom domain.

The normal path uses the existing GitHub-to-Vercel production deployment. No build queue change is required for this integration. Notifications compare the currently published manifest with the last completely accepted record. Persisted deletion events cover successive builds; overlapping independently published builds can omit transient intermediate deletions, so this minimal integration does not promise delivery of every transient historical URL. Historical artifact promotion should be replaced by a fresh build when reliable content dates are required. The attempted queue change was rejected and was not applied; no concurrency or paid build feature was enabled.

The workflow must be committed to the GitHub default branch and the new key/manifest must be published once before live notifications can work. These local edits have not been pushed or deployed. The first real production-success event and IndexNow response remain to be verified after publication.

## Verification

`npm run test:indexnow` covers changes, unchanged dates, pending deletion, restoration and repeated deletion, expired state, partial-batch failure, version/host checks, untrusted/Preview/failed events, key identity, production identity and inherited dates. `npm run test:seo` checks route-local content fingerprints. Build-time preparation refuses newly added static pages with missing SEO registration rather than silently dropping them.
