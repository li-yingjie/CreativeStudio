CREATE TABLE IF NOT EXISTS scores (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	score INTEGER NOT NULL,
	wave INTEGER NOT NULL,
	created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_rank
ON scores (score DESC, wave DESC, created_at ASC);

CREATE TABLE IF NOT EXISTS submissions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	ip_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_ip_time
ON submissions (ip_hash, created_at);
