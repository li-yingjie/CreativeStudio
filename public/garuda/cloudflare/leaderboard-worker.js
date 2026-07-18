const DEFAULT_ALLOWED_ORIGINS = [
	'https://awplanets.github.io',
	'http://localhost:5173',
	'http://localhost:4173',
	'http://localhost:8000',
	'http://127.0.0.1:5173',
	'http://127.0.0.1:4173',
	'http://127.0.0.1:8000'
];

const TOP_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 3;
const MAX_BODY_BYTES = 2048;
const MAX_SCORE = 100000000;
const MAX_WAVE = 500;

function allowedOrigins(env)
{
	const configured = String(env.ALLOWED_ORIGINS || '')
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
	return new Set(DEFAULT_ALLOWED_ORIGINS.concat(configured));
}

function isOriginAllowed(request, env)
{
	const origin = request.headers.get('Origin');
	return !origin || allowedOrigins(env).has(origin);
}

function corsHeaders(request, env)
{
	const origin = request.headers.get('Origin');
	const headers = {
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400',
		'Vary': 'Origin'
	};
	if (origin && allowedOrigins(env).has(origin))
		headers['Access-Control-Allow-Origin'] = origin;
	return headers;
}

function json(request, env, data, status = 200, extraHeaders = {})
{
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			...corsHeaders(request, env),
			...extraHeaders,
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}

function cleanName(value)
{
	return Array.from(String(value || 'PLAYER')
		.normalize('NFKC')
		.replace(/[\u0000-\u001f\u007f<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim())
		.slice(0, 12)
		.join('') || 'PLAYER';
}

function validInteger(value, min, max)
{
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
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
	if (Number(count && count.total || 0) >= RATE_LIMIT_MAX)
		return false;
	await env.DB.prepare('INSERT INTO submissions (ip_hash, created_at) VALUES (?, ?)').bind(ipHash, now).run();
	return true;
}

async function readPayload(request)
{
	const contentLength = Number(request.headers.get('Content-Length') || 0);
	if (contentLength > MAX_BODY_BYTES)
		throw new RangeError('Payload is too large.');
	if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json'))
		throw new TypeError('Content-Type must be application/json.');
	const raw = await request.text();
	if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES)
		throw new RangeError('Payload is too large.');
	let body;
	try
	{
		body = JSON.parse(raw);
	}
	catch
	{
		throw new SyntaxError('Invalid JSON.');
	}
	if (!body || typeof body !== 'object' || Array.isArray(body))
		throw new TypeError('Payload must be an object.');
	return body;
}

async function saveScore(request, env)
{
	if (!await enforceRateLimit(request, env))
		return json(request, env, { error: 'Rate limited.' }, 429, { 'Retry-After': String(RATE_LIMIT_WINDOW) });

	let body;
	try
	{
		body = await readPayload(request);
	}
	catch (error)
	{
		return json(request, env, { error: error.message || 'Invalid payload.' }, error instanceof RangeError ? 413 : 400);
	}

	if (typeof body.name !== 'string' || !validInteger(body.score, 0, MAX_SCORE) || !validInteger(body.wave, 0, MAX_WAVE))
	{
		return json(request, env, {
			error: `name must be a string; score and wave must be integers within 0-${MAX_SCORE} and 0-${MAX_WAVE}.`
		}, 400);
	}

	const entry = {
		id: crypto.randomUUID(),
		name: cleanName(body.name),
		score: body.score,
		wave: body.wave,
		created_at: new Date().toISOString()
	};

	const current = await topScores(env);
	current.push(entry);
	current.sort(compareScores);
	const qualified = current.slice(0, TOP_LIMIT).some((score) => score.id === entry.id);
	if (!qualified)
		return json(request, env, { saved: false, entry: { id: entry.id }, scores: current.slice(0, TOP_LIMIT) });

	await env.DB.prepare(
		'INSERT INTO scores (id, name, score, wave, created_at) VALUES (?, ?, ?, ?, ?)'
	).bind(entry.id, entry.name, entry.score, entry.wave, entry.created_at).run();

	const all = await env.DB.prepare(
		'SELECT id, name, score, wave, created_at FROM scores ORDER BY score DESC, wave DESC, created_at ASC'
	).all();
	const sorted = all.results || [];
	const stale = sorted.slice(TOP_LIMIT).map((score) => score.id);
	for (const id of stale)
		await env.DB.prepare('DELETE FROM scores WHERE id = ?').bind(id).run();

	return json(request, env, { saved: true, entry: { id: entry.id }, scores: sorted.slice(0, TOP_LIMIT) });
}

export default {
	async fetch(request, env)
	{
		if (!isOriginAllowed(request, env))
			return json(request, env, { error: 'Origin not allowed.' }, 403);

		const url = new URL(request.url);
		if (url.pathname !== '/scores')
			return json(request, env, { error: 'Not found.' }, 404);

		if (request.method === 'OPTIONS')
			return new Response(null, { status: 204, headers: corsHeaders(request, env) });

		try
		{
			if (request.method === 'GET')
				return json(request, env, { scores: await topScores(env) });
			if (request.method === 'POST')
				return await saveScore(request, env);
			return json(request, env, { error: 'Method not allowed.' }, 405, { 'Allow': 'GET, POST, OPTIONS' });
		}
		catch (error)
		{
			console.error('Leaderboard request failed.', error);
			return json(request, env, { error: 'Internal server error.' }, 500);
		}
	}
};
