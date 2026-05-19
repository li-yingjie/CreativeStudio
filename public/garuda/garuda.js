// Global variable for the main game loop
var interval;
var RESOLUTION_CHOICES = [3840, 3200, 2560, 1920];
function readRenderHeight()
{
	var value = 3840;
	try
	{
		value = parseInt(localStorage.getItem('garuda.renderHeight') || value, 10);
	}
	catch (e)
	{
	}
	return RESOLUTION_CHOICES.indexOf(value) >= 0 ? value : 3840;
}
var RENDER_HEIGHT = readRenderHeight();
var RENDER_WIDTH = RENDER_HEIGHT * 9 / 16 | 0;
var RESOLUTION_SCALE = RENDER_WIDTH / 1024;
var MOTION_SCALE = RENDER_HEIGHT / 768;
function scaled(v)
{
	return v * RESOLUTION_SCALE;
}
function motion(v)
{
	return v * MOTION_SCALE;
}
function scaledInt(v)
{
	return scaled(v) | 0;
}

// Initialize a single static level object
var l = {
	// High-resolution portrait remake canvas. Uses a 9:16 vertical playfield.
	WIDTH: RENDER_WIDTH,
	HEIGHT: RENDER_HEIGHT,
	SCALE: RESOLUTION_SCALE,
	MOTION_SCALE: MOTION_SCALE,
	// Scrolling speed for the background
	SPEED: motion(1),
	// Number of ticks for the screen flash effect
	MAX_BOMB: 10,
	y: 0,
	bomb: 0,
	bombs: 3,
	MAX_BOMBS: 3,
	timeStop: 0,
	killer: {
		MAX: 100,
		energy: 0,
		active: 0,
		DURATION: 5 * 60
	},
	bossRewardLevel: 0,
	bossHealthZero: 0,
	waveBossSpawned: false,
	upgradeDelay: 0,
	upgradeChoosing: false,
	traitChoosing: false,
	rogue: {
		primary: 0,
		laser: 0,
		bomb: 0,
		shield: 0,
		speed: 0,
		killer: 0
	},
	enemyTraits: {},
	stats: {
		startedAt: 0,
		endedAt: 0,
		kills: 0,
		skillUses: {},
		killSources: {},
		upgrades: [],
		traits: []
	},
	lastSavedScoreId: '',
	text: {
		MAX_T: 3 * 60,
		t: 0
	},
	p: 0,
	paused: true,
	menu: true,
	intro: false,
	points: {
		WIDTH: scaledInt(32),
		HEIGHT: scaledInt(48),
		STEP: scaledInt(24),
		images: []
	}
};

// Initialize a single static object for the players ship
var ship = {
	R: scaledInt(132),
	ACC: scaled(.75),
	ACC_FACTOR: .946,
	ANGLE_FACTOR: .894,
	MAX_ANGLE: 10,
	MAX_OSD: 6 * 60,
	x: l.WIDTH / 2,
	y: l.HEIGHT * .80 | 0,
	targetY: l.HEIGHT * .80 | 0,
	xAcc: 0,
	yAcc: 0,
	angle: 0,
	frame: 0,
	FRAME_T: 3,
	specialPose: 0,
	shootingArmed: false,
	SPECIAL_STEP: 3,
	SPECIAL_REVERSE_STEP: 3,
	bombPose: 0,
	BOMB_STEP: 3,
	killerPose: 0,
	KILLER_STEP: 2,
	KILLER_REVERSE_STEP: 3,
	e: 100,
	timeout: 0,
	weapon: 0,
	MAX_WEAPON: 8,
	reload: 0,
	laserReload: 0,
	laserTargets: [],
	shield: {
		MAX_T: 5 * 60,
		FRAME_T: 3,
		HOLD_T: 2,
		MAX_CHARGES: 3,
		START_CHARGES: 3,
		charges: 3,
		t: 0,
		age: 0,
		loopAge: 0
	}
};

var bullets = [];
bullets.R = scaledInt(26);
bullets.W = scaledInt(34);
bullets.H = scaledInt(132);
bullets.MAX_T = 70;
var playerLasers = [];

var explosions = [];
var hitEffects = [];
var selfDestructs = [];

var bonus = [];
bonus.R = scaledInt(40);
bonus.images = {};

var torpedos = [];
torpedos.R = scaledInt(24);
// Global sprite index for the rotation of all torpedos
torpedos.frame = 0;

var lasers = [];

var enemies = [];
var enemyQueue = [];
var bombWaves = [];
var ENEMY_DIVER_TYPE = 3;
var ENEMY_SPIDER_TYPE = 4;
var ENEMY_BOSS_TYPE = 5;
var SFX_PLAYER_LASER = 22;
var SFX_KILLER_MOVE = 23;
var SFX_TRANSFORM = 24;
var laserSfxCooldown = 0;

function toggleFullscreen()
{
	if (document['fullscreenElement'] || document['mozFullScreen'] || document['webkitIsFullScreen'])
	{
		// Opera 12.50 is first again
		if (document['exitFullscreen'])
			document['exitFullscreen']();
		else if (document['mozCancelFullScreen'])
			document['mozCancelFullScreen']();
		else if (document['webkitCancelFullScreen'])
			document['webkitCancelFullScreen']();
	}
	else
	{
		var target = document.documentElement || document.body;
		if (target['requestFullscreen'])
			target['requestFullscreen']();
		else if (target['mozRequestFullScreen'])
			target['mozRequestFullScreen']();
		else if (target['webkitRequestFullScreen'])
			target['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']);
	}
	return false;
}
// Export for the Closure Compiler
window['toggleFullscreen'] = toggleFullscreen;

// Helper function to hurt the player, or not if the shield is active
function hurt(e)
{
	if (ship.shield.t)
	{
		play(2);
		return;
	}
	// Merge multiple shots in a short time like they are a single shot
	if (ship.timeout < 0)
	{
		ship.e -= 20;
		if (ship.e < 0)
			ship.e = 0;
		ship.timeout = 10;
	}
	if (!ship.e && !l.paused)
	{
		// Giant explosion
		explode(ship.x, ship.y, scaledInt(512));
		explode(ship.x, ship.y, scaledInt(1024));
		l.paused = true;
		l.menu = true;
		// Stop the main game loop
		if (interval)
		{
			window.clearInterval(interval);
			interval = 0;
		}
		showGameOver();
		play(14); // Game over
		return;
	}
	else if (ship.e < 25)
		play(17); // Low energy
	play(1);
	ship.osd = ship.MAX_OSD;
}

function fire(xAcc, yAcc, xOffset, angle)
{
	// The acceleration of the bullets changes with the acceleration of the ship
	xAcc += ship.xAcc / 2;
	yAcc += ship.yAcc / 2;
	var primaryLevel = l.rogue.primary | 0;
	bullets.push({
		t: bullets.MAX_T,
		x: ship.x + (xOffset || 0),
		y: ship.y - ship.R * .9,
		xAcc: xAcc,
		yAcc: yAcc,
		damage: 1 + primaryLevel * 2,
		pierce: primaryLevel,
		hitEnemies: [],
		angle: angle || 0
	});
}

function fireWeapon()
{
	trackSkillUse('Primary');
	var level = ship.weapon | 0;
	var speed = motion(9.6);
	var lanes = level ? Math.min(11, level + 2) : 1;
	if (lanes <= 1)
	{
		fire(0, -speed, 0, 0);
		if (l.rogue.laser)
			fireLaserWeapon();
		return;
	}
	var spread = Math.min(Math.PI * .24, (8 + lanes * 3.6) * Math.PI / 180);
	var mid = (lanes - 1) / 2;
	for (var i = 0; i < lanes; i++)
	{
		var t = (i - mid) / mid;
		var angle = t * spread;
		fire(Math.sin(angle) * speed, -Math.cos(angle) * speed, scaled(20) * (i - mid), angle);
	}
	if (l.rogue.laser)
		fireLaserWeapon();
}

function fireLaserWeapon()
{
	if (ship.laserReload > 0)
		return;
	trackSkillUse('Laser');
	var level = laserLevel();
	ship.laserReload = Math.max(3, 16 - level * 1.5 | 0);
	var damage = laserDamage();
	var width = scaled(12 + level * 3.2);
	var targets = acquireLaserTargets(laserTargetCount());
	var origin = playerLaserOrigin();
	var points = [origin];
	for (var i = 0; i < targets.length; i++)
	{
		var target = targets[i];
		var index = enemies.indexOf(target);
		if (index < 0)
			continue;
		var center = laserTargetCenter(target);
		points.push(center);
		damageEnemy(index, damage, center.x, center.y, 'laser');
	}
	playerLasers.push({
		points: points.length > 1 ? points : [origin, { x: origin.x, y: -scaled(80) }],
		t: 8,
		width: width,
		damage: damage
	});
	if (!laserSfxCooldown)
	{
		play(SFX_PLAYER_LASER);
		laserSfxCooldown = Math.max(10, ship.laserReload);
	}
}

function playerLaserOrigin()
{
	return {
		x: ship.x,
		y: ship.y - ship.R * .85
	};
}

function laserTargetCenter(enemy)
{
	return {
		x: enemy.x,
		y: enemy.y + (enemy.yOffset || 0)
	};
}

function isLaserTargetable(enemy)
{
	if (isEnemyInvulnerable(enemy))
		return false;
	var center = laserTargetCenter(enemy);
	var r = enemy.r || 0;
	return center.x > -r * .25 && center.x < l.WIDTH + r * .25 &&
		center.y > r * .25 && center.y < l.HEIGHT + r * .5 &&
		center.y < ship.y + ship.R * 2;
}

function closestLaserTarget(from, selected)
{
	var best = null, bestScore = 0;
	for (var i = enemies.length; i--; )
	{
		var enemy = enemies[i];
		if (!isLaserTargetable(enemy) || selected.indexOf(enemy) >= 0)
			continue;
		var center = laserTargetCenter(enemy);
		var dx = center.x - from.x;
		var dy = center.y - from.y;
		var score = dx * dx + dy * dy;
		if (!best || score < bestScore)
		{
			best = enemy;
			bestScore = score;
		}
	}
	return best;
}

function laserLevel()
{
	return l.rogue.laser | 0;
}

function laserDamage()
{
	var level = laserLevel();
	return 5 + level * 4 + Math.max(0, level - 2) * 2;
}

function laserTargetCount()
{
	var level = laserLevel();
	return level < 2 ? 1 : Math.min(15, level * 2 - 1);
}

function acquireLaserTargets(count)
{
	var kept = [];
	var from = playerLaserOrigin();
	for (var i = 0; i < ship.laserTargets.length && kept.length < count; i++)
	{
		var target = ship.laserTargets[i];
		if (enemies.indexOf(target) >= 0 && isLaserTargetable(target) && kept.indexOf(target) < 0)
		{
			kept.push(target);
			from = laserTargetCenter(target);
		}
	}
	while (kept.length < count)
	{
		var next = closestLaserTarget(from, kept);
		if (!next)
			break;
		kept.push(next);
		from = laserTargetCenter(next);
	}
	ship.laserTargets = kept;
	return kept;
}

function cancelTorpedosWithLaserLine(x1, y1, x2, y2, width)
{
	var hitWidth = width * .75 + torpedos.R, dx = x2 - x1, dy = y2 - y1;
	var lenSq = dx * dx + dy * dy || 1;
	for (var j = torpedos.length; j--; )
	{
		var u = ((torpedos[j].x - x1) * dx + (torpedos[j].y - y1) * dy) / lenSq;
		if (u < 0)
			u = 0;
		else if (u > 1)
			u = 1;
		var px = x1 + dx * u, py = y1 + dy * u;
		var tx = torpedos[j].x - px, ty = torpedos[j].y - py;
		if (tx * tx + ty * ty < hitWidth * hitWidth)
		{
			addScore(2);
			torpedos.splice(j, 1);
		}
	}
}

function hitSpark(x, y)
{
	hitEffects.push({
		x: x,
		y: y,
		t: 16,
		angle: Math.random() * Math.PI * 2,
		size: scaled(13)
	});
}

function shieldSpark(x, y, size)
{
	hitEffects.push({
		x: x,
		y: y,
		t: 22,
		angle: Math.random() * Math.PI * 2,
		kind: 'shield',
		size: size || scaled(42)
	});
}

function explode(x, y, size)
{
	explosions.push({
		x: x,
		y: y,
		size: size ? size : scaledInt(64),
		angle: 0,
		d: 0,
		alpha: 1,
		t: 0,
		MAX_T: 48
	});
}

function shieldAnimationDuration()
{
	var count = ship.shield.frames && ship.shield.frames.length ? ship.shield.frames.length : 31;
	return count * ship.shield.FRAME_T + shieldHoldTime() + (count - 1) * ship.shield.FRAME_T;
}

function shieldHoldTime()
{
	return ship.shield.HOLD_T + (l.rogue.shield | 0) * 60;
}

function shieldRadius()
{
	return ship.R * (1.18 + Math.min(.28, (l.rogue.shield | 0) * .04));
}

function shieldMagnetRadius()
{
	var level = l.rogue.shield | 0;
	if (!ship.shield.t || !level)
		return 0;
	var radius = ship.R * (2.75 + level * .85);
	if (level >= 2)
		radius *= .62 + Math.min(.38, ship.shield.age / 150);
	return radius;
}

function rewardShieldBlock(weight)
{
	var level = l.rogue.shield | 0;
	if (!level)
		return false;
	return addKillerEnergy((weight || 1) * (1.4 + level * .35));
}

function shipAccel()
{
	var level = l.rogue.speed | 0;
	return ship.ACC * (1.08 + Math.min(.96, level * .24));
}

function shipMoveFactor()
{
	if (!keys[88] || l.intro)
		return 1;
	var level = l.rogue.speed | 0;
	return .76 + Math.min(.22, level * .07);
}

function shipFireReload()
{
	var level = l.rogue.speed | 0;
	var base = ship.weapon ? 8 : 12;
	var floor = ship.weapon ? 4 : 6;
	return Math.max(floor, base - Math.min(6, level * 1.5 | 0));
}

function clamp(v, max)
{
	return v > max ? max : (v < 0 ? 0 : v);
}

function scoreInt(value)
{
	return Math.max(0, Math.round(value || 0));
}

function addScore(amount)
{
	l.p = scoreInt(l.p + (amount || 0));
	return l.p;
}

function resetRunStats()
{
	l.stats = {
		startedAt: 0,
		endedAt: 0,
		kills: 0,
		skillUses: {
			Primary: 0,
			Laser: 0,
			Bomb: 0,
			Shield: 0,
			Killer: 0
		},
		killSources: {
			Primary: 0,
			Laser: 0,
			Bomb: 0,
			Killer: 0
		},
		upgrades: [],
		traits: []
	};
	l.lastSavedScoreId = '';
}

function trackSkillUse(name)
{
	if (!l.stats || l.paused || l.menu || l.intro || !ship.e)
		return;
	if (!l.stats.skillUses)
		l.stats.skillUses = {};
	l.stats.skillUses[name] = (l.stats.skillUses[name] || 0) + 1;
}

function skillNameFromSource(source)
{
	return source === 'laser' ? 'Laser' :
		source === 'bomb' ? 'Bomb' :
		source === 'killer' ? 'Killer' :
		'Primary';
}

function trackKillSource(source)
{
	if (!l.stats)
		return;
	var name = skillNameFromSource(source);
	if (!l.stats.killSources)
		l.stats.killSources = {};
	l.stats.killSources[name] = (l.stats.killSources[name] || 0) + 1;
}

function recordUpgrade(card)
{
	if (!l.stats)
		return;
	l.stats.upgrades.push({
		id: card.id,
		title: card.title,
		icon: card.icon || ''
	});
}

function recordEnemyTrait(card)
{
	if (!l.stats)
		return;
	l.stats.traits.push({
		id: card.id,
		title: card.title,
		abbr: card.abbr || card.title.charAt(0),
		icon: card.icon || ''
	});
}

function enemyTraitLevel(id)
{
	return l.enemyTraits && l.enemyTraits[id] ? l.enemyTraits[id] | 0 : 0;
}

function shouldOfferEnemyTrait(level)
{
	return level >= 10 && !(level % 5);
}

function enemyTraitDamageMultiplier(source, enemy)
{
	if (!enemy || enemy.bossPower)
		return 1;
	var multiplier = 1;
	if (source === 'laser')
		multiplier *= Math.pow(.8, enemyTraitLevel('energyResist'));
	else if (source === 'primary')
		multiplier *= Math.pow(.85, enemyTraitLevel('armor'));
	return multiplier;
}

function addShieldCharge(amount)
{
	var before = ship.shield.charges;
	ship.shield.charges = clamp(ship.shield.charges + amount, ship.shield.MAX_CHARGES) | 0;
	return ship.shield.charges > before;
}

function addBomb(amount)
{
	var before = l.bombs;
	l.bombs = clamp(l.bombs + amount, l.MAX_BOMBS);
	return l.bombs > before;
}

function collectShieldBonus()
{
	if (ship.shield.charges >= ship.shield.MAX_CHARGES)
		return startShield(true);
	return addShieldCharge(1);
}

function collectBombBonus()
{
	if (l.bombs >= l.MAX_BOMBS)
		return releaseBomb(true);
	return addBomb(1);
}

function addKillerEnergy(amount)
{
	if (l.killer.active || l.paused || l.menu || !ship.e)
		return false;
	var before = l.killer.energy;
	l.killer.energy = clamp(l.killer.energy + amount, l.killer.MAX);
	return l.killer.energy > before;
}

function activateKillerMove()
{
	if (l.paused || l.menu || l.intro || !ship.e || l.killer.active || l.killer.energy < l.killer.MAX)
		return false;
	trackSkillUse('Killer');
	l.killer.active = killerDuration();
	l.killer.energy = l.killer.MAX;
	ship.killerPose = Math.max(1, ship.killerPose);
	ship.specialPose = ship.bombPose = 0;
	ship.shootingArmed = false;
	if (killerPortrait)
	{
		killerPortrait.className = 'killer-portrait active';
		randomizeKillerPortrait();
	}
	play(SFX_KILLER_MOVE);
	return true;
}

function canPlayTransformSound()
{
	return !l.paused && !l.menu && !l.intro && ship.e && !l.killer.active && !ship.killerPose && !ship.bombPose;
}

function shootingPoseReady()
{
	var frameCount = ship.specialFrames && ship.specialFrames.length ? ship.specialFrames.length : 0;
	return !frameCount || ship.shootingArmed;
}

function shootingPoseFireFrame()
{
	var frameCount = ship.specialFrames && ship.specialFrames.length ? ship.specialFrames.length : 0;
	return Math.max(0, frameCount - 10);
}

function killerLevel()
{
	return l.rogue.killer | 0;
}

function killerDuration()
{
	return l.killer.DURATION + killerLevel() * 45;
}

function killerDamage(enemy)
{
	var level = killerLevel();
	return enemy.bossPower ? 42 + level * 18 : 58 + level * 26;
}

function killerBeamWidth()
{
	return scaled(220);
}

function killerBeamScale(frameCount)
{
	var introFrames = frameCount ? Math.ceil(frameCount / ship.KILLER_STEP) : 0;
	var elapsed = Math.max(0, killerDuration() - l.killer.active - introFrames);
	var rampIn = 10;
	var rampOut = 18;
	var scale = Math.min(clamp(elapsed / rampIn, 1), clamp(l.killer.active / rampOut, 1));
	scale = scale * scale * (3 - scale * 2);
	return .08 + scale * .92;
}

function applyKillerBeamDamage(width)
{
	var x = ship.x;
	var y = ship.y - ship.R * .75;
	var half = (width || killerBeamWidth()) * .5;
	for (var j = torpedos.length; j--; )
		if (Math.abs(torpedos[j].x - x) < half + torpedos.R && torpedos[j].y < y + torpedos.R)
			torpedos.splice(j, 1);
	for (var i = enemies.length; i--; )
	{
		var enemy = enemies[i];
		if (isEnemyInvulnerable(enemy))
			continue;
		var ey = enemy.y + (enemy.yOffset || 0);
		if (ey > y + enemy.r * .6)
			continue;
		if (Math.abs(enemy.x - x) < half + enemy.r * .65)
			damageEnemy(i, killerDamage(enemy), enemy.x, ey, 'killer');
	}
}

function lightningNoise(seed)
{
	var value = Math.sin(seed * 12.9898) * 43758.5453;
	return value - (value | 0);
}

function renderKillerLightning(x, y, top, width)
{
	var age = l.killer.active;
	var span = y - top;
	var segments = 7;
	a.save();
	a.globalCompositeOperation = 'lighter';
	a.lineCap = 'round';
	a.lineJoin = 'round';
	a.shadowColor = '#FF7A18';
	a.shadowBlur = scaled(14);
	for (var side = -1; side <= 1; side += 2)
	{
		for (var bolt = 0; bolt < 2; bolt++)
		{
			var base = side * width * (.46 + bolt * .15);
			var seed = age * .19 + bolt * 11 + side * 23;
			var points = [];
			for (var i = 0; i <= segments; i++)
			{
				var t = i / segments;
				var yy = y - span * t;
				var spreadT = Math.min(1, t * 2.4);
				var flicker = (lightningNoise(seed + i * 3.7) - .5) * width * .28;
				var wave = Math.sin(age * .42 + i * 1.9 + bolt) * width * .045;
				points.push({
					x: x + (base + side * (flicker + wave)) * spreadT,
					y: yy
				});
			}
			a.globalAlpha = bolt ? .48 : .72;
			a.strokeStyle = bolt ? '#FF7A18' : '#FFD35A';
			a.lineWidth = Math.max(scaled(5), width * (bolt ? .018 : .026));
			a.beginPath();
			for (var p = 0; p < points.length; p++)
			{
				if (!p)
					a.moveTo(points[p].x, points[p].y);
				else
					a.lineTo(points[p].x, points[p].y);
			}
			a.stroke();
			a.globalAlpha = bolt ? .34 : .52;
			a.lineWidth = Math.max(scaled(3), width * (bolt ? .011 : .015));
			a.beginPath();
			for (var b = 2; b < points.length - 1; b += 3)
			{
				var branch = side * width * (.12 + lightningNoise(seed + b) * .16);
				a.moveTo(points[b].x, points[b].y);
				a.lineTo(points[b].x + branch, points[b].y - span / segments * .62);
			}
			a.stroke();
		}
	}
	a.globalAlpha = .9;
	a.strokeStyle = '#FFF0A8';
	a.shadowBlur = scaled(8);
	a.lineWidth = Math.max(scaled(2), width * .008);
	for (var side2 = -1; side2 <= 1; side2 += 2)
	{
		a.beginPath();
		for (var j = 0; j <= segments; j++)
		{
			var tt = j / segments;
			var py = y - span * tt;
			var edgeSpread = Math.min(1, tt * 2.2);
			var px = x + side2 * (width * .38 + (lightningNoise(age * .31 + j * 5 + side2) - .5) * width * .16) * edgeSpread;
			if (!j)
				a.moveTo(px, py);
			else
				a.lineTo(px, py);
		}
		a.stroke();
	}
	a.restore();
}

function tickKillerMove()
{
	if (!l.killer.active)
		return;
	tickKillerPortraitShake();
	l.killer.active--;
	l.killer.energy = l.killer.MAX * l.killer.active / killerDuration();
	if (l.killer.active <= 0)
	{
		l.killer.active = 0;
		l.killer.energy = 0;
		resetKillerPortraitShake();
		if (keys[88] && ship.e && !l.paused && !l.menu && !l.intro)
		{
			ship.shootingArmed = true;
			ship.reload = 0;
		}
	}
}

function renderKillerBeam(timeStopped)
{
	if (!l.killer.active)
		return;
	var frameCount = ship.killerFrames && ship.killerFrames.length ? ship.killerFrames.length : 0;
	if (frameCount && ship.killerPose < frameCount)
		return;
	var x = ship.x;
	var y = ship.y - ship.R * .95;
	var top = -scaled(240);
	var beamScale = killerBeamScale(frameCount);
	var width = killerBeamWidth() * beamScale;
	var pulse = .92 + Math.sin(l.killer.active * .52) * .06;
	var off = Math.sin(l.killer.active * .33) * scaled(7);
	a.save();
	a.globalCompositeOperation = 'lighter';
	a.lineCap = 'round';
	a.globalAlpha = .24 * pulse;
	a.strokeStyle = '#FF7A18';
	a.shadowColor = '#FF7A18';
	a.shadowBlur = scaled(8 + 26 * beamScale);
	a.lineWidth = width * .78;
	a.beginPath();
	a.moveTo(x, y);
	a.lineTo(x, top);
	a.stroke();
	a.globalAlpha = .38;
	a.strokeStyle = '#FFD25A';
	a.shadowColor = '#FFB12A';
	a.shadowBlur = scaled(5 + 13 * beamScale);
	a.lineWidth = width * .34;
	a.beginPath();
	a.moveTo(x, y);
	a.lineTo(x, top);
	a.stroke();
	a.globalAlpha = .72;
	a.strokeStyle = '#FFF0A8';
	a.shadowColor = '#FFF0A8';
	a.shadowBlur = scaled(3 + 6 * beamScale);
	a.lineWidth = Math.max(scaled(4), width * .075);
	a.beginPath();
	a.moveTo(x, y);
	a.lineTo(x, top);
	a.stroke();
	a.globalAlpha = .42;
	a.strokeStyle = '#FF8A18';
	a.shadowBlur = scaled(2 + 6 * beamScale);
	a.lineWidth = Math.max(scaled(2), width * .025);
	a.beginPath();
	a.moveTo(x - width * .18 + off, y);
	a.lineTo(x - width * .08 + off * .4, top);
	a.moveTo(x + width * .18 - off, y);
	a.lineTo(x + width * .08 - off * .4, top);
	a.stroke();
	a.restore();
	if (beamScale > .35)
		renderKillerLightning(x, ship.y, top, width);
	if (!timeStopped && !(l.killer.active % 4))
		applyKillerBeamDamage(width);
}

function startBombAnimation()
{
	ship.bombPose = 1;
}

function releaseBomb(free)
{
	if (l.paused || l.menu || l.intro || !ship.e || (!free && l.bombs <= 0))
		return false;
	trackSkillUse('Bomb');
	if (!free)
		l.bombs--;
	var bombLevel = l.rogue.bomb | 0;
	bombWaves.push({
		x: ship.x,
		y: ship.y,
		r: scaled(42),
		speed: motion(18 + bombLevel * 2),
		maxR: Math.sqrt(l.WIDTH * l.WIDTH + l.HEIGHT * l.HEIGHT),
		t: 0,
		level: bombLevel,
		hit: []
	});
	if (bombLevel > 2)
	{
		for (var i = bonus.length; i--; )
		{
			bonus[i].xAcc = (ship.x - bonus[i].x) / 30;
			bonus[i].yAcc = (ship.y - bonus[i].y) / 30;
		}
	}
	l.bomb = l.MAX_BOMB;
	startBombAnimation();
	play(13);
	return true;
}

function bombDamage(enemy, level)
{
	if (!level)
		return 0;
	if (enemy.bossPower)
		return 18 + level * 10;
	var total = enemy.e + (enemy.shield || 0);
	if ((l.level || 1) > level * 10)
	{
		if (!enemy.bombDamageBase)
			enemy.bombDamageBase = total;
		return Math.max(1, (enemy.bombDamageBase + 1) / 2 | 0);
	}
	return enemy.r < ship.R * 3 ? total : 16 + level * 7;
}

function startShield(free)
{
	trackSkillUse('Shield');
	if (!free)
		ship.shield.charges--;
	ship.shield.t = shieldAnimationDuration();
	ship.shield.age = 0;
	ship.shield.loopAge = 0;
	play(3);
	return true;
}

function activateShield()
{
	if (l.paused || l.menu || l.intro || !ship.e || ship.shield.t || ship.shield.charges <= 0)
		return false;
	return startShield();
}

function spawnBonus(o, i)
{
	if (!i)
	{
		var r = Math.random();
		// A chance of 10 percent for every bonus, everything else is just money
		i = r > .9 ? '+' : (r > .8 ? 'E' : (r > .7 ? 'S' : (r > .6 ? 'B' : '10')));
	}
	// Lazy loading, this allows me to use every character I want whenever I want it
	if (!bonus.images[i])
		bonus.images[i] = transparentSprite(bonus.R * 2, bonus.R * 2);
	bonus.push({
		i: i,
		x: o.x || l.WIDTH / 2,
		y: o.y || -bonus.R,
		xAcc: o.xAcc ? o.xAcc / 2 : Math.random() * l.SPEED - l.SPEED / 2,
		yAcc: (o.yAcc ? o.yAcc / 2 : 0) + l.SPEED / 2
	});
}

function clampTorpedoAngle(angle, maxAngle)
{
	if (maxAngle)
	{
		if (angle > Math.PI)
			angle -= Math.PI * 2;
		if (angle > maxAngle)
			angle = maxAngle;
		if (angle < -maxAngle)
			angle = -maxAngle;
	}
	return angle;
}

function angleToShipFrom(x, y)
{
	return Math.atan2(ship.x - x, ship.y - y);
}

function enemyAimAngle(enemy, y)
{
	var lead = 13 + Math.min(18, waveStep() * 2.2);
	var targetX = ship.x + ship.xAcc * lead;
	var targetY = ship.y + ship.yAcc * lead * .55;
	return Math.atan2(targetX - enemy.x, targetY - y);
}

function enemyBodyHitRadius(enemy)
{
	return (enemy.r || 0) * (enemy.bossPower ? .7 : .68);
}

function shipBodyCollision(enemy, y)
{
	if (isEnemyInvulnerable(enemy))
		return false;
	var dx = ship.x - enemy.x;
	var dy = ship.y - y;
	var rx = ship.R * .86 + enemyBodyHitRadius(enemy);
	var ry = ship.R * .66 + enemyBodyHitRadius(enemy) * .92;
	return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1;
}

function bossLaserTier(power)
{
	return Math.max(0, ((power || l.level || 1) - 10) / 5 | 0);
}

function bossLaserInterval(power)
{
	if ((power || 1) < 10)
		return Math.max(2.6 * 60, 5 * 60 - (power || 1) * 12) | 0;
	var tier = bossLaserTier(power);
	return Math.max(2.25 * 60, (4.55 * 60 - tier * 18)) | 0;
}

function bossLaserWarnDuration(power)
{
	return Math.max(54, 78 - bossLaserTier(power) * 4) | 0;
}

function bossLaserActiveDuration(power)
{
	return Math.max(18, 32 - bossLaserTier(power) * 2) | 0;
}

function spawnTorpedoAt(x, y, angle, maxAngle)
{
	y = y | 0;
	// Never spawn any torpedos if the enemy is still to far away
	if (y < -l.HEIGHT / 4)
		return false
	angle = clampTorpedoAngle(angle, maxAngle);
	// All torpedos share the same speed, no matter which enemy fires them
	var speed = (3 + l.level / 2) / 2 * l.MOTION_SCALE;
	torpedos.push({
		x: x | 0,
		y: y,
		xAcc: angle ? Math.sin(angle) * speed : 0,
		yAcc: angle ? Math.cos(angle) * speed : speed,
		e: 0
	});
	return true;
}

function spawnTorpedo(o, angle, maxAngle)
{
	return spawnTorpedoAt(o.x, o.y + (o.yOffset || 0), angle, maxAngle);
}

function bossCannonOrigin(o, side)
{
	var localX = side * (o.cannonXOffset || o.r * .62);
	var localY = o.cannonYOffset || o.r * .1;
	var angle = o.angle || 0;
	var sin = Math.sin(angle);
	var cos = Math.cos(angle);
	return {
		x: o.x + localX * cos - localY * sin,
		y: o.y + (o.yOffset || 0) + localX * sin + localY * cos
	};
}

function spawnLaser(o)
{
	var y = o.y + (o.yOffset || 0);
	var power = o.bossPower || l.level || 1;
	var warn = bossLaserWarnDuration(power);
	lasers.push({
		x: o.x,
		y: y,
		x2: ship.x,
		y2: ship.y,
		warn: warn,
		warnMax: warn,
		warnWidth: o.r * 1.05,
		activeWidth: scaled(16),
		owner: o,
		t: bossLaserActiveDuration(power),
		hit: 0
	});
	play(12);
}

function renderEnemyLaserWarnings(timeStopped)
{
	for (var i = lasers.length; i--; )
	{
		var laser = lasers[i];
		if (laser.owner && enemies.indexOf(laser.owner) < 0)
		{
			lasers.splice(i, 1);
			continue;
		}
		if (laser.warn <= 0)
			continue;
		var dx = laser.x2 - laser.x, dy = laser.y2 - laser.y;
		var warnMax = laser.warnMax || 78;
		var grow = clamp((warnMax - laser.warn) / (warnMax * .28), 1);
		grow = grow * grow * (3 - grow * 2);
		var endX = laser.x + dx * grow;
		var endY = laser.y + dy * grow;
		var pulse = .72 + Math.sin(laser.warn * .52) * .18;
		var width = laser.warnWidth || scaled(160);
		a.save();
		a.lineCap = 'round';
		a.globalAlpha = (.16 + grow * .16) * pulse;
		a.strokeStyle = '#8F0000';
		a.shadowColor = '#FF1F1F';
		a.shadowBlur = scaled(24);
		a.lineWidth = width;
		a.beginPath();
		a.moveTo(laser.x, laser.y);
		a.lineTo(endX, endY);
		a.stroke();
		a.restore();
		if (!timeStopped && !--laser.warn)
			play(13);
	}
}

// Little helper function to spawn a new enemy, calls the spawn method from the enemy object
function spawnEnemy(i, y, count, rank, formation)
{
	// Can be used to spawn a random enemy, currently unused
	if (i < 0 || i >= enemies.TYPES.length)
		i = Math.random() * enemies.TYPES.length | 0;
	var type = enemies.TYPES[i];
	if (!type.R)
		type.R = scaledInt(132);
	if (!type.image)
		type.image = enemyPlaceholder(type);
	var before = enemies.length;
	type.spawn(y, count, rank || 0, formation || 0);
	for (var j = before; j < enemies.length; j++)
	{
		ensureEnemyStartsOffscreen(enemies[j]);
		enemies[j].spawnAge = 0;
	}
}

function enemyOffscreenTop(enemy)
{
	var r = enemy.r || scaled(100);
	return -r * 1.45 - (enemy.yOffset || 0);
}

function ensureEnemyStartsOffscreen(enemy)
{
	if (!enemy || isEnemyInvulnerable(enemy))
		return;
	enemy.y = Math.min(enemy.y, enemyOffscreenTop(enemy));
	if (!enemy.yAcc)
		enemy.yAcc = motion(1.2);
}

function difficultyTier()
{
	return Math.max(0, ((l.level || 1) - 1) / 3 | 0);
}

function waveStep()
{
	return Math.max(0, (l.level || 1) - 1);
}

function waveMultiplier()
{
	var step = waveStep();
	return 1 + step * .18 + Math.pow(step, 1.35) * .07 + difficultyTier() * .08;
}

function waveEnemyCountMultiplier()
{
	return Math.pow(2, Math.max(0, ((l.level || 1) - 1) / 10 | 0));
}

function waveEnemyDensity()
{
	return (l.level || 1) >= 10 ? 2 / 3 : 1;
}

function enemyBatchChunkSize(type)
{
	var decade = Math.max(0, ((l.level || 1) - 1) / 10 | 0);
	var extra = Math.min(3, decade);
	return type === ENEMY_DIVER_TYPE ? 5 :
		type === ENEMY_SPIDER_TYPE ? 1 + Math.min(1, extra) :
		type === 2 ? 3 + extra :
		type === 1 ? 5 + extra :
		6 + extra;
}

function enemyHpMultiplier()
{
	var decade = Math.max(0, ((l.level || 1) - 1) / 10 | 0);
	return 1 + decade * .45 + Math.max(0, waveStep() - 3) * .018;
}

function enemyHp(base, earlyGrowth, lateGrowth, tierGrowth, earlyCut, rank)
{
	var wave = l.level || 1;
	var step = waveStep();
	var value = base * waveMultiplier() + step * earlyGrowth + Math.pow(step, 1.28) * lateGrowth + difficultyTier() * tierGrowth;
	value += (rank || 0) * (base * .075 + 1.25);
	if (wave <= 3)
		value -= earlyCut;
	else
		value *= enemyHpMultiplier();
	value *= 1 + enemyTraitLevel('vitality') * .25;
	return Math.max(4, value) | 0;
}

function bossHpValue(power, tier)
{
	var value = 240 * waveMultiplier() + power * 85 + tier * 150;
	value *= 1.35 + Math.min(.55, Math.max(0, power - 1) * .025);
	if (power >= 10)
		value *= 2;
	return value | 0;
}

function bossShieldValue(power, tier)
{
	if (power < 5)
		return 0;
	var value = 120 * waveMultiplier() + power * 48 + tier * 92;
	if (power >= 10)
		value *= 2;
	return value | 0;
}

function queueEnemy(type, delay, y, count, rank, formation, supportType, supportCount)
{
	enemyQueue.push({
		type: type,
		t: delay,
		y: y,
		count: Math.max(0, count | 0),
		rank: rank || 0,
		formation: formation || 0,
		supportType: supportType || 0,
		supportCount: Math.max(0, supportCount | 0)
	});
}

function formationPoint(index, total, r, yStop, formation)
{
	var n = total > 1 ? total - 1 : 1;
	var mid = n / 2;
	var offset = index - mid;
	var spacing = Math.min(l.WIDTH / (total + 1), r * 1.42);
	var x = l.WIDTH / 2 + offset * spacing;
	var y = yStop;
	switch (formation % 5)
	{
		case 1:
			y -= Math.abs(offset) * r * .34;
			break;
		case 2:
			y += Math.sin(index / n * Math.PI) * r * .48;
			break;
		case 3:
			x = index % 2 ? l.WIDTH * .25 + (index / 2 | 0) * spacing * .55 : l.WIDTH * .75 - (index / 2 | 0) * spacing * .55;
			y += (index / 2 | 0) * r * .1;
			break;
		case 4:
			y += index % 2 ? r * .34 : -r * .18;
			break;
		default:
			y += Math.abs(offset) * r * .12;
	}
	if (x < r)
		x = r;
	else if (x > l.WIDTH - r)
		x = l.WIDTH - r;
	return { x: x | 0, yStop: y | 0 };
}

function spawnCombatWave()
{
	var tier = difficultyTier();
	var wave = l.level || 1;
	var delay = 60;
	var step = waveStep();
	var pattern = wave === 1 ? [0, 1, 0, 1, 0, 1, 0, 1, 0, 1] :
		wave < 3 ? [0, 1, 0, 2, 0, 1, 2, 0, 1, 2] :
		wave < 4 ? [0, 1, ENEMY_DIVER_TYPE, 0, 2, ENEMY_DIVER_TYPE, 1, 0, ENEMY_DIVER_TYPE, 2] :
		[0, 1, ENEMY_DIVER_TYPE, 0, 2, ENEMY_DIVER_TYPE, 0, 1, ENEMY_DIVER_TYPE, 2];
	var spacing = Math.max(44, 70 - tier * 4 - Math.min(12, step * 2));
	var nextBatchDelay = 60;
	var waveCount = Math.min(5, step / 2 | 0);
	var countMultiplier = waveEnemyCountMultiplier() * waveEnemyDensity();
	enemyQueue.length = 0;
	for (var pack = 0; pack < 10; pack++)
	{
		var type = pattern[(pack + Math.min(2, tier)) % pattern.length];
		var count = 2 + (pack / 3 | 0) + waveCount + Math.min(2, tier);
		if (type === 1)
			count--;
		else if (type === 2)
			count -= 2;
		if (wave === 1 && type === 1)
			count = Math.min(count, 3);
		if (pack > 6)
			count++;
		if (type === ENEMY_DIVER_TYPE)
			count = 5;
		else if (type === ENEMY_SPIDER_TYPE)
			count = 1 + (wave >= 8 && pack > 6 ? 1 : 0);
		count = Math.max(type === 2 || type === ENEMY_SPIDER_TYPE ? 1 : 2, count);
		count = Math.min(type === 0 ? 10 : type === 1 ? 8 : type === ENEMY_DIVER_TYPE ? 5 : type === ENEMY_SPIDER_TYPE ? 2 : 6, count);
		count = Math.max(type === 2 || type === ENEMY_SPIDER_TYPE ? 1 : 2, Math.ceil(count * countMultiplier));
		var spiderCount = wave >= 4 && (pack === 3 || pack === 7 || (wave >= 8 && pack === 5)) ? 1 : 0;
		if (wave >= 10 && pack === 7)
			spiderCount++;
		spiderCount = spiderCount ? Math.max(1, Math.ceil(spiderCount * countMultiplier)) : 0;
		var spawnY = -(.34 + pack % 3 * .035) * l.HEIGHT;
		queueEnemy(type, pack ? nextBatchDelay : delay, spawnY, count, pack + step * .65 + tier * 1.2, pack + wave, spiderCount ? ENEMY_SPIDER_TYPE : 0, spiderCount);
	}
}

function keepEnemyFromBlockingWave(enemy)
{
	enemy.spawnAge = (enemy.spawnAge || 0) + 1;
	if (enemy.bossPower || enemy.spawnAge < 150 || !isEnemyInvulnerable(enemy))
		return;
	var y = enemy.y + (enemy.yOffset || 0);
	if (y < -enemy.r * .35)
		enemy.y += -enemy.r * .25 - y;
	if (enemy.x < -enemy.r * .35 || enemy.x > l.WIDTH + enemy.r * .35)
	{
		enemy.y = Math.min(enemy.y, enemyOffscreenTop(enemy));
		enemy.x = clamp(enemy.entryXTarget || enemy.xTarget || l.WIDTH / 2, l.WIDTH - enemy.r);
		enemy.entryXAcc = 0;
	}
}

function preventWaveStall()
{
	for (var i = enemies.length; i--; )
		keepEnemyFromBlockingWave(enemies[i]);
}

function applyEnemyTraitState(enemy)
{
	if (!enemy || enemy.bossPower)
		return;
	var shieldLevel = enemyTraitLevel('shieldGen');
	if (shieldLevel && !enemy.traitShielded)
	{
		var shield = 4 + shieldLevel * 3 + difficultyTier() * 2 + (waveStep() / 3 | 0);
		enemy.shield = Math.max(enemy.shield || 0, shield);
		enemy.shieldBoost = 28;
		enemy.traitShielded = 1;
	}
}

function applyEnemyFireTrait(enemy)
{
	var level = enemyTraitLevel('rapidFire');
	if (!level || !enemy || enemy.bossPower)
		return;
	enemy.t = Math.max(8, enemy.t * Math.pow(.8, level) | 0);
}

function spawnSelfDestruct(enemy)
{
	var level = enemyTraitLevel('selfDestruct');
	if (!level || !enemy || enemy.bossPower)
		return;
	selfDestructs.push({
		x: enemy.x,
		y: enemy.y + (enemy.yOffset || 0),
		r: enemy.r * (1.35 + level * .15),
		t: 30,
		maxT: 30,
		hit: false
	});
}

function updateEnemyQueue()
{
	if (l.intro || l.text.t)
		return;
	preventWaveStall();
	if (!enemyQueue.length)
		return;
	if (enemies.length)
		return;
	var batch = enemyQueue[0];
	if (--batch.t <= 0)
	{
		var count = Math.min(batch.count, enemyBatchChunkSize(batch.type));
		var supportCount = batch.supportType ? Math.min(batch.supportCount, enemyBatchChunkSize(batch.supportType)) : 0;
		if (count > 0)
			spawnEnemy(batch.type, batch.y, count, batch.rank, batch.formation);
		if (batch.supportType && supportCount > 0)
			spawnEnemy(batch.supportType, batch.y - l.HEIGHT * .08, supportCount, batch.rank + 1, batch.formation + 3);
		batch.count -= count;
		batch.supportCount -= supportCount;
		if (batch.count > 0 || batch.supportCount > 0)
		{
			batch.t = 16;
			batch.rank += .35;
			batch.formation++;
			batch.y -= l.HEIGHT * .015;
		}
		else
			enemyQueue.splice(0, 1);
	}
}

function upperSideEntry(r, yStop, chance, xTarget)
{
	if (Math.random() >= chance)
		return null;
	var side = Math.random() < .5 ? -1 : 1;
	var fromCorner = Math.random() < .65;
	return {
		x: side < 0 ? -r * 1.7 : l.WIDTH + r * 1.7,
		y: fromCorner ? -r * (1 + Math.random() * 1.6) : yStop - l.HEIGHT * (.16 + Math.random() * .18),
		xTarget: xTarget !== undefined ? xTarget : r + (l.WIDTH - r * 2) * Math.random() | 0,
		yTarget: yStop,
		xAcc: side < 0 ? motion(4.4) : -motion(4.4),
		yAcc: motion(fromCorner ? 1.85 : 1.45)
	};
}

function sideEntry(r, yStop, chance, xTarget)
{
	return upperSideEntry(r, yStop, chance, xTarget);
}

function isEnemyInvulnerable(enemy)
{
	var y = enemy.y + (enemy.yOffset || 0);
	return y < -enemy.r * .35 || enemy.x < -enemy.r * .35 || enemy.x > l.WIDTH + enemy.r * .35;
}

function spawnSplitEnemies(enemy)
{
	if ((l.level || 0) < 4 || enemy.splitChild || !enemy.split)
		return;
	for (var n = 2; n--; )
	{
		var dir = n ? 1 : -1;
		var child = {
			image: enemy.image,
			frames: enemy.frames,
			x: enemy.x + dir * enemy.r * .45,
			y: enemy.y,
			yStop: Math.min(l.HEIGHT * .54, enemy.y + enemy.r * 1.2),
			r: enemy.r * .68,
			angle: enemy.angle || 0,
			maxAngle: enemy.maxAngle || Math.PI / 32,
			e: Math.max(3, enemy.eMax / 3 | 0),
			eMax: Math.max(3, enemy.eMax / 3 | 0),
			t: 45 + Math.random() * 90 | 0,
			xDrift: dir * scaled(1.6),
			yAcc: motion(1.9),
			splitChild: 1,
			shoot: enemy.shoot
		};
		ensureEnemyStartsOffscreen(child);
		child.spawnAge = 0;
		enemies.push(child);
	}
}

function updateDiveEnemy(enemy)
{
	if (enemy.y < enemy.yStop && enemy.diveDelay > 0)
	{
		enemy.y += enemy.yAcc || motion(4);
		if (enemy.y > enemy.yStop)
			enemy.y = enemy.yStop;
		return;
	}
	if (enemy.diveDelay > 0)
	{
		enemy.diveDelay--;
		enemy.x += Math.sin((enemy.diveDelay + enemy.divePhase) * .12) * scaled(.9);
		return;
	}
	if (!enemy.diveReady)
	{
		var dx = ship.x - enemy.x;
		var dy = ship.y - enemy.y;
		var dist = Math.sqrt(dx * dx + dy * dy) || 1;
		var speed = motion(8.4 + Math.min(2.8, waveStep() * .18));
		enemy.diveXAcc = dx / dist * speed;
		enemy.diveYAcc = dy / dist * speed;
		enemy.diveReady = 1;
	}
	enemy.x += enemy.diveXAcc;
	enemy.y += enemy.diveYAcc;
}

function updateSpiderSupport(spider)
{
	if (spider.buffT > 0)
	{
		spider.buffT--;
		return;
	}
	spider.buffT = Math.max(70, 150 - waveStep() * 5 - difficultyTier() * 12) | 0;
	var maxShield = 3 + difficultyTier() * 2 + (waveStep() / 4 | 0);
	var boosted = 0;
	for (var i = enemies.length; i--; )
	{
		var target = enemies[i];
		if (target === spider || target.bossPower || target.spiderSupport || isEnemyInvulnerable(target))
			continue;
		if ((target.shield || 0) >= maxShield)
			continue;
		target.shield = Math.min(maxShield, (target.shield || 0) + 2 + difficultyTier());
		target.shieldBoost = 28;
		if (++boosted >= 3 + difficultyTier())
			break;
	}
}

function renderSpiderSilk(enemy, y)
{
	a.save();
	a.globalAlpha = .78 + Math.sin(l.y / l.SCALE * .08 + enemy.x * .01) * .12;
	a.strokeStyle = '#F4FBFF';
	a.shadowColor = '#FFFFFF';
	a.shadowBlur = scaled(8);
	a.lineWidth = Math.max(2, scaled(3));
	a.beginPath();
	a.moveTo(enemy.x, 0);
	a.lineTo(enemy.x + Math.sin(l.y / l.SCALE * .05 + enemy.silkPhase) * scaled(6), y - enemy.r * .22);
	a.stroke();
	a.globalAlpha = .34;
	a.lineWidth = Math.max(1, scaled(1.2));
	a.beginPath();
	a.moveTo(enemy.x - scaled(5), 0);
	a.lineTo(enemy.x - scaled(2), y - enemy.r * .3);
	a.stroke();
	a.restore();
}

function killEnemy(i, source)
{
	var enemy = enemies[i];
	if (l.stats)
	{
		l.stats.kills++;
		trackKillSource(source);
	}
	addScore(100);
	addKillerEnergy(enemy.bossPower ? 35 : 8);
	spawnSelfDestruct(enemy);
	spawnBonus(enemy);
	spawnSplitEnemies(enemy);
	explode(enemy.x, enemy.y, enemy.r * 2);
	if (enemy.bossPower)
	{
		l.upgradeDelay = 48 + 120;
		l.bossHealthZero = l.upgradeDelay + 30;
		showBossHealthZero();
	}
	enemies.splice(i, 1);
	play(10);
}

function showBossHealthZero()
{
	var entering = !bossHealth.className || bossHealth.className === 'boss-health';
	bossHealth.className = 'boss-health active' + (entering ? ' enter' : '');
	bossHealth.setAttribute('aria-hidden', 'false');
	bossHealthFill.style.transform = 'scaleX(0)';
	if (bossHealthShieldFill)
		bossHealthShieldFill.style.transform = 'scaleX(0)';
	bossHealthText.textContent = '0%';
}

function damageEnemy(i, damage, x, y, source)
{
	if (!enemies[i])
		return false;
	if (isEnemyInvulnerable(enemies[i]))
		return false;
	damage *= enemyTraitDamageMultiplier(source, enemies[i]);
	if (!enemies[i].bossPower)
		enemies[i].hitFlash = 8;
	addScore(damage);
	addKillerEnergy(damage * .18);
	hitSpark(x, y);
	if (enemies[i].shield > 0)
	{
		var shieldBefore = enemies[i].shield;
		var shieldMultiplier = source === 'laser' ? 1.65 : 1;
		if (source === 'laser')
		{
			shieldSpark(x, y, Math.min(enemies[i].r * .56, scaled(150)));
			enemies[i].shieldBoost = 18;
		}
		enemies[i].shield -= damage * shieldMultiplier;
		if (enemies[i].shield >= 0)
		{
			play(2);
			return false;
		}
		if (enemies[i].bossPower)
		{
			enemies[i].shield = 0;
			play(2);
			return false;
		}
		damage = Math.max(0, damage - shieldBefore / shieldMultiplier);
		enemies[i].shield = 0;
		if (!damage)
			return false;
	}
	if ((enemies[i].e -= damage) <= 0)
	{
		killEnemy(i, source);
		return true;
	}
	return false;
}

function play(i)
{
	if (sfx[i] && sfx[i][sfx[i].i])
	{
		var now = Date.now();
		var cooldown = sfxCooldown[i] || 0;
		if (cooldown && sfxLastPlayed[i] && now - sfxLastPlayed[i] < cooldown)
			return;
		sfxLastPlayed[i] = now;
		var audio = sfx[i][sfx[i].i++];
		try
		{
			audio.currentTime = 0;
			audio.volume = sfxVolume(i);
		}
		catch (e)
		{
		}
		audio.play(true);
		sfx[i].i %= sfx[i].length;
		if (sfxDucksBgm[i])
			duckBgm(sfxDucksBgm[i][0], sfxDucksBgm[i][1]);
	}
}

function sfxVolume(i)
{
	return SFX_MASTER_VOLUME * (sfxVolumes[i] === undefined ? .5 : sfxVolumes[i]);
}

// Helper function to render all the static buffered canvas image objects
function render(f, w, h, c)
{
	if (!c)
		c = document.createElement('canvas');
	c.width = w | 0;
	c.height = (h || w) | 0;
	var a = c.getContext('2d');
	a.imageSmoothingEnabled = true;
	a.imageSmoothingQuality = 'high';
	f(c, a);
	return c;
}

function transparentSprite(w, h, c)
{
	if (!c)
		c = document.createElement('canvas');
	c.width = w | 0;
	c.height = (h || w) | 0;
	c.getContext('2d').clearRect(0, 0, c.width, c.height);
	return c;
}

function enemyPlaceholder(type)
{
	if (!type.R)
		type.R = scaledInt(132);
	type.placeholderImage = transparentSprite(type.R * 2, type.R * 2, type.placeholderImage);
	return type.placeholderImage;
}

var enemyFlashCanvas = document.createElement('canvas');

function drawEnemyImage(image, enemy, y)
{
	var drawX = -enemy.r;
	var drawY = enemy.y - y - enemy.r;
	var drawSize = enemy.r * 2;
	if (!enemy.hitFlash)
	{
		a.drawImage(image, drawX, drawY, drawSize, drawSize);
		return;
	}
	var c = enemyFlashCanvas;
	var size = Math.ceil(drawSize);
	if (c.width !== size || c.height !== size)
	{
		c.width = size;
		c.height = size;
	}
	var ctx = c.getContext('2d');
	ctx.clearRect(0, 0, size, size);
	ctx.drawImage(image, 0, 0, size, size);
	ctx.globalCompositeOperation = 'source-atop';
	ctx.globalAlpha = Math.min(.38, enemy.hitFlash / 8 * .38);
	ctx.fillStyle = '#FF1E18';
	ctx.fillRect(0, 0, size, size);
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
	a.drawImage(c, drawX, drawY, drawSize, drawSize);
}

// The players ship and all enemies do have a bright diamond shape in their center
function renderHeart(a, x, y)
{
	var p = ship.R / 6 | 0;
	a.beginPath();
	a.moveTo(x - p, y);
	a.lineTo(x, y + p);
	a.lineTo(x + p, y);
	a.lineTo(x, y - p);
	a.closePath();
	a.globalCompositeOperation = 'lighter';
	a.shadowColor = '#FFF';
	a.stroke();
}

// Helper function to spawn the title, "WAVE 1", "PAUSE" and "GAME OVER" text objects
function spawnText(text, t)
{
	// Always render the buffered image first
	l.text.image = render(function(c, a)
	{
		a.shadowBlur = c.height / 10 | 0;
		a.font = 'bold ' + (c.height * .9 - a.shadowBlur * 2 | 0) + 'px Consolas,monospace';
		a.textAlign = 'center';
		a.textBaseline = 'middle';

		var maxWidth = c.width - a.shadowBlur * 2;

		a.fillStyle = '#62F';
		a.shadowColor = '#FFF';
		for (var i = 2; i--; )
			a.fillText(text, c.width / 2, c.height / 2, maxWidth);

		a.fillStyle = '#FFF';
		a.shadowBlur /= 4;
		a.shadowColor = 'rgba(0,0,0,.5)';

		a.lineWidth = a.shadowBlur;
		a.lineJoin = 'round';
		a.strokeStyle = '#FFF';
		a.shadowColor = '#000';
		a.strokeText(text, c.width / 2, c.height / 2, maxWidth);

		a.globalAlpha = .2;
		a.globalCompositeOperation = 'source-atop';
		a.fillStyle = '#62F';
		// It seems I forgot to set shadowBlur = 0 here
		for (var i = 0; i < c.height; i += 3)
			a.fillRect(0, i, c.width, 1);
	}, l.WIDTH / 1.6, l.WIDTH / 8, l.text.image);
	l.text.x = (l.WIDTH - l.text.image.width) / 2 | 0;
	l.text.y = scaledInt(16);
	l.text.yAcc = l.SPEED / 2;
	l.text.t = t || l.text.MAX_T;
	// The "PAUSE" and "GAME OVER" texts need to be drawn instantly
	if (t < 0)
	{
		l.text.t = 0;
		a.globalAlpha = 1;
		a.drawImage(l.text.image, l.text.x, l.text.y);
	}
}

// Render the ten numbers for the points in the upper right corner of the screen
for (var number = 10; number--; )
	l.points.images[number] = render(function(c, a)
	{
		a.shadowBlur = 6;
		a.font = 'bold ' + (c.width * 1.3 | 0) + 'px Consolas,monospace';
		a.textAlign = 'center';
		a.textBaseline = 'middle';
		a.lineWidth = 2;
		a.lineJoin = 'round';
		a.shadowColor = '#9F0';
		a.strokeText(number, c.width / 2, c.height / 2);
		a.strokeStyle = '#9F0';
		a.strokeText(number, c.width / 2, c.height / 2);
	}, l.points.WIDTH, l.points.HEIGHT);

// Render the level background
l.background = null;

ship.image = null;

// The remake uses the Garuda shell sprite instead of the original generated shield.
ship.frames = [];
ship.specialFrames = [];
ship.bombFrames = [];
ship.killerFrames = [];
ship.shield.image = null;
ship.shield.frames = [];
ship.shield.loopFrames = [];

bullets.image = transparentSprite(bullets.W, bullets.H);
explosions.image = transparentSprite(16, 16);

// Buffer a sprite sheet instead of rotating the possible many, many torpedos on screen
torpedos.images = [];
var count = 8;
for (var i = count; i--; )
	torpedos.images.push(transparentSprite(torpedos.R * 2, torpedos.R * 2));
torpedos.image = torpedos.images[0];

// I wanted to use real inheritance but this is not so easy in JavaScript, unfortunately
enemies.TYPES = [
	// Enemy number 0 is the smallest
	{
		render: function(c, a)
		{
			a.lineWidth = 3;
			a.shadowBlur = a.lineWidth * 2;
			a.strokeStyle = '#62F';
			a.shadowColor = a.strokeStyle;
			a.miterLimit = 128;
			a.beginPath();
			for (var i = 5; i--; )
			{
				var x1 = c.width * (6 - i) / 11, y1 = c.height * (6 - i) / 20;
				var x2 = c.width * (11 - i) / 26, y2 = c.height * (1 + i) / 9;
				a.moveTo(c.width / 2, c.height * (12 - i) / 12 - a.shadowBlur);
				a.lineTo(c.width - x1, y1);
				a.lineTo(c.width - x2, y2);
				a.lineTo(x2, y2);
				a.lineTo(x1, y1);
				a.closePath();
			}
			a.stroke();
			a.stroke();
			renderHeart(a, c.width / 2, c.height / 2);
		},
		spawn: function(y, count, rank, formation)
		{
			var tier = difficultyTier();
			var step = waveStep();
			rank = rank || 0;
			var total = count || Math.min(5, 2 + (l.level / 2 | 0) + tier);
			for (var i = total; i--; )
			{
				var yStop = l.HEIGHT / 8 + Math.random() * l.HEIGHT / 4 | 0;
				var point = formationPoint(i, total, this.R, yStop, formation);
				yStop = point.yStop;
				var hp = (l.level || 1) === 1 ? 3 : enemyHp(8, 2, 2, 4, 2, rank);
				var entry = sideEntry(this.R, yStop, .34 + Math.min(.46, step * .05 + tier * .05 + rank * .012), point.x);
				enemies.push({
					image: this.image,
					frames: this.frames,
					x: entry ? entry.x : point.x,
					y: entry ? entry.y : (y ? yStop + y : -this.R),
					yStop: yStop,
					r: this.R,
					angle: 0,
					maxAngle: Math.PI / Math.max(7, 11 - Math.min(4, step + (rank / 3 | 0))),
					e: hp,
					eMax: hp,
					split: l.level >= 4 || rank >= 8,
					volley: l.level >= 3 || rank >= 5,
					t: Math.random() * Math.max(48, 220 - step * 12 - tier * 24 - rank * 5) | 0,
					yAcc: entry ? entry.yAcc : motion(1.25 + tier * .16 + Math.min(.62, step * .035 + rank * .018)),
					xDrift: l.level >= 2 || rank >= 3 ? (Math.random() < .5 ? -1 : 1) * scaled(.45 + Math.min(1.7, step * .16 + rank * .06)) : 0,
					entryXAcc: entry ? entry.xAcc : 0,
					entryXTarget: entry ? entry.xTarget : 0,
					shoot: this.shoot
				});
			}
		},
		shoot: function(angle)
		{
			//this.t = 240 - l.level * 20;
			this.t = 1100 / (l.level + 4 + difficultyTier() * 2) | 0;
			if (this.t < 10)
				this.t = 10;
			var fired = spawnTorpedo(this, angle, this.maxAngle);
			if (this.volley && Math.random() < .55)
			{
				fired = spawnTorpedo(this, angle + .09, this.maxAngle * 2) || fired;
				fired = spawnTorpedo(this, angle - .09, this.maxAngle * 2) || fired;
			}
			if (fired)
				play(19);
		}
	},
	// Enemy number 1 is slightly bigger than enemy number 0, but almost the same
	{
		render: function(c, a)
		{
			a.lineWidth = 3;
			a.shadowBlur = a.lineWidth * 2;
			a.strokeStyle = '#62F';
			a.shadowColor = a.strokeStyle;
			for (var i = 5; i--; )
			{
				var x1 = c.width * (5 - i) / 14 + a.shadowBlur, y1 = c.height * (16 - i) / 17;
				var x2 = c.width * (8 - i) / 22, y2 = c.height * (1 + i) / 11;
				a.moveTo(c.width / 2, c.height * (6 - i) / 12);
				a.lineTo(c.width - x1, y1);
				a.lineTo(c.width - x2, y2);
				a.lineTo(x2, y2);
				a.lineTo(x1, y1);
				a.closePath();
			}
			a.stroke();
			a.stroke();
			renderHeart(a, c.width / 2, c.height / 2);
		},
		spawn: function(y, count, rank, formation)
		{
			var tier = difficultyTier();
			var step = waveStep();
			rank = rank || 0;
			var total = count || Math.min(4, 1 + (l.level / 2 | 0) + tier);
			for (var i = total; i--; )
			{
				var yStop = l.HEIGHT / 8 + Math.random() * l.HEIGHT / 4 | 0;
				var point = formationPoint(i, total, this.R, yStop, formation);
				yStop = point.yStop;
				var hp = enemyHp(12, 3, 3, 5, 2, rank);
				var entry = sideEntry(this.R, yStop, .48 + Math.min(.42, step * .045 + tier * .06 + rank * .012), point.x);
				enemies.push({
					image: this.image,
					frames: this.frames,
					x: entry ? entry.x : point.x,
					y: entry ? entry.y : (y ? yStop + y : -this.R),
					yStop: yStop,
					r: this.R,
					angle: 0,
					maxAngle: Math.PI / Math.max(6, 12 - Math.min(5, step + (rank / 2 | 0))),
					e: hp,
					eMax: hp,
					t: Math.random() * Math.max(38, 205 - step * 13 - tier * 24 - rank * 5) | 0,
					yAcc: entry ? entry.yAcc : motion(1.25 + tier * .18 + Math.min(.68, step * .04 + rank * .018)),
					move: 'wander',
					moveT: 0,
					dashCooldown: Math.max(24, 98 - step * 7 - tier * 10 - rank * 4) + Math.random() * Math.max(42, 145 - step * 8 - tier * 14 - rank * 5) | 0,
					dashTime: 0,
					sideShots: l.level >= 4 || rank >= 6,
					xTarget: entry ? entry.xTarget : point.x,
					yTarget: entry ? entry.yTarget : yStop,
					entryXAcc: entry ? entry.xAcc : 0,
					entryXTarget: entry ? entry.xTarget : 0,
					animOffset: Math.random() * 120 | 0,
					shoot: this.shoot
				});
			}
		},
		shoot: function(angle)
		{
			//this.t = 240 - l.level * 20;
			this.t = 1200 / (l.level + 4 + difficultyTier() * 2) | 0;
			if (this.t < 10)
				this.t = 10;
			// I can't use the angle calculation from the spawnTorpedo() function because of the two directions
			if (angle > Math.PI)
				angle -= Math.PI * 2;
			if (angle > this.maxAngle)
				angle = this.maxAngle;
			if (angle < -this.maxAngle)
				angle = -this.maxAngle;
			var fired = spawnTorpedo(this, angle + .1) ||
			    spawnTorpedo(this, angle - .1);
			if (this.sideShots)
			{
				fired = spawnTorpedo(this, angle + .24, this.maxAngle * 2) || fired;
				fired = spawnTorpedo(this, angle - .24, this.maxAngle * 2) || fired;
			}
			if (fired)
				play(20);
		}
	},
	// Enemy number 2 is probably the most dangerous, fires in all directions but does not aim
	{
		render: function(c, a)
		{
			a.lineWidth = 3;
			a.shadowBlur = a.lineWidth * 2;
			a.strokeStyle = '#62F';
			a.shadowColor = a.strokeStyle;
			a.miterLimit = 32;
			a.beginPath();
			for(var i = 0; i < Math.PI * 2; i += Math.PI / 4)
			{
				var d = Math.PI / 12;
				var r = c.width / 2 - a.shadowBlur;
				var x = c.width / 2 + Math.sin(i + d) * r, y = c.width / 2 + Math.cos(i + d) * r;
				if (!i)
					a.moveTo(x, y); else a.lineTo(x, y);
				d -= Math.PI / 1.45;
				a.lineTo(c.width / 2 + Math.sin(i + d) * r, c.width / 2 + Math.cos(i + d) * r);
			}
			a.closePath();
			for(var i = 0; i < Math.PI * 2; i += Math.PI / 4)
			{
				var r = c.width * .4;
				var x = c.width / 2 + Math.sin(i) * r, y = c.width / 2 + Math.cos(i) * r;
				if (!i)
					a.moveTo(x, y); else a.lineTo(x, y);
			}
			a.closePath();
			a.stroke();
			a.stroke();
			renderHeart(a, c.width / 2, c.height / 2);
		},
		spawn: function(y, count, rank, formation)
		{
			var tier = difficultyTier();
			var step = waveStep();
			rank = rank || 0;
			var total = count || Math.min(3, 1 + (l.level / 3 | 0) + (tier / 2 | 0));
			for (var i = total; i--; )
			{
				var hp = enemyHp(16, 3, 3, 6, 2, rank);
				var yStop = l.HEIGHT / 2 | 0;
				var point = formationPoint(i, total, this.R, yStop, formation);
				yStop = point.yStop;
				var entry = sideEntry(this.R, yStop, .28 + Math.min(.38, step * .035 + tier * .05 + rank * .01), point.x);
				enemies.push({
					image: this.image,
					x: entry ? entry.x : point.x,
					y: entry ? entry.y : (y ? yStop + y : -this.R),
					yStop: yStop,
					r: this.R,
					angle: 0,
					maxAngle: Math.PI * 32,
					e: hp,
					eMax: hp,
					shield: (l.level || 1) < 2 ? 0 : 2 + ((step + rank) / 2 | 0) + tier,
					t: Math.random() * Math.max(10, 58 - step * 4 - tier * 6 - rank * 2) | 0,
					fireDirection: Math.random() * Math.PI,
					ringShots: Math.min(8, 2 + ((step + rank) / 2 | 0)),
					yAcc: entry ? entry.yAcc : motion(1.1 + tier * .12 + Math.min(.58, step * .03 + rank * .015)),
					entryXAcc: entry ? entry.xAcc : 0,
					entryXTarget: entry ? entry.xTarget : 0,
					shoot: this.shoot
				});
			}
		},
		shoot: function(angle)
		{
			// Insert a bigger pause between every 5 shots
			if (!this.tActive)
			{
				this.tActive = 5;
				// But the pause gets shorter every level
				//this.t = 60 - l.level * 4;
				this.t = 500 / (l.level + 8 + difficultyTier() * 3) | 0;
			}
			this.tActive--;
			if (this.t < 5)
				this.t = 5;
			this.fireDirection += .2 + Math.min(.18, waveStep() * .018);
			var result;
			var shots = this.ringShots || 2;
			for (var i = shots; i--; )
				result = spawnTorpedo(this, this.fireDirection + Math.PI * 2 * i / shots);
			if (result)
				play(18);
		}
	},
	// Enemy number 3 is a small diver. It attacks in packs and rams the player.
	{
		R: scaledInt(92),
		render: function(c, a)
		{
			a.lineWidth = 3;
			a.shadowBlur = a.lineWidth * 2;
			a.strokeStyle = '#7CFF55';
			a.shadowColor = a.strokeStyle;
			a.beginPath();
			a.moveTo(c.width / 2, c.height * .12);
			a.lineTo(c.width * .86, c.height * .72);
			a.lineTo(c.width * .58, c.height * .58);
			a.lineTo(c.width / 2, c.height * .9);
			a.lineTo(c.width * .42, c.height * .58);
			a.lineTo(c.width * .14, c.height * .72);
			a.closePath();
			a.stroke();
			a.stroke();
		},
		spawn: function(y, count, rank, formation)
		{
			var tier = difficultyTier();
			var step = waveStep();
			rank = rank || 0;
			var total = count || 5;
			var center = l.WIDTH * (.28 + Math.random() * .44);
			var spacing = Math.min(this.R * 1.45, l.WIDTH / (total + 1));
			for (var i = total; i--; )
			{
				var offset = i - (total - 1) / 2;
				var hp = enemyHp(6, 1.7, 1.9, 3, 1, rank);
				if ((l.level || 1) === 3)
					hp = Math.max(3, hp * .82 | 0);
				var x = center + offset * spacing;
				if (x < this.R)
					x = this.R;
				else if (x > l.WIDTH - this.R)
					x = l.WIDTH - this.R;
				enemies.push({
					image: this.image,
					frames: this.frames,
					x: x,
					y: y ? y + offset * this.R * .14 : -this.R * (2.5 + i * .18),
					yStop: l.HEIGHT * (.14 + (i % 2) * .035),
					r: this.R,
					angle: 0,
					maxAngle: Math.PI / 5,
					e: hp,
					eMax: hp,
					t: 70 + Math.random() * Math.max(30, 100 - step * 5) | 0,
					yAcc: motion(5.2 + tier * .25),
					diveDelay: 32 + i * 7 + Math.random() * 16 | 0,
					divePhase: Math.random() * 90 | 0,
					move: 'dive',
					shoot: this.shoot
				});
			}
		},
		shoot: function(angle)
		{
			this.t = Math.max(32, 92 - waveStep() * 4 - difficultyTier() * 8) | 0;
			if (!this.diveReady && spawnTorpedo(this, angle, this.maxAngle))
				play(19);
		}
	},
	// Enemy number 4 is a hanging spider support unit. It shields nearby enemies.
	{
		R: scaledInt(162),
		render: function(c, a)
		{
			a.lineWidth = 3;
			a.shadowBlur = a.lineWidth * 2;
			a.strokeStyle = '#7CFF55';
			a.shadowColor = a.strokeStyle;
			a.beginPath();
			a.arc(c.width / 2, c.height / 2, c.width * .32, 0, Math.PI * 2);
			a.stroke();
			a.stroke();
		},
		spawn: function(y, count, rank, formation)
		{
			var tier = difficultyTier();
			var step = waveStep();
			rank = rank || 0;
			var total = count || 1;
			for (var i = total; i--; )
			{
				var hp = enemyHp(26, 4, 5, 9, 2, rank);
				var x = (i + 1) * l.WIDTH / (total + 1);
				x += Math.sin((formation || 0) + i) * l.WIDTH * .12;
				if (x < this.R * .75)
					x = this.R * .75;
				else if (x > l.WIDTH - this.R * .75)
					x = l.WIDTH - this.R * .75;
				enemies.push({
					image: this.image,
					frames: this.frames,
					x: x,
					y: y ? y : -this.R * 2.4,
					yStop: l.HEIGHT * (.18 + Math.random() * .12),
					r: this.R,
					angle: 0,
					maxAngle: Math.PI / 18,
					e: hp,
					eMax: hp,
					shield: 3 + tier,
					t: 95 + Math.random() * 80 | 0,
					yAcc: motion(1.55 + tier * .08),
					spiderSupport: 1,
					silkPhase: Math.random() * 90,
					buffT: 45 + Math.random() * 60 | 0,
					xDrift: Math.sin((formation || 0) + i) * scaled(.28),
					shoot: this.shoot
				});
			}
		},
		shoot: function(angle)
		{
			this.t = Math.max(38, 128 - waveStep() * 5 - difficultyTier() * 8) | 0;
			var fired = spawnTorpedo(this, angle, this.maxAngle * 2);
			if ((l.level || 0) >= 6)
			{
				fired = spawnTorpedo(this, angle + .18, this.maxAngle * 2.5) || fired;
				fired = spawnTorpedo(this, angle - .18, this.maxAngle * 2.5) || fired;
			}
			if (fired)
				play(20);
		}
	},
	// Enemy number 5 was the first I created, the idea is it grows bigger and bigger like in "Warning Forever"
	{
		R: scaledInt(264),
		render: function(c, a)
		{
			a.lineWidth = 3;
			a.shadowBlur = a.lineWidth * 2;
			a.strokeStyle = '#62F';
			a.shadowColor = a.strokeStyle;
			a.miterLimit = 32;
			a.beginPath();
			for (var i = 7; i--; )
			{
				a.moveTo(c.width / 2, c.height * i / 12 + a.shadowBlur);
				var x1 = c.width * (11 + i) / 18 - a.shadowBlur;
				var y1 = c.height * (25 - i) / 28;
				a.lineTo(x1, y1);
				var x2 = c.width * (16 - i) / 16 - a.shadowBlur;
				var y2 = c.height * (i + 4) / 28;
				a.lineTo(x2, y2);
				a.lineTo(c.width / 2, c.height * (i + 30) / 36 - a.shadowBlur);
				a.lineTo(c.width - x2, y2);
				a.lineTo(c.width - x1, y1);
				a.closePath();
			}
			a.stroke();
			a.stroke();
			renderHeart(a, c.width / 2, c.height * .8);
		},
		spawn: function(y)
		{
			var yStart = y || -this.R * 3;
			var power = l.level || 1;
			var tier = difficultyTier();
			var e = bossHpValue(power, tier);
			var shield = bossShieldValue(power, tier);
			var tStart = 2 * 60;
			enemies.push({
				image: this.image,
				frames: this.frames,
				x: l.WIDTH / 2,
				y: yStart,
				yOffset: this.R * .6 | 0,
				yStop: this.R + scaled(8),
				r: this.R,
				angle: 0,
				maxAngle: Math.PI / 8,
				e: e,
				eMax: e,
				shield: shield,
				shieldMax: shield,
				t: tStart + Math.random() * 60 | 0,
				yAcc: motion(4),
				bossPower: power,
				cannonXOffset: this.R * .62 | 0,
				cannonYOffset: this.R * .1 | 0,
				burstShots: 0,
				burstPause: 0,
				laserInterval: bossLaserInterval(power),
				laserT: bossLaserInterval(power),
				animOffset: 0,
				shoot: this.shoot
			});
		},
		shoot: function(angle)
		{
			var power = this.bossPower || l.level || 1;
			var tier = difficultyTier();
			if (this.burstPause > 0)
			{
				this.burstPause--;
				this.t = 1;
				return;
			}
			if (!this.burstShots)
				this.burstShots = Math.min(5, 2 + (power / 3 | 0) + (tier / 2 | 0));
			this.burstShots--;
			this.t = Math.max(14, 24 - tier * 2) | 0;
			if (!this.burstShots)
				this.burstPause = Math.max(70, 128 - power * 5 - tier * 8) | 0;
			var count = Math.min(5, 3 + (power / 4 | 0) + (tier / 3 | 0));
			if (!(count % 2))
				count++;
			var mid = (count - 1) / 2;
			var fired = false;
			var left = bossCannonOrigin(this, -1);
			var right = bossCannonOrigin(this, 1);
			var leftAim = angleToShipFrom(left.x, left.y);
			var rightAim = angleToShipFrom(right.x, right.y);
			var spreadStep = .12 + Math.min(.04, tier * .008);
			for (var i = count; i--; )
			{
				var spread = (i - mid) * spreadStep;
				fired = spawnTorpedoAt(left.x, left.y, leftAim + spread) || fired;
				fired = spawnTorpedoAt(right.x, right.y, rightAim + spread) || fired;
			}
			if (fired)
				play(12);
		}
	}
];

function fitArtImage(image, width, height)
{
	var c = document.createElement('canvas');
	c.width = width;
	c.height = height;
	var a = c.getContext('2d');
	a.imageSmoothingEnabled = true;
	a.imageSmoothingQuality = 'high';
	var scale = Math.min(width / image.width, height / image.height);
	var w = image.width * scale, h = image.height * scale;
	a.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
	return c;
}

function fitArtBackground(image)
{
	var c = document.createElement('canvas');
	c.width = l.WIDTH;
	c.height = Math.ceil(image.height * l.WIDTH / image.width);
	var a = c.getContext('2d');
	a.imageSmoothingEnabled = true;
	a.imageSmoothingQuality = 'high';
	a.drawImage(image, 0, 0, c.width, c.height);
	return c;
}

var assetLoadTotal = 0;
var assetLoadDone = 0;
var pendingStart = false;
var bootLoadingActive = false;
var bootLoadingStartedAt = 0;
var BOOT_LOADING_MIN_MS = 1200;
var ASSET_LOAD_CONCURRENCY = 10;
var assetLoadActive = 0;
var assetLoadQueue = [];

function assetLoadProgress()
{
	return assetLoadTotal ? assetLoadDone / assetLoadTotal : 1;
}

function assetsReady()
{
	return assetLoadTotal && assetLoadDone >= assetLoadTotal;
}

function updateAssetLoadingUi()
{
	if (typeof loadingFill === 'undefined' || !loadingFill)
		return;
	var progress = assetLoadProgress();
	loadingFill.style.transform = 'scaleX(' + progress + ')';
	loadingPercent.textContent = Math.round(progress * 100) + '%';
}

function finishAssetLoad()
{
	assetLoadDone++;
	updateAssetLoadingUi();
	if (pendingStart && assetsReady())
		window.setTimeout(startPrebattleIntro, 180);
	if (bootLoadingActive && assetsReady())
		completeBootLoading();
}

function pumpAssetLoadQueue()
{
	while (assetLoadActive < ASSET_LOAD_CONCURRENCY && assetLoadQueue.length)
	{
		(function(job)
		{
			assetLoadActive++;
			var image = new Image();
			image.onload = function()
			{
				job.callback(image);
				assetLoadActive--;
				finishAssetLoad();
				pumpAssetLoadQueue();
			};
			image.onerror = function()
			{
				assetLoadActive--;
				finishAssetLoad();
				pumpAssetLoadQueue();
			};
			image.src = job.src;
		})(assetLoadQueue.shift());
	}
}

function useArtImage(src, callback)
{
	assetLoadTotal++;
	updateAssetLoadingUi();
	assetLoadQueue.push({ src: src, callback: callback });
	pumpAssetLoadQueue();
}

function prepareEnemyImages()
{
	for (var i = enemies.TYPES.length; i--; )
	{
		var type = enemies.TYPES[i];
		if (!type.R)
			type.R = scaledInt(132);
		if (!type.image)
			type.image = enemyPlaceholder(type);
	}
}

function loadEnemyStill(i, src)
{
	useArtImage(src, function(image)
	{
		var type = enemies.TYPES[i];
		type.image = fitArtImage(image, type.R * 2, type.R * 2);
	});
}

function loadEnemyFrames(i, src, prefix, count, ext)
{
	var type = enemies.TYPES[i];
	type.frames = [];
	ext = ext || 'png';
	for (var j = 0; j < count; j++)
	{
		(function(j)
		{
			var index = (j < 10 ? '0' : '') + j;
			useArtImage(src + '/' + prefix + '_' + index + '.' + ext, function(image)
			{
				var type = enemies.TYPES[i];
				var frame = fitArtImage(image, type.R * 2, type.R * 2);
				type.frames[j] = frame;
				if (!type.image || j === 0)
					type.image = frame;
			});
		})(j);
	}
}

function loadBonusImage(key, src, scale)
{
	useArtImage(src, function(image)
	{
		var size = bonus.R * 2 * (scale || 1) | 0;
		bonus.images[key] = fitArtImage(image, size, size);
	});
}

function loadAnimationArt()
{
	for (var i = 0; i < 50; i++)
	{
		(function(i)
		{
			var index = (i < 10 ? '0' : '') + i;
			useArtImage('assets/garuda_fly-webp/garuda_fly_' + index + '.webp', function(image)
			{
				var frame = fitArtImage(image, ship.R * 3, ship.R * 2.5);
				ship.frames[i] = frame;
				if (!ship.image)
					ship.image = frame;
			});
		})(i);
	}
	for (var i = 0; i < 202; i++)
	{
		(function(i)
		{
			var index = (i < 10 ? '00' : (i < 100 ? '0' : '')) + i;
			useArtImage('assets/garuda_special-webp/garuda_special_' + index + '.webp', function(image)
			{
				ship.specialFrames[i] = fitArtImage(image, ship.R * 3, ship.R * 2.5);
			});
		})(i);
	}
	for (var i = 0; i < 152; i++)
	{
		(function(i)
		{
			var index = (i < 10 ? '00' : (i < 100 ? '0' : '')) + i;
			useArtImage('assets/garuda_bomb-webp/garuda_bomb_' + index + '.webp', function(image)
			{
				ship.bombFrames[i] = fitArtImage(image, ship.R * 3, ship.R * 2.5);
			});
		})(i);
	}
	for (var i = 0; i < 80; i++)
	{
		(function(i)
		{
			var index = (i < 10 ? '00' : (i < 100 ? '0' : '')) + i;
			useArtImage('assets/garuda_killer_video-webp/garuda_special_video_' + index + '.webp', function(image)
			{
				ship.killerFrames[i] = fitArtImage(image, ship.R * 3, ship.R * 2.5);
			});
		})(i);
	}
	for (var i = 0; i < 31; i++)
	{
		(function(i)
		{
			var index = (i < 10 ? '0' : '') + i;
			useArtImage('assets/garuda_shell_gif-webp/garuda_shell_gif_' + index + '.webp', function(image)
			{
				var frame = fitArtImage(image, ship.R * 3, ship.R * 2.5);
				ship.shield.frames[i] = frame;
				if (!ship.shield.image)
					ship.shield.image = frame;
			});
		})(i);
	}
	for (var i = 0; i < 101; i++)
	{
		(function(i)
		{
			var index = (i < 10 ? '00' : (i < 100 ? '0' : '')) + i;
			useArtImage('assets/garuda_shield-webp/garuda_shield_' + index + '.webp', function(image)
			{
				ship.shield.loopFrames[i] = fitArtImage(image, ship.R * 3, ship.R * 2.5);
			});
		})(i);
	}
	loadEnemyFrames(1, 'assets/enemy/enemy_1-webp', 'enemy_1', 47, 'webp');
	loadEnemyFrames(ENEMY_BOSS_TYPE, 'assets/enemy/enemy_boss-webp', 'enemy_boss', 61, 'webp');
}

function loadGeneratedArt()
{
	prepareEnemyImages();
	useArtImage('assets/background.jpg', function(image)
	{
		l.artBackground = fitArtBackground(image);
	});
	useArtImage('assets/garuda_bullet.png', function(image)
	{
		bullets.image = fitArtImage(image, bullets.W, bullets.H);
	});
	loadBonusImage('+', 'assets/item_enegy.png', 1.36);
	loadBonusImage('E', 'assets/item_blood.png', 1.36);
	loadBonusImage('S', 'assets/item_shell.png', 1.36);
	loadBonusImage('B', 'assets/item_bomb.png', 1.36);
	loadBonusImage('10', 'assets/coin.png');
	useArtImage('assets/enemy/enemy_bullet.png', function(image)
	{
		torpedos.image = fitArtImage(image, torpedos.R * 2, torpedos.R * 2);
		for (var i = torpedos.images.length; i--; )
			torpedos.images[i] = torpedos.image;
	});
	useArtImage('assets/explosion_0.png', function(image)
	{
		explosions.image = image;
	});
	explosions.frames = [];
	for (var i = 4; i--; )
	{
		(function(i)
		{
			useArtImage('assets/explosion_clean_' + i + '.png', function(image)
			{
				explosions.frames[i] = image;
			});
		})(i);
	}
	loadEnemyStill(0, 'assets/enemy/enemy_0.png');
	loadEnemyStill(2, 'assets/enemy/enemy_2.png');
	loadEnemyStill(ENEMY_DIVER_TYPE, 'assets/enemy/enemy_3_clean.webp');
	loadEnemyStill(ENEMY_SPIDER_TYPE, 'assets/enemy/enemy_4_clean.webp');
	loadAnimationArt();
}

loadGeneratedArt();

// This global variable will be needed again when the game ends
var tweet = document.getElementById('tweet');
tweet.style.display = 'none';
var ui = document.getElementById('game-ui');
var logoScreen = document.getElementById('logo-screen');
var landingVideo = document.getElementById('landing-video');
var menuVideoPreloadStarted = false;
var menuVideoReadyBound = false;
var hud = document.getElementById('hud');
var hudScore = document.getElementById('hud-score');
var hudWave = document.getElementById('hud-wave');
var bossHealth = document.getElementById('boss-health');
var bossHealthFill = document.getElementById('boss-health-fill');
var bossHealthShieldFill = document.getElementById('boss-health-shield-fill');
var bossHealthText = document.getElementById('boss-health-text');
var hudHealthImage = document.getElementById('hud-health-image');
var hudShieldImage = document.getElementById('hud-shield-image');
var hudSpecialImage = document.getElementById('hud-special-image');
var killerGauge = document.getElementById('killer-gauge');
var killerPortrait = document.getElementById('killer-portrait');
var pausePanel = document.getElementById('pause-panel');
var stageBanner = document.getElementById('stage-banner');
var stageNumber = document.getElementById('stage-number');
var stageName = document.getElementById('stage-name');
var prebattleOverlay = document.getElementById('prebattle-overlay');
var prebattleVideo = document.getElementById('prebattle-video');
var menuPanel = document.getElementById('menu-panel');
var boardPanel = document.getElementById('leaderboard-panel');
var loadingPanel = document.getElementById('loading-panel');
var loadingFill = document.getElementById('loading-fill');
var loadingPercent = document.getElementById('loading-percent');
var upgradePanel = document.getElementById('upgrade-panel');
var upgradeSummary = document.getElementById('upgrade-summary');
var upgradeCards = document.getElementById('upgrade-cards');
var gameoverPanel = document.getElementById('gameover-panel');
var gameoverSummaryPage = document.getElementById('gameover-summary-page');
var gameoverRankPage = document.getElementById('gameover-rank-page');
var scoreSummary = document.getElementById('score-summary');
var rankScoreSummary = document.getElementById('rank-score-summary');
var resultScore = document.getElementById('result-score');
var resultTime = document.getElementById('result-time');
var resultKills = document.getElementById('result-kills');
var resultSkill = document.getElementById('result-skill');
var resultUpgrades = document.getElementById('result-upgrades');
var resultTraits = document.getElementById('result-traits');
var nameInput = document.getElementById('player-name');
var boardList = document.getElementById('leaderboard-list');
var finalBoardList = document.getElementById('final-leaderboard-list');
var boardStatus = document.getElementById('leaderboard-status');
var finalBoardStatus = document.getElementById('final-leaderboard-status');
var saveButton = document.getElementById('save-score');
var gameoverNextButton = document.getElementById('gameover-next');
var resolutionControl = document.getElementsByClassName('resolution-control')[0];
var leaderboardKey = 'garuda.leaderboard';
var leaderboardApi = ((window.GARUDA_LEADERBOARD_API || '') + '').replace(/\/+$/, '');
var leaderboardCache = null;
var leaderboardNetworkError = false;
var pendingScore = null;
var BGM_VOLUME = .58;
var SFX_MASTER_VOLUME = .78;
var bgmDuck = 0;
var bgmDuckT = 0;
var prebattlePlaying = false;
var battleBgm = typeof Audio === 'function' ? new Audio('assets/bgm.mp3') : null;
updateAssetLoadingUi();

if (battleBgm)
{
	battleBgm.loop = true;
	battleBgm.preload = 'auto';
	battleBgm.volume = BGM_VOLUME;
}
if (prebattleVideo)
	prebattleVideo.load();

function setUiClass(name)
{
	ui.className = name;
	if (name && name.indexOf('combat-overlay') < 0)
		playMenuVideo();
	else
		pauseMenuVideo();
}

function preloadMenuVideo()
{
	if (!landingVideo)
		return true;
	landingVideo.muted = true;
	landingVideo.loop = true;
	landingVideo.playsInline = true;
	landingVideo.preload = 'auto';
	if (!menuVideoReadyBound)
	{
		menuVideoReadyBound = true;
		landingVideo.addEventListener('canplay', markMenuVideoReady);
		landingVideo.addEventListener('playing', markMenuVideoReady);
	}
	if (!menuVideoPreloadStarted)
	{
		menuVideoPreloadStarted = true;
		try
		{
			landingVideo.load();
		}
		catch (e)
		{
		}
	}
	markMenuVideoReady();
	return landingVideo.readyState >= 3;
}

function markMenuVideoReady()
{
	if (landingVideo && landingVideo.readyState >= 2 && !bootLoadingActive && ui.className.indexOf('booting') < 0)
		landingVideo.className = 'landing-video ready';
}

function playMenuVideo()
{
	if (!landingVideo)
		return;
	var promise = landingVideo.play();
	if (promise && promise.catch)
		promise.catch(function(){});
	markMenuVideoReady();
}

function pauseMenuVideo()
{
	if (landingVideo)
		landingVideo.pause();
}

function waitForMenuVideoReady(callback)
{
	if (!landingVideo || landingVideo.readyState >= 3)
	{
		callback();
		return;
	}
	var done = false;
	function finish()
	{
		if (done)
			return;
		done = true;
		markMenuVideoReady();
		callback();
	}
	landingVideo.addEventListener('canplaythrough', finish, { once: true });
	landingVideo.addEventListener('playing', finish, { once: true });
	landingVideo.addEventListener('error', finish, { once: true });
	window.setTimeout(finish, 5000);
}

function completeBootLoading()
{
	if (!bootLoadingActive || !assetsReady())
		return;
	waitForMenuVideoReady(function()
	{
		if (!bootLoadingActive || !assetsReady())
			return;
		var elapsed = Date.now() - bootLoadingStartedAt;
		var delay = Math.max(0, BOOT_LOADING_MIN_MS - elapsed);
		window.setTimeout(function()
		{
			if (!bootLoadingActive || !assetsReady())
				return;
			bootLoadingActive = false;
			markMenuVideoReady();
			playMenuVideo();
			showMenu();
			setUiClass('active menu-reveal');
			if (resolutionControl)
				resolutionControl.style.display = 'flex';
		}, delay);
	});
}

function showBootLoadingThenMenu()
{
	bootLoadingActive = true;
	bootLoadingStartedAt = Date.now();
	preloadMenuVideo();
	ui.className = 'active boot-loading';
	hud.className = '';
	updatePausePanel();
	stageBanner.className = '';
	menuPanel.className = 'ui-panel';
	boardPanel.className = 'ui-panel';
	loadingPanel.className = 'ui-panel active';
	upgradePanel.className = 'ui-panel';
	gameoverPanel.className = 'ui-panel';
	pauseMenuVideo();
	if (resolutionControl)
		resolutionControl.style.display = 'none';
	updateAssetLoadingUi();
	completeBootLoading();
}

function startLogoIntro()
{
	showMenu();
	ui.className = 'active booting';
	pauseMenuVideo();
	if (landingVideo)
		landingVideo.className = 'landing-video';
	if (resolutionControl)
		resolutionControl.style.display = 'none';
	preloadMenuVideo();
	if (!logoScreen)
	{
		setUiClass('active');
		return;
	}
	logoScreen.className = 'active';
	window.setTimeout(function()
	{
		logoScreen.className = 'active visible';
		preloadMenuVideo();
	}, 20);
	window.setTimeout(function()
	{
		logoScreen.className = 'active';
		window.setTimeout(function()
		{
			logoScreen.className = '';
			showBootLoadingThenMenu();
		}, 1000);
	}, 2000);
}

function shouldSkipLogoIntro()
{
	try
	{
		if (sessionStorage.getItem('garuda.skipLogoOnce') === '1')
		{
			sessionStorage.removeItem('garuda.skipLogoOnce');
			document.documentElement.className = document.documentElement.className.replace(/\bskip-logo-intro\b/g, '').replace(/^\s+|\s+$/g, '');
			return true;
		}
	}
	catch (e)
	{
	}
	return false;
}

function showMenuDirectly()
{
	if (logoScreen)
		logoScreen.className = '';
	showMenu();
	setUiClass('active use-poster');
	if (resolutionControl)
		resolutionControl.style.display = 'flex';
	preloadMenuVideo();
	playMenuVideo();
}

function playBattleBgm()
{
	if (!battleBgm)
		return;
	battleBgm.currentTime = 0;
	battleBgm.volume = BGM_VOLUME;
	var promise = battleBgm.play();
	if (promise && promise.catch)
		promise.catch(function(){});
}

function stopBattleBgm()
{
	if (!battleBgm)
		return;
	battleBgm.pause();
	battleBgm.currentTime = 0;
	bgmDuck = bgmDuckT = 0;
	battleBgm.volume = BGM_VOLUME;
}

function showPrebattleOverlay(active)
{
	if (!prebattleOverlay)
		return;
	prebattleOverlay.className = active ? 'active' : '';
	prebattleOverlay.setAttribute('aria-hidden', active ? 'false' : 'true');
}

function finishPrebattleIntro()
{
	if (!prebattlePlaying)
		return;
	prebattlePlaying = false;
	showPrebattleOverlay(false);
	if (prebattleVideo)
	{
		prebattleVideo.pause();
		prebattleVideo.onended = null;
		prebattleVideo.onerror = null;
	}
	hideUi();
	updateHud();
	l.intro = true;
	play(21);
}

function startPrebattleIntro()
{
	if (!pendingStart || prebattlePlaying)
		return;
	pendingScore = null;
	pendingStart = false;
	prebattlePlaying = true;
	resetGameState();
	l.paused = false;
	l.menu = false;
	l.upgradeChoosing = false;
	l.traitChoosing = false;
	l.intro = false;
	setUiClass('');
	if (resolutionControl)
		resolutionControl.style.display = 'none';
	hud.className = '';
	stageBanner.className = '';
	updatePausePanel();
	startLoop();
	playBattleBgm();
	if (battleBgm)
		battleBgm.volume = BGM_VOLUME * .62;
	if (!prebattleVideo)
	{
		window.setTimeout(finishPrebattleIntro, 300);
		return;
	}
	showPrebattleOverlay(true);
	prebattleVideo.currentTime = 0;
	prebattleVideo.volume = .94;
	prebattleVideo.onended = finishPrebattleIntro;
	prebattleVideo.onerror = finishPrebattleIntro;
	var promise = prebattleVideo.play();
	if (promise && promise.catch)
		promise.catch(function()
		{
			window.setTimeout(finishPrebattleIntro, 900);
		});
}

function duckBgm(amount, time)
{
	if (!battleBgm || battleBgm.paused)
		return;
	bgmDuck = Math.max(bgmDuck, amount);
	bgmDuckT = Math.max(bgmDuckT, time);
}

function updateBgmMix()
{
	if (!battleBgm || battleBgm.paused)
		return;
	if (bgmDuckT > 0)
		bgmDuckT--;
	else
		bgmDuck *= .88;
	if (bgmDuck < .01)
		bgmDuck = 0;
	var target = BGM_VOLUME * (1 - bgmDuck);
	battleBgm.volume += (target - battleBgm.volume) * .12;
}

function readLocalLeaderboard()
{
	try
	{
		return JSON.parse(localStorage.getItem(leaderboardKey) || '[]') || [];
	}
	catch (e)
	{
		return [];
	}
}

function writeLocalLeaderboard(scores)
{
	localStorage.setItem(leaderboardKey, JSON.stringify(scores.slice(0, 10)));
}

function readLeaderboard()
{
	return leaderboardCache || readLocalLeaderboard();
}

function compareScores(a, b)
{
	return scoreInt(b.score) - scoreInt(a.score) || (b.wave || 0) - (a.wave || 0);
}

function normalizeLeaderboard(scores)
{
	if (!scores || !scores.length)
		return [];
	var list = [];
	for (var i = 0; i < scores.length; i++)
		list.push({
			id: scores[i].id || ('score-' + i),
			name: (scores[i].name || 'PLAYER') + '',
			score: scoreInt(scores[i].score),
			wave: scores[i].wave | 0,
			date: scores[i].date || scores[i].created_at || ''
		});
	list.sort(compareScores);
	return list.slice(0, 10);
}

function setLeaderboardStatus(target, text, mode)
{
	if (!target)
		return;
	target.textContent = text || '';
	target.className = 'leaderboard-status' + (mode ? ' ' + mode : '');
}

function leaderboardStatusFor(list)
{
	if (leaderboardApi && leaderboardCache && !leaderboardNetworkError)
		setLeaderboardStatus(list === finalBoardList ? finalBoardStatus : boardStatus, 'Global Rank', 'online');
	else if (leaderboardApi && leaderboardNetworkError)
		setLeaderboardStatus(list === finalBoardList ? finalBoardStatus : boardStatus, 'Network unavailable / Local Rank', 'error');
	else
		setLeaderboardStatus(list === finalBoardList ? finalBoardStatus : boardStatus, 'Local Rank', 'local');
}

function requestLeaderboard(path, options)
{
	if (!leaderboardApi || !window.fetch)
		return Promise.reject(new Error('Leaderboard API is not configured.'));
	var controller = window.AbortController ? new AbortController() : null;
	var timeout = window.setTimeout(function()
	{
		if (controller)
			controller.abort();
	}, 6500);
	options = options || {};
	options.headers = options.headers || {};
	if (controller)
		options.signal = controller.signal;
	return fetch(leaderboardApi + path, options).then(function(response)
	{
		window.clearTimeout(timeout);
		if (!response.ok)
			throw new Error('Leaderboard request failed: ' + response.status);
		return response.json();
	}, function(error)
	{
		window.clearTimeout(timeout);
		throw error;
	});
}

function fetchLeaderboard(list, highlightId)
{
	if (!leaderboardApi)
	{
		leaderboardStatusFor(list);
		return Promise.resolve(readLeaderboard());
	}
	setLeaderboardStatus(list === finalBoardList ? finalBoardStatus : boardStatus, 'Loading Global Rank...', '');
	return requestLeaderboard('/scores').then(function(data)
	{
		leaderboardCache = normalizeLeaderboard(data.scores || data);
		leaderboardNetworkError = false;
		renderLeaderboard(list, highlightId);
		return leaderboardCache;
	}, function()
	{
		leaderboardNetworkError = true;
		renderLeaderboard(list, highlightId);
		return readLocalLeaderboard();
	});
}

function qualifiesForLeaderboard(score, wave, id)
{
	if (leaderboardApi && !leaderboardCache)
		return true;
	var scores = readLeaderboard();
	scores.push({
		id: id,
		name: '',
		score: scoreInt(score),
		wave: wave || 0,
		date: ''
	});
	scores.sort(compareScores);
	for (var i = 0; i < Math.min(10, scores.length); i++)
		if (scores[i].id === id)
			return true;
	return false;
}

function renderLeaderboard(list, highlightId)
{
	var scores = readLeaderboard();
	leaderboardStatusFor(list);
	list.innerHTML = '';
	if (!scores.length)
	{
		list.innerHTML = '<li class="empty-score">暂无记录</li>';
		return;
	}
	for (var i = 0; i < scores.length; i++)
	{
		var item = document.createElement('li');
		if (highlightId && scores[i].id === highlightId)
			item.className = 'highlight';
		var name = document.createElement('span');
		var score = document.createElement('strong');
		var wave = document.createElement('em');
		name.textContent = (i + 1) + '. ' + scores[i].name;
		score.textContent = scoreInt(scores[i].score);
		wave.textContent = 'WAVE ' + scores[i].wave;
		item.appendChild(name);
		item.appendChild(score);
		item.appendChild(wave);
		list.appendChild(item);
	}
}

function runId()
{
	return 'run-' + Date.now() + '-' + (Math.random() * 100000 | 0);
}

function formatDuration(ms)
{
	var seconds = Math.max(0, Math.round(ms / 1000));
	var minutes = seconds / 60 | 0;
	seconds %= 60;
	return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function topSkill(stats)
{
	var uses = stats && stats.killSources ? stats.killSources : {};
	var best = 'Primary';
	var bestValue = -1;
	for (var name in uses)
		if (uses.hasOwnProperty(name) && uses[name] > bestValue)
		{
			best = name;
			bestValue = uses[name];
		}
	return bestValue > 0 ? best : 'None';
}

function renderResultIcons(container, entries, trait)
{
	container.innerHTML = '';
	if (!entries || !entries.length)
	{
		container.innerHTML = '<span class="result-empty">None</span>';
		return;
	}
	for (var i = 0; i < entries.length; i++)
	{
		var icon = document.createElement('span');
		icon.className = trait ? 'result-icon trait' : 'result-icon';
		icon.title = entries[i].title || '';
		if (entries[i].icon)
			icon.innerHTML = '<img src="' + entries[i].icon + '" alt="">';
		else if (trait)
			icon.textContent = entries[i].abbr || '?';
		else
			icon.textContent = '?';
		container.appendChild(icon);
	}
}

function snapshotRunStats()
{
	var now = Date.now();
	var stats = l.stats || {};
	stats.endedAt = now;
	return {
		score: scoreInt(l.p),
		wave: l.level || 0,
		duration: Math.max(0, now - (stats.startedAt || now)),
		kills: stats.kills || 0,
		topSkill: topSkill(stats),
		upgrades: (stats.upgrades || []).slice(),
		traits: (stats.traits || []).slice()
	};
}

function renderRunSummary(summary)
{
	resultScore.textContent = scoreInt(summary.score);
	resultTime.textContent = formatDuration(summary.duration);
	resultKills.textContent = summary.kills | 0;
	resultSkill.textContent = summary.topSkill;
	renderResultIcons(resultUpgrades, summary.upgrades, false);
	renderResultIcons(resultTraits, summary.traits, true);
}

function hudAsset(prefix, value, max)
{
	var cells = Math.ceil(clamp(value, max) / max * max);
	if (cells >= max)
		return 'assets/' + prefix + '_full.png';
	return 'assets/' + prefix + '_' + cells + '.png';
}

function setHudImage(image, src)
{
	if (image.getAttribute('src') !== src)
		image.src = src;
}

function updateHud()
{
	l.p = scoreInt(l.p);
	hudScore.textContent = l.p;
	hudWave.textContent = l.level || 0;
	var boss = null;
	for (var i = enemies.length; i--; )
		if (enemies[i].bossPower)
		{
			boss = enemies[i];
			break;
	}
	if (boss)
	{
		var healthRatio = boss.eMax ? clamp(Math.max(0, boss.e) / boss.eMax, 1) : 1;
		var shieldRatio = boss.shieldMax ? clamp(Math.max(0, boss.shield || 0) / boss.shieldMax, 1) : 0;
		var bossClass = 'boss-health active' + (boss.shield > 0 ? ' shielded' : '');
		if (bossHealth.getAttribute('aria-hidden') === 'true')
			bossClass += ' enter';
		bossHealth.className = bossClass;
		bossHealth.setAttribute('aria-hidden', 'false');
		bossHealthFill.style.transform = 'scaleX(' + healthRatio + ')';
		if (bossHealthShieldFill)
			bossHealthShieldFill.style.transform = 'scaleX(' + shieldRatio + ')';
		bossHealthText.textContent = boss.shield > 0
			? 'SHIELD ' + Math.max(0, shieldRatio * 100 | 0) + '%'
			: Math.max(0, healthRatio * 100 | 0) + '%';
	}
	else
	{
		if (l.bossHealthZero > 0)
		{
			l.bossHealthZero--;
			showBossHealthZero();
		}
		else
		{
			bossHealth.className = 'boss-health';
			bossHealth.setAttribute('aria-hidden', 'true');
			bossHealthFill.style.transform = 'scaleX(1)';
			if (bossHealthShieldFill)
				bossHealthShieldFill.style.transform = 'scaleX(0)';
			bossHealthText.textContent = '100%';
		}
	}
	setHudImage(hudHealthImage, hudAsset('blood', Math.ceil(ship.e / 20), 5));
	setHudImage(hudShieldImage, hudAsset('shield', ship.shield.charges, ship.shield.MAX_CHARGES));
	setHudImage(hudSpecialImage, hudAsset('special', Math.min(l.bombs, 3), 3));
	var killerRatio = clamp(l.killer.energy / l.killer.MAX, 1);
	if (killerGauge)
	{
		killerGauge.style.setProperty('--killer-charge', killerRatio);
		killerGauge.className = 'killer-gauge' +
			(killerRatio >= 1 && !l.killer.active ? ' ready' : '') +
			(l.killer.active ? ' casting' : '');
	}
	if (killerPortrait)
	{
		killerPortrait.className = l.killer.active ? 'killer-portrait active' : 'killer-portrait';
		if (!l.killer.active)
			resetKillerPortraitShake();
	}
}

function randomizeKillerPortrait()
{
	if (!killerPortrait)
		return;
	var shake = .85 + Math.random() * 1.35;
	killerPortrait.style.setProperty('--killer-x', ((Math.random() * 2 - 1) * shake).toFixed(2) + '%');
	killerPortrait.style.setProperty('--killer-y', ((Math.random() * 2 - 1) * shake).toFixed(2) + '%');
	killerPortrait.style.setProperty('--killer-r', ((Math.random() * 2 - 1) * 3).toFixed(2) + 'deg');
	killerPortrait.style.setProperty('--killer-s', (1 + Math.random() * .035).toFixed(3));
}

function tickKillerPortraitShake()
{
	if (!killerPortrait)
		return;
	killerPortrait.className = 'killer-portrait active';
	randomizeKillerPortrait();
}

function resetKillerPortraitShake()
{
	if (!killerPortrait)
		return;
	killerPortrait.className = 'killer-portrait';
	killerPortrait.style.setProperty('--killer-x', '0%');
	killerPortrait.style.setProperty('--killer-y', '0%');
	killerPortrait.style.setProperty('--killer-r', '0deg');
	killerPortrait.style.setProperty('--killer-s', '1');
}

function updatePausePanel()
{
	var active = l.paused && !l.menu && ship.e;
	pausePanel.className = active ? 'pause-panel active' : 'pause-panel';
	pausePanel.setAttribute('aria-hidden', active ? 'false' : 'true');
}

function showStageBanner(level)
{
	stageNumber.textContent = 'Wave ' + level;
	stageName.textContent = '';
	stageBanner.className = 'active';
	window.clearTimeout(showStageBanner.timer);
	showStageBanner.timer = window.setTimeout(function()
	{
		stageBanner.className = '';
	}, 1800);
}

var upgradeDeck = [
	{
		id: 'primary',
		icon: 'assets/item_enegy.png',
		title: 'Primary',
		text: 'Stronger main shots. Pierce more enemies.',
		apply: function()
		{
			l.rogue.primary++;
		}
	},
	{
		id: 'laser',
		icon: 'assets/item_laser.png',
		title: 'Laser',
		text: 'Tracking beams gain damage and odd-number chain jumps.',
		apply: function()
		{
			l.rogue.laser++;
		}
	},
	{
		id: 'bomb',
		icon: 'assets/item_bomb.png',
		title: 'Bomb',
		text: 'Bombs destroy ships. Later levels pull items.',
		apply: function()
		{
			l.rogue.bomb++;
		}
	},
	{
		id: 'shield',
		icon: 'assets/item_shell.png',
		title: 'Shield',
		text: 'Barrier pulls items and guard blocks charge Killer.',
		apply: function()
		{
			l.rogue.shield++;
		}
	},
	{
		id: 'speed',
		icon: 'assets/item_speed.png',
		title: 'Speed',
		text: 'Faster movement, faster cannon fire, less firing slowdown.',
		apply: function()
		{
			l.rogue.speed++;
		}
	},
	{
		id: 'killer',
		icon: 'assets/killer_R.png',
		title: 'Killer',
		text: 'Longer ultimate beam and heavier ultimate damage.',
		apply: function()
		{
			l.rogue.killer++;
		}
	}
];

var enemyTraitDeck = [
	{
		id: 'vitality',
		abbr: 'HP',
		icon: 'assets/enemy_Vitality.webp',
		title: 'Vitality',
		text: 'Future enemies gain 25% max health.'
	},
	{
		id: 'rapidFire',
		abbr: 'RF',
		icon: 'assets/enemy_RapidFire.webp',
		title: 'Rapid Fire',
		text: 'Future enemies fire 20% faster.'
	},
	{
		id: 'shieldGen',
		abbr: 'SG',
		icon: 'assets/enemy_Shield%20Generator.webp',
		title: 'Shield Generator',
		text: 'Future enemies spawn with extra shields.'
	},
	{
		id: 'energyResist',
		abbr: 'ER',
		icon: 'assets/enemy_Energy%20Resist.webp',
		title: 'Energy Resist',
		text: 'Future enemies take 20% less Laser damage.'
	},
	{
		id: 'armor',
		abbr: 'PA',
		icon: 'assets/enemy_Physical%20Armor.webp',
		title: 'Physical Armor',
		text: 'Future enemies take 15% less Primary damage.'
	},
	{
		id: 'selfDestruct',
		abbr: 'SD',
		icon: 'assets/item_Self-Destruct.webp',
		title: 'Self-Destruct Core',
		text: 'Future enemies leave delayed blast rings.'
	}
];

function randomUpgradeCards()
{
	var deck = upgradeDeck.slice();
	var cards = [];
	while (deck.length && cards.length < 3)
	{
		var index = Math.random() * deck.length | 0;
		cards.push(deck.splice(index, 1)[0]);
	}
	return cards;
}

function randomEnemyTraitCards()
{
	var deck = enemyTraitDeck.slice();
	var cards = [];
	while (deck.length && cards.length < 3)
	{
		var index = Math.random() * deck.length | 0;
		cards.push(deck.splice(index, 1)[0]);
	}
	return cards;
}

function resumeAfterReward()
{
	l.menu = false;
	l.paused = false;
	l.upgradeChoosing = false;
	l.traitChoosing = false;
	hideUi();
	updateHud();
}

function showEnemyTraitChoices()
{
	l.paused = true;
	l.menu = true;
	l.traitChoosing = true;
	upgradeSummary.textContent = 'Enemy Trait / Choose One';
	upgradeCards.innerHTML = '';
	upgradeCards.className = 'upgrade-grid enemy-trait-grid';
	var cards = randomEnemyTraitCards();
	for (var i = 0; i < cards.length; i++)
	{
		(function(card)
		{
			var button = document.createElement('button');
			button.className = 'upgrade-card enemy-trait ' + card.id;
			button.type = 'button';
			var icon = card.icon ? '<img src="' + card.icon + '" alt="">' : card.abbr;
			button.innerHTML = '<span class="upgrade-icon trait-icon">' + icon + '</span><strong>' + card.title + ' Lv.' + (enemyTraitLevel(card.id) + 1) + '</strong><span class="upgrade-text">' + card.text + '</span>';
			button.onclick = function()
			{
				l.enemyTraits[card.id] = enemyTraitLevel(card.id) + 1;
				recordEnemyTrait(card);
				play(5);
				resumeAfterReward();
			};
			upgradeCards.appendChild(button);
		})(cards[i]);
	}
	showPanel(upgradePanel);
	setUiClass('active combat-overlay');
}

function finishPlayerUpgrade()
{
	l.upgradeChoosing = false;
	play(5);
	if (shouldOfferEnemyTrait(l.level || 0))
		showEnemyTraitChoices();
	else
		resumeAfterReward();
}

function showUpgradeChoices()
{
	l.paused = true;
	l.menu = true;
	l.upgradeChoosing = true;
	l.traitChoosing = false;
	upgradeSummary.textContent = 'Boss Clear / Choose One';
	upgradeCards.innerHTML = '';
	upgradeCards.className = 'upgrade-grid';
	var cards = randomUpgradeCards();
	for (var i = 0; i < cards.length; i++)
	{
		(function(card)
		{
			var button = document.createElement('button');
			button.className = 'upgrade-card ' + card.id;
			button.type = 'button';
			var icon = card.icon ? '<img src="' + card.icon + '" alt="">' : '';
			button.innerHTML = '<span class="upgrade-icon' + (card.icon ? '' : ' empty') + '">' + icon + '</span><strong>' + card.title + ' Lv.' + (l.rogue[card.id] + 1) + '</strong><span class="upgrade-text">' + card.text + '</span>';
			button.onclick = function()
			{
				card.apply();
				recordUpgrade(card);
				finishPlayerUpgrade();
			};
			upgradeCards.appendChild(button);
		})(cards[i]);
	}
	showPanel(upgradePanel);
	setUiClass('active combat-overlay');
}

function showPanel(panel)
{
	hud.className = '';
	updatePausePanel();
	stageBanner.className = '';
	setUiClass('active');
	if (resolutionControl)
		resolutionControl.style.display = panel === menuPanel || panel === loadingPanel ? 'flex' : 'none';
	menuPanel.className = panel === menuPanel ? 'ui-panel active' : 'ui-panel';
	boardPanel.className = panel === boardPanel ? 'ui-panel active' : 'ui-panel';
	loadingPanel.className = panel === loadingPanel ? 'ui-panel active' : 'ui-panel';
	upgradePanel.className = panel === upgradePanel ? 'ui-panel active' : 'ui-panel';
	gameoverPanel.className = panel === gameoverPanel ? 'ui-panel active' : 'ui-panel';
}

function hideUi()
{
	setUiClass('');
	if (resolutionControl)
		resolutionControl.style.display = 'none';
	blurActiveControl();
	hud.className = 'active';
	updatePausePanel();
}

function resetGameState()
{
	keys.length = bullets.length = playerLasers.length = explosions.length = hitEffects.length = selfDestructs.length = bonus.length = torpedos.length = lasers.length = enemies.length = enemyQueue.length = bombWaves.length = 0;
	resetRunStats();
	l.y = l.bomb = l.p = l.level = 0;
	l.timeStop = l.bossRewardLevel = l.bossHealthZero = 0;
	laserSfxCooldown = 0;
	l.killer.energy = l.killer.active = 0;
	l.waveBossSpawned = false;
	l.upgradeDelay = 0;
	l.upgradeChoosing = false;
	l.traitChoosing = false;
	l.enemyTraits = {};
	l.bombs = 3;
	l.MAX_BOMBS = 3;
	l.rogue.primary = l.rogue.laser = l.rogue.bomb = l.rogue.shield = l.rogue.speed = l.rogue.killer = 0;
	l.text.t = 0;
	l.paused = false;
	l.menu = false;
	l.intro = true;
	ship.x = l.WIDTH / 2;
	ship.targetY = l.HEIGHT * .80 | 0;
	ship.y = l.HEIGHT + ship.R * .35 | 0;
	ship.xAcc = ship.yAcc = ship.angle = ship.frame = ship.timeout = ship.weapon = ship.reload = ship.laserReload = ship.osd = 0;
	ship.specialPose = ship.bombPose = 0;
	ship.shootingArmed = false;
	ship.killerPose = 0;
	ship.e = 100;
	ship.shield.t = ship.shield.age = ship.shield.loopAge = 0;
	ship.shield.charges = ship.shield.START_CHARGES;
	torpedos.frame = 0;
	updateHud();
}

function startLoop()
{
	if (!interval)
		interval = window.setInterval(gameloop, 16);
}

function beginGame(keepBgm)
{
	pendingScore = null;
	pendingStart = false;
	prebattlePlaying = false;
	showPrebattleOverlay(false);
	hideUi();
	resetGameState();
	startLoop();
	if (!keepBgm || !battleBgm || battleBgm.paused)
		playBattleBgm();
	else
		battleBgm.volume = BGM_VOLUME;
	play(21);
}

function startGame()
{
	pendingScore = null;
	pendingStart = true;
	l.paused = true;
	l.menu = true;
	showPanel(loadingPanel);
	updateAssetLoadingUi();
	if (assetsReady())
		window.setTimeout(startPrebattleIntro, 180);
}

function showMenu()
{
	stopBattleBgm();
	pendingStart = false;
	l.paused = true;
	l.menu = true;
	l.upgradeChoosing = false;
	l.traitChoosing = false;
	showPanel(menuPanel);
}

function showLeaderboard()
{
	stopBattleBgm();
	pendingStart = false;
	l.paused = true;
	l.menu = true;
	l.upgradeChoosing = false;
	l.traitChoosing = false;
	renderLeaderboard(boardList);
	showPanel(boardPanel);
	fetchLeaderboard(boardList);
}

function showGameOver()
{
	stopBattleBgm();
	var wave = l.level || 0;
	var finalScore = scoreInt(l.p);
	var summary = snapshotRunStats();
	var id = runId();
	pendingScore = { id: id, score: finalScore, wave: wave, summary: summary, qualifies: qualifiesForLeaderboard(finalScore, wave, id) };
	scoreSummary.innerHTML = 'SCORE ' + finalScore + ' / WAVE ' + wave;
	rankScoreSummary.innerHTML = 'SCORE ' + finalScore + ' / WAVE ' + wave;
	renderRunSummary(summary);
	nameInput.value = localStorage.getItem('garuda.playerName') || '';
	saveButton.disabled = false;
	gameoverNextButton.textContent = pendingScore.qualifies ? 'Next' : 'Home';
	gameoverSummaryPage.className = 'gameover-page active';
	gameoverRankPage.className = 'gameover-page';
	renderLeaderboard(finalBoardList, l.lastSavedScoreId);
	fetchLeaderboard(finalBoardList, l.lastSavedScoreId).then(function()
	{
		if (pendingScore)
		{
			pendingScore.qualifies = qualifiesForLeaderboard(finalScore, wave, id);
			gameoverNextButton.textContent = pendingScore.qualifies ? 'Next' : 'Home';
		}
	});
	showPanel(gameoverPanel);
}

function saveScore()
{
	if (!pendingScore)
		return;
	var name = nameInput.value.replace(/[<>]/g, '').replace(/^\s+|\s+$/g, '').slice(0, 12) || 'PLAYER';
	localStorage.setItem('garuda.playerName', name);
	var entry = {
		id: pendingScore.id,
		name: name,
		score: scoreInt(pendingScore.score),
		wave: pendingScore.wave,
		date: new Date().toISOString()
	};
	var saveLocal = function()
	{
		var scores = readLocalLeaderboard();
		scores.push(entry);
		scores.sort(function(a, b)
		{
			return compareScores(a, b);
		});
		writeLocalLeaderboard(scores);
		leaderboardCache = null;
		leaderboardNetworkError = !leaderboardApi ? false : true;
		l.lastSavedScoreId = entry.id;
		pendingScore = null;
		saveButton.disabled = true;
		renderLeaderboard(finalBoardList, l.lastSavedScoreId);
	};
	saveButton.disabled = true;
	if (!leaderboardApi)
	{
		saveLocal();
		return;
	}
	setLeaderboardStatus(finalBoardStatus, 'Uploading Score...', '');
	requestLeaderboard('/scores', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(entry)
	}).then(function(data)
	{
		leaderboardCache = normalizeLeaderboard(data.scores || []);
		leaderboardNetworkError = false;
		l.lastSavedScoreId = data.saved === false ? '' : entry.id;
		pendingScore = null;
		renderLeaderboard(finalBoardList, l.lastSavedScoreId);
		if (data.saved === false)
			setLeaderboardStatus(finalBoardStatus, 'Not Top 10 / Global Rank', 'local');
	}, function()
	{
		saveLocal();
	});
}

function showGameOverRank()
{
	if (!pendingScore || !pendingScore.qualifies)
	{
		pendingScore = null;
		showMenu();
		return;
	}
	gameoverSummaryPage.className = 'gameover-page';
	gameoverRankPage.className = 'gameover-page active';
	renderLeaderboard(finalBoardList, l.lastSavedScoreId);
	fetchLeaderboard(finalBoardList, l.lastSavedScoreId);
	nameInput.focus();
}

function setupResolutionSelect()
{
	var select = document.getElementById('resolution-select');
	if (!select)
		return;
	if (select.dataset.ready)
		return;
	select.dataset.ready = '1';
	select.value = String(RENDER_HEIGHT);
	select.onchange = function()
	{
		var value = parseInt(select.value, 10);
		if (RESOLUTION_CHOICES.indexOf(value) < 0 || value === RENDER_HEIGHT)
			return;
		try
		{
			localStorage.setItem('garuda.renderHeight', String(value));
			sessionStorage.setItem('garuda.skipLogoOnce', '1');
		}
		catch (e)
		{
		}
		location.reload();
	};
}

// Initialization similar to the JS1K shim
var c = document.getElementsByTagName('canvas')[0];
var pixelRatio = 1;
c.width = l.WIDTH * pixelRatio;
c.height = l.HEIGHT * pixelRatio;
var a = c.getContext('2d');
a.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
a.imageSmoothingEnabled = true;
a.imageSmoothingQuality = 'high';
a.fillStyle = '#000';
a.fillRect(0, 0, l.WIDTH, l.HEIGHT);
spawnText('GARUDA', 3 * 60);
document.getElementById('start-game').onclick = startGame;
document.getElementById('show-leaderboard').onclick = showLeaderboard;
document.getElementById('leaderboard-start').onclick = startGame;
document.getElementById('leaderboard-back').onclick = showMenu;
document.getElementById('save-score').onclick = saveScore;
document.getElementById('restart-game').onclick = startGame;
document.getElementById('gameover-next').onclick = showGameOverRank;
setupResolutionSelect();
document.addEventListener('DOMContentLoaded', setupResolutionSelect);
nameInput.onkeydown = function(e)
{
	if ((e || event).keyCode === 13)
		saveScore();
};
if (shouldSkipLogoIntro())
	showMenuDirectly();
else
	startLogoIntro();

// Debug only
/*
var fps = Array(10);
fps.i = 0;
fps.t = 1;
*/

// Keyboard handling, cursor keys and X is my main control scheme but several others are provided
var keys = [], keyMap = {
	27: 80, // Esc => P
	32: 88, // Space => X
	48: 88, // 0 => X
	50: 40, // 2 => Down
	52: 37, // 4 => Left
	53: 40, // 5 => Down
	54: 39, // 6 => Right
	56: 38, // 8 => Up
	65: 37, // A => Left
	67: 88, // C => X
	68: 39, // D => Right
	73: 38, // I => Up
	74: 37, // J => Left
	75: 40, // K => Down
	76: 39, // L => Right
	83: 40, // S => Down
	87: 38, // W => Up
	89: 88, // Y => X
	90: 88  // Z => X
};

function isFormControl(element)
{
	if (!element || !element.tagName)
		return false;
	var tag = element.tagName.toLowerCase();
	return tag === 'input' || tag === 'textarea' || tag === 'select' || element.isContentEditable;
}

function isGameKey(code)
{
	return code === 37 || code === 38 || code === 39 || code === 40 ||
		code === 70 || code === 77 || code === 80 || code === 81 ||
		code === 82 || code === 88 || code === 69;
}

function isOneShotKey(code)
{
	return code === 70 || code === 77 || code === 80 ||
		code === 81 || code === 82 || code === 88 || code === 69;
}

function preventGameKeyDefault(e, mapped)
{
	if (!isGameKey(mapped))
		return;
	if (isFormControl(document.activeElement))
		return;
	if (e && e.preventDefault)
		e.preventDefault();
	if (e)
		e.returnValue = false;
}

function blurActiveControl()
{
	var active = document.activeElement;
	if (active && active !== document.body && active.blur && !isFormControl(active))
		active.blur();
}

function clearCombatKeys()
{
	for (var i = keys.length; i--; )
		keys[i] = false;
	ship.shootingArmed = false;
	ship.laserTargets.length = 0;
}

document.onkeydown = function(e)
{
	e = e || event;
	var c = e.keyCode;
	var mapped = keyMap[c] || c;
	if (isFormControl(document.activeElement) && mapped !== 80)
		return;
	preventGameKeyDefault(e, mapped);
	var wasDown = keys[mapped];
	var pressed = !wasDown || (e.repeat === false && isOneShotKey(mapped));
	keys[mapped] = true;
	if (mapped === 88 && pressed)
	{
		if (l.paused && !l.menu)
		{
			l.paused = false;
			updatePausePanel();
		}
		if (canPlayTransformSound())
		{
			ship.shootingArmed = true;
			ship.reload = 0;
			play(SFX_TRANSFORM);
		}
	}
	if (mapped === 70 && pressed)
		toggleFullscreen();
	if (mapped === 82 && pressed)
		activateKillerMove();
	if (mapped === 69 && pressed)
		releaseBomb();
	if (mapped === 81 && pressed)
		activateShield();
	if (mapped === 77 && pressed)
	{
		if (ship.originalImage)
		{
			ship.image = ship.originalImage;
			ship.originalImage = null;
		}
		else
		{
			// That's all I need for my little easter egg, the code above is to be able to switch back
			var image = new Image();
			image.onload = function()
			{
				ship.originalImage = ship.image;
				ship.image = image;
			}
			image.src = 'assets/logo.jpg';
		}
	}
	// Cheat key skips to the next level
	/*
	else if (keys[79])
	{
		l.text.t = 0;
		ship.weapon++;
		ship.shield.t = shieldAnimationDuration();
		ship.shield.age = 0;
		enemies.length = 0;
	}
	*/
	// Pause is not possible if the player is not alive
	if (mapped === 80 && pressed && ship.e && !l.menu)
	{
		l.paused = !l.paused;
		updatePausePanel();
	}
}

document.onkeyup = function(e)
{
	e = e || event;
	var c = e.keyCode;
	var mapped = keyMap[c] || c;
	preventGameKeyDefault(e, mapped);
	var wasDown = keys[mapped];
	// Remove the key code from the key pressed map
	keys[mapped] = false;
	if (mapped === 88)
		ship.shootingArmed = false;
	if (mapped === 88 && wasDown && canPlayTransformSound())
		play(SFX_TRANSFORM);
}

window.onblur = clearCombatKeys;
document.addEventListener('visibilitychange', function()
{
	if (document.hidden)
		clearCombatKeys();
});

function drawScrollingBackground(speedFactor)
{
	if (l.artBackground)
	{
		var bg = l.artBackground, bgHeight = bg.height;
		for (var y = (l.y % bgHeight - bgHeight) | 0; y < l.HEIGHT; y += bgHeight)
			a.drawImage(bg, 0, y);
	}
	else
	{
		a.fillStyle = '#000';
		a.fillRect(0, 0, l.WIDTH, l.HEIGHT);
	}
	l.y += l.SPEED * (speedFactor === undefined ? 1 : speedFactor);
}

function gameloop()
{
	if (l.paused)
	{
		if (l.upgradeChoosing || l.traitChoosing)
			drawScrollingBackground(1);
		return;
	}

	if (prebattlePlaying)
	{
		drawScrollingBackground(1);
		updateBgmMix();
		return;
	}

	if (l.intro)
	{
		ship.x = l.WIDTH / 2;
		ship.xAcc = ship.yAcc = ship.angle = 0;
		ship.reload = 12;
		ship.specialPose = ship.bombPose = 0;
		ship.shootingArmed = false;
		ship.laserTargets.length = 0;
		ship.y -= Math.max(motion(4.2), (ship.y - ship.targetY) * .048);
		if (ship.y <= ship.targetY)
		{
			ship.y = ship.targetY;
			l.intro = false;
			if (l.stats && !l.stats.startedAt)
				l.stats.startedAt = Date.now();
		}
	}
	else if (--ship.reload <= 0 && keys[88] && shootingPoseReady())
	{
		ship.reload = shipFireReload();
		fireWeapon();
		play(ship.weapon ? 0 : 15);
	}
	else if (!keys[88])
		ship.laserTargets.length = 0;
	ship.angle *= ship.ANGLE_FACTOR;
	var accel = shipAccel();
	if (!l.intro && keys[37])
	{
		// This is required for a fast turn when stuck at the edge of the screen
		if (ship.x >= l.WIDTH && ship.xAcc > 0)
			ship.xAcc = 0;
		ship.xAcc -= accel;
		ship.angle = (ship.angle + 1) * ship.ANGLE_FACTOR - 1;
	}
	if (!l.intro && keys[38])
	{
		if (ship.y >= l.HEIGHT && ship.yAcc > 0)
			ship.yAcc = 0;
		ship.yAcc -= accel;
	}
	if (!l.intro && keys[39])
	{
		if (ship.x < 0 && ship.xAcc < 0)
			ship.xAcc = 0;
		ship.xAcc += accel;
		ship.angle = (ship.angle - 1) * ship.ANGLE_FACTOR + 1;
	}
	if (!l.intro && keys[40])
	{
		if (ship.y < 0 && ship.yAcc < 0)
			ship.yAcc = 0;
		ship.yAcc += accel;
	}
	// Stop the players ship at all 4 edges of the screen
	if (ship.x < 0 && ship.xAcc < 0)
		ship.x = 0;
	else if (ship.x >= l.WIDTH && ship.xAcc > 0)
		ship.x = l.WIDTH - 1;
	if (ship.y < 0 && ship.yAcc < 0)
		ship.y = 0;
	else if (ship.y >= l.HEIGHT && ship.yAcc > 0)
		ship.y = l.HEIGHT - 1;
	// Accelerate the players ship
	var moveFactor = shipMoveFactor();
	ship.x += ship.xAcc * moveFactor;
	ship.y += ship.yAcc * moveFactor;
	// Decrease the acceleration. I don't need to clip to a maximum, this is enough.
	ship.xAcc *= ship.ACC_FACTOR;
	ship.yAcc *= ship.ACC_FACTOR;
	if (ship.laserReload > 0)
		ship.laserReload--;
	if (laserSfxCooldown > 0)
		laserSfxCooldown--;
	tickKillerMove();
	updateBgmMix();

	var timeStopped = l.timeStop > 0;
	drawScrollingBackground(timeStopped ? .2 : 1);
	renderEnemyLaserWarnings(timeStopped);
	if (timeStopped)
		l.timeStop--;

	// Show the current text in the middle of the screen
	if (l.text.t)
	{
		a.globalAlpha = l.text.t < l.text.MAX_T ? l.text.t / l.text.MAX_T : 1;
		a.drawImage(l.text.image, l.text.x, l.text.y);
		a.globalAlpha = 1;
		l.text.t--;
		l.text.y += l.text.yAcc;
	}
	updateEnemyQueue();

	for (var i = bullets.length; i--; )
	{
		// Avoid sub-pixel rendering by trimming all coordinates to whole numbers
		a.save();
		a.translate(bullets[i].x | 0, bullets[i].y | 0);
		a.rotate(bullets[i].angle || 0);
		a.drawImage(bullets.image, -bullets.W / 2 | 0, -bullets.H / 2 | 0);
		a.restore();
		bullets[i].x += bullets[i].xAcc;
		bullets[i].y += bullets[i].yAcc;
		// There was a bug, the comparison "y < ship.R" was always false because ship.R is undefined
		if (--bullets[i].t < 0 || bullets[i].x < -bullets.R ||
			bullets[i].x >= l.WIDTH + bullets.R || bullets[i].y >= l.HEIGHT + bullets.R)
			bullets.splice(i, 1);
	}
	for (var i = playerLasers.length; i--; )
	{
		var beam = playerLasers[i];
		a.save();
		a.globalAlpha = Math.min(1, beam.t / 4);
		a.strokeStyle = '#05D9FF';
		a.shadowColor = '#05D9FF';
		a.shadowBlur = scaled(20);
		a.lineCap = 'round';
		a.lineWidth = beam.width;
		var points = beam.points || [{ x: beam.x, y: beam.y }, { x: beam.x2, y: beam.y2 }];
		a.beginPath();
		a.moveTo(points[0].x, points[0].y);
		for (var j = 1; j < points.length; j++)
			a.lineTo(points[j].x, points[j].y);
		a.stroke();
		a.strokeStyle = '#FFF';
		a.shadowBlur = scaled(6);
		a.lineWidth = Math.max(2, beam.width * .32);
		a.beginPath();
		a.moveTo(points[0].x, points[0].y);
		for (var j = 1; j < points.length; j++)
			a.lineTo(points[j].x, points[j].y);
		a.stroke();
		a.restore();
		if (!--beam.t)
			playerLasers.splice(i, 1);
	}
	renderKillerBeam(timeStopped);
	for (var i = bombWaves.length; i--; )
	{
		var wave = bombWaves[i];
		wave.r += wave.speed;
		wave.t++;
		for (var j = torpedos.length; j--; )
		{
			var tx = torpedos[j].x - wave.x, ty = torpedos[j].y - wave.y;
			var tr = wave.r + torpedos.R;
			if (tx * tx + ty * ty <= tr * tr)
			{
				explode(torpedos[j].x, torpedos[j].y, scaled(88));
				torpedos.splice(j, 1);
			}
		}
		for (var j = enemies.length; j--; )
		{
			var enemy = enemies[j];
			if (wave.hit.indexOf(enemy) >= 0 || isEnemyInvulnerable(enemy))
				continue;
			var ey = enemy.y + (enemy.yOffset || 0);
			var ex = enemy.x - wave.x, ey2 = ey - wave.y;
			var er = wave.r + enemy.r * .62;
			if (ex * ex + ey2 * ey2 <= er * er)
			{
				wave.hit.push(enemy);
				var damage = bombDamage(enemy, wave.level);
				if (damage > 0)
					damageEnemy(j, damage, enemy.x, ey, 'bomb');
			}
		}
		var alpha = Math.max(0, 1 - wave.r / wave.maxR);
		a.save();
		a.globalCompositeOperation = 'lighter';
		a.globalAlpha = Math.min(.95, alpha * 1.25);
		a.strokeStyle = '#FF7A18';
		a.shadowColor = '#FF5A00';
		a.shadowBlur = scaled(38);
		a.lineWidth = scaled(30);
		a.beginPath();
		a.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2);
		a.stroke();
		a.strokeStyle = '#FFD1A0';
		a.shadowBlur = scaled(14);
		a.lineWidth = scaled(9);
		a.beginPath();
		a.arc(wave.x, wave.y, wave.r + scaled(10), 0, Math.PI * 2);
		a.stroke();
		a.restore();
		if (wave.r > wave.maxR + scaled(160))
			bombWaves.splice(i, 1);
	}

	// The whole screen flashes
	if (l.bomb)
	{
		a.fillStyle = 'rgba(255,112,16,' + l.bomb-- / l.MAX_BOMB / 3 + ')';
		a.fillRect(0, 0, l.WIDTH, l.HEIGHT);
	}
	if (timeStopped)
	{
		a.fillStyle = 'rgba(5, 217, 255, .10)';
		a.fillRect(0, 0, l.WIDTH, l.HEIGHT);
	}

	for (var i = selfDestructs.length; i--; )
	{
		var blast = selfDestructs[i];
		var warning = blast.t / blast.maxT;
		a.save();
		a.globalCompositeOperation = 'lighter';
		a.globalAlpha = .24 + (1 - warning) * .42;
		a.strokeStyle = '#FF2A18';
		a.shadowColor = '#FF2A18';
		a.shadowBlur = scaled(24);
		a.lineWidth = scaled(8);
		a.beginPath();
		a.arc(blast.x, blast.y, blast.r * (1.05 - warning * .18), 0, Math.PI * 2);
		a.stroke();
		a.strokeStyle = '#FFD1A0';
		a.shadowBlur = scaled(8);
		a.lineWidth = scaled(2);
		a.beginPath();
		a.arc(blast.x, blast.y, blast.r * (1.12 - warning * .12), 0, Math.PI * 2);
		a.stroke();
		a.restore();
		if (!timeStopped && !--blast.t)
		{
			var bx = ship.x - blast.x, by = ship.y - blast.y;
			if (bx * bx + by * by < (blast.r + ship.R * .35) * (blast.r + ship.R * .35))
			{
				if (ship.shield.t)
				{
					rewardShieldBlock(4);
					play(2);
				}
				else
					hurt(20);
			}
			explode(blast.x, blast.y, blast.r * 1.2);
			selfDestructs.splice(i, 1);
		}
	}

	// Enable additive blending for everything below
	a.globalCompositeOperation = 'lighter';

	var d = ship.R * .8 | 0,
	    e = ship.R * .4 | 0;
	for (var i = bonus.length; i--; )
	{
		var magnetRadius = shieldMagnetRadius();
		if (magnetRadius)
		{
			var mx = ship.x - bonus[i].x, my = ship.y - bonus[i].y;
			var md = Math.sqrt(mx * mx + my * my) || 1;
			if (md < magnetRadius)
			{
				var pull = (1 - md / magnetRadius) * motion(3.6 + (l.rogue.shield | 0) * .45);
				bonus[i].xAcc += mx / md * pull;
				bonus[i].yAcc += my / md * pull;
				bonus[i].xAcc *= .88;
				bonus[i].yAcc *= .88;
			}
		}
		if (ship.y < bonus[i].y + d && ship.y > bonus[i].y - d &&
		    ship.x < bonus[i].x + e && ship.x > bonus[i].x - e)
		{
			addScore(10);
			var pickupSound = bonus[i].i !== '10';
			switch (bonus[i].i)
			{
				case '+':
					if (ship.weapon < ship.MAX_WEAPON)
						ship.weapon++;
					break;
				case 'E':
					if (ship.e < 100)
						ship.osd = ship.MAX_OSD;
					ship.e += 20;
					if (ship.e > 100)
						ship.e = 100;
					break;
				case 'S':
					collectShieldBonus();
					break;
				case 'B':
					collectBombBonus();
					break;
				default:
					pickupSound = false;
			}
			if (pickupSound)
				play(5);
			bonus[i].y = l.HEIGHT * 2;
		}
		// Avoid sub-pixel rendering by trimming all coordinates to whole numbers
		var bonusImage = bonus.images[bonus[i].i];
		a.drawImage(bonusImage, bonus[i].x - bonusImage.width / 2 | 0, bonus[i].y - bonusImage.height / 2 | 0);
		bonus[i].x += bonus[i].xAcc;
		bonus[i].y += bonus[i].yAcc;
		if (bonus[i].y >= l.HEIGHT + bonus.R * 2 || bonus[i].x < -bonus.R ||
			bonus[i].x >= l.WIDTH + bonus.R || bonus[i].y < -bonus.R)
			bonus.splice(i, 1);
	}

	for (var j = torpedos.length; j--; )
	{
		if (!timeStopped && ship.shield.t)
		{
			var sx = torpedos[j].x - ship.x, sy = torpedos[j].y - ship.y;
			var sr = shieldRadius() + torpedos.R * .45;
			if (sx * sx + sy * sy < sr * sr)
			{
				hitSpark(torpedos[j].x, torpedos[j].y);
				play(2);
				rewardShieldBlock(1);
				torpedos.splice(j, 1);
				continue;
			}
		}
		if (!timeStopped && ship.y < torpedos[j].y + d && ship.y > torpedos[j].y - d &&
		    ship.x < torpedos[j].x + e && ship.x > torpedos[j].x - e)
		{
			hurt(10);
			explode(torpedos[j].x, torpedos[j].y);
			torpedos[j].y = l.HEIGHT * 2;
		}

		// Avoid sub-pixel rendering by trimming all coordinates to whole numbers
		a.drawImage(torpedos.images[torpedos.frame],
			torpedos[j].x - torpedos.R | 0, torpedos[j].y - torpedos.R | 0);
		/*
		a.save()
		a.translate(torpedos[j].x, torpedos[j].y);
		a.rotate(torpedos.angle);
		a.drawImage(torpedos.image, -torpedos.R, -torpedos.R);
		a.restore();
		*/

		if (!timeStopped)
		{
			torpedos[j].x += torpedos[j].xAcc;
			torpedos[j].y += torpedos[j].yAcc;
		}
		if (torpedos[j].y >= l.HEIGHT + torpedos.R || torpedos[j].x < -torpedos.R ||
			torpedos[j].x >= l.WIDTH + torpedos.R || torpedos[j].y < -l.HEIGHT)
			torpedos.splice(j, 1);
	}
	for (var j = lasers.length; j--; )
	{
		var laser = lasers[j];
		if (laser.owner && enemies.indexOf(laser.owner) < 0)
		{
			lasers.splice(j, 1);
			continue;
		}
		var dx = laser.x2 - laser.x, dy = laser.y2 - laser.y;
		var lenSq = dx * dx + dy * dy || 1;
		a.save();
		a.lineCap = 'round';
		if (laser.warn > 0)
		{
			a.restore();
			continue;
		}
		var u = ((ship.x - laser.x) * dx + (ship.y - laser.y) * dy) / lenSq;
		if (u < 0)
			u = 0;
		else if (u > 1)
			u = 1;
		var px = laser.x + dx * u, py = laser.y + dy * u;
		var lx = ship.x - px, ly = ship.y - py;
		var laserHitRadius = ship.shield.t ? shieldRadius() : ship.R * .5;
		if (!timeStopped && !laser.hit && lx * lx + ly * ly < laserHitRadius * laserHitRadius)
		{
			if (ship.shield.t)
			{
				rewardShieldBlock(5);
				play(2);
			}
			else
				hurt(25);
			laser.hit = 1;
		}
		a.globalAlpha = Math.min(1, laser.t / 8);
		a.strokeStyle = '#9F6';
		a.shadowColor = '#5F0';
		a.shadowBlur = scaled(24);
		a.lineWidth = laser.activeWidth || scaled(16);
		a.beginPath();
		a.moveTo(laser.x, laser.y);
		a.lineTo(laser.x2, laser.y2);
		a.stroke();
		a.strokeStyle = '#EFF';
		a.shadowBlur = scaled(8);
		a.lineWidth = Math.max(scaled(5), (laser.activeWidth || scaled(16)) * .38);
		a.beginPath();
		a.moveTo(laser.x, laser.y);
		a.lineTo(laser.x2, laser.y2);
		a.stroke();
		a.restore();
		if (!timeStopped && !--laser.t)
			lasers.splice(j, 1);
	}
	if (!timeStopped)
		torpedos.frame++;
	torpedos.frame %= torpedos.images.length;
	ship.timeout--;

	for (var i = hitEffects.length; i--; )
	{
		var h = hitEffects[i], p = h.t / 16;
		a.save()
		a.globalAlpha = p;
		a.translate(h.x, h.y);
		a.rotate(h.angle);
		if (h.kind === 'shield')
		{
			var shieldP = h.t / 22;
			var radius = (h.size || scaled(42)) * (1.25 - shieldP * .25);
			a.globalCompositeOperation = 'lighter';
			a.strokeStyle = '#05D9FF';
			a.shadowBlur = scaled(22);
			a.shadowColor = '#05D9FF';
			a.lineWidth = scaled(5);
			a.beginPath();
			a.arc(0, 0, radius, 0, Math.PI * 2);
			a.stroke();
			a.strokeStyle = '#FFFFFF';
			a.shadowBlur = scaled(8);
			a.lineWidth = scaled(2);
			for (var bolt = 0; bolt < 6; bolt++)
			{
				var angle = bolt * Math.PI / 3 + h.angle;
				a.beginPath();
				a.moveTo(Math.cos(angle) * radius * .35, Math.sin(angle) * radius * .35);
				a.lineTo(Math.cos(angle + .18) * radius * .9, Math.sin(angle + .18) * radius * .9);
				a.stroke();
			}
			a.restore();
			if (!--h.t)
				hitEffects.splice(i, 1);
			continue;
		}
		a.strokeStyle = '#FFF';
		a.shadowBlur = scaled(8);
		a.shadowColor = '#FC6';
		a.lineWidth = scaled(2);
		a.beginPath();
		var starSize = h.size || scaled(10);
		a.moveTo(-starSize * p, 0);
		a.lineTo(starSize * p, 0);
		a.moveTo(0, -starSize * p);
		a.lineTo(0, starSize * p);
		a.stroke();
		a.fillStyle = '#F80';
		a.beginPath();
		a.arc(0, 0, starSize * .55 * p, 0, Math.PI * 2);
		a.fill();
		a.restore();
		if (!--h.t)
			hitEffects.splice(i, 1);
	}

	for (var i = explosions.length; i--; )
	{
		var e = explosions[i];
		if (explosions.frames && explosions.frames.length && explosions.frames[0])
		{
			var frameTime = 10;
			var frameCount = explosions.frames.length;
			var frame = Math.min(frameCount - 1, e.t / frameTime | 0);
			var image = e.t < frameCount * frameTime ? explosions.frames[frame] : explosions.debris;
			var size = e.size;
			if (image)
				a.drawImage(image, e.x - size / 2, e.y - size / 2, size, size);
		}
		else
			a.drawImage(explosions.image, e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
		//a.lineWidth = .2;
		//a.strokeStyle = '#FFF';
		//a.strokeRect(explosions[i].x - explosions[i].size / 2, explosions[i].y - explosions[i].size / 2,
		//	explosions[i].size, explosions[i].size);
		e.t++;
		// Never compare floating point numbers with integer numbers, always use an epsilon
		if (e.t > e.MAX_T)
			explosions.splice(i, 1);
	}

	a.globalCompositeOperation = 'source-over';
	a.globalAlpha = 1;
	var shieldVisible = ship.shield.t;
	var shellFrameCount = ship.shield.frames && ship.shield.frames.length ? ship.shield.frames.length : 0;
	var shellFrameIndex = 0;
	var shellFrame = null;
	if (shellFrameCount)
	{
		var frameT = ship.shield.FRAME_T;
		var forwardT = shellFrameCount * frameT;
		var holdEndT = forwardT + shieldHoldTime();
		if (ship.shield.age < forwardT)
		{
			shellFrameIndex = Math.min(shellFrameCount - 1, ship.shield.age / frameT | 0);
			shellFrame = ship.shield.frames[shellFrameIndex];
		}
		else if (ship.shield.age < holdEndT)
		{
			var loopFrames = (l.rogue.shield | 0) && ship.shield.loopFrames && ship.shield.loopFrames.length ? ship.shield.loopFrames : null;
			if (loopFrames)
				shellFrame = loopFrames[(ship.shield.loopAge / frameT | 0) % loopFrames.length] || loopFrames[0];
			else
				shellFrame = ship.shield.frames[shellFrameCount - 1];
		}
		else
		{
			shellFrameIndex = Math.max(0, shellFrameCount - 2 - ((ship.shield.age - holdEndT) / frameT | 0));
			shellFrame = ship.shield.frames[shellFrameIndex];
		}
	}
	var flyFrame = ship.frames && ship.frames.length && !ship.originalImage
		? ship.frames[(ship.frame / ship.FRAME_T | 0) % ship.frames.length]
		: null;
	var specialFrameCount = ship.specialFrames && ship.specialFrames.length ? ship.specialFrames.length : 0;
	var bombFrameCount = ship.bombFrames && ship.bombFrames.length ? ship.bombFrames.length : 0;
	var killerFrameCount = ship.killerFrames && ship.killerFrames.length ? ship.killerFrames.length : 0;
	var killerActive = killerFrameCount && (l.killer.active || ship.killerPose) && !l.intro;
	if (killerFrameCount && !l.intro)
	{
		if (l.killer.active)
			ship.killerPose = Math.min(killerFrameCount, ship.killerPose + ship.KILLER_STEP);
		else if (ship.killerPose)
			ship.killerPose = Math.max(0, ship.killerPose - ship.KILLER_REVERSE_STEP);
	}
	else ship.killerPose = 0;
	var killerFrame = null;
	if (ship.killerPose && killerFrameCount)
		killerFrame = ship.killerFrames[Math.min(killerFrameCount - 1, ship.killerPose - 1)];
	var bombActive = bombFrameCount && ship.bombPose && !shieldVisible && !l.intro && !killerActive;
	if (specialFrameCount && !shieldVisible && !l.intro && !bombActive && !killerActive)
	{
		var specialTarget = keys[88] ? specialFrameCount : 0;
		if (ship.specialPose < specialTarget)
			ship.specialPose = Math.min(specialTarget, ship.specialPose + ship.SPECIAL_STEP);
		else if (ship.specialPose > specialTarget)
			ship.specialPose = Math.max(specialTarget, ship.specialPose - ship.SPECIAL_REVERSE_STEP);
		if (keys[88] && ship.specialPose >= shootingPoseFireFrame())
			ship.shootingArmed = true;
	}
	else ship.specialPose = 0;
	var specialFrame = null;
	if (ship.specialPose && specialFrameCount)
		specialFrame = ship.specialFrames[Math.min(specialFrameCount - 1, ship.specialPose - 1)];
	if (bombFrameCount && ship.bombPose && !shieldVisible && !l.intro)
	{
		ship.bombPose += ship.BOMB_STEP;
		if (ship.bombPose > bombFrameCount)
			ship.bombPose = 0;
	}
	else if (shieldVisible || l.intro)
		ship.bombPose = 0;
	var bombFrame = null;
	if (ship.bombPose && bombFrameCount)
		bombFrame = ship.bombFrames[Math.min(bombFrameCount - 1, ship.bombPose - 1)];
	ship.frame++;
	var baseShipImage = killerFrame || bombFrame || specialFrame || flyFrame || ship.image;
	var shipImage = !killerFrame && shieldVisible && (shellFrame || ship.shield.image)
		? (shellFrame || ship.shield.image)
		: baseShipImage;
	if (shipImage)
	{
		a.save()
		a.translate(ship.x, ship.y);
		var angle = ship.angle * ship.MAX_ANGLE;
		a.rotate(angle / 180 * Math.PI);
		a.drawImage(shipImage, -shipImage.width / 2 | 0, -shipImage.height / 2 | 0);
		a.restore();
	}

	if (ship.shield.t)
	{
		var shieldLoopCount = ship.shield.frames && ship.shield.frames.length ? ship.shield.frames.length : 31;
		var shieldForwardT = shieldLoopCount * ship.shield.FRAME_T;
		var shieldHoldEndT = shieldForwardT + shieldHoldTime();
		ship.shield.age++;
		if (ship.shield.age >= shieldForwardT && ship.shield.age < shieldHoldEndT)
			ship.shield.loopAge++;
		if (!--ship.shield.t)
		{
			ship.shield.age = ship.shield.loopAge = 0;
			play(4);
		}
		else if (ship.shield.age >= shieldAnimationDuration())
			ship.shield.age = ship.shield.loopAge = 0;
	}

	// Test only: l.text.t=0;
	// Spawn new enemies if they are all destroyed and the text is gone
	if (!l.intro && !enemies.length && !enemyQueue.length && !l.text.t)
	{
		if (l.level && l.waveBossSpawned && l.bossRewardLevel < l.level)
		{
			if (l.upgradeDelay > 0)
			{
				l.upgradeDelay--;
				return;
			}
			l.bossRewardLevel = l.level;
			showUpgradeChoices();
			return;
		}
		if (l.level && !l.waveBossSpawned)
		{
			l.waveBossSpawned = true;
			spawnEnemy(ENEMY_BOSS_TYPE, -2.25 * l.HEIGHT);
			l.bomb = l.MAX_BOMB;
			play(8);
			return;
		}
		addScore((l.level || 0) * 1000);
		l.level = (l.level || 0) + 1;
		l.waveBossSpawned = false;
		spawnCombatWave();
		showStageBanner(l.level);
		l.bomb = l.MAX_BOMB;
		play(8);
	}

	enemyLoop:
	for (var i = enemies.length; i--; )
	{
		var y = enemies[i].y + (enemies[i].yOffset || 0);
		applyEnemyTraitState(enemies[i]);
		if (enemies[i].shieldContact)
			enemies[i].shieldContact--;
		// Calculate the angle from the enemy to the players ship, this is used to shoot at the player
		var angle = enemyAimAngle(enemies[i], y);

		// Calculate the rotation of the enemy graphic
		var bossAngle = (angle + Math.PI) % (Math.PI * 2) - Math.PI;
		var maxAngle = enemies[i].maxAngle || 0;
		if (bossAngle > maxAngle)
			bossAngle = maxAngle;
		else if (bossAngle < -maxAngle)
			bossAngle = -maxAngle;
		enemies[i].angle = ((enemies[i].angle * 29 - bossAngle) / 30);
		//if (enemies[i].angle > maxAngle) enemies[i].angle = maxAngle;
		//if (enemies[i].angle < -maxAngle) enemies[i].angle = -maxAngle;

		//a.drawImage(enemies[i].image, enemies[i].x - enemies[i].r | 0, enemies[i].y - enemies[i].r | 0,
		//	enemies[i].r * 2, enemies[i].r * 2);
		var enemyImage = enemies[i].image;
		if (enemies[i].frames && enemies[i].frames.length)
			enemyImage = enemies[i].frames[((l.y / l.SCALE / 3 | 0) + (enemies[i].animOffset || 0)) % enemies[i].frames.length] || enemyImage;
		if (enemies[i].spiderSupport)
			renderSpiderSilk(enemies[i], y);
		a.save()
		a.translate(enemies[i].x, y);
		a.rotate(enemies[i].angle);
		drawEnemyImage(enemyImage, enemies[i], y);
		a.restore();
		if (enemies[i].hitFlash)
			enemies[i].hitFlash--;
		if (enemies[i].shieldBoost)
			enemies[i].shieldBoost--;
		if (enemies[i].shield > 0)
		{
			var shieldPulse = (enemies[i].shieldBoost ? .86 : .55) + Math.sin(l.y / l.SCALE / 7 + i) * .2;
			var shieldOuter = enemies[i].bossPower ? 1.02 : .72;
			var shieldInner = enemies[i].bossPower ? .88 : .58;
			var shieldCenterY = enemies[i].bossPower ? y - (enemies[i].yOffset || 0) * .52 : y;
			a.save();
			a.globalAlpha = shieldPulse;
			a.strokeStyle = '#05D9FF';
			a.shadowColor = '#05D9FF';
			a.shadowBlur = scaled(enemies[i].bossPower ? 28 : 16);
			a.lineWidth = scaled(enemies[i].bossPower ? 7 : 4);
			a.beginPath();
			a.arc(enemies[i].x, shieldCenterY, enemies[i].r * shieldOuter, 0, Math.PI * 2);
			a.stroke();
			a.strokeStyle = '#FFF';
			a.shadowBlur = scaled(4);
			a.lineWidth = scaled(1.5);
			a.beginPath();
			a.arc(enemies[i].x, shieldCenterY, enemies[i].r * shieldInner, 0, Math.PI * 2);
			a.stroke();
			a.restore();
		}

		// All enemies share the same bullet hit box. Ship-body collision uses
		// a wider ellipse so visual contact with wings and hull is respected.
		var d = enemies[i].r * .6;
		var bodyD = enemyBodyHitRadius(enemies[i]);
		// Visualize the hit box for debugging purposes
		//a.lineWidth = .2;
		//a.strokeStyle = '#FFF';
		//a.strokeRect(enemies[i].x - d, enemies[i].y - d, d * 2, d * 2);
		if (ship.shield.t)
		{
			var shieldDx = enemies[i].x - ship.x, shieldDy = y - ship.y;
			var shieldHitR = shieldRadius() + bodyD;
			if (shieldDx * shieldDx + shieldDy * shieldDy < shieldHitR * shieldHitR)
			{
				if (!enemies[i].shieldContact)
				{
					hitSpark((ship.x + enemies[i].x) / 2, (ship.y + y) / 2);
					play(2);
					rewardShieldBlock(enemies[i].bossPower ? 4 : 2);
					enemies[i].shieldContact = 10;
				}
			}
		}
		else if (shipBodyCollision(enemies[i], y))
		{
			var canCrashHurt = ship.timeout < 0;
			hurt(35);
			if (canCrashHurt)
			{
				hitSpark((ship.x + enemies[i].x) / 2, (ship.y + y) / 2);
				explode((ship.x + enemies[i].x) / 2, (ship.y + y) / 2, enemies[i].r);
			}
		}
		for (var j = bullets.length; j--; )
		{
			if (bullets[j].y < enemies[i].y + d && bullets[j].y > enemies[i].y - d &&
				bullets[j].x > enemies[i].x - d && bullets[j].x < enemies[i].x + d)
			{
				var bullet = bullets[j];
				if (bullet.hitEnemies && bullet.hitEnemies.indexOf(enemies[i]) >= 0)
					continue;
				var killed = damageEnemy(i, bullet.damage || 1, bullet.x, bullet.y, 'primary');
				if (bullet.hitEnemies)
					bullet.hitEnemies.push(enemies[i]);
				if (bullet.pierce > 0)
					bullet.pierce--;
				else
					bullets.splice(j, 1);
				if (killed)
					continue enemyLoop;
				break;
			}
		}

		// Move the enemy down
		if (timeStopped)
		{
		}
		else if (enemies[i].move === 'dive')
			updateDiveEnemy(enemies[i]);
		else if (enemies[i].entryXAcc)
		{
			enemies[i].x += enemies[i].entryXAcc;
			if (enemies[i].y < enemies[i].yStop)
				enemies[i].y += enemies[i].yAcc || motion(1.2);
			if (enemies[i].y > enemies[i].yStop)
				enemies[i].y = enemies[i].yStop;
			if ((enemies[i].entryXAcc > 0 && enemies[i].x >= enemies[i].entryXTarget) ||
				(enemies[i].entryXAcc < 0 && enemies[i].x <= enemies[i].entryXTarget))
			{
				enemies[i].x = enemies[i].entryXTarget;
				enemies[i].entryXAcc = 0;
			}
		}
		else if (enemies[i].y < enemies[i].yStop)
			enemies[i].y += enemies[i].yAcc || motion(.5);
		else
		{
			if (enemies[i].xDrift)
			{
				enemies[i].x += enemies[i].xDrift;
				if (enemies[i].x < enemies[i].r || enemies[i].x > l.WIDTH - enemies[i].r)
					enemies[i].xDrift *= -1;
			}
			var dashing = false;
			if (enemies[i].dashCooldown !== undefined)
			{
				if (enemies[i].dashTime > 0)
				{
					enemies[i].x += enemies[i].dashXAcc;
					enemies[i].y += enemies[i].dashYAcc;
					if (enemies[i].x < enemies[i].r)
						enemies[i].x = enemies[i].r;
					else if (enemies[i].x > l.WIDTH - enemies[i].r)
						enemies[i].x = l.WIDTH - enemies[i].r;
					if (enemies[i].y < l.HEIGHT / 10)
						enemies[i].y = l.HEIGHT / 10;
					else if ((l.level || 0) < 6 && enemies[i].y > l.HEIGHT * .62)
						enemies[i].y = l.HEIGHT * .62;
					dashing = true;
					if (!--enemies[i].dashTime)
						enemies[i].dashCooldown = 105 + Math.random() * 130 | 0;
				}
				else if (--enemies[i].dashCooldown <= 0)
				{
					var dashDx = ship.x - enemies[i].x;
					var dashDy = ship.y - enemies[i].y;
					var dashDist = Math.sqrt(dashDx * dashDx + dashDy * dashDy) || 1;
					var ramming = (l.level || 0) >= 6;
					var dashSpeed = ramming ? scaled(7.4) : scaled(5.2);
					enemies[i].dashXAcc = dashDx / dashDist * dashSpeed;
					enemies[i].dashYAcc = dashDy / dashDist * dashSpeed;
					enemies[i].dashTime = ramming ? 44 : 22;
					dashing = true;
				}
			}
			if (!dashing && enemies[i].move === 'wander')
			{
				var dx = enemies[i].xTarget - enemies[i].x;
				var dy = enemies[i].yTarget - enemies[i].y;
				var dist = Math.sqrt(dx * dx + dy * dy) || 1;
				var speed = scaled(1.45);
				if (dist < speed || --enemies[i].moveT < 0)
				{
					enemies[i].xTarget = enemies[i].r + (l.WIDTH - enemies[i].r * 2) * Math.random() | 0;
					enemies[i].yTarget = l.HEIGHT / 8 + Math.random() * l.HEIGHT / 3 | 0;
					enemies[i].moveT = 90 + Math.random() * 150 | 0;
				}
				else
				{
					enemies[i].x += dx / dist * speed;
					enemies[i].y += dy / dist * speed;
				}
			}
			if (enemies[i].spiderSupport)
				updateSpiderSupport(enemies[i]);
		}
		// Test only: if (enemies[i].y < 0) enemies[i].y = enemies[i].yStop;
		if (enemies[i].y > l.HEIGHT + enemies[i].r * 3)
		{
			enemies.splice(i, 1);
			continue;
		}

		if (!timeStopped && enemies[i].laserT && enemies[i].y >= enemies[i].yStop && --enemies[i].laserT <= 0)
		{
			spawnLaser(enemies[i]);
			enemies[i].laserT = enemies[i].laserInterval || 5 * 60;
		}
		// Each enemy shoots every few game ticks
		if (!timeStopped && !isEnemyInvulnerable(enemies[i]) && --enemies[i].t < 0)
		{
			enemies[i].shoot(angle);
			applyEnemyFireTrait(enemies[i]);
		}
	}

	// Disable additive blending
	a.globalCompositeOperation = 'source-over';

	updateHud();

	// Debug only
	/*
	if (!--fps.t)
	{
		fps.t = 60;
		fps[fps.i] = new Date().getTime();
		fps.v = fps.t * 1000 / (fps[fps.i] - fps[(fps.i - 1 + fps.length) % fps.length]) + .5 | 0;
		//fps.v = fps[(fps.i - 1 + fps.length) % fps.length] +' '+fps[fps.i]+' '+((fps.i - 1 + fps.length) % fps.length);
		fps.i++;
		fps.i %= fps.length;
	}
	a.fillStyle = '#FFF';
	a.font = 'bold 14px Consolas,monospace';
	a.textAlign = 'left';
	a.textBaseline = 'top';
	a.fillText(fps.v + ' FPS', 10, 10);
	a.fillText('SHIELD: ' + ((ship.shield.t / 30 * 10) | 0) / 10 + 's', 10, 20);
	*/

	// Alternative game loop technique
	//window.setTimeout(gameloop, 33);
}

// Sound effects created with as3sfxr, see http://www.superflashbros.net/as3sfxr/
var sfx = [
	// 0 = Player shoots (Schuss_004)
	'8|0,,.167,.1637,.1361,.7212,.0399,-.363,,,,,,.1314,.0517,,.0154,-.1633,1,,,.0515,,.2',
	// 1 = Player is hurt (Treffer_002)
	'4|3,.0704,.0462,.3388,.4099,.1599,,.0109,-.3247,.0006,,-.1592,.4477,.1028,.1787,,-.0157,-.3372,.1896,.1628,,.0016,-.0003,.5',
	// 2 = Player shield is hit (Treffer_001_Schutzschild)
	'4|3,.1,.3899,.1901,.2847,.0399,,.0007,.1492,,,-.9636,,,-.3893,.1636,-.0047,.7799,.1099,-.1103,.5924,.484,.1547,1',
	// 3 = Player shield activated (Schutzschild_ein)
	'1|1,,.0398,,.4198,.3891,,.4383,,,,,,,,.616,,,1,,,,,.5',
	// 4 = Player shield deactivated (Schutzschild_aus)
	'1|1,.1299,.27,.1299,.4199,.1599,,.4383,,,,-.6399,,,-.4799,.7099,,,1,,,,,.5',
	// 5 = Player get weapon upgrade (Upgrade_001)
	'1|0,.43,.1099,.67,.4499,.6999,,-.2199,-.2,.5299,.5299,-.0399,.3,,.0799,.1899,-.1194,.2327,.8815,-.2364,.43,.2099,-.5799,.5',
	// 6 = Player collect non-applicable bonus (Einsammeln_002)
	'1|0,.2,.1099,.0733,.0854,.14,,-.1891,.36,,,.9826,,,.4642,,-.1194,.2327,.8815,-.2364,.0992,.0076,.2,.5',
	// 7 = Player collect money (Einsammeln_001)
	'2|0,.09,.1099,.0733,.0854,.1099,,-.1891,.827,,,.9826,,,.4642,,-.1194,.2327,.8815,-.2364,.0992,.0076,.8314,.5',
	// 8 = Alarm (new_wave)
	'1|1,.1,1,.1901,.2847,.3199,,.0007,.1492,,,-.9636,,,-.3893,.1636,-.0047,.6646,.9653,-.1103,.5924,.484,.1547,.6',
	// 9 = Big enemy is hurt (Treffer_001)
	'8|3,.1,.3899,.1901,.2847,.0399,,.0007,.1492,,,-.9636,,,-.3893,.1636,-.0047,.6646,.9653,-.1103,.5924,.484,.1547,.4',
	// 10 = Big enemy is destroyed (Explosion_001)
	'4|3,.2,.1899,.4799,.91,.0599,,-.2199,-.2,.5299,.5299,-.0399,.3,,.0799,.1899,-.1194,.2327,.8815,-.2364,.43,.2099,-.5799,.5',
	// 11 = Small torpedo is destroyed (Explosion_003)
	'4|3,,.3626,.5543,.191,.0731,,-.3749,,,,,,,,,,,1,,,,,.4',
	// 12 = Enemy shoots (Schuss_002)
	'4|1,.071,.3474,.0506,.1485,.5799,.2,-.2184,-.1405,.1681,,-.1426,,.9603,-.0961,,.2791,-.8322,.2832,.0009,,.0088,-.0082,.3',
	// 13 = Bomb explodes (Bombe)
	'1|3,.05,.3365,.4591,.4922,.1051,,.015,,,,-.6646,.7394,,,,,,1,,,,,.7',
	// 14 = Player died (Gameover_001)
	'1|1,1,.09,.5,.4111,.506,.0942,.1499,.0199,.8799,.1099,-.68,.0268,.1652,.62,.6999,-.0399,.4799,.5199,-.0429,.0599,.8199,-.4199,.7',
	// 15 = Player shoots with the smallest weapon (Spielerschuss_001)
	'8|2,,.1199,.15,.1361,.5,.0399,-.363,-.4799,,,,,.1314,.0517,,.0154,-.1633,1,,,.0515,,.2',
	// 16 = Player shoots with one of the more powerful weapons (Spielerschuss_002)
	'8|2,,.98,.4699,.07,.7799,.0399,-.28,-.4799,.2399,.1,,.36,.1314,.0517,,.0154,-.1633,1,,.37,.0399,.54,.1',
	// 17 = Players energy is below 25 % (Wenig_Energie)
	'1|0,.9705,.0514,.5364,.5273,.4816,.0849,.1422,.205,.7714,.1581,-.7685,.0822,.2147,.6062,.7448,-.0917,.4009,.6251,.1116,.0573,.9005,-.3763,.3',
	// 18 = The round enemy 3 shoots (Gegnerschuss_002)
	'4|0,.0399,.1362,.0331,.2597,.85,.0137,-.3976,,,,,,.2099,-.72,,,,1,,,,,.3',
	// 19 = The smallest enemy 1 shoots (Gegnerschuss_007)
	'4|0,,.2863,,.3048,.751,.2,-.316,,,,,,.4416,.1008,,,,1,,,.2962,,.3',
	// 20 = The medium enemy 2 shoots (Gegnerschuss_004)
	'4|0,,.3138,,.0117,.7877,.1583,-.3391,-.04,,.0464,.0585,,.4085,-.4195,,-.024,-.0396,1,-.0437,.0124,.02,.0216,.3',
	// 21 = Intro
	'1|0,1,.8799,.3499,.17,.61,.1899,-.3,-.18,.3,.6399,-.0279,.0071,.8,-.1599,.5099,-.46,.5199,.25,.0218,.49,.4,-.2,.3',
	// 22 = Player laser
	'3|0,,.1,.12,.18,.36,.04,-.2,,,,,,.12,,,,1,,,,,.3',
	// 23 = Killer move
	'3|0,,.1,.12,.18,.36,.04,-.2,,,,,,.12,,,,1,,,,,.3',
	// 24 = Ship transforms between flight and firing poses
	'3|0,,.1,.12,.18,.36,.04,-.2,,,,,,.12,,,,1,,,,,.3'
];

var sfxLastPlayed = [];
var sfxCooldown = {
	0: 18,
	2: 32,
	10: 46,
	11: 36,
	12: 18,
	13: 60,
	15: 18,
	18: 24,
	19: 24,
	20: 24
};
var sfxVolumes = {
	0: .30,
	1: .58,
	2: .28,
	3: .48,
	4: .34,
	5: .46,
	6: .36,
	7: .18,
	8: .42,
	9: .20,
	10: .38,
	11: .20,
	12: .23,
	13: .52,
	14: .62,
	15: .26,
	16: .28,
	17: .30,
	18: .20,
	19: .21,
	20: .21,
	21: .42,
	22: .20,
	23: .56,
	24: .38
};
var sfxDucksBgm = {
	10: [.13, 14],
	13: [.18, 24],
	14: [.22, 34],
	23: [.16, 42]
};

var assetSfx = {
	3: ['assets/sfx_shield_on.wav', 2, sfxVolume(3)],
	10: ['assets/explosion_.wav', 4, sfxVolume(10)],
	11: ['assets/sfx_explosion_small.wav', 4, sfxVolume(11)],
	13: ['assets/sfx_bomb_blast.wav', 2, sfxVolume(13)],
	22: ['assets/laser.wav', 8, sfxVolume(22)],
	23: ['assets/killer.mp3', 1, sfxVolume(23)],
	24: ['assets/trans.mp3', 2, sfxVolume(24)]
};

// This is required to make the "LOADING" message show up on the screen in slower web browsers
window.setTimeout(function()
{
	for (var i = sfx.length; i--; )
	{
		var asset = assetSfx[i];
		var params = sfx[i].split('|', 2);
		sfx[i] = [];
		sfx[i].i = 0;
		if (typeof Audio === 'function')
			try
			{
				if (asset)
				{
					for (var copies = asset[1]; copies--; )
					{
						var audio = new Audio(asset[0]);
						audio.preload = 'auto';
						if (asset.length > 2)
							audio.volume = asset[2];
						audio.load();
						sfx[i].push(audio);
					}
					continue;
				}
				// Export for the Closure Compiler
				var url = jsfxr(params[1]);
				//sfx[0].push(new Audio('shot.ogg'));
				for (; params[0]--; )
					sfx[i].push(new Audio(url));
			}
			catch (e)
			{
				// This happens in Internet Explorer 9, but I can live with that
				//alert(e);
			}
	}
	startLoop();
	// Alternative game loop technique
	//gameloop();
}, 0);
