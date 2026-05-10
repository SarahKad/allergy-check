// Single point of configuration for the backend proxy. After deploying the
// Cloudflare Worker, replace this URL with the printed `*.workers.dev`
// address (or your custom domain). The trailing path-without-slash is
// important: the Anthropic SDK appends `/v1/messages` itself.
export const PROXY_URL = 'https://allergy-check-proxy.example.workers.dev';

// The model the app asks the proxy to forward to. Keep in one place so it's
// easy to bump.
export const MODEL = 'claude-sonnet-4-6';
