const ALLOWED_ORIGINS = new Set([
	'https://awplanets.github.io',
	'http://localhost:8000',
	'http://localhost:4173',
	'http://127.0.0.1:8000',
	'http://127.0.0.1:4173'
]);

const TOP_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 3;

function corsHeaders(request)
{
	const origin = request.headers.get('Origin') || '';
	const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://awplanets.github.io';
	return {
		'Access-Control-Allow-Origin': allowOrigin,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400',
		'Vary': 'Origin'
	};
}

function json(request, data, status = 200)
{
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			...corsHeaders(request),
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store'
		}
	});
}

function cleanName(value)
{
	return String(value || 'PLAYER')
		.replace(/[<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 12) || 'PLAYER';
}

function scoreInt(value)
{
	value = Number(value);
	if (!Number.isFinite(value))
		return 0;
	return Math.max(0, Math.min(999999999, Math.floor(value)));
}

function waveInt(value)
{
	value = Number(value);
	if (!Number.isFinite(value))
		return 0;
	return Math.max(0, Math.min(9999, Math.floor(value)));
}

function compareScores(a, b)
{
	return b.score - a.score || b.wave - a.wave || String(a.created_at).localeCompare(String(b.created_at));
}

async function hashText(text, secret)
{
	const bytes = new TextEncoder().encode(`${secret || 'garuda'}:${text || 'unknown'}`);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function topScores(env)
{
	const result = await env.DB.prepare(
		'SELECT id, name, score, wave, created_at FROM scores ORDER BY score DESC, wave DESC, created_at ASC LIMIT ?'
	).bind(TOP_LIMIT).all();
	return (result.results || []).map((row) => ({
		id: row.id,
		name: row.name,
		score: row.score,
		wave: row.wave,
		created_at: row.created_at
	}));
}

async function enforceRateLimit(request, env)
{
	const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
	const ipHash = await hashText(ip, env.RATE_LIMIT_SECRET);
	const now = Math.floor(Date.now() / 1000);
	await env.DB.prepare('DELETE FROM submissions WHERE created_at < ?').bind(now - RATE_LIMIT_WINDOW).run();
	const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM submissions WHERE ip_hash = ? AND created_at >= ?')
		.bind(ipHash, now - RATE_LIMIT_WINDOW).first();
	if ((count && count.total || 0) >= RATE_LIMIT_MAX)
		return false;
	await env.DB.prepare('INSERT INTO submissions (ip_hash, created_at) VALUES (?, ?)').bind(ipHash, now).run();
	return true;
}

async function saveScore(request, env)
{
	if (!await enforceRateLimit(request, env))
		return json(request, { error: 'Rate limited.' }, 429);

	let body;
	try
	{
		body = await request.json();
	}
	catch (error)
	{
		return json(request, { error: 'Invalid JSON.' }, 400);
	}

	const entry = {
		id: String(body.id || crypto.randomUUID()).slice(0, 80),
		name: cleanName(body.name),
		score: scoreInt(body.score),
		wave: waveInt(body.wave),
		created_at: new Date().toISOString()
	};

	const current = await topScores(env);
	current.push(entry);
	current.sort(compareScores);
	const qualified = current.slice(0, TOP_LIMIT).some((score) => score.id === entry.id);
	if (!qualified)
		return json(request, { saved: false, scores: current.slice(0, TOP_LIMIT) });

	await env.DB.prepare(
		'INSERT OR REPLACE INTO scores (id, name, score, wave, created_at) VALUES (?, ?, ?, ?, ?)'
	).bind(entry.id, entry.name, entry.score, entry.wave, entry.created_at).run();

	const all = await env.DB.prepare(
		'SELECT id, name, score, wave, created_at FROM scores ORDER BY score DESC, wave DESC, created_at ASC'
	).all();
	const sorted = all.results || [];
	const stale = sorted.slice(TOP_LIMIT).map((score) => score.id);
	for (const id of stale)
		await env.DB.prepare('DELETE FROM scores WHERE id = ?').bind(id).run();

	return json(request, { saved: true, scores: sorted.slice(0, TOP_LIMIT) });
}

export default {
	async fetch(request, env)
	{
		if (request.method === 'OPTIONS')
			return new Response(null, { status: 204, headers: corsHeaders(request) });

		const url = new URL(request.url);
		if (url.pathname === '/scores' && request.method === 'GET')
			return json(request, { scores: await topScores(env) });
		if (url.pathname === '/scores' && request.method === 'POST')
			return saveScore(request, env);

		return json(request, { error: 'Not found.' }, 404);
	}
};
