# Custom domain: videoads.abhishekjha.com

Point the Vercel project **11s-ads** (repo: [11s-ads-portfolio](https://github.com/helloAbhishekJha/11s-ads-portfolio)) at a subdomain of **abhishekjha.com** so DMs and profiles can use a branded URL. The default host `11s-ads.vercel.app` keeps working via **301 redirect** to the custom domain (see root `vercel.json`).

**Recommended primary subdomain:** `videoads.abhishekjha.com` — reads clearly for paid-social / performance work and still fits OTT-style films and longer cuts on the same page.

## Alternate subdomains (pick one if you prefer)

| Subdomain | One-line pro |
|-----------|----------------|
| **motion.abhishekjha.com** | Broad “motion design / video” — less ad-specific, good if films dominate later. |
| **watch.abhishekjha.com** | Simple CTA (“go watch”) — great for link-in-bio; weaker SEO signal for “ads”. |
| **reels.abhishekjha.com** | Matches short vertical format — can sound social-only, less natural for long-form OTT. |

**Why videoads:** Your outbound DMs emphasize AI ad work; the site also lists series and brand films. `videoads` signals commercial creative without locking you to exactly 11 seconds.

---

## 1. Vercel — add the domain

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → project **11s-ads** (or the name you used when linking this repo).
2. **Settings** → **Domains**.
3. Add **`videoads.abhishekjha.com`**.
4. Vercel shows required DNS records (usually a **CNAME**). Leave this tab open.

Optional: keep **`11s-ads.vercel.app`** listed as a domain on the project so the redirect in `vercel.json` can run; you do not need to remove it.

5. After DNS propagates, Vercel issues TLS automatically. Set **videoads.abhishekjha.com** as **Primary** if the UI offers it.

## 2. DNS at your registrar

At whoever hosts DNS for **abhishekjha.com** (registrar or Cloudflare, etc.):

| Type | Name / host | Value | TTL |
|------|-------------|-------|-----|
| **CNAME** | `videoads` | `cname.vercel-dns.com` | 300–3600 (or Auto) |

Notes:

- Some panels want **Host** = `videoads`; others want the full name `videoads.abhishekjha.com` — both mean the same record.
- If Vercel instead shows an **A** record to `76.76.21.21`, use that — follow the dashboard for this project.
- **Do not** commit API tokens or zone IDs to git.

Propagation is often 5–30 minutes; global DNS can take up to 48 hours.

## 3. Verify

1. `https://videoads.abhishekjha.com` loads the portfolio (padlock valid).
2. `https://11s-ads.vercel.app` **301** redirects to `https://videoads.abhishekjha.com/` (same path).
3. Spot-check a sample video: `https://videoads.abhishekjha.com/samples/MVP-1-hero.mp4`.

## 4. After go-live

- Update LinkedIn **Featured** and new DMs to `https://videoads.abhishekjha.com` (old `11s-ads.vercel.app` links still work via redirect).
- Chroma / contest forms: use the custom URL when they ask for a portfolio site.

## Troubleshooting

| Issue | Check |
|-------|--------|
| “Invalid configuration” in Vercel | CNAME points to `cname.vercel-dns.com` with no typo; no conflicting A record on same host. |
| SSL pending | Wait for DNS green check in Vercel; avoid orange-cloud proxy quirks (Cloudflare: often “DNS only” until verified). |
| Redirect loop | Ensure only one canonical host; `vercel.json` redirect targets `videoads.abhishekjha.com`. |

---

*Repo path (monorepo mirror): `portfolio/11s-ads` · Live (until DNS): https://11s-ads.vercel.app*
