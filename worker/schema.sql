-- ページビュー。1 リクエスト 1 行。
CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- epoch ミリ秒。集計時に日本時間へ寄せる。
  ts INTEGER NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  -- 訪問者の重複排除用。個人を辿れる情報は持たない。
  visitor TEXT NOT NULL
);

-- 期間で絞ってから集計するので、時系列と組み合わせた索引を張る。
CREATE INDEX IF NOT EXISTS idx_pageviews_ts ON pageviews (ts);
CREATE INDEX IF NOT EXISTS idx_pageviews_path_ts ON pageviews (path, ts);
