# Garuda Global Leaderboard

Garuda's GitHub Pages build is static, so the global leaderboard needs a small
server API. This folder contains a Cloudflare Worker plus a D1 schema.

## Deploy

1. Install Wrangler and log in:

```bash
npm install -g wrangler
wrangler login
```

2. Create the D1 database:

```bash
wrangler d1 create garuda_leaderboard
```

3. Copy `cloudflare/wrangler.toml.example` to `wrangler.toml`, then paste the
   generated `database_id`.

4. Apply the schema:

```bash
wrangler d1 execute garuda_leaderboard --file=cloudflare/schema.sql
```

5. Deploy the Worker:

```bash
wrangler deploy
```

6. Copy the Worker URL into `index.html`:

```html
<script>
window.GARUDA_LEADERBOARD_API = 'https://garuda-leaderboard.your-name.workers.dev';
</script>
```

When the API URL is empty or unavailable, the game falls back to the local
browser leaderboard.
