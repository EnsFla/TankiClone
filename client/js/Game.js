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
        this.inputInterval = 1000 / 60;  // Higher input rate for smoother feel
        this.running = false;
        this.chatOpen = false;
        this.shaftCharging = false;
        this.shaftChargeStart = 0;
        // Camera smoothing
        this.cameraTarget = { x: 0, y: CONFIG.CAMERA_HEIGHT, z: CONFIG.CAMERA_DISTANCE };
        this.cameraLookAt = { x: 0, y: 0, z: 0 };
        // Screen shake
        this.screenShake = { intensity: 0, decay: 0.9 };
    }

    init() {
        this.scene = new THREE.Scene();
        // Better sky color
        this.scene.background = new THREE.Color(0x87ceeb);
        // Improved fog for depth perception
        this.scene.fog = new THREE.Fog(0x87ceeb, 80, 200);
        
        // Better lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Hemisphere light for natural outdoor feel
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3d, 0.4);
        this.scene.add(hemiLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
        directionalLight.position.set(30, 80, 40);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 10;
        directionalLight.shadow.camera.far = 250;
        directionalLight.shadow.camera.left = -80;
        directionalLight.shadow.camera.right = 80;
        directionalLight.shadow.camera.top = 80;
        directionalLight.shadow.camera.bottom = -80;
        directionalLight.shadow.bias = -0.0005;
        this.scene.add(directionalLight);
        
        // Fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        fillLight.position.set(-30, 40, -30);
        this.scene.add(fillLight);
        
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
        this.camera.position.set(0, CONFIG.CAMERA_HEIGHT, CONFIG.CAMERA_DISTANCE);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
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
        this.updateCamera(deltaTime);
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

    updateCamera(deltaTime) {
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer) return;
        
        // Calculate look-ahead based on player movement direction
        const lookAhead = CONFIG.CAMERA_LOOK_AHEAD || 5;
        const lookAheadX = Math.sin(localPlayer.rotation) * lookAhead;
        const lookAheadZ = Math.cos(localPlayer.rotation) * lookAhead;
        
        // Target position with look-ahead
        const targetX = localPlayer.x + lookAheadX * 0.3;
        const targetZ = localPlayer.z + CONFIG.CAMERA_DISTANCE + lookAheadZ * 0.3;
        const targetY = CONFIG.CAMERA_HEIGHT;
        
        // Smooth camera movement with configurable smoothing
        const smoothing = CONFIG.CAMERA_SMOOTHING || 0.08;
        this.cameraTarget.x += (targetX - this.cameraTarget.x) * smoothing;
        this.cameraTarget.y += (targetY - this.cameraTarget.y) * smoothing;
        this.cameraTarget.z += (targetZ - this.cameraTarget.z) * smoothing;
        
        // Smooth look-at target
        this.cameraLookAt.x += (localPlayer.x - this.cameraLookAt.x) * smoothing * 1.5;
        this.cameraLookAt.z += (localPlayer.z - this.cameraLookAt.z) * smoothing * 1.5;
        
        // Apply screen shake if active
        let shakeX = 0, shakeY = 0;
        if (this.screenShake.intensity > 0.01) {
            shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
            shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.intensity *= this.screenShake.decay;
        }
        
        this.camera.position.set(
            this.cameraTarget.x + shakeX,
            this.cameraTarget.y + shakeY,
            this.cameraTarget.z
        );
        this.camera.lookAt(this.cameraLookAt.x, 1, this.cameraLookAt.z);
    }
    
    addScreenShake(intensity) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
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
        const now = performance.now();
        if (this.map) {
            this.map.updateHealthPacks(state.healthPacks, now);
            if (state.flags) {
                this.map.updateFlags(state.flags, now);
            }
        }
    }

    onGameUpdate(state) {
        this.gameState = state;
        const deltaTime = 1 / 60;
        const now = performance.now();
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
            this.map.updateHealthPacks(state.healthPacks, now);
            if (state.flags) {
                this.map.updateFlags(state.flags, now);
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
            this.effects.createExplosion(victimTank.x, 1, victimTank.z, 0xff4400, 2.0);
            this.audio.play('explosion');
            
            // Screen shake if local player is nearby or is the victim
            const localPlayer = this.getLocalPlayer();
            if (localPlayer) {
                if (victim.id === this.localPlayerId) {
                    this.addScreenShake(1.5);
                } else {
                    const dx = victimTank.x - localPlayer.x;
                    const dz = victimTank.z - localPlayer.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < 30) {
                        this.addScreenShake((30 - dist) / 30 * 0.8);
                    }
                }
            }
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
