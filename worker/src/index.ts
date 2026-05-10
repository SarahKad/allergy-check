// Transparent reverse proxy for Anthropic's Messages API.
//
// Clients send POST /v1/messages with the family code in `x-api-key`. We
// validate the code (constant-time), swap it for the real Anthropic key
// from secrets, and forward the request to api.anthropic.com.

interface Env {
  ANTHROPIC_API_KEY: string;
  FAMILY_CODE: string;
}

const UPSTREAM = 'https://api.anthropic.com';

// Headers we should not forward to upstream.
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'cf-connecting-ip',
  'cf-ipcountry',
  'cf-ray',
  'cf-visitor',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-real-ip',
]);

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function corsHeaders(): HeadersInit {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-api-key, anthropic-version',
    'access-control-max-age': '86400',
  };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders() },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return json(200, { ok: true });
    }

    if (req.method !== 'POST') {
      return json(405, { error: { type: 'method_not_allowed', message: 'Use POST.' } });
    }

    if (url.pathname !== '/v1/messages') {
      return json(404, { error: { type: 'not_found', message: 'Unknown path.' } });
    }

    if (!env.FAMILY_CODE || !env.ANTHROPIC_API_KEY) {
      return json(500, {
        error: { type: 'misconfigured', message: 'Server secrets not set.' },
      });
    }

    const provided = req.headers.get('x-api-key') ?? '';
    if (!timingSafeEqual(provided, env.FAMILY_CODE)) {
      return json(401, {
        error: { type: 'unauthorized', message: 'Invalid family code.' },
      });
    }

    const upstreamHeaders = new Headers();
    req.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) upstreamHeaders.set(key, value);
    });
    upstreamHeaders.set('x-api-key', env.ANTHROPIC_API_KEY);
    if (!upstreamHeaders.has('anthropic-version')) {
      upstreamHeaders.set('anthropic-version', '2023-06-01');
    }

    const upstreamReq = new Request(`${UPSTREAM}/v1/messages`, {
      method: 'POST',
      headers: upstreamHeaders,
      body: req.body,
    });

    const upstreamRes = await fetch(upstreamReq);

    const resHeaders = new Headers(upstreamRes.headers);
    for (const [k, v] of Object.entries(corsHeaders())) {
      resHeaders.set(k, v as string);
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  },
};
