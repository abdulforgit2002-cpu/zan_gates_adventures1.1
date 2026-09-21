# Deployment

Every push to `main` builds the backend and frontend as Docker images,
pushes them to `ghcr.io/abdulforgit2002-cpu/zan-gates-backend` and
`ghcr.io/abdulforgit2002-cpu/zan-gates-frontend`, then SSHes into the server,
applies any new SQL files in `backend/migrations/`, and restarts the stack
(`.github/workflows/deploy.yml`). Postgres runs as its own container on a
named volume so data survives redeploys.

- Frontend → `zanzibargates.co.tz` (container listens on `:3016`;
  `www.zanzibargates.co.tz` redirects to it)
- Backend → `api.zanzibargates.co.tz` (container listens on `:8028`)

TLS and domain routing are handled by the system-level Caddy already running
on this box (`/etc/caddy/Caddyfile`), which is shared across all your other
projects and stays managed outside this repo's deploy pipeline. Nothing here
touches it. The existing `api.gatesofzanzibarsafaris.com` entry (unix
socket) is unrelated to this deploy and is left alone.

Add this block to `/etc/caddy/Caddyfile` once, by hand:

```caddy
# ── Zan Gates Adventures ─────────────────────────────────────────────────────
zanzibargates.co.tz {
    reverse_proxy http://127.0.0.1:3016
}
www.zanzibargates.co.tz {
    redir https://zanzibargates.co.tz{uri} permanent
}
api.zanzibargates.co.tz {
    reverse_proxy http://127.0.0.1:8028
}
```

`www` deliberately **redirects** instead of serving the site: search engines
must see exactly one hostname (the canonical tags, sitemaps and structured
data all use `https://zanzibargates.co.tz`). If you already added the earlier
version of this block that proxied both hostnames to the same port, replace it
with the one above.

Then reload Caddy: `sudo systemctl reload caddy`.

This is a one-time manual setup on the server (steps below), after which
every push to `main` deploys automatically.

## GitHub secrets required (this repo)

Add these under Settings → Secrets and variables → Actions, even if you're
reusing the same server/key pair as another project — secrets are per-repo:

- `SERVER_IP`
- `SERVER_USER`
- `SSH_PRIVATE_KEY` — private key whose matching public key is in this
  user's `~/.ssh/authorized_keys` on the server

No registry credential is needed — GHCR pulls are authenticated per-run
using the workflow's own `GITHUB_TOKEN`, which only lives for the run's
duration.

## One-time server setup

SSH into the server as the user matching `SERVER_USER`, then:

**1. Confirm Docker + Compose plugin are available** (already true if
other projects on this box run in Docker):

```bash
docker compose version
```

**2. Create the deploy directory:**

```bash
mkdir -p ~/zan-gates-deploy
cd ~/zan-gates-deploy
```

Copy [`.env.prod.example`](.env.prod.example) (in this repo) to
`~/zan-gates-deploy/.env` and fill in real values:

- `DB_NAME` / `DB_USER` — any names you like; the Postgres container is
  initialised with them on its first run
- `DB_PASSWORD` — a strong password; this is what the **new** Postgres
  container will be initialized with
- `JWT_SECRET` — at least 32 random characters
  (`python3 -c "import secrets; print(secrets.token_urlsafe(50))"`)
- `CORS_ALLOWED_ORIGIN` — already set correctly in the template
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` — the first admin
  login, auto-created on first deploy (see below) — pick a real password
  here, not the placeholder

This `.env` file is never touched by CI — it's server-only and stays put
across deploys.

**3. Database: fresh start, no Railway carry-over.**

The project previously ran on Railway, but its database was never captured
in git (`backend/migrations/` only had incremental `ALTER TABLE` scripts
layered on top of an undocumented base schema). Rather than depend on
dumping/restoring that Railway database, `backend/migrations/0000_base_schema.sql`
now reconstructs the full schema from scratch — `categories`, `destinations`,
`users` (admin accounts), `tours`, `tour_prices`, `tour_images`,
`booking_enquiries` — by reading every query the controllers actually run.
It was validated locally (a real Postgres instance, every migration file
applied in order, then re-applied a second time to confirm idempotency, then
every read/write query path in `TourController`, `AdminAuthController`, and
`BookingEnquiryController` run against the result) before being committed.

This means **the first deploy creates an entirely empty database** — no
sample tours, no admin login. Nothing to do here before the first deploy;
just create the admin account and content afterward (next section).

**4. Confirm DNS.** `zanzibargates.co.tz`, `www.zanzibargates.co.tz`, and
`api.zanzibargates.co.tz` all need A records pointing at this server's IP
for Caddy to issue Let's Encrypt certificates.

Ports `8028`/`3016` don't need to be opened to the public internet (Caddy
reaches them over `127.0.0.1`), matching how your other projects on this
box are set up.

## First deploy

Push to `main` (or run the workflow manually from the Actions tab —
`workflow_dispatch` is enabled). The deploy job checks `~/zan-gates-deploy/.env`
exists **and** that `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `JWT_SECRET` /
`ADMIN_USERNAME` / `ADMIN_PASSWORD` are non-blank before touching anything,
so a misconfigured server fails fast instead of starting a broken stack.

**The first admin account is created automatically.** After migrations
apply, the deploy runs `backend/scripts/seed_admin.php` (via
`docker compose run --rm backend php scripts/seed_admin.php`), which inserts
one row into `users` using `ADMIN_USERNAME`/`ADMIN_PASSWORD`/`ADMIN_FULL_NAME`
from `.env` — but only if `users` is currently empty, so it's a no-op on
every deploy after the first. Nothing to run by hand.

Log in at the admin panel with those credentials, then use it to add
categories, destinations, and tours — the site starts completely empty
otherwise. Categories and destinations are managed at `/admin/categories`
and `/admin/destinations`.

## What CI actually does (`.github/workflows/deploy.yml`)

1. **build-backend** / **build-frontend** — build each Dockerfile, push
   `:latest` and `:<commit-sha>` tags to GHCR. The frontend build bakes
   `VITE_API_BASE_URL=https://api.zanzibargates.co.tz/api` in at build time
   (Vite inlines env vars into the JS bundle, so this can't be a runtime
   var).
2. **deploy** — clears any previously-copied `backend/migrations/` on the
   server (so a file removed from the repo can't keep running from a stale
   copy), copies `docker-compose.prod.yml` and `backend/migrations/*.sql`
   fresh, then over SSH: validates `.env`, logs into GHCR using the run's
   own `GITHUB_TOKEN`, pulls the new images, brings up `db` and waits for
   it to be healthy, applies every `.sql` file in `backend/migrations/` via
   `psql`, seeds the first admin account if `users` is empty, then starts
   everything.

## SEO

The site is a React single-page app, which by default gives every URL the same
empty HTML — invisible to link previews (WhatsApp/Facebook/X) and slow for
search engines to understand. The stack fixes that without moving to a
different framework:

```
browser / Googlebot
      │
   Caddy ──► frontend container (nginx)
                ├─ real file (JS/CSS/images/robots.txt)  → served directly
                ├─ /sitemap*.xml                         → backend (built from the database)
                └─ any page URL                          → backend GET /seo/render
                        │  reads the built index.html + seo-data.json from this
                        │  container, looks the URL up in the database, and
                        │  returns the same HTML with that page's <title>,
                        │  description, canonical, Open Graph/Twitter tags,
                        │  JSON-LD, crawler-visible text and the real HTTP
                        │  status (404 for unknown/inactive tours and pages)
                        └─ backend slow/down/erroring → plain static index.html
                           (the site never depends on the SEO layer)
```

Rendered pages are cached by nginx for 5 minutes (404s for 1 minute, sitemaps
for 10) — so an edit in the admin panel reaches search engines within minutes,
and a frontend deploy starts with an empty cache.

**What each page gets**

| Page | Title / description | Structured data (JSON-LD) |
|---|---|---|
| Every page | unique title + description, canonical, Open Graph, Twitter card, robots | `TravelAgency` + `WebSite` (site-wide), `BreadcrumbList` |
| Tours | title, description with the real lowest price | `Product` + `TouristTrip` with `Offer`/`AggregateOffer` from the tour's prices |
| Destinations | destination description (admin-editable) | `TouristDestination`, `ItemList` of its tours |
| Hotels | from the hotel catalog | `Hotel` |
| Transfers / Weddings | real starting prices | `Service` + `AggregateOffer` |
| Booking, admin, empty destinations, 404s | — | `noindex` |

The static-page copy lives in one file, `frontend/src/seo/pages.json`; it is
used by the React app and (via the build-emitted `/seo-data.json`) by the
backend, so the two cannot drift. Tours, destinations and prices always come
from the database.

**Sitemaps** (all generated live, no file to maintain):
`/sitemap.xml` → index of `/sitemap-pages.xml`, `/sitemap-tours.xml` (active
tours only, with `<lastmod>` and their images), `/sitemap-destinations.xml`
(only destinations that have at least one active tour) and
`/sitemap-hotels.xml`. Add a tour or destination in the admin panel and it is
in the sitemap immediately. `robots.txt` points crawlers at it and blocks
`/admin`; the API host (`api.zanzibargates.co.tz`) serves `Disallow: /` and
sends `X-Robots-Tag: noindex`.

**Environment**: `SITE_URL` (optional, default `https://zanzibargates.co.tz`) in
the server `.env` sets the host used in canonicals, sitemaps and JSON-LD.

### After the first deploy — do these once

Ranking also depends on things no code can do for you. In order of impact:

1. **Google Search Console** → add the *Domain* property `zanzibargates.co.tz`
   (DNS TXT record), then *Sitemaps* → submit `https://zanzibargates.co.tz/sitemap.xml`.
   Use *URL Inspection → Request indexing* on the home page, `/tours`,
   `/safaris` and your top tours.
2. **Google Business Profile** for ZAN GATES Adventures (category "Tour
   operator"/"Travel agency", service area Zanzibar, your real phone and
   website, photos). This is the biggest lever for "tours in Zanzibar" style
   searches and the map pack.
3. **Bing Webmaster Tools** (can import the Search Console property).
4. **Verify the output** on a live tour URL:
   `curl -s https://zanzibargates.co.tz/tours/<slug> | grep -E "<title>|canonical|ld\+json"`
   and paste the URL into Google's *Rich Results Test*.
5. **Fill in the content** — this is what search engines actually rank:
   - every tour: a unique title, a 100–160 character *short description*, a
     long *description* (300+ words is a good target), real prices, and 5+
     photos each with **alt text** (it feeds image search and the sitemap)
   - every destination: a *description* (it becomes the page's intro text
     and its meta description)
   - use short, keyword-bearing slugs (`safari-blue-zanzibar`, not `tour-1`);
     never reuse or change a live slug — deactivate a tour instead of
     deleting it if you want to retire it (inactive tours return a proper 404)
6. **Reviews & links**: list the tours on TripAdvisor, Viator/GetYourGuide and
   local directories, and ask guests for Google/TripAdvisor reviews. Add
   `AggregateRating` structured data only once you have real reviews to
   show on the page — it is deliberately not included today.

### SEO — what is not covered (yet)

- **Multi-language search results.** Language switching uses the GTranslate
  widget, which translates in the visitor's browser; search engines never see
  German/French/Italian/Polish versions and there is no per-language URL to
  put `hreflang` on. Ranking in those markets needs real per-language URLs
  (e.g. `/de/tours/safari-blue`) using the tour translations that already
  exist in the database — a sizeable follow-up change to routing.
- **Ranking is not guaranteed.** This is the complete technical foundation;
  position #1 for competitive terms (Zanzibar tours, Safari Blue…) also needs
  content, backlinks, reviews and time.

## Known limitations (flagging, not fixed here)

- **`:latest` tag, no rollback tooling.** Every deploy overwrites `:latest`;
  the `:<sha>`-tagged image is also pushed, so a rollback is possible by
  hand (`docker compose -f docker-compose.prod.yml pull ghcr.io/abdulforgit2002-cpu/zan-gates-backend:<old-sha>`
  and re-tagging), but there's no one-command rollback yet.
- **Migrations must stay idempotent.** There's no migrations-tracking table
  (no framework), so every deploy re-runs every `.sql` file in
  `backend/migrations/`. All existing files already use
  `IF NOT EXISTS` / `ON CONFLICT ... DO UPDATE`; any new migration file must
  follow the same style or a redeploy will fail (or silently re-apply
  something destructive). Migration files are numbered (`0000_`, `0001_`, …)
  because they're applied in plain alphabetical glob order and some depend
  on tables created by an earlier file — keep new ones numbered after the
  last one.
- **No content carried over from Railway.** Tours, categories, destinations,
  and past booking enquiries that existed on Railway are gone from this
  deploy — only the schema was reconstructed, not the data. If any of that
  content is still needed, it has to be re-entered by hand through the admin
  panel.
