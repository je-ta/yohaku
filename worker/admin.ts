// /admin の集計画面。すべて Worker 側で HTML を組み立て、SVG グラフも
// サーバーで描く。管理画面なのでサイト本体のクライアント JS ゼロは崩さない。

interface D1Result<T> {
  results: T[];
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

type Range = 7 | 30 | 90;

interface DailyRow {
  day: string;
  views: number;
  visitors: number;
}

interface PathRow {
  path: string;
  views: number;
  visitors: number;
}

interface RefRow {
  referrer: string;
  views: number;
}

interface BreakdownRow {
  key: string;
  views: number;
}

const RANGES: Range[] = [7, 30, 90];

/** 日本時間に寄せる。D1 には epoch ミリ秒で入っている。 */
const DAY_MS = 86_400_000;
const JST_OFFSET = 9 * 60 * 60 * 1000;

function dayKey(ms: number): string {
  return new Date(ms + JST_OFFSET).toISOString().slice(0, 10);
}

export async function renderAdmin(db: D1Database, url: URL): Promise<string> {
  const requested = Number(url.searchParams.get('range'));
  const range: Range = RANGES.includes(requested as Range) ? (requested as Range) : 30;

  const now = Date.now();
  // 集計の起点は「今日（日本時間）の 0 時」から range 日ぶん遡った日。
  // 日別のグラフと合計がずれないよう、両方をこの起点に揃える。
  const todayStart = Math.floor((now + JST_OFFSET) / DAY_MS) * DAY_MS - JST_OFFSET;
  const since = todayStart - (range - 1) * DAY_MS;
  const prevSince = since - range * DAY_MS;

  const [daily, paths, refs, countries, devices, prevTotals, total, periodUnique] = await Promise.all([
    db
      .prepare(
        `SELECT strftime('%Y-%m-%d', (ts + ?) / 1000, 'unixepoch') AS day,
                COUNT(*) AS views,
                COUNT(DISTINCT visitor) AS visitors
           FROM pageviews
          WHERE ts >= ?
          GROUP BY day
          ORDER BY day`,
      )
      .bind(JST_OFFSET, since)
      .all<DailyRow>(),
    db
      .prepare(
        `SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
           FROM pageviews
          WHERE ts >= ?
          GROUP BY path
          ORDER BY views DESC
          LIMIT 20`,
      )
      .bind(since)
      .all<PathRow>(),
    db
      .prepare(
        `SELECT referrer, COUNT(*) AS views
           FROM pageviews
          WHERE ts >= ? AND referrer <> ''
          GROUP BY referrer
          ORDER BY views DESC
          LIMIT 10`,
      )
      .bind(since)
      .all<RefRow>(),
    db
      .prepare(
        `SELECT country AS key, COUNT(*) AS views
           FROM pageviews
          WHERE ts >= ? AND country <> ''
          GROUP BY country
          ORDER BY views DESC
          LIMIT 8`,
      )
      .bind(since)
      .all<BreakdownRow>(),
    db
      .prepare(
        `SELECT device AS key, COUNT(*) AS views
           FROM pageviews
          WHERE ts >= ?
          GROUP BY device
          ORDER BY views DESC`,
      )
      .bind(since)
      .all<BreakdownRow>(),
    db
      .prepare(
        `SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
           FROM pageviews
          WHERE ts >= ? AND ts < ?`,
      )
      .bind(prevSince, since)
      .all<{ views: number; visitors: number }>(),
    db
      .prepare('SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM pageviews')
      .all<{ views: number; visitors: number }>(),
    // 期間内のユニーク訪問者。日別の合計だと同じ人の再訪が二重に乗るので別で数える。
    db
      .prepare('SELECT COUNT(DISTINCT visitor) AS visitors FROM pageviews WHERE ts >= ?')
      .bind(since)
      .all<{ visitors: number }>(),
  ]);

  const days = fillDays(daily.results, range, now);
  const views = days.reduce((sum, d) => sum + d.views, 0);
  const prev = prevTotals.results[0] ?? { views: 0, visitors: 0 };
  const all = total.results[0] ?? { views: 0, visitors: 0 };
  const visitors = periodUnique.results[0]?.visitors ?? 0;

  const empty = views === 0 && all.views === 0;

  return page({
    range,
    days,
    views,
    prevViews: prev.views,
    visitors,
    paths: paths.results,
    refs: refs.results,
    countries: countries.results,
    devices: devices.results,
    all,
    empty,
  });
}

/** 期間内の日を 0 で埋めて並べる。グラフの x 軸を等間隔にするため。 */
function fillDays(rows: DailyRow[], range: number, now: number): DailyRow[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: DailyRow[] = [];
  for (let i = range - 1; i >= 0; i -= 1) {
    const day = dayKey(now - i * DAY_MS);
    out.push(byDay.get(day) ?? { day, views: 0, visitors: 0 });
  }
  return out;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function delta(current: number, previous: number): { text: string; dir: 'up' | 'down' | 'flat' } {
  if (previous === 0) {
    return current === 0 ? { text: '—', dir: 'flat' } : { text: '新規', dir: 'up' };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: '±0%', dir: 'flat' };
  return { text: `${pct > 0 ? '+' : ''}${pct}%`, dir: pct > 0 ? 'up' : 'down' };
}

interface PageData {
  range: Range;
  days: DailyRow[];
  views: number;
  prevViews: number;
  visitors: number;
  paths: PathRow[];
  refs: RefRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  all: { views: number; visitors: number };
  empty: boolean;
}

function page(d: PageData): string {
  const dDelta = delta(d.views, d.prevViews);

  return `<!doctype html>
<html lang="ja" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Analytics — log</title>
<style>${STYLES}</style>
</head>
<body>
<div class="page">
  <header class="head">
    <div>
      <p class="eyebrow">Analytics</p>
      <h1>log</h1>
    </div>
    <nav class="ranges" aria-label="期間">
      ${RANGES.map(
        (r) =>
          `<a href="/admin?range=${r}"${r === d.range ? ' aria-current="page"' : ''}>${r}日</a>`,
      ).join('')}
    </nav>
  </header>

  ${
    d.empty
      ? `<p class="notice">まだデータがありません。サイトにアクセスがあると、ここに集計が出ます。</p>`
      : ''
  }

  <section class="kpis" aria-label="概要">
    <div class="tile">
      <p class="tile__label">ページビュー</p>
      <p class="tile__value">${d.views.toLocaleString('ja-JP')}</p>
      <p class="tile__delta tile__delta--${dDelta.dir}">${dDelta.text}<span>前期間比</span></p>
    </div>
    <div class="tile">
      <p class="tile__label">訪問者</p>
      <p class="tile__value">${d.visitors.toLocaleString('ja-JP')}</p>
      <p class="tile__delta tile__delta--flat">${d.days.filter((x) => x.views > 0).length}<span>日分の記録</span></p>
    </div>
    <div class="tile">
      <p class="tile__label">累計ページビュー</p>
      <p class="tile__value">${d.all.views.toLocaleString('ja-JP')}</p>
      <p class="tile__delta tile__delta--flat">${d.all.visitors.toLocaleString('ja-JP')}<span>累計訪問者</span></p>
    </div>
  </section>

  <section class="card" aria-labelledby="trend-heading">
    <h2 id="trend-heading">日別のページビュー</h2>
    ${d.empty ? '<p class="muted">データなし</p>' : lineChart(d.days)}
    ${d.empty ? '' : '<details class="table-view"><summary>数値を表で見る</summary>' + dailyTable(d.days) + '</details>'}
  </section>

  <div class="cols">
    <section class="card" aria-labelledby="paths-heading">
      <h2 id="paths-heading">よく見られたページ</h2>
      ${d.paths.length ? barList(d.paths.map((p) => ({ label: p.path, value: p.views }))) : '<p class="muted">データなし</p>'}
    </section>
    <section class="card" aria-labelledby="refs-heading">
      <h2 id="refs-heading">参照元</h2>
      ${d.refs.length ? barList(d.refs.map((r) => ({ label: r.referrer, value: r.views }))) : '<p class="muted">外部からの流入なし</p>'}
    </section>
  </div>

  <div class="cols">
    <section class="card" aria-labelledby="country-heading">
      <h2 id="country-heading">国</h2>
      ${d.countries.length ? barList(d.countries.map((c) => ({ label: countryName(c.key), value: c.views }))) : '<p class="muted">データなし</p>'}
    </section>
    <section class="card" aria-labelledby="device-heading">
      <h2 id="device-heading">デバイス</h2>
      ${d.devices.length ? barList(d.devices.map((x) => ({ label: x.key === 'mobile' ? 'モバイル' : 'デスクトップ', value: x.views }))) : '<p class="muted">データなし</p>'}
    </section>
  </div>

  <footer class="foot">
    <p>計測は 1×1 の画像リクエスト 1 回だけ。Cookie は訪問者の重複排除にのみ使い、個人は特定しません。</p>
    <p>直近 ${d.range} 日間（日本時間）</p>
  </footer>
</div>
</body>
</html>`;
}

/** 日別の折れ線。1 系列なので凡例は置かない。 */
function lineChart(days: DailyRow[]): string {
  const W = 880;
  const H = 260;
  const PAD = { top: 18, right: 16, bottom: 30, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...days.map((d) => d.views));
  const niceMax = niceCeil(max);
  const stepX = days.length > 1 ? innerW / (days.length - 1) : 0;
  const x = (i: number) => PAD.left + i * stepX;
  const y = (v: number) => PAD.top + innerH - (v / niceMax) * innerH;

  const points = days.map((d, i) => `${x(i).toFixed(1)},${y(d.views).toFixed(1)}`);
  const line = `M${points.join(' L')}`;
  const area = `${line} L${x(days.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left},${(PAD.top + innerH).toFixed(1)} Z`;

  const ticks = [0, 0.5, 1].map((f) => Math.round(niceMax * f));
  const gridLines = ticks
    .map(
      (t) =>
        `<line x1="${PAD.left}" x2="${W - PAD.right}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="grid"/>` +
        `<text x="${PAD.left - 8}" y="${(y(t) + 4).toFixed(1)}" class="axis" text-anchor="end">${compact(t)}</text>`,
    )
    .join('');

  // x 軸ラベルは間引く。7日なら全部、30日以上なら 5 個ほど。
  const labelEvery = days.length <= 7 ? 1 : Math.ceil(days.length / 5);
  const xLabels = days
    .map((d, i) =>
      i % labelEvery === 0 || i === days.length - 1
        ? `<text x="${x(i).toFixed(1)}" y="${H - 8}" class="axis" text-anchor="middle">${d.day.slice(5)}</text>`
        : '',
    )
    .join('');

  const last = days[days.length - 1]!;
  const lastX = x(days.length - 1);
  const lastY = y(last.views);

  return `<figure class="chart">
<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="日別ページビューの折れ線グラフ。最大 ${max} ビュー。">
  ${gridLines}
  <path d="${area}" class="area"/>
  <path d="${line}" class="line"/>
  <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4" class="dot"/>
  <text x="${lastX.toFixed(1)}" y="${(lastY - 12).toFixed(1)}" class="endlabel" text-anchor="end">${last.views}</text>
  ${xLabels}
</svg>
<figcaption>1日あたりのページビュー。直近 ${days.length} 日。</figcaption>
</figure>`;
}

function niceCeil(n: number): number {
  if (n <= 5) return 5;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / mag;
  const step = norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

/** 横棒の一覧。値は棒の端に直接置く。 */
function barList(rows: { label: string; value: number }[]): string {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return `<ul class="barlist">${rows
    .map(
      (r) => `<li>
      <span class="barlist__label" title="${esc(r.label)}">${esc(r.label)}</span>
      <span class="barlist__track"><span class="barlist__fill" style="width:${((r.value / max) * 100).toFixed(1)}%"></span></span>
      <span class="barlist__value">${r.value.toLocaleString('ja-JP')}</span>
    </li>`,
    )
    .join('')}</ul>`;
}

function dailyTable(days: DailyRow[]): string {
  return `<table>
<thead><tr><th>日付</th><th>ページビュー</th><th>訪問者</th></tr></thead>
<tbody>${days
    .slice()
    .reverse()
    .map((d) => `<tr><td>${d.day}</td><td>${d.views}</td><td>${d.visitors}</td></tr>`)
    .join('')}</tbody>
</table>`;
}

/** ISO 3166-1 alpha-2 のよく出るものを日本語に。無ければコードのまま。 */
function countryName(code: string): string {
  const names: Record<string, string> = {
    JP: '日本',
    US: 'アメリカ',
    CN: '中国',
    KR: '韓国',
    TW: '台湾',
    HK: '香港',
    SG: 'シンガポール',
    GB: 'イギリス',
    DE: 'ドイツ',
    FR: 'フランス',
    CA: 'カナダ',
    AU: 'オーストラリア',
    IN: 'インド',
    BR: 'ブラジル',
    RU: 'ロシア',
  };
  return names[code] ?? code;
}

const STYLES = `
:root{
  color-scheme: light dark;
  --bg:#fbfaf8; --surface:#ffffff; --sunken:#f2f0ec;
  --text:#1c1a17; --muted:#6b665e; --faint:#948e85;
  --border:#e2ddd5; --accent:#8a6a3f;
  --series-1:#2a78d6; --good:#006300; --bad:#a4342b;
  --grid:#e1e0d9; --axis:#c3c2b7;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#14130f; --surface:#1c1a16; --sunken:#100f0d;
    --text:#ece7de; --muted:#a49c90; --faint:#7b7367;
    --border:#2e2a24; --accent:#d6b184;
    --series-1:#3987e5; --good:#0ca30c; --bad:#e08a80;
    --grid:#2c2c2a; --axis:#383835;
  }
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--bg); color:var(--text);
  font-family:system-ui,-apple-system,'Hiragino Sans','Noto Sans JP','Yu Gothic UI',Meiryo,sans-serif;
  font-size:15px; line-height:1.7; -webkit-font-smoothing:antialiased;
}
.page{max-width:980px; margin-inline:auto; padding:clamp(1.25rem,4vw,2.5rem); display:grid; gap:1.25rem}
.head{display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; flex-wrap:wrap}
.eyebrow{margin:0; font-size:.7rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--faint)}
h1{margin:.2rem 0 0; font-size:1.5rem; letter-spacing:.04em}
.ranges{display:flex; gap:.35rem}
.ranges a{
  padding:.3rem .75rem; border:1px solid var(--border); border-radius:999px;
  font-size:.78rem; color:var(--muted); text-decoration:none;
}
.ranges a:hover{border-color:var(--accent); color:var(--accent)}
.ranges a[aria-current=page]{background:var(--text); border-color:var(--text); color:var(--bg)}
.kpis{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr)); gap:1rem}
.tile{background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1rem 1.1rem}
.tile__label{margin:0; font-size:.75rem; letter-spacing:.06em; color:var(--muted)}
.tile__value{margin:.35rem 0 0; font-size:1.9rem; font-weight:600; line-height:1.2}
.tile__delta{margin:.35rem 0 0; font-size:.75rem; color:var(--faint); display:flex; gap:.4rem; align-items:baseline}
.tile__delta--up{color:var(--good)}
.tile__delta--down{color:var(--bad)}
.card{background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1.1rem}
.card h2{margin:0 0 .9rem; font-size:.82rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--muted)}
.cols{display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr)); gap:1rem}
.muted{color:var(--faint); font-size:.85rem; margin:.25rem 0}
.notice{background:var(--sunken); border:1px solid var(--border); border-radius:10px; padding:.85rem 1rem; margin:0; font-size:.85rem; color:var(--muted)}
.chart{margin:0}
.chart svg{width:100%; height:auto; display:block; overflow:visible}
.chart figcaption{margin-top:.5rem; font-size:.72rem; color:var(--faint)}
.grid{stroke:var(--grid); stroke-width:1}
.axis{fill:var(--faint); font-size:11px; font-variant-numeric:tabular-nums}
.line{fill:none; stroke:var(--series-1); stroke-width:2; stroke-linejoin:round; stroke-linecap:round}
.area{fill:var(--series-1); opacity:.1}
.dot{fill:var(--series-1); stroke:var(--surface); stroke-width:2}
.endlabel{fill:var(--text); font-size:11px; font-weight:600; font-variant-numeric:tabular-nums}
.barlist{list-style:none; margin:0; padding:0; display:grid; gap:.45rem}
.barlist li{display:grid; grid-template-columns:minmax(0,1fr) 42% auto; align-items:center; gap:.6rem}
.barlist__label{font-size:.8rem; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.barlist__track{background:var(--sunken); border-radius:4px; height:8px; overflow:hidden}
.barlist__fill{display:block; height:100%; background:var(--series-1); border-radius:0 4px 4px 0}
.barlist__value{font-size:.78rem; color:var(--muted); font-variant-numeric:tabular-nums; text-align:right; min-width:2.5rem}
.table-view{margin-top:.85rem}
.table-view summary{cursor:pointer; font-size:.78rem; color:var(--muted)}
table{width:100%; border-collapse:collapse; margin-top:.6rem; font-size:.8rem; font-variant-numeric:tabular-nums}
th,td{text-align:left; padding:.3rem .5rem; border-bottom:1px solid var(--border)}
th{color:var(--muted); font-weight:600; font-size:.72rem}
th:not(:first-child),td:not(:first-child){text-align:right}
.foot{margin:0; display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; font-size:.72rem; color:var(--faint)}
.foot p{margin:0}
`;
