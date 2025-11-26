// Game Engine - 3D rendering and game loop
class Game {
    constructor(canvas, ui, network) {
        this.canvas = canvas;
        this.ui = ui;
        this.network = network;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.tanks = new Map();
        this.projectiles = [];
        this.map = null;
        this.effects = null;
        this.audio = null;
        this.localPlayerId = null;
        this.roomInfo = null;
        this.gameState = null;
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.lastFrameTime = 0;
        this.lastInputSent = 0;
        this.inputInterval = 1000 / 30;
        this.running = false;
        this.chatOpen = false;
        this.shaftCharging = false;
        this.shaftChargeStart = 0;
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222244);
        this.scene.fog = new THREE.Fog(0x222244, 50, 150);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 10;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -60;
        directionalLight.shadow.camera.right = 60;
        directionalLight.shadow.camera.top = 60;
        directionalLight.shadow.camera.bottom = -60;
        this.scene.add(directionalLight);
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, CONFIG.CAMERA_HEIGHT, CONFIG.CAMERA_DISTANCE);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.effects = new Effects(this.scene);
        this.audio = new Audio();
        this.setupEventListeners();
        window.addEventListener('resize', () => this.onResize());
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
            if (this.running && this.canvas.requestPointerLock) {
                this.canvas.requestPointerLock();
            }
        });
    }

    onKeyDown(e) {
        if (this.chatOpen) {
            if (e.key === 'Escape') {
                this.chatOpen = false;
                this.ui.hideChatInput();
            } else if (e.key === 'Enter') {
                const input = this.ui.elements.chatInput;
                if (input && input.value.trim()) {
                    this.network.sendChat(input.value.trim());
                }
                this.chatOpen = false;
                this.ui.hideChatInput();
            }
            return;
        }
        if (e.key === 'Enter') {
            this.chatOpen = true;
            this.ui.showChatInput();
            return;
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            if (this.gameState) {
                this.ui.showScoreboard(this.gameState.players);
            }
        }
        this.keys[e.key.toLowerCase()] = true;
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
        if (e.key === 'Tab') {
            this.ui.hideScoreboard();
        }
    }

    onMouseMove(e) {
        if (document.pointerLockElement === this.canvas) {
            this.mouse.x += e.movementX;
            this.mouse.y += e.movementY;
        } else {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        }
    }

    onMouseDown(e) {
        if (e.button === 0) {
            this.mouse.down = true;
            const localPlayer = this.getLocalPlayer();
            if (localPlayer && localPlayer.turret === 'shaft') {
                this.shaftCharging = true;
                this.shaftChargeStart = Date.now();
            }
        }
    }

    onMouseUp(e) {
        if (e.button === 0) {
            this.mouse.down = false;
            if (this.shaftCharging) {
                const chargeTime = (Date.now() - this.shaftChargeStart) / 1000;
                this.network.shoot({ charge: Math.min(chargeTime, 3) });
                this.shaftCharging = false;
            }
        }
    }

    onResize() {
        if (!this.canvas || !this.camera || !this.renderer) return;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    loadMap(mapName) {
        if (this.map) {
            this.map.obstacles.forEach(obs => this.scene.remove(obs));
            this.map.healthPacks.forEach(hp => this.scene.remove(hp));
            Object.values(this.map.flags).forEach(flag => { if (flag) this.scene.remove(flag); });
        }
        this.map = new GameMap(this.scene, mapName);
    }

    setRoomInfo(room) {
        this.roomInfo = room;
    }

    setLocalPlayerId(id) {
        this.localPlayerId = id;
    }

    getLocalPlayer() {
        if (!this.gameState || !this.localPlayerId) return null;
        return this.gameState.players[this.localPlayerId];
    }

    start() {
        this.running = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    stop() {
        this.running = false;
    }

    animate() {
        if (!this.running) return;
        requestAnimationFrame(() => this.animate());
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    update(deltaTime) {
        this.sendInput();
        this.updateCamera();
        this.updateProjectiles(deltaTime);
        this.effects.update(deltaTime);
        this.updateHUD();
        this.updateMinimap();
    }

    sendInput() {
        const now = performance.now();
        if (now - this.lastInputSent < this.inputInterval) return;
        this.lastInputSent = now;
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer || !localPlayer.alive) return;
        const turretRotation = this.calculateTurretRotation();
        const turretConfig = CONFIG.TURRETS[localPlayer.turret];
        const isStreamWeapon = turretConfig && (turretConfig.type === 'stream' || turretConfig.type === 'beam');
        const input = {
            forward: this.keys['w'],
            backward: this.keys['s'],
            left: this.keys['a'],
            right: this.keys['d'],
            turretRotation: turretRotation,
            shooting: this.mouse.down && isStreamWeapon
        };
        this.network.sendInput(input);
        if (this.mouse.down && !isStreamWeapon && !this.shaftCharging) {
            this.network.shoot({});
        }
    }

    calculateTurretRotation() {
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer) return 0;
        const tankPos = new THREE.Vector3(localPlayer.x, 0, localPlayer.z);
        const raycaster = new THREE.Raycaster();
        const mouseNDC = new THREE.Vector2(
            (this.mouse.x / this.canvas.clientWidth) * 2 - 1,
            -(this.mouse.y / this.canvas.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouseNDC, this.camera);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersection);
        if (intersection) {
            const dx = intersection.x - tankPos.x;
            const dz = intersection.z - tankPos.z;
            return Math.atan2(dx, dz);
        }
        return localPlayer.turretRotation || 0;
    }

    updateCamera() {
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer) return;
        const targetX = localPlayer.x;
        const targetZ = localPlayer.z + CONFIG.CAMERA_DISTANCE * Math.cos(CONFIG.CAMERA_ANGLE);
        const targetY = CONFIG.CAMERA_HEIGHT;
        this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;
        this.camera.lookAt(localPlayer.x, 0, localPlayer.z);
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (!proj.update(deltaTime)) {
                proj.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateHUD() {
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer) return;
        this.ui.updateHealth(localPlayer.hp, localPlayer.maxHp);
        this.ui.updateKills(localPlayer.kills);
        if (!localPlayer.alive && localPlayer.respawnTimer > 0) {
            this.ui.showRespawn(localPlayer.respawnTimer);
        } else {
            this.ui.hideRespawn();
        }
        if (this.gameState) {
            const timeRemaining = this.gameState.timeLimit - this.gameState.gameTime;
            this.ui.updateTimer(timeRemaining);
            if (this.roomInfo && this.roomInfo.mode !== 'dm') {
                this.ui.updateScores(this.roomInfo.mode, this.gameState.scores);
            }
        }
    }

    updateMinimap() {
        if (!this.gameState || !this.roomInfo) return;
        const mapConfig = CONFIG.MAPS[this.roomInfo.map] || CONFIG.MAPS.sandbox;
        this.ui.updateMinimap(
            this.gameState.players,
            this.localPlayerId,
            mapConfig,
            this.gameState.flags
        );
    }

    onGameState(state) {
        this.gameState = state;
        this.syncPlayers(state.players);
        if (this.map) {
            this.map.updateHealthPacks(state.healthPacks);
            if (state.flags) {
                this.map.updateFlags(state.flags);
            }
        }
    }

    onGameUpdate(state) {
        this.gameState = state;
        const deltaTime = 1 / 60;
        if (state.players) {
            Object.entries(state.players).forEach(([id, playerData]) => {
                const tank = this.tanks.get(id);
                if (tank) {
                    tank.update(playerData, deltaTime);
                } else {
                    this.addTank(playerData);
                }
            });
            this.tanks.forEach((tank, id) => {
                if (!state.players[id]) {
                    this.removeTank(id);
                }
            });
        }
        if (this.map) {
            this.map.updateHealthPacks(state.healthPacks);
            if (state.flags) {
                this.map.updateFlags(state.flags);
            }
        }
    }

    syncPlayers(players) {
        if (!players) return;
        Object.entries(players).forEach(([id, playerData]) => {
            if (!this.tanks.has(id)) {
                this.addTank(playerData);
            }
        });
        this.tanks.forEach((tank, id) => {
            if (!players[id]) {
                this.removeTank(id);
            }
        });
    }

    addTank(playerData) {
        const tank = new Tank(this.scene, playerData);
        this.tanks.set(playerData.id, tank);
    }

    removeTank(id) {
        const tank = this.tanks.get(id);
        if (tank) {
            tank.destroy();
            this.tanks.delete(id);
        }
    }

    onProjectileSpawned(data) {
        const projectile = new Projectile(this.scene, data);
        this.projectiles.push(projectile);
        const localPlayer = this.getLocalPlayer();
        if (localPlayer && data.ownerId === this.localPlayerId) {
            const turretConfig = CONFIG.TURRETS[localPlayer.turret];
            if (turretConfig && turretConfig.type !== 'stream' && turretConfig.type !== 'beam') {
                this.effects.createMuzzleFlash(
                    localPlayer.x + Math.sin(localPlayer.turretRotation) * 2,
                    1.5,
                    localPlayer.z + Math.cos(localPlayer.turretRotation) * 2,
                    localPlayer.turretRotation,
                    turretConfig.color
                );
                this.audio.play('shoot');
            }
        }
    }

    onPlayerKilled(killer, victim) {
        const victimTank = this.tanks.get(victim.id);
        if (victimTank) {
            this.effects.createExplosion(victimTank.x, 1, victimTank.z, 0xff4400, 1.5);
            this.audio.play('explosion');
        }
        this.ui.addKillMessage(killer.name || 'Unknown', victim.name || 'Unknown');
    }

    onChatMessage(data) {
        this.ui.addChatMessage(data.player, data.message);
    }

    cleanup() {
        this.tanks.forEach((tank) => tank.destroy());
        this.tanks.clear();
        this.projectiles.forEach((proj) => proj.destroy());
        this.projectiles = [];
        if (this.map) {
            this.map.obstacles.forEach(obs => this.scene.remove(obs));
            this.map.healthPacks.forEach(hp => this.scene.remove(hp));
        }
    }
}

window.Game = Game;
