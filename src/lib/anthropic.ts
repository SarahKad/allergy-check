import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, CheckKind, Mode } from '../skill/skillPrompt';
import { getApiKey } from './secureKey';

export type Verdict = 'safe' | 'caution' | 'unsafe';

export type Finding = {
  level: 'ok' | 'warn' | 'bad';
  title: string;
  detail: string;
};

export type CheckResult = {
  verdict: Verdict;
  headline: string;
  summary: string;
  findings: Finding[];
  modifications: string | null;
  encouragement: string | null;
};

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Anthropic API key configured.');
    this.name = 'MissingApiKeyError';
  }
}

const MODEL = 'claude-sonnet-4-6';

async function getClient(): Promise<Anthropic> {
  const key = await getApiKey();
  if (!key) throw new MissingApiKeyError();
  return new Anthropic({
    apiKey: key,
    // SDK refuses to run in browser-like envs (incl. React Native) without
    // this flag. The key lives in SecureStore on device, so direct calls are
    // acceptable for a family-distributed app.
    dangerouslyAllowBrowser: true,
  });
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  // Strip code fences if the model added them anyway.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Otherwise grab the first {...} block.
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function parseResult(text: string): CheckResult {
  const json = extractJson(text);
  const obj = JSON.parse(json);
  const verdict: Verdict =
    obj.verdict === 'safe' || obj.verdict === 'caution' || obj.verdict === 'unsafe'
      ? obj.verdict
      : 'caution';
  return {
    verdict,
    headline: String(obj.headline ?? ''),
    summary: String(obj.summary ?? ''),
    findings: Array.isArray(obj.findings)
      ? obj.findings
          .filter((f: unknown): f is Finding => !!f && typeof f === 'object')
          .map((f: any) => ({
            level: f.level === 'ok' || f.level === 'warn' || f.level === 'bad' ? f.level : 'warn',
            title: String(f.title ?? ''),
            detail: String(f.detail ?? ''),
          }))
      : [],
    modifications:
      typeof obj.modifications === 'string' && obj.modifications.trim() !== ''
        ? obj.modifications
        : null,
    encouragement:
      typeof obj.encouragement === 'string' && obj.encouragement.trim() !== ''
        ? obj.encouragement
        : null,
  };
}

export async function checkLabelImage(opts: {
  mode: Mode;
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  notes?: string;
}): Promise<CheckResult> {
  const client = await getClient();
  const system = buildSystemPrompt(opts.mode, 'label');

  const userText =
    (opts.notes && opts.notes.trim()) ||
    'Please check this ingredient label and tell me if it is safe.';

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: opts.mediaType,
              data: opts.base64,
            },
          },
          { type: 'text', text: userText },
        ],
      },
    ],
  });

  const textBlock = response.content.find((c) => c.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Empty response from Claude.');
  }
  return parseResult(textBlock.text);
}

export async function checkRestaurantItem(opts: {
  mode: Mode;
  restaurant?: string;
  dish: string;
}): Promise<CheckResult> {
  const client = await getClient();
  const system = buildSystemPrompt(opts.mode, 'restaurant');

  const lines = [
    opts.restaurant ? `Restaurant: ${opts.restaurant}` : null,
    `Dish: ${opts.dish}`,
    '',
    'Please tell me whether this dish is safe, and if not, suggest a simple modification if possible.',
  ].filter(Boolean);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: lines.join('\n') }],
  });

  const textBlock = response.content.find((c) => c.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Empty response from Claude.');
  }
  return parseResult(textBlock.text);
}
