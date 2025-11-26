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
        this.inputInterval = 1000 / 60;
        this.running = false;
        this.chatOpen = false;
        this.shaftCharging = false;
        this.shaftChargeStart = 0;
        // Camera smoothing - separate position and angle tracking
        this.cameraTarget = { x: 0, y: CONFIG.CAMERA_HEIGHT, z: CONFIG.CAMERA_DISTANCE };
        this.cameraLookAt = { x: 0, y: 0, z: 0 };
        // Screen shake
        this.screenShake = { intensity: 0, decay: 0.9 };
        // QoL features
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        this.currentFps = 0;
        // Damage number pool for performance
        this.damageNumberPool = [];
        this.maxDamageNumbers = 20;
        // Turret rotation tracking for pointer lock mode
        this.turretAngle = 0;
        this.mouseSensitivity = 0.003;
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 80, 200);
        
        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3d, 0.4);
        this.scene.add(hemiLight);
        
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
        
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        fillLight.position.set(-30, 40, -30);
        this.scene.add(fillLight);
        
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(CONFIG.CAMERA_FOV || 65, aspect, 0.1, 1000);
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
        this.createCrosshair();
        window.addEventListener('resize', () => this.onResize());
    }
    
    createCrosshair() {
        // Create crosshair element
        if (!document.getElementById('crosshair')) {
            const crosshair = document.createElement('div');
            crosshair.id = 'crosshair';
            crosshair.innerHTML = `
                <div class="crosshair-line crosshair-top"></div>
                <div class="crosshair-line crosshair-right"></div>
                <div class="crosshair-line crosshair-bottom"></div>
                <div class="crosshair-line crosshair-left"></div>
                <div class="crosshair-dot"></div>
            `;
            document.body.appendChild(crosshair);
            
            // Add crosshair styles
            const style = document.createElement('style');
            style.textContent = `
                #crosshair {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    z-index: 1000;
                    display: none;
                }
                .crosshair-line {
                    position: absolute;
                    background: rgba(0, 255, 136, 0.9);
                    box-shadow: 0 0 4px rgba(0, 255, 136, 0.5);
                }
                .crosshair-top, .crosshair-bottom {
                    width: 2px;
                    height: 12px;
                    left: -1px;
                }
                .crosshair-top { top: -20px; }
                .crosshair-bottom { bottom: -20px; }
                .crosshair-left, .crosshair-right {
                    width: 12px;
                    height: 2px;
                    top: -1px;
                }
                .crosshair-left { left: -20px; }
                .crosshair-right { right: -20px; }
                .crosshair-dot {
                    width: 4px;
                    height: 4px;
                    background: rgba(0, 255, 136, 0.9);
                    border-radius: 50%;
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    box-shadow: 0 0 6px rgba(0, 255, 136, 0.8);
                }
                #hit-marker {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    z-index: 1001;
                    opacity: 0;
                    transition: opacity 0.1s;
                }
                #hit-marker.active {
                    opacity: 1;
                }
                .hit-marker-line {
                    position: absolute;
                    background: #ff4444;
                    box-shadow: 0 0 4px rgba(255, 68, 68, 0.8);
                }
                .hit-marker-line:nth-child(1) { width: 15px; height: 2px; transform: rotate(45deg); top: -1px; left: -7px; }
                .hit-marker-line:nth-child(2) { width: 15px; height: 2px; transform: rotate(-45deg); top: -1px; left: -7px; }
                #fps-counter {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    color: #00ff88;
                    font-family: monospace;
                    font-size: 14px;
                    z-index: 1000;
                    text-shadow: 0 0 4px rgba(0, 255, 136, 0.5);
                }
                #weapon-info {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    color: #fff;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    z-index: 1000;
                    text-align: right;
                    background: rgba(0, 0, 0, 0.5);
                    padding: 10px 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 255, 136, 0.3);
                }
                .damage-number {
                    position: fixed;
                    color: #ff4444;
                    font-weight: bold;
                    font-size: 18px;
                    pointer-events: none;
                    z-index: 1001;
                    text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
                    animation: damageFloat 1s ease-out forwards;
                }
                @keyframes damageFloat {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-40px); }
                }
            `;
            document.head.appendChild(style);
            
            // Create hit marker
            const hitMarker = document.createElement('div');
            hitMarker.id = 'hit-marker';
            hitMarker.innerHTML = `<div class="hit-marker-line"></div><div class="hit-marker-line"></div>`;
            document.body.appendChild(hitMarker);
            
            // Create FPS counter
            const fpsCounter = document.createElement('div');
            fpsCounter.id = 'fps-counter';
            document.body.appendChild(fpsCounter);
            
            // Create weapon info
            const weaponInfo = document.createElement('div');
            weaponInfo.id = 'weapon-info';
            document.body.appendChild(weaponInfo);
        }
    }
    
    showCrosshair(show) {
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.style.display = show ? 'block' : 'none';
        }
    }
    
    showHitMarker() {
        const hitMarker = document.getElementById('hit-marker');
        if (hitMarker) {
            hitMarker.classList.add('active');
            setTimeout(() => hitMarker.classList.remove('active'), 150);
        }
    }
    
    showDamageNumber(damage, x, y, z) {
        if (!CONFIG.SHOW_DAMAGE_NUMBERS) return;
        const vector = new THREE.Vector3(x, y + 2, z);
        vector.project(this.camera);
        const screenX = (vector.x * 0.5 + 0.5) * this.canvas.clientWidth;
        const screenY = (-vector.y * 0.5 + 0.5) * this.canvas.clientHeight;
        
        // Reuse or create damage number element (object pool)
        let damageNum = this.damageNumberPool.pop();
        if (!damageNum) {
            damageNum = document.createElement('div');
            damageNum.className = 'damage-number';
            document.body.appendChild(damageNum);
        }
        
        // Reset and position
        damageNum.textContent = '-' + Math.round(damage);
        damageNum.style.left = screenX + 'px';
        damageNum.style.top = screenY + 'px';
        damageNum.style.animation = 'none';
        damageNum.offsetHeight; // Trigger reflow
        damageNum.style.animation = 'damageFloat 1s ease-out forwards';
        
        // Return to pool after animation
        setTimeout(() => {
            if (this.damageNumberPool.length < this.maxDamageNumbers) {
                this.damageNumberPool.push(damageNum);
            } else {
                damageNum.remove();
            }
        }, 1000);
    }
    
    updateFPS(deltaTime) {
        this.frameCount++;
        this.fpsUpdateTime += deltaTime;
        if (this.fpsUpdateTime >= 0.5) {
            this.currentFps = Math.round(this.frameCount / this.fpsUpdateTime);
            this.frameCount = 0;
            this.fpsUpdateTime = 0;
            const fpsCounter = document.getElementById('fps-counter');
            if (fpsCounter && CONFIG.SHOW_FPS) {
                fpsCounter.textContent = this.currentFps + ' FPS';
            }
        }
    }
    
    updateWeaponInfo() {
        const weaponInfo = document.getElementById('weapon-info');
        if (!weaponInfo) return;
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer) {
            weaponInfo.style.display = 'none';
            return;
        }
        weaponInfo.style.display = 'block';
        const turretConfig = CONFIG.TURRETS[localPlayer.turret];
        if (turretConfig) {
            weaponInfo.innerHTML = `
                <div style="color: #00ff88; font-weight: bold;">${turretConfig.name}</div>
                <div style="font-size: 12px; opacity: 0.8;">${turretConfig.desc}</div>
            `;
        }
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
        document.addEventListener('pointerlockchange', () => {
            this.showCrosshair(document.pointerLockElement === this.canvas);
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
            // When pointer is locked, update turret angle based on mouse movement
            this.turretAngle += e.movementX * this.mouseSensitivity;
            // Keep angle in [-PI, PI] range
            while (this.turretAngle > Math.PI) this.turretAngle -= Math.PI * 2;
            while (this.turretAngle < -Math.PI) this.turretAngle += Math.PI * 2;
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
        this.updateStreamWeapons(deltaTime);
        this.effects.update(deltaTime);
        this.updateHUD();
        this.updateMinimap();
        this.updateFPS(deltaTime);
        this.updateWeaponInfo();
    }
    
    updateStreamWeapons(deltaTime) {
        // Show stream weapon visuals for the local player when shooting
        const localPlayer = this.getLocalPlayer();
        if (!localPlayer || !localPlayer.alive) return;
        
        const turretConfig = CONFIG.TURRETS[localPlayer.turret];
        if (!turretConfig) return;
        
        const isStreamWeapon = turretConfig.type === 'stream' || turretConfig.type === 'beam';
        if (!isStreamWeapon) return;
        
        // Check if player is holding down mouse (shooting)
        if (!this.mouse.down) return;
        
        // Calculate stream start and end positions
        const turretRotation = document.pointerLockElement === this.canvas 
            ? this.turretAngle 
            : (localPlayer.turretRotation || 0);
            
        const startX = localPlayer.x + Math.sin(turretRotation) * 2.5;
        const startY = 1.5;
        const startZ = localPlayer.z + Math.cos(turretRotation) * 2.5;
        
        const range = turretConfig.range || 20;
        const endX = localPlayer.x + Math.sin(turretRotation) * range;
        const endY = 1.5;
        const endZ = localPlayer.z + Math.cos(turretRotation) * range;
        
        // Create stream visual effect with weapon color
        this.effects.createStream(startX, startY, startZ, endX, endY, endZ, turretConfig.color);
        
        // Add extra particles for flamethrower effect
        if (turretConfig.name === 'Firebird') {
            // Fire particles along the stream
            const dist = Math.random() * range * 0.8;
            const particleX = localPlayer.x + Math.sin(turretRotation) * dist + (Math.random() - 0.5) * 2;
            const particleZ = localPlayer.z + Math.cos(turretRotation) * dist + (Math.random() - 0.5) * 2;
            this.effects.createHitSpark(particleX, 1 + Math.random(), particleZ, 0xff4400);
        } else if (turretConfig.name === 'Freeze') {
            // Ice particles along the stream
            const dist = Math.random() * range * 0.8;
            const particleX = localPlayer.x + Math.sin(turretRotation) * dist + (Math.random() - 0.5) * 2;
            const particleZ = localPlayer.z + Math.cos(turretRotation) * dist + (Math.random() - 0.5) * 2;
            this.effects.createHitSpark(particleX, 1 + Math.random(), particleZ, 0x00ccff);
        } else if (turretConfig.name === 'Isida') {
            // Heal particles
            const dist = Math.random() * range * 0.8;
            const particleX = localPlayer.x + Math.sin(turretRotation) * dist + (Math.random() - 0.5) * 1.5;
            const particleZ = localPlayer.z + Math.cos(turretRotation) * dist + (Math.random() - 0.5) * 1.5;
            this.effects.createHitSpark(particleX, 1 + Math.random(), particleZ, 0x00ff00);
        }
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
        
        // When pointer is locked, use tracked turret angle
        if (document.pointerLockElement === this.canvas) {
            return this.turretAngle;
        }
        
        // When not locked, use mouse position to aim
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
        
        // Use the tracked turret angle when pointer is locked, otherwise use player's turret rotation
        const turretAngle = document.pointerLockElement === this.canvas 
            ? this.turretAngle 
            : (localPlayer.turretRotation || 0);
        const cameraDistance = CONFIG.CAMERA_DISTANCE || 14;
        const cameraHeight = CONFIG.CAMERA_HEIGHT || 10;
        const lookAhead = CONFIG.CAMERA_LOOK_AHEAD || 8;
        
        // Camera positioned behind the tank (opposite of where turret is aiming)
        // We SUBTRACT to position the camera behind the turret direction
        const targetX = localPlayer.x - Math.sin(turretAngle) * cameraDistance;
        const targetZ = localPlayer.z - Math.cos(turretAngle) * cameraDistance;
        const targetY = cameraHeight;
        
        // Look-at point is ahead of the tank in the turret direction
        const lookAtX = localPlayer.x + Math.sin(turretAngle) * lookAhead;
        const lookAtZ = localPlayer.z + Math.cos(turretAngle) * lookAhead;
        
        // Frame-rate independent smoothing using exponential decay
        // Formula: 1 - (1 - smoothFactor)^(deltaTime * 60) approximates consistent smoothing
        const smoothFactor = CONFIG.CAMERA_SMOOTHING || 0.18;
        const smoothing = 1 - Math.pow(1 - smoothFactor, deltaTime * 60);
        this.cameraTarget.x += (targetX - this.cameraTarget.x) * smoothing;
        this.cameraTarget.y += (targetY - this.cameraTarget.y) * smoothing;
        this.cameraTarget.z += (targetZ - this.cameraTarget.z) * smoothing;
        
        // Look at point with slightly faster interpolation
        const lookSmoothing = 1 - Math.pow(1 - smoothFactor * 1.3, deltaTime * 60);
        this.cameraLookAt.x += (lookAtX - this.cameraLookAt.x) * lookSmoothing;
        this.cameraLookAt.z += (lookAtZ - this.cameraLookAt.z) * lookSmoothing;
        
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
