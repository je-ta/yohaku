// 計測用ビーコンと /admin だけを受ける Worker。
//
// 静的アセットは wrangler.toml の `run_worker_first` に載せていないので、
// HTML / CSS / 画像はこのスクリプトを通らずにエッジから直接返る。
// つまりページ表示のレイテンシは今までと変わらない。

interface D1Result<T> {
  results: T[];
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB: D1Database;
  /** Basic 認証のパスワード。未設定なら /admin は閉じる。 */
  ADMIN_PASS?: string;
}

interface ExecContext {
  waitUntil(promise: Promise<unknown>): void;
}

/** 1x1 の透明 GIF。ビーコンの応答はこれだけ。 */
const PIXEL = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  (c) => c.charCodeAt(0),
);

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|twitterbot|semrush|ahrefs|mj12|petalbot|bytespider|gptbot|claude|anthropic|ccbot|perplexity|headlesschrome/i;

const MOBILE_PATTERN = /iphone|ipod|android.*mobile|windows phone/i;

export default {
  async fetch(request: Request, env: Env, ctx: ExecContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/__a.gif') return handleBeacon(request, url, env, ctx);
    if (path === '/admin' || path.startsWith('/admin/')) return handleAdmin(request, env);

    // run_worker_first に載っていないパスはここへ来ないが、念のため素通しする。
    return env.ASSETS.fetch(request);
  },
} satisfies { fetch: (request: Request, env: Env, ctx: ExecContext) => Promise<Response> };

/** 計測ビーコン。記録は待たずに返し、書き込みは waitUntil に逃がす。 */
async function handleBeacon(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecContext,
): Promise<Response> {
  const headers = new Headers({
    'Content-Type': 'image/gif',
    // 同じ URL が再訪時にキャッシュされると 2 回目以降が記録されない。
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Length': String(PIXEL.length),
  });

  const visitor = readVisitor(request);
  if (visitor.setCookie) headers.set('Set-Cookie', visitor.setCookie);

  const response = new Response(PIXEL, { headers });

  if (!shouldCount(request)) return response;

  const pagePath = (url.searchParams.get('p') ?? '').slice(0, 512);
  if (!pagePath.startsWith('/')) return response;

  const referrer = externalReferrer(request, url);
  const country = (request as { cf?: { country?: string } }).cf?.country ?? '';
  const device = MOBILE_PATTERN.test(request.headers.get('User-Agent') ?? '')
    ? 'mobile'
    : 'desktop';

  const insert = env.DB.prepare(
    'INSERT INTO pageviews (ts, path, referrer, country, device, visitor) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(Date.now(), pagePath, referrer, country, device, visitor.id);

  ctx.waitUntil(insert.run().catch(() => undefined));
  return response;
}

/** 事前読み込みやボットは数えない。 */
function shouldCount(request: Request): boolean {
  if ((request.headers.get('Sec-Purpose') ?? '').includes('prefetch')) return false;
  if (request.headers.get('Purpose') === 'prefetch') return false;
  return !BOT_PATTERN.test(request.headers.get('User-Agent') ?? '');
}

/**
 * 訪問者 ID。初回にランダムな値を Cookie で配り、以後はそれを読む。
 * 個人を辿れる情報は持たない。
 */
function readVisitor(request: Request): { id: string; setCookie?: string } {
  const cookie = request.headers.get('Cookie') ?? '';
  const found = cookie.match(/(?:^|;\s*)_v=([0-9a-f]{16,32})/);
  if (found) return { id: found[1]! };

  const id = crypto.randomUUID().replace(/-/g, '');
  return {
    id,
    setCookie: `_v=${id}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
  };
}

/** 参照元は外部サイトだけ残す。自サイト内の遷移は空にする。 */
function externalReferrer(request: Request, url: URL): string {
  const raw = request.headers.get('Referer');
  if (!raw) return '';
  try {
    const ref = new URL(raw);
    if (ref.host === url.host) return '';
    return ref.host.slice(0, 200);
  } catch {
    return '';
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function handleAdmin(request: Request, env: Env): Promise<Response> {
  if (!env.ADMIN_PASS) {
    return new Response('ADMIN_PASS が未設定です。`wrangler secret put ADMIN_PASS` で設定してください。', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Basic ')) return unauthorized();

  let decoded = '';
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return unauthorized();
  }
  const split = decoded.indexOf(':');
  const user = split === -1 ? '' : decoded.slice(0, split);
  const pass = split === -1 ? '' : decoded.slice(split + 1);
  if (user !== 'admin' || !timingSafeEqual(pass, env.ADMIN_PASS)) return unauthorized();

  const { renderAdmin } = await import('./admin');
  const html = await renderAdmin(env.DB, new URL(request.url));
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function unauthorized(): Response {
  return new Response('認証が必要です。', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="log analytics", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
