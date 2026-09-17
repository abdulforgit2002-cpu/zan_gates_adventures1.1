# Deployment

Every push to `main` builds the backend and frontend as Docker images,
pushes them to `ghcr.io/abdulforgit2002-cpu/zan-gates-backend` and
`ghcr.io/abdulforgit2002-cpu/zan-gates-frontend`, then SSHes into the server,
applies any new SQL files in `backend/migrations/`, and restarts the stack
(`.github/workflows/deploy.yml`). Postgres runs as its own container on a
named volume so data survives redeploys.

- Frontend → `zanzibargates.co.tz` / `www.zanzibargates.co.tz` (container
  listens on `:3016`)
- Backend → `api.zanzibargates.co.tz` (container listens on `:8028`)

TLS and domain routing are handled by the system-level Caddy already running
on this box (`/etc/caddy/Caddyfile`), which is shared across all your other
projects and stays managed outside this repo's deploy pipeline. Nothing here
touches it. The existing `api.gatesofzanzibarsafaris.com` entry (unix
socket) is unrelated to this deploy and is left alone.

Add this block to `/etc/caddy/Caddyfile` once, by hand:

```caddy
# ── Zan Gates Adventures ─────────────────────────────────────────────────────
zanzibargates.co.tz, www.zanzibargates.co.tz {
    reverse_proxy http://127.0.0.1:3016
}
api.zanzibargates.co.tz {
    reverse_proxy http://127.0.0.1:8028
}
```

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

- `DB_NAME` / `DB_USER` — pick values matching whatever you use for the
  restored database (see step 3)
- `DB_PASSWORD` — a strong password; this is what the **new** Postgres
  container will be initialized with
- `JWT_SECRET` — at least 32 random characters
  (`python3 -c "import secrets; print(secrets.token_urlsafe(50))"`)
- `CORS_ALLOWED_ORIGIN` — already set correctly in the template

This `.env` file is never touched by CI — it's server-only and stays put
across deploys.

**3. Migrate the database off Railway.**

The real schema (tours, categories, destinations, booking_enquiries, admin
accounts, etc.) currently only exists in your Railway Postgres instance —
`backend/migrations/` only has incremental `ALTER TABLE` scripts layered on
top of it, not a base schema. Dump it from Railway and restore it into the
new container:

```bash
# From your machine, using the connection string from the Railway dashboard
# (Postgres service → Connect → "Postgres Connection URL"):
pg_dump --no-owner --no-privileges "postgres://USER:PASSWORD@HOST:PORT/DBNAME" \
  > zan_gates_dump.sql
```

Copy the dump to the server, then, after the deploy directory and `.env`
exist (step 2) but **before the first deploy runs**, bring up just the
database container and restore into it:

```bash
scp zan_gates_dump.sql your-server:~/zan-gates-deploy/
ssh your-server
cd ~/zan-gates-deploy

# Bring up an empty db container using the values in .env
docker compose -f docker-compose.prod.yml up -d db

# Wait for it to report healthy, then restore
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U "$DB_USER" -d "$DB_NAME" < zan_gates_dump.sql
```

Existing admin login credentials come across with the dump — no need to
create a new admin user. Once this is done, `backend/migrations/*.sql` are
safe to (re-)apply on top, since they're all written with
`IF NOT EXISTS` / `ON CONFLICT ... DO UPDATE` — CI re-applies all of them on
every deploy, which is a no-op once already applied. Keep any future
migration files idempotent the same way.

**4. Confirm DNS.** `zanzibargates.co.tz`, `www.zanzibargates.co.tz`, and
`api.zanzibargates.co.tz` all need A records pointing at this server's IP
for Caddy to issue Let's Encrypt certificates.

Ports `8028`/`3016` don't need to be opened to the public internet (Caddy
reaches them over `127.0.0.1`), matching how your other projects on this
box are set up.

## First deploy

Push to `main` (or run the workflow manually from the Actions tab —
`workflow_dispatch` is enabled). The deploy job checks `~/zan-gates-deploy/.env`
exists **and** that `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `JWT_SECRET` are
non-blank before touching anything, so a misconfigured server fails fast
instead of starting a broken stack.

## What CI actually does (`.github/workflows/deploy.yml`)

1. **build-backend** / **build-frontend** — build each Dockerfile, push
   `:latest` and `:<commit-sha>` tags to GHCR. The frontend build bakes
   `VITE_API_BASE_URL=https://api.zanzibargates.co.tz/api` in at build time
   (Vite inlines env vars into the JS bundle, so this can't be a runtime
   var).
2. **deploy** — copies `docker-compose.prod.yml` and
   `backend/migrations/*.sql` to `~/zan-gates-deploy/` on the server, then
   over SSH: validates `.env`, logs into GHCR using the run's own
   `GITHUB_TOKEN`, pulls the new images, brings up `db` and waits for it to
   be healthy, applies every `.sql` file in `backend/migrations/` via
   `psql`, then starts everything.

## Known limitations (flagging, not fixed here)

- **`:latest` tag, no rollback tooling.** Every deploy overwrites `:latest`;
  the `:<sha>`-tagged image is also pushed, so a rollback is possible by
  hand (`docker compose -f docker-compose.prod.yml pull ghcr.io/abdulforgit2002-cpu/zan-gates-backend:<old-sha>`
  and re-tagging), but there's no one-command rollback yet.
- **Migrations must stay idempotent.** There's no migrations-tracking table
  (no framework), so every deploy re-runs every `.sql` file in
  `backend/migrations/`. All three existing files already use
  `IF NOT EXISTS` / `ON CONFLICT ... DO UPDATE`; any new migration file must
  follow the same style or a redeploy will fail (or silently re-apply
  something destructive).
