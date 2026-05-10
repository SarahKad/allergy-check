# Allergy Check proxy (Cloudflare Worker)

Transparent reverse proxy for the Anthropic Messages API. The mobile app
sends its family code in `x-api-key`; the worker validates it and forwards
the request to `api.anthropic.com` using the real Anthropic key stored as a
Cloudflare secret. The real key never leaves this server.

## Deploy

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # paste your sk-ant-... key
npx wrangler secret put FAMILY_CODE         # e.g. lily-2026
npx wrangler deploy
```

After `deploy`, copy the printed `https://allergy-check-proxy.<sub>.workers.dev`
URL into `src/lib/config.ts` (`PROXY_URL`) in the app and rebuild.

## Smoke test

```bash
curl -i -X POST https://<your-worker-url>/v1/messages \
  -H "x-api-key: <FAMILY_CODE>" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "say hi"}]
  }'
```

A wrong code returns `401`. A missing secret returns `500`.

## Local dev

```bash
npx wrangler dev
# put dev secrets in a .dev.vars file (gitignored):
#   ANTHROPIC_API_KEY=sk-ant-...
#   FAMILY_CODE=lily-2026
```
