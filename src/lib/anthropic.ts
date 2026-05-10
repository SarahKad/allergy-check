import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, CheckKind, Mode } from '../skill/skillPrompt';
import { getFamilyCode } from './secureKey';
import { MODEL, PROXY_URL } from './config';
import { Profile } from './profile';

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

export class MissingFamilyCodeError extends Error {
  constructor() {
    super('No family code configured.');
    this.name = 'MissingFamilyCodeError';
  }
}

async function getClient(): Promise<Anthropic> {
  const code = await getFamilyCode();
  if (!code) throw new MissingFamilyCodeError();
  // The SDK sends `apiKey` as `x-api-key` to `${baseURL}/messages`. Our
  // proxy validates it as the family code, then swaps in the real key
  // server-side. The Anthropic key never leaves the worker.
  return new Anthropic({
    apiKey: code,
    baseURL: PROXY_URL,
    dangerouslyAllowBrowser: true,
  });
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
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
  profile: Profile;
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  notes?: string;
}): Promise<CheckResult> {
  const client = await getClient();
  const system = buildSystemPrompt(opts.mode, 'label', opts.profile);

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
  profile: Profile;
  restaurant?: string;
  dish: string;
}): Promise<CheckResult> {
  const client = await getClient();
  const system = buildSystemPrompt(opts.mode, 'restaurant', opts.profile);

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
