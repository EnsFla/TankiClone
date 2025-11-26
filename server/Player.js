const HULLS = {
    wasp: { hp: 100, speed: 12, turnSpeed: 3.5 },
    hornet: { hp: 150, speed: 10, turnSpeed: 3.2 },
    viking: { hp: 200, speed: 7, turnSpeed: 2.8 },
    dictator: { hp: 280, speed: 5.5, turnSpeed: 2.4 },
    titan: { hp: 350, speed: 4.5, turnSpeed: 2.0 },
    mammoth: { hp: 450, speed: 3.5, turnSpeed: 1.6 }
};

class Player {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.team = options.team || 'none';
        this.x = options.x || 0;
        this.y = 0;
        this.z = options.z || 0;
        this.rotation = options.rotation || 0;
        this.turretRotation = 0;
        this.hull = options.hull || 'viking';
        this.turret = options.turret || 'smoky';
        this.maxHp = HULLS[this.hull].hp;
        this.hp = this.maxHp;
        this.alive = true;
        this.kills = 0;
        this.deaths = 0;
        this.lastShot = 0;
        this.lastStreamTick = 0;
        this.burnUntil = 0;
        this.burnDamage = 0;
        this.burnSource = null;
        this.slowUntil = 0;
        this.ready = false;
        this.respawnTimer = 0;
        this.input = {};
    }
    
    getState() {
        return {
            id: this.id,
            name: this.name,
            team: this.team,
            x: this.x,
            y: this.y,
            z: this.z,
            rotation: this.rotation,
            turretRotation: this.turretRotation,
            hull: this.hull,
            turret: this.turret,
            hp: this.hp,
            maxHp: this.maxHp,
            alive: this.alive,
            kills: this.kills,
            deaths: this.deaths,
            ready: this.ready,
            respawnTimer: this.respawnTimer,
            burning: this.burnUntil > Date.now(),
            slowed: this.slowUntil > Date.now()
        };
    }
}

module.exports = Player;