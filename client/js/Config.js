// Game Configuration - Tanki Online Classic
const CONFIG = {
    // Tank Hulls - Balanced for different playstyles
    HULLS: {
        wasp: { 
            hp: 120, speed: 14, turnSpeed: 4.0, acceleration: 25, 
            width: 1.6, length: 2.2, height: 0.5, 
            color: 0x88ff88, name: 'Wasp', 
            desc: 'Lightning fast scout tank',
            armor: 0.9 // Takes 10% more damage
        },
        hornet: { 
            hp: 160, speed: 11, turnSpeed: 3.5, acceleration: 20,
            width: 1.8, length: 2.5, height: 0.6, 
            color: 0xaaff66, name: 'Hornet', 
            desc: 'Agile flanker with good speed',
            armor: 0.95
        },
        hunter: { 
            hp: 200, speed: 9, turnSpeed: 3.0, acceleration: 18,
            width: 2.0, length: 2.8, height: 0.7, 
            color: 0x66cc66, name: 'Hunter', 
            desc: 'Balanced all-rounder',
            armor: 1.0
        },
        viking: { 
            hp: 250, speed: 7.5, turnSpeed: 2.8, acceleration: 15,
            width: 2.2, length: 3.0, height: 0.8, 
            color: 0x66aa66, name: 'Viking', 
            desc: 'Versatile combat tank',
            armor: 1.05
        },
        dictator: { 
            hp: 320, speed: 6, turnSpeed: 2.4, acceleration: 12,
            width: 2.5, length: 3.3, height: 0.9, 
            color: 0x448844, name: 'Dictator', 
            desc: 'Heavy assault tank',
            armor: 1.1
        },
        titan: { 
            hp: 400, speed: 5, turnSpeed: 2.0, acceleration: 10,
            width: 2.8, length: 3.6, height: 1.0, 
            color: 0x336633, name: 'Titan', 
            desc: 'Heavily armored bruiser',
            armor: 1.2
        },
        mammoth: { 
            hp: 500, speed: 4, turnSpeed: 1.6, acceleration: 8,
            width: 3.2, length: 4.0, height: 1.1, 
            color: 0x225522, name: 'Mammoth', 
            desc: 'Unstoppable fortress',
            armor: 1.3
        }
    },
    // Weapons - Each with unique mechanics
    TURRETS: {
        smoky: { 
            damage: 28, fireRate: 0.35, range: 55, speed: 90, 
            type: 'projectile', color: 0xffaa00, name: 'Smoky', 
            desc: 'Reliable cannon with critical hits',
            critChance: 0.15, critMultiplier: 2.0
        },
        firebird: { 
            damage: 12, fireRate: 0.04, range: 22, speed: 0, 
            type: 'stream', color: 0xff4400, name: 'Firebird', 
            desc: 'Burns enemies over time',
            burnDamage: 5, burnDuration: 4
        },
        freeze: { 
            damage: 8, fireRate: 0.04, range: 22, speed: 0, 
            type: 'stream', color: 0x00ccff, name: 'Freeze', 
            desc: 'Slows and weakens enemies',
            slowAmount: 0.5, slowDuration: 3, damageAmp: 1.15
        },
        twins: { 
            damage: 18, fireRate: 0.15, range: 45, speed: 95, 
            type: 'projectile', color: 0x88ff88, name: 'Twins', 
            desc: 'Rapid-fire dual cannons',
            projectileCount: 2, spread: 0.05
        },
        isida: { 
            damage: 15, fireRate: 0.08, range: 20, speed: 0, 
            type: 'beam', color: 0x00ff00, name: 'Isida', 
            desc: 'Heals allies, damages enemies',
            healAmount: 20
        },
        thunder: { 
            damage: 90, fireRate: 1.4, range: 50, speed: 70, 
            type: 'projectile', color: 0xffff00, name: 'Thunder', 
            desc: 'Devastating splash damage',
            splash: 5, splashDamage: 0.6
        },
        railgun: { 
            damage: 120, fireRate: 2.8, range: 120, speed: 300, 
            type: 'instant', color: 0x0088ff, name: 'Railgun', 
            desc: 'Piercing high-damage shot',
            pierce: true, pierceCount: 2
        },
        ricochet: { 
            damage: 35, fireRate: 0.5, range: 70, speed: 60, 
            type: 'projectile', color: 0xff00ff, name: 'Ricochet', 
            desc: 'Bouncing plasma rounds',
            bounceCount: 4, bounceBonus: 0.1
        },
        shaft: { 
            damage: 50, fireRate: 0.7, range: 150, speed: 400, 
            type: 'sniper', color: 0x8800ff, name: 'Shaft', 
            desc: 'Sniper with charge-up',
            maxCharge: 3, maxDamage: 180, zoomFov: 30
        },
        vulcan: { 
            damage: 6, fireRate: 0.03, range: 40, speed: 120, 
            type: 'projectile', color: 0xff6600, name: 'Vulcan', 
            desc: 'Minigun that heats up',
            spinupTime: 1.0, maxFireRate: 0.015
        }
    },
    // Maps with different themes and layouts
    MAPS: {
        sandbox: { width: 100, height: 100, name: 'Sandbox', groundColor: 0x3d5c3d, theme: 'grass' },
        silence: { width: 120, height: 80, name: 'Silence', groundColor: 0x4a4a4a, theme: 'urban' },
        kungur: { width: 100, height: 100, name: 'Kungur', groundColor: 0x5c4a3d, theme: 'desert' },
        island: { width: 90, height: 90, name: 'Island', groundColor: 0x7a9a6a, theme: 'tropical' },
        polygon: { width: 80, height: 80, name: 'Polygon', groundColor: 0x555555, theme: 'industrial' }
    },
    // Power-ups that spawn on the map
    POWERUPS: {
        health: { color: 0x00ff44, effect: 'heal', amount: 100, duration: 0 },
        damage: { color: 0xff4400, effect: 'damage', amount: 1.5, duration: 15 },
        speed: { color: 0x00aaff, effect: 'speed', amount: 1.4, duration: 12 },
        armor: { color: 0xffaa00, effect: 'armor', amount: 0.5, duration: 10 },
        nitro: { color: 0xff00ff, effect: 'nitro', amount: 2.0, duration: 5 }
    },
    // Team colors
    TEAM_COLORS: { red: 0xff4444, blue: 0x4444ff, none: 0x44ff44 },
    // Camera - More responsive and closer to action
    CAMERA_HEIGHT: 8,
    CAMERA_DISTANCE: 14,
    CAMERA_ANGLE: Math.PI / 7,
    CAMERA_SMOOTHING: 0.18,
    CAMERA_LOOK_AHEAD: 6,
    CAMERA_FOV: 75,
    CAMERA_SHAKE_MULTIPLIER: 1.0,
    // Gameplay settings
    HITBOX_MULTIPLIER: 1.0,
    RESPAWN_PROTECTION: 3.0,
    KILL_STREAK_THRESHOLD: 3,
    // QoL settings
    SHOW_FPS: true,
    SHOW_CROSSHAIR: true,
    SHOW_DAMAGE_NUMBERS: true,
    SHOW_HIT_MARKERS: true,
    SHOW_KILL_STREAK: true,
    // Audio
    INTERPOLATION_DELAY: 80,
    MASTER_VOLUME: 0.6,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.3
};
window.CONFIG = CONFIG;