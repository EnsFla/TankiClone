const Player = require('./Player');

const HULLS = {
    wasp: { hp: 100, speed: 12, turnSpeed: 3.5, width: 1.8, length: 2.5, height: 0.6 },
    hornet: { hp: 150, speed: 10, turnSpeed: 3.2, width: 2.0, length: 2.8, height: 0.7 },
    viking: { hp: 200, speed: 7, turnSpeed: 2.8, width: 2.2, length: 3.0, height: 0.8 },
    dictator: { hp: 280, speed: 5.5, turnSpeed: 2.4, width: 2.5, length: 3.3, height: 0.9 },
    titan: { hp: 350, speed: 4.5, turnSpeed: 2.0, width: 2.8, length: 3.6, height: 1.0 },
    mammoth: { hp: 450, speed: 3.5, turnSpeed: 1.6, width: 3.2, length: 4.0, height: 1.1 }
};

const TURRETS = {
    smoky: { damage: 25, fireRate: 0.4, range: 50, projectileSpeed: 80, type: 'projectile', splash: 0, special: null },
    firebird: { damage: 8, fireRate: 0.05, range: 20, projectileSpeed: 0, type: 'stream', splash: 0, special: 'burn', burnDamage: 3, burnDuration: 3 },
    freeze: { damage: 6, fireRate: 0.05, range: 20, projectileSpeed: 0, type: 'stream', splash: 0, special: 'slow', slowAmount: 0.5, slowDuration: 2 },
    isida: { damage: 10, fireRate: 0.1, range: 18, projectileSpeed: 0, type: 'beam', splash: 0, special: 'heal', healAmount: 15 },
    thunder: { damage: 80, fireRate: 1.5, range: 45, projectileSpeed: 60, type: 'projectile', splash: 4, special: null },
    railgun: { damage: 100, fireRate: 3.0, range: 100, projectileSpeed: 200, type: 'instant', splash: 0, special: 'pierce' },
    ricochet: { damage: 30, fireRate: 0.6, range: 60, projectileSpeed: 50, type: 'projectile', splash: 0, special: 'bounce', bounceCount: 3 },
    shaft: { damage: 40, fireRate: 0.8, range: 120, projectileSpeed: 300, type: 'sniper', splash: 0, special: 'charge', maxCharge: 3, maxDamage: 150 }
};

const MAPS = {
    sandbox: {
        width: 100, height: 100,
        spawns: {
            dm: [{ x: -40, z: -40 }, { x: 40, z: -40 }, { x: -40, z: 40 }, { x: 40, z: 40 }, { x: 0, z: -40 }, { x: 0, z: 40 }, { x: -40, z: 0 }, { x: 40, z: 0 }],
            red: [{ x: -40, z: 0 }, { x: -40, z: -15 }, { x: -40, z: 15 }],
            blue: [{ x: 40, z: 0 }, { x: 40, z: -15 }, { x: 40, z: 15 }]
        },
        flags: { red: { x: -45, z: 0 }, blue: { x: 45, z: 0 } },
        obstacles: [
            { x: 0, z: 0, width: 8, height: 4, depth: 8, type: 'box' },
            { x: -20, z: -20, width: 6, height: 3, depth: 6, type: 'box' },
            { x: 20, z: -20, width: 6, height: 3, depth: 6, type: 'box' },
            { x: -20, z: 20, width: 6, height: 3, depth: 6, type: 'box' },
            { x: 20, z: 20, width: 6, height: 3, depth: 6, type: 'box' }
        ],
        healthPacks: [{ x: -25, z: 0 }, { x: 25, z: 0 }, { x: 0, z: -25 }, { x: 0, z: 25 }]
    },
    silence: {
        width: 120, height: 80,
        spawns: {
            dm: [{ x: -50, z: -30 }, { x: 50, z: -30 }, { x: -50, z: 30 }, { x: 50, z: 30 }],
            red: [{ x: -50, z: 0 }, { x: -50, z: -15 }, { x: -50, z: 15 }],
            blue: [{ x: 50, z: 0 }, { x: 50, z: -15 }, { x: 50, z: 15 }]
        },
        flags: { red: { x: -55, z: 0 }, blue: { x: 55, z: 0 } },
        obstacles: [
            { x: -25, z: -15, width: 10, height: 8, depth: 10, type: 'building' },
            { x: 25, z: -15, width: 10, height: 8, depth: 10, type: 'building' },
            { x: -25, z: 15, width: 10, height: 8, depth: 10, type: 'building' },
            { x: 25, z: 15, width: 10, height: 8, depth: 10, type: 'building' },
            { x: 0, z: 0, width: 12, height: 10, depth: 12, type: 'building' }
        ],
        healthPacks: [{ x: -40, z: 0 }, { x: 40, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 }]
    },
    kungur: {
        width: 100, height: 100,
        spawns: {
            dm: [{ x: -40, z: -40 }, { x: 40, z: -40 }, { x: -40, z: 40 }, { x: 40, z: 40 }],
            red: [{ x: -40, z: 0 }, { x: -40, z: -15 }, { x: -40, z: 15 }],
            blue: [{ x: 40, z: 0 }, { x: 40, z: -15 }, { x: 40, z: 15 }]
        },
        flags: { red: { x: -45, z: 0 }, blue: { x: 45, z: 0 } },
        obstacles: [
            { x: -20, z: 0, width: 12, height: 3, depth: 8, type: 'ramp' },
            { x: 20, z: 0, width: 12, height: 3, depth: 8, type: 'ramp' },
            { x: 0, z: -20, width: 15, height: 5, depth: 15, type: 'platform' },
            { x: 0, z: 20, width: 15, height: 5, depth: 15, type: 'platform' }
        ],
        healthPacks: [{ x: -25, z: 0 }, { x: 25, z: 0 }, { x: 0, z: -35 }, { x: 0, z: 35 }]
    }
};

class GameRoom {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.map = options.map;
        this.mode = options.mode;
        this.maxPlayers = options.maxPlayers;
        this.timeLimit = options.timeLimit * 60;
        this.scoreLimit = options.scoreLimit;
        this.players = new Map();
        this.projectiles = [];
        this.healthPacks = [];
        this.flags = { red: null, blue: null };
        this.isActive = false;
        this.gameTime = 0;
        this.scores = { red: 0, blue: 0 };
        this.projectileIdCounter = 0;
        this.initMap();
    }

    initMap() {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        this.mapData = mapData;
        this.healthPacks = mapData.healthPacks.map((hp, index) => ({ id: index, x: hp.x, z: hp.z, active: true, respawnTime: 0 }));
        if (this.mode === 'ctf') {
            this.flags = {
                red: { x: mapData.flags.red.x, z: mapData.flags.red.z, carrier: null, atBase: true },
                blue: { x: mapData.flags.blue.x, z: mapData.flags.blue.z, carrier: null, atBase: true }
            };
        }
    }

    addPlayer(id, name) {
        const team = this.assignTeam();
        const spawn = this.getSpawnPoint(team);
        const player = new Player({ id, name, team, x: spawn.x, z: spawn.z, hull: 'viking', turret: 'smoky' });
        this.players.set(id, player);
        return player.getState();
    }

    removePlayer(id) {
        const player = this.players.get(id);
        if (player && this.mode === 'ctf') {
            ['red', 'blue'].forEach(flagTeam => {
                if (this.flags[flagTeam].carrier === id) {
                    this.flags[flagTeam].carrier = null;
                    this.flags[flagTeam].x = player.x;
                    this.flags[flagTeam].z = player.z;
                    this.flags[flagTeam].atBase = false;
                }
            });
        }
        this.players.delete(id);
    }

    assignTeam() {
        if (this.mode === 'dm') return 'none';
        let redCount = 0, blueCount = 0;
        this.players.forEach(p => { if (p.team === 'red') redCount++; if (p.team === 'blue') blueCount++; });
        return redCount <= blueCount ? 'red' : 'blue';
    }

    getSpawnPoint(team) {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        const spawns = this.mode === 'dm' ? mapData.spawns.dm : (mapData.spawns[team] || mapData.spawns.dm);
        return spawns[Math.floor(Math.random() * spawns.length)];
    }

    updatePlayerTank(playerId, config) {
        const player = this.players.get(playerId);
        if (player) {
            if (config.hull && HULLS[config.hull]) { player.hull = config.hull; player.maxHp = HULLS[config.hull].hp; player.hp = player.maxHp; }
            if (config.turret && TURRETS[config.turret]) { player.turret = config.turret; }
        }
    }

    setPlayerReady(playerId, ready) { const player = this.players.get(playerId); if (player) player.ready = ready; }
    allPlayersReady() { if (this.players.size < 1) return false; let allReady = true; this.players.forEach(p => { if (!p.ready) allReady = false; }); return allReady; }

    startGame() {
        this.isActive = true;
        this.gameTime = 0;
        this.scores = { red: 0, blue: 0 };
        this.players.forEach(player => {
            const spawn = this.getSpawnPoint(player.team);
            player.x = spawn.x; player.z = spawn.z;
            player.rotation = player.team === 'blue' ? Math.PI : 0;
            player.hp = player.maxHp; player.alive = true; player.kills = 0; player.deaths = 0;
        });
        this.healthPacks.forEach(hp => { hp.active = true; hp.respawnTime = 0; });
        if (this.mode === 'ctf') {
            const mapData = MAPS[this.map] || MAPS.sandbox;
            this.flags = {
                red: { x: mapData.flags.red.x, z: mapData.flags.red.z, carrier: null, atBase: true },
                blue: { x: mapData.flags.blue.x, z: mapData.flags.blue.z, carrier: null, atBase: true }
            };
        }
    }

    handleInput(playerId, input) { const player = this.players.get(playerId); if (player && player.alive) player.input = input; }

    handleShoot(playerId, data) {
        const player = this.players.get(playerId);
        if (!player || !player.alive) return null;
        const turretData = TURRETS[player.turret];
        const now = Date.now();
        if (now - player.lastShot < turretData.fireRate * 1000) return null;
        player.lastShot = now;
        const projectile = {
            id: this.projectileIdCounter++, ownerId: playerId, ownerTeam: player.team, turret: player.turret,
            x: player.x + Math.sin(player.turretRotation) * 2, y: 1.5, z: player.z + Math.cos(player.turretRotation) * 2,
            vx: Math.sin(player.turretRotation) * turretData.projectileSpeed, vz: Math.cos(player.turretRotation) * turretData.projectileSpeed,
            rotation: player.turretRotation, damage: turretData.damage, range: turretData.range, traveled: 0,
            type: turretData.type, splash: turretData.splash, special: turretData.special, bounceCount: turretData.bounceCount || 0, charge: data.charge || 0
        };
        if (player.turret === 'shaft' && data.charge) {
            const chargeMultiplier = 1 + (data.charge / turretData.maxCharge) * 2.5;
            projectile.damage = Math.min(turretData.damage * chargeMultiplier, turretData.maxDamage);
        }
        this.projectiles.push(projectile);
        return projectile;
    }

    update(deltaTime) {
        if (!this.isActive) return;
        this.gameTime += deltaTime;
        this.players.forEach(player => this.updatePlayer(player, deltaTime));
        this.updateProjectiles(deltaTime);
        this.updateEffects(deltaTime);
        this.updateHealthPacks(deltaTime);
        if (this.mode === 'ctf') this.updateFlags();
        this.checkRespawns(deltaTime);
    }

    updatePlayer(player, deltaTime) {
        if (!player.alive) return;
        const hull = HULLS[player.hull];
        const input = player.input || {};
        let speedMult = (player.slowUntil && Date.now() < player.slowUntil) ? 0.5 : 1;
        if (input.left) player.rotation += hull.turnSpeed * deltaTime * speedMult;
        if (input.right) player.rotation -= hull.turnSpeed * deltaTime * speedMult;
        let moveSpeed = 0;
        if (input.forward) moveSpeed = hull.speed * speedMult;
        if (input.backward) moveSpeed = -hull.speed * 0.6 * speedMult;
        if (moveSpeed !== 0) {
            const newX = player.x + Math.sin(player.rotation) * moveSpeed * deltaTime;
            const newZ = player.z + Math.cos(player.rotation) * moveSpeed * deltaTime;
            const mapData = MAPS[this.map] || MAPS.sandbox;
            const halfW = mapData.width / 2 - 3, halfH = mapData.height / 2 - 3;
            if (newX > -halfW && newX < halfW && newZ > -halfH && newZ < halfH && !this.checkObstacleCollision(newX, newZ, hull)) {
                player.x = newX; player.z = newZ;
            }
        }
        if (input.turretRotation !== undefined) player.turretRotation = input.turretRotation;
        if (input.shooting && player.alive) {
            const turret = TURRETS[player.turret];
            if (turret.type === 'stream' || turret.type === 'beam') this.handleStreamWeapon(player, turret);
        }
    }

    handleStreamWeapon(player, turretData) {
        const now = Date.now();
        if (now - player.lastStreamTick < 50) return;
        player.lastStreamTick = now;
        this.players.forEach(target => {
            if (target.id === player.id || !target.alive) return;
            if (turretData.special !== 'heal' && player.team !== 'none' && player.team === target.team) return;
            const isHealing = turretData.special === 'heal' && player.team === target.team && player.team !== 'none';
            const dx = target.x - player.x, dz = target.z - player.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > turretData.range) return;
            const angleToTarget = Math.atan2(dx, dz);
            let angleDiff = angleToTarget - player.turretRotation;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            if (Math.abs(angleDiff) > Math.PI / 6) return;
            if (isHealing) { target.hp = Math.min(target.maxHp, target.hp + turretData.healAmount * 0.05); }
            else {
                this.damagePlayer(target, player, turretData.damage * 0.05);
                if (turretData.special === 'burn') { target.burnUntil = now + turretData.burnDuration * 1000; target.burnDamage = turretData.burnDamage; target.burnSource = player.id; }
                if (turretData.special === 'slow') { target.slowUntil = now + turretData.slowDuration * 1000; }
            }
        });
    }

    checkObstacleCollision(x, z, hull) {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        const tankRadius = Math.max(hull.width, hull.length) / 2;
        for (const obs of mapData.obstacles) {
            const halfW = obs.width / 2 + tankRadius, halfD = obs.depth / 2 + tankRadius;
            if (x > obs.x - halfW && x < obs.x + halfW && z > obs.z - halfD && z < obs.z + halfD) return true;
        }
        return false;
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx * deltaTime; proj.z += proj.vz * deltaTime;
            proj.traveled += Math.sqrt(proj.vx * proj.vx + proj.vz * proj.vz) * deltaTime;
            if (proj.traveled > proj.range) { this.projectiles.splice(i, 1); continue; }
            if (this.checkProjectileObstacleCollision(proj)) {
                if (proj.special === 'bounce' && proj.bounceCount > 0) { proj.bounceCount--; proj.vx = -proj.vx; proj.rotation = Math.atan2(proj.vx, proj.vz); }
                else { if (proj.splash > 0) this.applySplashDamage(proj); this.projectiles.splice(i, 1); continue; }
            }
            const hitPlayer = this.checkProjectilePlayerCollision(proj);
            if (hitPlayer) {
                const owner = this.players.get(proj.ownerId);
                this.damagePlayer(hitPlayer, owner, proj.damage);
                if (proj.splash > 0) this.applySplashDamage(proj, hitPlayer.id);
                if (proj.special !== 'pierce') this.projectiles.splice(i, 1);
            }
            const mapData = MAPS[this.map] || MAPS.sandbox;
            if (Math.abs(proj.x) > mapData.width / 2 || Math.abs(proj.z) > mapData.height / 2) this.projectiles.splice(i, 1);
        }
    }

    checkProjectileObstacleCollision(proj) {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        for (const obs of mapData.obstacles) {
            const halfW = obs.width / 2, halfD = obs.depth / 2;
            if (proj.x > obs.x - halfW && proj.x < obs.x + halfW && proj.z > obs.z - halfD && proj.z < obs.z + halfD) return true;
        }
        return false;
    }

    checkProjectilePlayerCollision(proj) {
        for (const [id, player] of this.players) {
            if (id === proj.ownerId || !player.alive) continue;
            if (proj.ownerTeam !== 'none' && proj.ownerTeam === player.team) continue;
            const hull = HULLS[player.hull];
            const dx = proj.x - player.x, dz = proj.z - player.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < Math.max(hull.width, hull.length) / 2 + 0.5) return player;
        }
        return null;
    }

    applySplashDamage(proj, excludeId = null) {
        this.players.forEach(player => {
            if (player.id === proj.ownerId || player.id === excludeId || !player.alive) return;
            if (proj.ownerTeam !== 'none' && proj.ownerTeam === player.team) return;
            const dx = proj.x - player.x, dz = proj.z - player.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < proj.splash) {
                const owner = this.players.get(proj.ownerId);
                this.damagePlayer(player, owner, proj.damage * (1 - dist / proj.splash) * 0.5);
            }
        });
    }

    damagePlayer(target, attacker, damage) {
        target.hp -= damage;
        if (target.hp <= 0) {
            target.hp = 0; target.alive = false; target.deaths++; target.respawnTimer = 5;
            if (attacker) { attacker.kills++; if (this.mode === 'tdm' && attacker.team !== 'none') this.scores[attacker.team]++; }
            if (this.mode === 'ctf') {
                ['red', 'blue'].forEach(flagTeam => {
                    if (this.flags[flagTeam].carrier === target.id) {
                        this.flags[flagTeam].carrier = null; this.flags[flagTeam].x = target.x; this.flags[flagTeam].z = target.z; this.flags[flagTeam].atBase = false;
                    }
                });
            }
        }
    }

    updateEffects(deltaTime) {
        const now = Date.now();
        this.players.forEach(player => {
            if (player.burnUntil && now < player.burnUntil && player.alive) {
                player.hp -= player.burnDamage * deltaTime;
                if (player.hp <= 0) { const attacker = this.players.get(player.burnSource); this.damagePlayer(player, attacker, 0); }
            }
        });
    }

    updateHealthPacks(deltaTime) {
        this.healthPacks.forEach(hp => {
            if (!hp.active) { hp.respawnTime -= deltaTime; if (hp.respawnTime <= 0) hp.active = true; return; }
            this.players.forEach(player => {
                if (!player.alive || player.hp >= player.maxHp) return;
                const dx = hp.x - player.x, dz = hp.z - player.z;
                if (Math.sqrt(dx * dx + dz * dz) < 3) { player.hp = Math.min(player.maxHp, player.hp + 50); hp.active = false; hp.respawnTime = 30; }
            });
        });
    }

    updateFlags() {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        ['red', 'blue'].forEach(flagTeam => {
            const flag = this.flags[flagTeam], enemyTeam = flagTeam === 'red' ? 'blue' : 'red';
            if (flag.carrier) { const carrier = this.players.get(flag.carrier); if (carrier && carrier.alive) { flag.x = carrier.x; flag.z = carrier.z; } }
            if (!flag.carrier) {
                this.players.forEach(player => {
                    if (!player.alive || player.team !== enemyTeam) return;
                    const dx = flag.x - player.x, dz = flag.z - player.z;
                    if (Math.sqrt(dx * dx + dz * dz) < 3) { flag.carrier = player.id; flag.atBase = false; }
                });
            }
            if (!flag.carrier && !flag.atBase) {
                this.players.forEach(player => {
                    if (!player.alive || player.team !== flagTeam) return;
                    const dx = flag.x - player.x, dz = flag.z - player.z;
                    if (Math.sqrt(dx * dx + dz * dz) < 3) { flag.x = mapData.flags[flagTeam].x; flag.z = mapData.flags[flagTeam].z; flag.atBase = true; }
                });
            }
            if (flag.carrier) {
                const carrier = this.players.get(flag.carrier);
                if (carrier) {
                    const ownFlag = this.flags[carrier.team], basePos = mapData.flags[carrier.team];
                    const dx = carrier.x - basePos.x, dz = carrier.z - basePos.z;
                    if (Math.sqrt(dx * dx + dz * dz) < 5 && ownFlag.atBase) {
                        this.scores[carrier.team]++; flag.carrier = null; flag.x = mapData.flags[flagTeam].x; flag.z = mapData.flags[flagTeam].z; flag.atBase = true;
                    }
                }
            }
        });
    }

    checkRespawns(deltaTime) {
        this.players.forEach(player => {
            if (!player.alive && player.respawnTimer > 0) {
                player.respawnTimer -= deltaTime;
                if (player.respawnTimer <= 0) {
                    const spawn = this.getSpawnPoint(player.team);
                    player.x = spawn.x; player.z = spawn.z; player.rotation = player.team === 'blue' ? Math.PI : 0;
                    player.hp = player.maxHp; player.alive = true; player.burnUntil = 0; player.slowUntil = 0;
                }
            }
        });
    }

    getPlayerCount() { return this.players.size; }
    getInfo() { return { id: this.id, name: this.name, map: this.map, mode: this.mode, players: this.getPlayerCount(), maxPlayers: this.maxPlayers, isActive: this.isActive }; }
    getState() {
        const players = {};
        this.players.forEach((player, id) => { players[id] = player.getState(); });
        return { players, projectiles: this.projectiles, healthPacks: this.healthPacks, flags: this.flags, scores: this.scores, gameTime: this.gameTime, timeLimit: this.timeLimit };
    }
    isGameOver() {
        if (this.gameTime >= this.timeLimit) return true;
        if (this.mode === 'dm') { for (const [id, player] of this.players) { if (player.kills >= this.scoreLimit) return true; } }
        else if (this.mode === 'tdm') { if (this.scores.red >= this.scoreLimit || this.scores.blue >= this.scoreLimit) return true; }
        else if (this.mode === 'ctf') { if (this.scores.red >= 3 || this.scores.blue >= 3) return true; }
        return false;
    }
    getResults() {
        const playerStats = [];
        this.players.forEach(player => { playerStats.push({ id: player.id, name: player.name, team: player.team, kills: player.kills, deaths: player.deaths }); });
        playerStats.sort((a, b) => b.kills - a.kills);
        let winner = this.mode === 'dm' ? (playerStats[0]?.name || 'No one') : (this.scores.red > this.scores.blue ? 'Red Team' : this.scores.blue > this.scores.red ? 'Blue Team' : 'Tie');
        return { winner, scores: this.scores, players: playerStats, gameTime: this.gameTime };
    }
    reset() { this.isActive = false; this.gameTime = 0; this.projectiles = []; this.players.forEach(player => { player.ready = false; player.kills = 0; player.deaths = 0; }); }
}

module.exports = GameRoom;