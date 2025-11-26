// Game Configuration - Tanki Online Classic
const CONFIG = {
    HULLS: {
        wasp: { hp: 100, speed: 12, turnSpeed: 3.5, width: 1.8, length: 2.5, height: 0.6, color: 0x88ff88, name: 'Wasp', desc: 'HP: 100 | Speed: ★★★★★' },
        hornet: { hp: 150, speed: 10, turnSpeed: 3.2, width: 2.0, length: 2.8, height: 0.7, color: 0xaaff66, name: 'Hornet', desc: 'HP: 150 | Speed: ★★★★☆' },
        viking: { hp: 200, speed: 7, turnSpeed: 2.8, width: 2.2, length: 3.0, height: 0.8, color: 0x66aa66, name: 'Viking', desc: 'HP: 200 | Speed: ★★★☆☆' },
        dictator: { hp: 280, speed: 5.5, turnSpeed: 2.4, width: 2.5, length: 3.3, height: 0.9, color: 0x448844, name: 'Dictator', desc: 'HP: 280 | Speed: ★★☆☆☆' },
        titan: { hp: 350, speed: 4.5, turnSpeed: 2.0, width: 2.8, length: 3.6, height: 1.0, color: 0x336633, name: 'Titan', desc: 'HP: 350 | Speed: ★★☆☆☆' },
        mammoth: { hp: 450, speed: 3.5, turnSpeed: 1.6, width: 3.2, length: 4.0, height: 1.1, color: 0x225522, name: 'Mammoth', desc: 'HP: 450 | Speed: ★☆☆☆☆' }
    },
    TURRETS: {
        smoky: { damage: 25, fireRate: 0.4, range: 50, speed: 80, type: 'projectile', color: 0xffaa00, name: 'Smoky', desc: 'Damage: 25 | Basic cannon' },
        firebird: { damage: 8, fireRate: 0.05, range: 20, speed: 0, type: 'stream', color: 0xff4400, name: 'Firebird', desc: 'Damage: 8/tick | Burns enemies' },
        freeze: { damage: 6, fireRate: 0.05, range: 20, speed: 0, type: 'stream', color: 0x00ccff, name: 'Freeze', desc: 'Damage: 6/tick | Slows enemies' },
        isida: { damage: 10, fireRate: 0.1, range: 18, speed: 0, type: 'beam', color: 0x00ff00, name: 'Isida', desc: 'Heal: 15/tick | Heals allies' },
        thunder: { damage: 80, fireRate: 1.5, range: 45, speed: 60, type: 'projectile', color: 0xffff00, name: 'Thunder', desc: 'Damage: 80 | Splash damage' },
        railgun: { damage: 100, fireRate: 3.0, range: 100, speed: 200, type: 'instant', color: 0x0088ff, name: 'Railgun', desc: 'Damage: 100 | Piercing shot' },
        ricochet: { damage: 30, fireRate: 0.6, range: 60, speed: 50, type: 'projectile', color: 0xff00ff, name: 'Ricochet', desc: 'Damage: 30 | Bouncing shots' },
        shaft: { damage: 40, fireRate: 0.8, range: 120, speed: 300, type: 'sniper', color: 0x8800ff, name: 'Shaft', desc: 'Damage: 40-150 | Sniper zoom' }
    },
    MAPS: {
        sandbox: { width: 100, height: 100, name: 'Sandbox', groundColor: 0x3d5c3d },
        silence: { width: 120, height: 80, name: 'Silence', groundColor: 0x4a4a4a },
        kungur: { width: 100, height: 100, name: 'Kungur', groundColor: 0x5c4a3d }
    },
    TEAM_COLORS: { red: 0xff4444, blue: 0x4444ff, none: 0x44ff44 },
    // Improved camera settings for better gameplay feel
    CAMERA_HEIGHT: 18,
    CAMERA_DISTANCE: 22,
    CAMERA_ANGLE: Math.PI / 5,
    CAMERA_SMOOTHING: 0.08,
    CAMERA_LOOK_AHEAD: 5,
    INTERPOLATION_DELAY: 100,
    MASTER_VOLUME: 0.5,
    SFX_VOLUME: 0.7,
    MUSIC_VOLUME: 0.3
};
window.CONFIG = CONFIG;