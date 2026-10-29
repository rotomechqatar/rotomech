# Rotomech Website: Maintenance Audit Report

**Date:** 11 October 2026
**Scope:** Admin panel save/publish reliability, security and dependency health. No UI or feature changes.

---

## 1. Summary

The admin panel's publish pipeline works. Saves are committed to the `staging` branch, **Publish** merges them into `master`, and Vercel redeploys. The two branches are currently in sync.

The changes that "did not go live" were saved under the wrong location in the content files. The publish step deployed them correctly, but the live pages read their content from a different location, so the visitor never saw the new value. Four admin fields are affected. The maintenance backlog also includes outdated packages with known security advisories and a weak admin login check.

---

## 2. Admin panel defects (cause of "changes not applying")

| # | Area | What happens | Evidence |
|---|------|--------------|----------|
| A1 | **About Us → Director name & title** | The admin sends the section name `"teamInfo.director"` as one literal key. The save creates a new top-level entry called `teamInfo.director` instead of updating `teamInfo → director`. The live page reads `teamInfo.director.name`, which has never changed. | `src/app/admin/about/page.js:207,215`. Live page still shows **"Lorem Ipsum"** as the director's name. Commits 56425cc, 25e38a5, f707dcc, 5b8b784, 651f3e8 all wrote to the wrong key. |
| A2 | **Contact Us → Intro heading & text** | The admin saves to `contact.head` / `contact.text`. The live page reads the top-level `head` / `text`. Edits are stored but never shown. | `src/app/admin/contact/page.js:185-194` vs `src/components/contact-us/PageIntro.js:12-13` |
| A3 | **Products & Partners → Partner name & description** | The partner index is passed to the editor but dropped when the save request is built. Any edit writes `partners.name` / `partners.description` instead of updating the chosen partner. A save here would also add a broken entry to the partner list. | `src/app/admin/products-partners/page.js:651-659` and `:604` |
| A4 | **About Us → CTA tagline** | This field can be edited in the admin, but the live CTA component never renders it. | `src/components/about-us/CTA.js` (only renders `head` and `text`) |

Other admin issues found:

| # | Issue | Impact |
|---|-------|--------|
| A5 | **Publish shows an error when there is nothing new to publish.** GitHub answers "already up to date" with an empty response, and the code still tries to read it as JSON. | The admin sees "Error publishing" even though nothing is broken. This is confusing and may lead to repeated clicks. |
| A6 | **Careers page would break the site build if every job is deleted.** The empty-state message renders the whole `noJobs` object instead of `noJobs.message`. | If all vacancies are removed, the Vercel build fails and **no later publish goes live** until a job is added back. |
| A7 | After a save, the admin screen for A1/A2 shows the old value again when reloaded. | The client thinks the save failed and retries. Several "no change" commits in the history (2984a04, f8375e4, c351423, 055704b) are consistent with this. |
| A8 | Leftover test content is live: a **"testing"** job on Careers, and placeholder `sample.jpg` product images on 5 partners. | Content cleanup needed on the live site. |

Note: the homepage alt-text edit (61f449f, "Rotomech-supplierss") **did** go live. Alt text is not visible on the page, so it can look as if nothing changed.

---

## 3. Security and maintenance tasks

| # | Task | Priority |
|---|------|----------|
| M1 | **Upgrade Next.js 15.2.8 → latest 15.5.x patch.** The installed version has a *critical* security advisory. The same upgrade also fixes advisories in bundled `postcss` and `sharp`. | High |
| M2 | **Fix the admin authentication check.** The middleware only checks that an `auth-token` cookie *exists*, and its value is the fixed string `"authenticated"`. Anyone can create that cookie and reach the admin APIs, including content editing and publishing. Replace it with a signed or verified session token. | High |
| M3 | **Remove `npm` from the app dependencies.** It was added by mistake and accounts for most of the 26 audit findings (2 critical, 15 high), including `tar`, `glob` and `minimatch`. | High |
| M4 | Update `@supabase/supabase-js` (low-severity auth advisory) and run `npm audit fix` for the remaining transitive packages (`ws`, `nanoid`, etc.). | Medium |
| M5 | Align `eslint-config-next` (15.2.3) with the Next.js version, and migrate off `next lint`, which is deprecated. | Low |
| M6 | **GitHub Action (Supabase keep-alive):** update `actions/checkout@v3` and `setup-node@v3` to v4 and replace the deprecated `::set-output` syntax. Otherwise the job will stop running, and the free-tier Supabase project (used for CV uploads) will pause. | Medium |
| M7 | Move the Supabase URL and key out of `script/upload.js` and `script/delete.js` (currently hard-coded in the repo) into GitHub Actions secrets. | Medium |
| M8 | Remove about 190 debug `console.log` lines in the API routes. Some print full file contents and request payloads into the production logs. | Low |
| M9 | Replace deprecated `next/image` props (`layout="fill"`, `objectFit`) in the 5 admin pages. | Low |
| M10 | Remove unused assets: `banner-image-1.webp`, `products/test4.webp`, `qatar-image-2/3/7/9.webp`. | Low |
| M11 | Add documentation to the README covering the required environment variables and the staging → publish workflow. | Low |

---

## 4. Suggested billing breakdown (estimates)

| Item | Est. effort |
|------|-------------|
| Admin save-path fixes (A1–A4) and data cleanup of stray keys | 2–3 h |
| Publish error handling and Careers build-safety (A5–A7) | 1 h |
| Test content cleanup (A8) | 0.5 h |
| Framework and security updates, plus regression testing (M1, M3, M4, M5) | 2–3 h |
| Admin authentication hardening (M2) | 2 h |
| CI workflow and secrets housekeeping (M6, M7) | 1 h |
| Code hygiene: logging, deprecated props, unused assets, docs (M8–M11) | 1–1.5 h |
| **Total** | **≈ 9.5–12 h** |

---

## 5. Work completed (12 October 2026)

All work is on branch `maintenance/2026-10` (9 commits on top of `master` at `c795d79`). It is not yet merged or deployed, so the live site is unchanged until then.

| # | Status | What was done |
|---|--------|---------------|
| A1 | ✅ Done | Dotted sections (`teamInfo.director`) now save as nested JSON. |
| A2 | ✅ Done | Contact intro heading/text now save to the top-level `head` / `text` the page reads. |
| A3 | ✅ Done | Partner edits now include the partner number (`partners → "3" → name`). |
| A4 | ⬜ Open | Not in this round. The CTA tagline is still editable but not shown. |
| A5 | ✅ Done | "Already up to date" (GitHub 204) is now treated as a successful publish. |
| A6 | ✅ Done | The empty-jobs message renders `noJobs.message`; deleting every job no longer breaks the build. |
| A7 | ✅ Done | Resolved by A1/A2 plus removal of the stray `teamInfo.director` and duplicate `contact` keys. |
| A8 | 🟡 Partial | The director's name is now **Khalid Ahmed Usmani** (the value the client had tried to save). The "testing" job and `sample.jpg` product images are still live. |
| M1 | ✅ Done | Next.js 15.2.8 → **15.5.27**. |
| M2 | ⬜ **Open (High)** | Admin authentication is unchanged. This is the most important remaining item. |
| M3 | ✅ Done | `npm` removed from dependencies. |
| M4 | ✅ Done | `@supabase/supabase-js` → **~2.109.0**, and `npm audit fix` (no `--force`) applied. 2.109 is the newest release that still supports Node 20, which the CI job uses; 2.110+ requires Node 22. |
| M5 | 🟡 Partial | `eslint-config-next` aligned to 15.5.27. The move off `next lint` is not done. |
| M6 | ✅ Done | Workflow uses `checkout@v4`, `setup-node@v4` and `$GITHUB_OUTPUT`. Schedule and logic unchanged. |
| M7 | ⬜ Open | Supabase URL/key are still hard-coded in `script/`. |
| M8 | ✅ Done | All 190 `console.log` statements removed from `src/app/api` (336 lines). All 74 `console.error` calls kept. |
| M9 | ⬜ Open | Deprecated `next/image` props in the admin pages are unchanged. |
| M10 | ✅ Done | The 6 unused images deleted (≈ 4.5 MB). |
| M11 | ✅ Done | README now documents every environment variable, the staging → publish flow and the scheduled job. |

**Security audit:** 43 findings (2 critical, 28 high) → **9 (0 critical)**. The 9 left need breaking upgrades: 8 are in the development-only ESLint toolchain, and 1 is the copy of `postcss` bundled inside Next.js 15 (fixed in Next 16).

### Verification

- **Build:** clean at every phase. The only warning is the pre-existing `<img>` warning in `Footer.js`. All public pages are still pre-rendered as static pages.
- **Admin saves:** every new save payload was run through the site's own merge code against copies of the content files. Only the intended field changed each time. Sections without a dot produce exactly the same payload as before.
- **Publish:** with GitHub's responses simulated, a 204 now succeeds. Merged (201), conflict (409) and missing-branch (404) responses behave exactly as before.
- **Public pages (all 5):** compared with the original site, the `<head>`, meta tags, text, class names and image sources are identical. The only differences are the intended director name, and an empty hidden `<div>` that Next.js 15.5 adds to every page (not displayed; accepted).
- **Layout and screenshots (desktop 1440 px and mobile 375 px):** identical apart from carousels caught at a different moment and reCAPTCHA's per-load token. Page heights match.
- **Animations and carousels**, checked with the page visible:
  - The partner wheel cycles every partner with the correct name, description and images.
  - The About and Contact image carousels rotate through their configured images.
  - The home logo sliders advance and pause on hover.
  - The Our Legacy images rotate.
  - The mobile menu opens and navigates.
- **Forms:** the Contact and Careers forms load with the same fields as before, and reCAPTCHA renders. No EmailJS or Supabase errors. Nothing was submitted.
- **API log removal:** each changed file was parsed before and after. With the `console.log` statements dropped, the syntax trees are identical, so no logic changed.
- **Phase 3b/3c:** the browser receives byte-identical JS and CSS to the verified upgrade build.

### Deployment notes

- `staging` and `master` were both at `c795d79` on 12 October, so there were no unpublished admin edits. Merge while that is still true, or merge `staging` in first.
- After the merge, run the "Image Editor" workflow once from GitHub → Actions to confirm the CI change. It performs a real Supabase upload or delete, as it does every 3 days.
- Careers and Contact load about 28 kB more JavaScript (245 → 273 kB), mostly from the newer Supabase client.

---

## 6. New findings during the maintenance work (not fixed)

| # | Finding | Suggested priority |
|---|---------|--------------------|
| N1 | If `GITHUB_STAGING_BRANCH` is ever unset, 15 save routes fall back to `master` (edits go live without publishing) and 3 others fail. Publish assumes `staging`. The README now says it must be set; the defaults should be made consistent. | Medium |
| N2 | `/contact-us` uses the Products & Partners page title, description and keywords (copied metadata), which hurts search results for the contact page. | Medium |
| N3 | Broken links: the home CTA links to `/contact` (404; the page is `/contact-us`), and the footer on every page links to `/clients` (404; set in `src/data/footer.json`). | Medium |
| N4 | Partner 2 (BAI Brescia) uses `/logos/partnerLogo2.webp`, which does not exist, so its logo shows as broken. | Medium |
| N5 | Partners 7 and 8 are duplicate entries for "Del PD Pumps & Gears" (one with a trailing space), and both use partner 1's logo. | Low |
| N6 | The "Our Legacy" images on the home page declare a 500×500 size but are not square, so the section's height jumps as they load (layout shift). | Low |
| N7 | `console.log` calls remain outside the API routes. For example, `about-us/TeamSection.js` prints the team data during every build, and `careers/Jobs.js` logs each job click in visitors' browsers. | Low |
| N8 | `actions/checkout` and `setup-node` v5 (Node 24 runtime) are now available. v4 works, but a future one-line bump is advisable. | Low |
| N9 | `/api/getContent/[page]` (used only by the 5 admin editors) answers with `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. The browser reuses that cached answer, so reloading an admin page right after a save can show the **old** value. On Vercel, the CDN can also serve it for up to about 6 minutes. Saves themselves are correct, because the save route always reads fresh from GitHub. This is the most likely remaining cause of A7 ("save looks like it failed"). **✅ Fixed in `474d648`:** the route now sends `no-store`. Verified locally: a reload right after a save shows the new value, fetched from the server rather than the cache. | Medium |

---

## 7. Developer credit in the browser console (12 October 2026)

Commit `5f75264` adds one inline `<script>` at the end of the root layout. It logs `Designed and developed by Melvin Prince - melvinprince.io` once per page load, on every public and admin page and on the 404 page.

- No extra request, no new JS chunk. Route sizes in the build output are unchanged.
- Rendered markup, `<head>` and meta tags are identical on all 5 public pages. The only change is +239 bytes of HTML (uncompressed) per page.
- No new console warnings or hydration errors.

### Admin end-to-end check (local, GitHub mocked)

The production build was run with GitHub's API replaced by a local copy of the repository, so nothing was sent to GitHub. The following were exercised through the admin UI:

- Login: wrong credentials rejected, correct ones accepted.
- About → Director name: only `teamInfo.director.name` changed.
- Contact → intro heading: only top-level `head` changed.
- Products & Partners → partner 3 name: only `partners.3.name` changed.
- Publish: "already up to date" (204) shows success, merged (201) shows success, and conflict (409) shows the error as before.
- Home, Careers and the dashboard load their content.

Image uploads were not exercised in the browser. Their routes only lost `console.log` lines, which were checked syntax-tree-identical in Phase 3c.
