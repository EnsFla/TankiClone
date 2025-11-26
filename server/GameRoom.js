const Player = require('./Player');

// Collision constants
const PROJECTILE_COLLISION_BUFFER = 0.2;
const TANK_HITBOX_MULTIPLIER = 1.0;
const MUZZLE_OFFSET = 2.5;  // Distance from tank center to muzzle
const TWINS_BARREL_OFFSET = 0.3;  // Lateral offset for dual barrel weapons

const HULLS = {
    wasp: { hp: 120, speed: 14, turnSpeed: 4.0, acceleration: 25, width: 1.6, length: 2.2, height: 0.5, armor: 0.9 },
    hornet: { hp: 160, speed: 11, turnSpeed: 3.5, acceleration: 20, width: 1.8, length: 2.5, height: 0.6, armor: 0.95 },
    hunter: { hp: 200, speed: 9, turnSpeed: 3.0, acceleration: 18, width: 2.0, length: 2.8, height: 0.7, armor: 1.0 },
    viking: { hp: 250, speed: 7.5, turnSpeed: 2.8, acceleration: 15, width: 2.2, length: 3.0, height: 0.8, armor: 1.05 },
    dictator: { hp: 320, speed: 6, turnSpeed: 2.4, acceleration: 12, width: 2.5, length: 3.3, height: 0.9, armor: 1.1 },
    titan: { hp: 400, speed: 5, turnSpeed: 2.0, acceleration: 10, width: 2.8, length: 3.6, height: 1.0, armor: 1.2 },
    mammoth: { hp: 500, speed: 4, turnSpeed: 1.6, acceleration: 8, width: 3.2, length: 4.0, height: 1.1, armor: 1.3 }
};

const TURRETS = {
    smoky: { damage: 28, fireRate: 0.35, range: 55, projectileSpeed: 90, type: 'projectile', splash: 0, special: 'crit', critChance: 0.15, critMultiplier: 2.0 },
    firebird: { damage: 12, fireRate: 0.04, range: 22, projectileSpeed: 0, type: 'stream', splash: 0, special: 'burn', burnDamage: 5, burnDuration: 4 },
    freeze: { damage: 8, fireRate: 0.04, range: 22, projectileSpeed: 0, type: 'stream', splash: 0, special: 'slow', slowAmount: 0.5, slowDuration: 3, damageAmp: 1.15 },
    twins: { damage: 18, fireRate: 0.15, range: 45, projectileSpeed: 95, type: 'projectile', splash: 0, special: 'double', spread: 0.05 },
    isida: { damage: 15, fireRate: 0.08, range: 20, projectileSpeed: 0, type: 'beam', splash: 0, special: 'heal', healAmount: 20 },
    thunder: { damage: 90, fireRate: 1.4, range: 50, projectileSpeed: 70, type: 'projectile', splash: 5, special: null, splashDamage: 0.6 },
    railgun: { damage: 120, fireRate: 2.8, range: 120, projectileSpeed: 300, type: 'instant', splash: 0, special: 'pierce', pierceCount: 2 },
    ricochet: { damage: 35, fireRate: 0.5, range: 70, projectileSpeed: 60, type: 'projectile', splash: 0, special: 'bounce', bounceCount: 4, bounceBonus: 0.1 },
    shaft: { damage: 50, fireRate: 0.7, range: 150, projectileSpeed: 400, type: 'sniper', splash: 0, special: 'charge', maxCharge: 3, maxDamage: 180 },
    vulcan: { damage: 6, fireRate: 0.03, range: 40, projectileSpeed: 120, type: 'projectile', splash: 0, special: 'spinup', spinupTime: 1.0, maxFireRate: 0.015 }
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
            { x: 0, z: 0, width: 10, height: 5, depth: 10, type: 'box' },
            { x: -22, z: -22, width: 8, height: 4, depth: 8, type: 'box' },
            { x: 22, z: -22, width: 8, height: 4, depth: 8, type: 'box' },
            { x: -22, z: 22, width: 8, height: 4, depth: 8, type: 'box' },
            { x: 22, z: 22, width: 8, height: 4, depth: 8, type: 'box' },
            { x: -35, z: 0, width: 5, height: 3, depth: 12, type: 'box' },
            { x: 35, z: 0, width: 5, height: 3, depth: 12, type: 'box' }
        ],
        healthPacks: [{ x: -25, z: 0 }, { x: 25, z: 0 }, { x: 0, z: -25 }, { x: 0, z: 25 }],
        powerups: [{ x: 0, z: 0, type: 'damage' }, { x: -35, z: -35, type: 'speed' }, { x: 35, z: 35, type: 'armor' }]
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
            { x: -28, z: -18, width: 12, height: 10, depth: 12, type: 'building' },
            { x: 28, z: -18, width: 12, height: 10, depth: 12, type: 'building' },
            { x: 0, z: 0, width: 14, height: 12, depth: 14, type: 'building' },
            { x: -28, z: 18, width: 8, height: 6, depth: 8, type: 'building' },
            { x: 28, z: 18, width: 8, height: 6, depth: 8, type: 'building' }
        ],
        healthPacks: [{ x: -40, z: 0 }, { x: 40, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 }],
        powerups: [{ x: 0, z: 0, type: 'damage' }, { x: -45, z: -25, type: 'nitro' }]
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
            { x: -22, z: 0, width: 14, height: 4, depth: 10, type: 'ramp' },
            { x: 22, z: 0, width: 14, height: 4, depth: 10, type: 'ramp' },
            { x: 0, z: -22, width: 18, height: 6, depth: 18, type: 'platform' },
            { x: 0, z: 22, width: 10, height: 3, depth: 10, type: 'platform' }
        ],
        healthPacks: [{ x: -25, z: 0 }, { x: 25, z: 0 }, { x: 0, z: -35 }, { x: 0, z: 35 }],
        powerups: [{ x: 0, z: 0, type: 'armor' }, { x: -35, z: 35, type: 'speed' }]
    },
    island: {
        width: 90, height: 90,
        spawns: {
            dm: [{ x: -35, z: -35 }, { x: 35, z: -35 }, { x: -35, z: 35 }, { x: 35, z: 35 }, { x: 0, z: -35 }, { x: 0, z: 35 }],
            red: [{ x: -35, z: 0 }, { x: -35, z: -12 }, { x: -35, z: 12 }],
            blue: [{ x: 35, z: 0 }, { x: 35, z: -12 }, { x: 35, z: 12 }]
        },
        flags: { red: { x: -40, z: 0 }, blue: { x: 40, z: 0 } },
        obstacles: [
            { x: 0, z: 0, width: 12, height: 6, depth: 12, type: 'box' },
            { x: -18, z: -18, width: 6, height: 3, depth: 6, type: 'box' },
            { x: 18, z: 18, width: 6, height: 3, depth: 6, type: 'box' },
            { x: -25, z: 15, width: 8, height: 4, depth: 5, type: 'box' },
            { x: 25, z: -15, width: 8, height: 4, depth: 5, type: 'box' }
        ],
        healthPacks: [{ x: -20, z: 0 }, { x: 20, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 }],
        powerups: [{ x: 0, z: 0, type: 'damage' }]
    },
    polygon: {
        width: 80, height: 80,
        spawns: {
            dm: [{ x: -30, z: -30 }, { x: 30, z: -30 }, { x: -30, z: 30 }, { x: 30, z: 30 }],
            red: [{ x: -30, z: 0 }, { x: -30, z: -10 }, { x: -30, z: 10 }],
            blue: [{ x: 30, z: 0 }, { x: 30, z: -10 }, { x: 30, z: 10 }]
        },
        flags: { red: { x: -35, z: 0 }, blue: { x: 35, z: 0 } },
        obstacles: [
            { x: 0, z: 0, width: 8, height: 8, depth: 8, type: 'box' },
            { x: -15, z: -15, width: 5, height: 4, depth: 5, type: 'box' },
            { x: 15, z: -15, width: 5, height: 4, depth: 5, type: 'box' },
            { x: -15, z: 15, width: 5, height: 4, depth: 5, type: 'box' },
            { x: 15, z: 15, width: 5, height: 4, depth: 5, type: 'box' }
        ],
        healthPacks: [{ x: -18, z: 0 }, { x: 18, z: 0 }, { x: 0, z: -18 }, { x: 0, z: 18 }],
        powerups: [{ x: 0, z: 0, type: 'nitro' }]
    }
};

const POWERUP_TYPES = {
    damage: { effect: 'damage', amount: 1.5, duration: 15 },
    speed: { effect: 'speed', amount: 1.4, duration: 12 },
    armor: { effect: 'armor', amount: 0.5, duration: 10 },
    nitro: { effect: 'nitro', amount: 2.0, duration: 5 }
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
        this.powerups = [];
        this.flags = { red: null, blue: null };
        this.isActive = false;
        this.gameTime = 0;
        this.scores = { red: 0, blue: 0 };
        this.projectileIdCounter = 0;
        this.killFeed = [];
        this.initMap();
    }

    initMap() {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        this.mapData = mapData;
        this.healthPacks = mapData.healthPacks.map((hp, index) => ({ id: index, x: hp.x, z: hp.z, active: true, respawnTime: 0 }));
        // Initialize powerups
        if (mapData.powerups) {
            this.powerups = mapData.powerups.map((pu, index) => ({ 
                id: index + 100, 
                x: pu.x, 
                z: pu.z, 
                type: pu.type, 
                active: true, 
                respawnTime: 0 
            }));
        }
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
        // Add new player properties
        player.killStreak = 0;
        player.respawnProtection = 0;
        player.powerups = {};
        player.velocity = { x: 0, z: 0 };
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
        
        // Check fire rate - initialize spinupProgress if undefined
        let fireRate = turretData.fireRate;
        if (turretData.special === 'spinup') {
            const spinup = player.spinupProgress || 0;
            fireRate = Math.max(turretData.maxFireRate, fireRate * (1 - spinup * 0.5));
        }
        if (now - player.lastShot < fireRate * 1000) return null;
        player.lastShot = now;
        
        // Apply damage multiplier from powerups
        let damage = turretData.damage;
        if (player.powerups && player.powerups.damage && now < player.powerups.damage.until) {
            damage *= player.powerups.damage.amount;
        }
        
        // Critical hit for Smoky
        let isCrit = false;
        if (turretData.special === 'crit' && Math.random() < turretData.critChance) {
            damage *= turretData.critMultiplier;
            isCrit = true;
        }
        
        const projectile = {
            id: this.projectileIdCounter++, ownerId: playerId, ownerTeam: player.team, turret: player.turret,
            x: player.x + Math.sin(player.turretRotation) * MUZZLE_OFFSET, y: 1.5, z: player.z + Math.cos(player.turretRotation) * MUZZLE_OFFSET,
            vx: Math.sin(player.turretRotation) * turretData.projectileSpeed, vz: Math.cos(player.turretRotation) * turretData.projectileSpeed,
            rotation: player.turretRotation, damage: damage, range: turretData.range, traveled: 0,
            type: turretData.type, splash: turretData.splash, special: turretData.special, 
            bounceCount: turretData.bounceCount || 0, bounceBonus: turretData.bounceBonus || 0,
            charge: data.charge || 0, isCrit: isCrit
        };
        
        // Twins fires 2 projectiles with lateral offset
        if (turretData.special === 'double') {
            const spread = turretData.spread || 0.05;
            projectile.vx = Math.sin(player.turretRotation - spread) * turretData.projectileSpeed;
            projectile.vz = Math.cos(player.turretRotation - spread) * turretData.projectileSpeed;
            
            const proj2 = { ...projectile, id: this.projectileIdCounter++ };
            proj2.vx = Math.sin(player.turretRotation + spread) * turretData.projectileSpeed;
            proj2.vz = Math.cos(player.turretRotation + spread) * turretData.projectileSpeed;
            proj2.x = player.x + Math.sin(player.turretRotation) * MUZZLE_OFFSET + Math.sin(player.turretRotation + Math.PI/2) * TWINS_BARREL_OFFSET;
            proj2.z = player.z + Math.cos(player.turretRotation) * MUZZLE_OFFSET + Math.cos(player.turretRotation + Math.PI/2) * TWINS_BARREL_OFFSET;
            this.projectiles.push(proj2);
        }
        
        // Shaft charge damage
        if (player.turret === 'shaft' && data.charge) {
            const chargeMultiplier = 1 + (data.charge / turretData.maxCharge) * 2.5;
            projectile.damage = Math.min(damage * chargeMultiplier, turretData.maxDamage);
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
        this.updatePowerups(deltaTime);
        if (this.mode === 'ctf') this.updateFlags();
        this.checkRespawns(deltaTime);
    }

    updatePlayer(player, deltaTime) {
        if (!player.alive) return;
        const hull = HULLS[player.hull];
        const input = player.input || {};
        const now = Date.now();
        
        // Update respawn protection
        if (player.respawnProtection > 0) {
            player.respawnProtection -= deltaTime;
        }
        
        // Calculate speed multipliers
        let speedMult = 1;
        if (player.slowUntil && now < player.slowUntil) speedMult *= 0.5;
        if (player.powerups && player.powerups.speed && now < player.powerups.speed.until) {
            speedMult *= player.powerups.speed.amount;
        }
        if (player.powerups && player.powerups.nitro && now < player.powerups.nitro.until) {
            speedMult *= player.powerups.nitro.amount;
        }
        
        const rotationChanged = input.left || input.right;
        if (input.left) player.rotation += hull.turnSpeed * deltaTime * speedMult;
        if (input.right) player.rotation -= hull.turnSpeed * deltaTime * speedMult;
        
        // Cache trig values for hitbox calculations when rotation changes
        if (rotationChanged || player.cosRotation === undefined) {
            player.cosRotation = Math.cos(-player.rotation);
            player.sinRotation = Math.sin(-player.rotation);
        }
        
        // Tank physics with acceleration
        const acceleration = hull.acceleration || 15;
        let targetSpeed = 0;
        if (input.forward) targetSpeed = hull.speed * speedMult;
        if (input.backward) targetSpeed = -hull.speed * 0.6 * speedMult;
        
        // Initialize velocity if not present
        if (!player.currentSpeed) player.currentSpeed = 0;
        
        // Smooth acceleration/deceleration
        if (targetSpeed !== 0) {
            player.currentSpeed += (targetSpeed - player.currentSpeed) * Math.min(1, acceleration * deltaTime);
        } else {
            // Decelerate when no input
            player.currentSpeed *= Math.max(0, 1 - acceleration * 0.5 * deltaTime);
            if (Math.abs(player.currentSpeed) < 0.1) player.currentSpeed = 0;
        }
        
        if (player.currentSpeed !== 0) {
            const newX = player.x + Math.sin(player.rotation) * player.currentSpeed * deltaTime;
            const newZ = player.z + Math.cos(player.rotation) * player.currentSpeed * deltaTime;
            const mapData = MAPS[this.map] || MAPS.sandbox;
            const halfW = mapData.width / 2 - 3, halfH = mapData.height / 2 - 3;
            if (newX > -halfW && newX < halfW && newZ > -halfH && newZ < halfH && !this.checkObstacleCollision(newX, newZ, hull)) {
                player.x = newX; player.z = newZ;
            } else {
                player.currentSpeed *= 0.3; // Slow down on collision
            }
        }
        
        if (input.turretRotation !== undefined) player.turretRotation = input.turretRotation;
        if (input.shooting && player.alive) {
            const turret = TURRETS[player.turret];
            if (turret.type === 'stream' || turret.type === 'beam') this.handleStreamWeapon(player, turret);
            // Vulcan spinup
            if (turret.special === 'spinup') {
                player.spinupProgress = Math.min(1, (player.spinupProgress || 0) + deltaTime / turret.spinupTime);
            }
        } else {
            // Vulcan spindown
            if (player.spinupProgress) {
                player.spinupProgress = Math.max(0, player.spinupProgress - deltaTime * 2);
            }
        }
    }

    handleStreamWeapon(player, turretData) {
        const now = Date.now();
        if (now - player.lastStreamTick < 50) return;
        player.lastStreamTick = now;
        
        // Apply damage multiplier from powerups
        let damageMultiplier = 1;
        if (player.powerups && player.powerups.damage && now < player.powerups.damage.until) {
            damageMultiplier = player.powerups.damage.amount;
        }
        
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
            
            // Check if there's a wall between player and target
            if (this.isLineBlockedByWall(player.x, player.z, target.x, target.z)) return;
            
            if (isHealing) { target.hp = Math.min(target.maxHp, target.hp + turretData.healAmount * 0.05); }
            else {
                this.damagePlayer(target, player, turretData.damage * damageMultiplier * 0.05);
                if (turretData.special === 'burn') { 
                    target.burnUntil = now + turretData.burnDuration * 1000; 
                    target.burnDamage = turretData.burnDamage; 
                    target.burnSource = player.id; 
                }
                if (turretData.special === 'slow') { 
                    target.slowUntil = now + turretData.slowDuration * 1000; 
                    // Apply freeze damage amplification
                    target.freezeDamageAmp = turretData.damageAmp || 1.0;
                }
            }
        });
    }
    
    // Check if a line from point A to point B is blocked by a wall/obstacle
    isLineBlockedByWall(startX, startZ, endX, endZ) {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        const dx = endX - startX;
        const dz = endZ - startZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const steps = Math.max(Math.ceil(dist / 1.0), 2);
        
        for (let step = 1; step < steps; step++) {
            const t = step / steps;
            const checkX = startX + dx * t;
            const checkZ = startZ + dz * t;
            
            for (const obs of mapData.obstacles) {
                const halfW = obs.width / 2;
                const halfD = obs.depth / 2;
                
                if (checkX > obs.x - halfW && checkX < obs.x + halfW && 
                    checkZ > obs.z - halfD && checkZ < obs.z + halfD) {
                    return true;
                }
            }
        }
        return false;
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
            const prevX = proj.x, prevZ = proj.z;
            
            // Calculate movement
            const moveX = proj.vx * deltaTime;
            const moveZ = proj.vz * deltaTime;
            
            // Use ray casting to check for wall collision along the path
            const wallHit = this.raycastProjectileWall(prevX, prevZ, prevX + moveX, prevZ + moveZ, proj);
            
            if (wallHit) {
                if (proj.special === 'bounce' && proj.bounceCount > 0) {
                    proj.bounceCount--;
                    // Bounce off the wall
                    if (wallHit.normal === 'x') {
                        proj.vx = -proj.vx;
                    } else {
                        proj.vz = -proj.vz;
                    }
                    proj.x = wallHit.x;
                    proj.z = wallHit.z;
                    proj.rotation = Math.atan2(proj.vx, proj.vz);
                } else {
                    if (proj.splash > 0) this.applySplashDamage(proj);
                    this.projectiles.splice(i, 1);
                    continue;
                }
            } else {
                proj.x += moveX;
                proj.z += moveZ;
            }
            
            proj.traveled += Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (proj.traveled > proj.range) { this.projectiles.splice(i, 1); continue; }
            
            // Check map boundary collision
            const mapData = MAPS[this.map] || MAPS.sandbox;
            const halfW = mapData.width / 2 - 1;
            const halfH = mapData.height / 2 - 1;
            
            if (Math.abs(proj.x) > halfW || Math.abs(proj.z) > halfH) {
                if (proj.special === 'bounce' && proj.bounceCount > 0) {
                    proj.bounceCount--;
                    // Apply bounce damage bonus
                    if (proj.bounceBonus) {
                        proj.damage *= (1 + proj.bounceBonus);
                    }
                    if (Math.abs(proj.x) > halfW) {
                        proj.vx = -proj.vx;
                        proj.x = Math.sign(proj.x) * halfW;
                    }
                    if (Math.abs(proj.z) > halfH) {
                        proj.vz = -proj.vz;
                        proj.z = Math.sign(proj.z) * halfH;
                    }
                    proj.rotation = Math.atan2(proj.vx, proj.vz);
                } else {
                    if (proj.splash > 0) this.applySplashDamage(proj);
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }
            
            const hitPlayer = this.checkProjectilePlayerCollision(proj);
            if (hitPlayer) {
                const owner = this.players.get(proj.ownerId);
                this.damagePlayer(hitPlayer, owner, proj.damage, proj.isCrit);
                if (proj.splash > 0) this.applySplashDamage(proj, hitPlayer.id);
                if (proj.special !== 'pierce') this.projectiles.splice(i, 1);
            }
        }
    }

    // Ray-cast from start to end to find wall collision with finer stepping
    raycastProjectileWall(startX, startZ, endX, endZ, proj) {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        const dx = endX - startX;
        const dz = endZ - startZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        // Use finer step size (0.2 units) to prevent tunneling through walls
        const steps = Math.max(Math.ceil(dist / 0.2), 1);
        
        for (let step = 1; step <= steps; step++) {
            const t = step / steps;
            const checkX = startX + dx * t;
            const checkZ = startZ + dz * t;
            
            for (const obs of mapData.obstacles) {
                const halfW = obs.width / 2 + PROJECTILE_COLLISION_BUFFER;
                const halfD = obs.depth / 2 + PROJECTILE_COLLISION_BUFFER;
                
                if (checkX > obs.x - halfW && checkX < obs.x + halfW && 
                    checkZ > obs.z - halfD && checkZ < obs.z + halfD) {
                    // Get position just before collision
                    const prevT = Math.max(0, (step - 1) / steps);
                    const prevX = startX + dx * prevT;
                    const prevZ = startZ + dz * prevT;
                    
                    // Determine which wall face was hit by comparing penetration depths.
                    // The axis with smaller penetration is the one the projectile crossed most recently,
                    // so it's the face that should be used for the bounce normal.
                    const relX = checkX - obs.x;
                    const relZ = checkZ - obs.z;
                    const penX = halfW - Math.abs(relX);  // How deep into the X faces
                    const penZ = halfD - Math.abs(relZ);  // How deep into the Z faces
                    const normal = penX < penZ ? 'x' : 'z';
                    
                    return { x: prevX, z: prevZ, normal };
                }
            }
        }
        return null;
    }

    checkProjectileObstacleCollision(proj) {
        const mapData = MAPS[this.map] || MAPS.sandbox;
        for (const obs of mapData.obstacles) {
            const halfW = obs.width / 2 + PROJECTILE_COLLISION_BUFFER;
            const halfD = obs.depth / 2 + PROJECTILE_COLLISION_BUFFER;
            if (proj.x > obs.x - halfW && proj.x < obs.x + halfW && proj.z > obs.z - halfD && proj.z < obs.z + halfD) return true;
        }
        return false;
    }

    checkProjectilePlayerCollision(proj) {
        for (const [id, player] of this.players) {
            if (id === proj.ownerId || !player.alive) continue;
            if (proj.ownerTeam !== 'none' && proj.ownerTeam === player.team) continue;
            const hull = HULLS[player.hull];
            
            // Use oriented bounding box (OBB) for accurate hitbox
            // Transform projectile position to tank's local space
            const dx = proj.x - player.x;
            const dz = proj.z - player.z;
            
            // Use cached trig values if available, otherwise compute
            const cos = player.cosRotation !== undefined ? player.cosRotation : Math.cos(-player.rotation);
            const sin = player.sinRotation !== undefined ? player.sinRotation : Math.sin(-player.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            
            // Check if point is inside the oriented box
            const halfWidth = (hull.width / 2) * TANK_HITBOX_MULTIPLIER;
            const halfLength = (hull.length / 2) * TANK_HITBOX_MULTIPLIER;
            
            if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfLength) {
                return player;
            }
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

    damagePlayer(target, attacker, damage, isCrit = false) {
        // Check respawn protection
        if (target.respawnProtection > 0) return;
        
        // Apply armor from hull
        const hull = HULLS[target.hull];
        const armorMultiplier = hull.armor || 1.0;
        
        // Apply armor powerup
        const now = Date.now();
        if (target.powerups && target.powerups.armor && now < target.powerups.armor.until) {
            damage *= target.powerups.armor.amount;
        }
        
        // Apply freeze damage amplification
        if (target.slowUntil && now < target.slowUntil && target.freezeDamageAmp) {
            damage *= target.freezeDamageAmp;
        }
        
        const finalDamage = damage * armorMultiplier;
        target.hp -= finalDamage;
        
        if (target.hp <= 0) {
            target.hp = 0; 
            target.alive = false; 
            target.deaths++; 
            target.respawnTimer = 4;
            target.currentSpeed = 0;
            
            if (attacker) { 
                attacker.kills++; 
                attacker.killStreak = (attacker.killStreak || 0) + 1;
                
                // Add to kill feed
                this.killFeed.push({
                    killer: attacker.name,
                    killed: target.name,
                    weapon: attacker.turret,
                    isCrit: isCrit,
                    time: Date.now()
                });
                // Keep only last 5 kills
                if (this.killFeed.length > 5) this.killFeed.shift();
                
                if (this.mode === 'tdm' && attacker.team !== 'none') this.scores[attacker.team]++; 
            }
            
            // Reset target's kill streak
            target.killStreak = 0;
            
            if (this.mode === 'ctf') {
                ['red', 'blue'].forEach(flagTeam => {
                    if (this.flags[flagTeam].carrier === target.id) {
                        this.flags[flagTeam].carrier = null; 
                        this.flags[flagTeam].x = target.x; 
                        this.flags[flagTeam].z = target.z; 
                        this.flags[flagTeam].atBase = false;
                    }
                });
            }
        }
        
        return finalDamage;
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
    
    updatePowerups(deltaTime) {
        if (!this.powerups) return;
        this.powerups.forEach(pu => {
            if (!pu.active) { 
                pu.respawnTime -= deltaTime; 
                if (pu.respawnTime <= 0) pu.active = true; 
                return; 
            }
            this.players.forEach(player => {
                if (!player.alive) return;
                const dx = pu.x - player.x, dz = pu.z - player.z;
                if (Math.sqrt(dx * dx + dz * dz) < 3) {
                    // Apply powerup
                    const powerupConfig = POWERUP_TYPES[pu.type];
                    if (powerupConfig) {
                        if (!player.powerups) player.powerups = {};
                        player.powerups[powerupConfig.effect] = {
                            amount: powerupConfig.amount,
                            until: Date.now() + powerupConfig.duration * 1000
                        };
                    }
                    pu.active = false;
                    pu.respawnTime = 45;
                }
            });
        });
    }

    updateHealthPacks(deltaTime) {
        this.healthPacks.forEach(hp => {
            if (!hp.active) { hp.respawnTime -= deltaTime; if (hp.respawnTime <= 0) hp.active = true; return; }
            this.players.forEach(player => {
                if (!player.alive || player.hp >= player.maxHp) return;
                const dx = hp.x - player.x, dz = hp.z - player.z;
                if (Math.sqrt(dx * dx + dz * dz) < 3) { player.hp = Math.min(player.maxHp, player.hp + 75); hp.active = false; hp.respawnTime = 25; }
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
                    player.respawnProtection = 3.0; // 3 seconds of spawn protection
                    player.currentSpeed = 0;
                    player.powerups = {};
                }
            }
        });
    }

    getPlayerCount() { return this.players.size; }
    getInfo() { return { id: this.id, name: this.name, map: this.map, mode: this.mode, players: this.getPlayerCount(), maxPlayers: this.maxPlayers, isActive: this.isActive }; }
    getState() {
        const players = {};
        this.players.forEach((player, id) => { 
            const state = player.getState();
            state.killStreak = player.killStreak || 0;
            state.respawnProtection = player.respawnProtection || 0;
            state.powerups = player.powerups || {};
            players[id] = state; 
        });
        return { 
            players, 
            projectiles: this.projectiles, 
            healthPacks: this.healthPacks, 
            powerups: this.powerups || [],
            flags: this.flags, 
            scores: this.scores, 
            gameTime: this.gameTime, 
            timeLimit: this.timeLimit,
            killFeed: this.killFeed || []
        };
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
        this.players.forEach(player => { playerStats.push({ id: player.id, name: player.name, team: player.team, kills: player.kills, deaths: player.deaths, killStreak: player.killStreak || 0 }); });
        playerStats.sort((a, b) => b.kills - a.kills);
        let winner = this.mode === 'dm' ? (playerStats[0]?.name || 'No one') : (this.scores.red > this.scores.blue ? 'Red Team' : this.scores.blue > this.scores.red ? 'Blue Team' : 'Tie');
        return { winner, scores: this.scores, players: playerStats, gameTime: this.gameTime };
    }
    reset() { 
        this.isActive = false; 
        this.gameTime = 0; 
        this.projectiles = []; 
        this.killFeed = [];
        this.players.forEach(player => { 
            player.ready = false; 
            player.kills = 0; 
            player.deaths = 0;
            player.killStreak = 0;
            player.powerups = {};
        }); 
    }
}

module.exports = GameRoom;