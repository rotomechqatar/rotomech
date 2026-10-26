Next JS based application for displaying information on Rotomech - an oil and Gas Machinery supplying the company

## Running locally

```bash
npm install
npm run dev      # http://localhost:5000
npm run build    # production build (needs the variables below)
```

Create a `.env.local` file in the project root with the variables below. Never commit it.

## Environment variables

All of these are set in the Vercel project settings for production. `NEXT_PUBLIC_*` values are built into the browser bundle, so they must only ever be public keys.

| Variable | Used by | Purpose |
|---|---|---|
| `ADMIN_USERS` | `/api/login` | Admin panel logins as comma-separated `username:password` pairs, e.g. `alice:secret1,bob:secret2`. Every listed user can log in. |
| `ADMIN_SESSION_SECRET` | `/api/login`, middleware | Secret used to sign admin session cookies (HMAC-SHA256). Must be a random string of at least 32 characters, e.g. from `openssl rand -base64 48`. If it is missing or too short, admin login fails. Changing it logs out every admin. |
| `GITHUB_TOKEN` | all admin save routes, `/api/publish` | GitHub token with read/write access to this repository's contents. The admin panel saves content by committing to GitHub. |
| `GITHUB_OWNER` | same | GitHub account that owns the repository (e.g. `rotomechqatar`). |
| `GITHUB_REPO` | same | Repository name (`rotomech`). `owner/rotomech` or the full `https://github.com/...` URL also work. |
| `GITHUB_STAGING_BRANCH` | all admin save routes, `/api/publish` | Branch the admin panel saves to. **Must be set to `staging`.** If it is missing, most save routes fall back to `master` (edits go live without publishing) and a few fail. |
| `GITHUB_DEPLOY_BRANCH` | `/api/publish` | Branch Vercel deploys from. Defaults to `master`. |
| `R2_ACCOUNT_ID` | `/api/upload-cv` | Cloudflare account ID. Applicants' CVs from the careers forms are stored in Cloudflare R2. |
| `R2_ACCESS_KEY_ID` | `/api/upload-cv` | R2 API token access key (Object Read & Write, limited to the CV bucket). Secret: never prefix with `NEXT_PUBLIC_`. |
| `R2_SECRET_ACCESS_KEY` | `/api/upload-cv` | R2 API token secret key. Secret. |
| `R2_BUCKET` | `/api/upload-cv` | R2 bucket name (`rotomech-forms`). |
| `R2_PUBLIC_URL` | `/api/upload-cv` | Public URL of the bucket (`https://rotomech.digimaxqatar.com`). The CV link in each application email starts with it. |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | contact and careers forms | EmailJS public key. |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | contact and careers forms | EmailJS service ID. |
| `NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID` | contact form | EmailJS template for contact messages. |
| `NEXT_PUBLIC_EMAILJS_CAREERS_TEMPLATE_ID` | careers form | EmailJS template for job applications. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | contact and careers forms | Google reCAPTCHA v2 site key. |

## How admin edits reach the live site (staging → publish)

Site content lives in `src/data/*.json` and images in `public/`. There is no database: the admin panel edits these files through the GitHub API.

1. **Save.** Each save in the admin panel (`/admin`) commits the changed JSON file or image to the `staging` branch. Vercel does not deploy `staging` (see `vercel.json`), so nothing changes on the live site yet.
2. **Publish.** The **Publish** button calls `/api/publish`, which merges `staging` into `master`. If there is nothing new to publish, it reports success and does nothing.
3. **Deploy.** The push to `master` triggers a Vercel production build. Changes are live once that build finishes (usually a few minutes).
4. **Reset.** After the merge, `staging` is reset to match `master`, ready for the next round of edits.

Because content is committed to `master` by the admin panel, developers should merge code changes into `master` only when `staging` has no unpublished edits (`git log origin/master..origin/staging` is empty), so the next publish does not conflict.

## CV uploads

The careers forms send the CV to `/api/upload-cv`, which stores it in the R2 bucket under `cv/` with a random file name and returns its public URL. EmailJS then emails that link, not the file. CVs are limited to 4 MB (PDF, DOC or DOCX) because Vercel rejects larger request bodies.
