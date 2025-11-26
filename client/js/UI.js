// UI Manager - Screen and HUD management
class UI {
    constructor() {
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            garage: document.getElementById('garage-screen'),
            browser: document.getElementById('browser-screen'),
            waiting: document.getElementById('waiting-screen'),
            game: document.getElementById('game-screen'),
            gameover: document.getElementById('gameover-screen')
        };
        this.elements = {
            playerName: document.getElementById('player-name'),
            btnPlay: document.getElementById('btn-play'),
            btnGarage: document.getElementById('btn-garage'),
            btnGarageBack: document.getElementById('btn-garage-back'),
            btnBrowserBack: document.getElementById('btn-browser-back'),
            btnCreateRoom: document.getElementById('btn-create-room'),
            btnReady: document.getElementById('btn-ready'),
            btnLeaveRoom: document.getElementById('btn-leave-room'),
            btnGameoverContinue: document.getElementById('btn-gameover-continue'),
            roomName: document.getElementById('room-name'),
            roomMap: document.getElementById('room-map'),
            roomMode: document.getElementById('room-mode'),
            roomPlayers: document.getElementById('room-players'),
            roomList: document.getElementById('room-list'),
            hullList: document.getElementById('hull-list'),
            turretList: document.getElementById('turret-list'),
            waitingRoomName: document.getElementById('waiting-room-name'),
            waitingPlayers: document.getElementById('waiting-players'),
            healthFill: document.getElementById('health-fill'),
            healthText: document.getElementById('health-text'),
            reloadFill: document.getElementById('reload-fill'),
            killsCount: document.getElementById('kills-count'),
            gameTimer: document.getElementById('game-timer'),
            killFeed: document.getElementById('kill-feed'),
            respawnOverlay: document.getElementById('respawn-overlay'),
            respawnTimer: document.getElementById('respawn-timer'),
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            scoreboard: document.getElementById('scoreboard'),
            scoreboardBody: document.getElementById('scoreboard-body'),
            scoreContainer: document.getElementById('score-container'),
            gameoverTitle: document.getElementById('gameover-title'),
            gameoverWinner: document.getElementById('gameover-winner'),
            minimapCanvas: document.getElementById('minimap-canvas')
        };
        this.selectedHull = 'viking';
        this.selectedTurret = 'smoky';
        this.garagePreviewRenderer = null;
        this.garagePreviewScene = null;
        this.garagePreviewTank = null;
        this.minimapCtx = null;
        this.callbacks = {};
        this.init();
    }

    init() {
        this.populateGarage();
        this.setupMinimap();
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }

    showScreen(screenName) {
        Object.keys(this.screens).forEach(name => {
            const screen = this.screens[name];
            if (screen) {
                screen.classList.toggle('active', name === screenName);
            }
        });
    }

    populateGarage() {
        const hullList = this.elements.hullList;
        const turretList = this.elements.turretList;
        if (hullList) {
            hullList.innerHTML = '';
            Object.keys(CONFIG.HULLS).forEach(key => {
                const hull = CONFIG.HULLS[key];
                const item = document.createElement('div');
                item.className = 'item' + (key === this.selectedHull ? ' selected' : '');
                item.dataset.key = key;
                item.innerHTML = `<span class="item-name">${hull.name}</span><span class="item-stats">${hull.desc}</span>`;
                item.onclick = () => this.selectHull(key);
                hullList.appendChild(item);
            });
        }
        if (turretList) {
            turretList.innerHTML = '';
            Object.keys(CONFIG.TURRETS).forEach(key => {
                const turret = CONFIG.TURRETS[key];
                const item = document.createElement('div');
                item.className = 'item' + (key === this.selectedTurret ? ' selected' : '');
                item.dataset.key = key;
                item.innerHTML = `<span class="item-name">${turret.name}</span><span class="item-stats">${turret.desc}</span>`;
                item.onclick = () => this.selectTurret(key);
                turretList.appendChild(item);
            });
        }
        this.initGaragePreview();
    }

    selectHull(key) {
        this.selectedHull = key;
        const items = this.elements.hullList.querySelectorAll('.item');
        items.forEach(item => item.classList.toggle('selected', item.dataset.key === key));
        this.updateGaragePreview();
        this.trigger('tankChanged', { hull: this.selectedHull, turret: this.selectedTurret });
    }

    selectTurret(key) {
        this.selectedTurret = key;
        const items = this.elements.turretList.querySelectorAll('.item');
        items.forEach(item => item.classList.toggle('selected', item.dataset.key === key));
        this.updateGaragePreview();
        this.trigger('tankChanged', { hull: this.selectedHull, turret: this.selectedTurret });
    }

    initGaragePreview() {
        const canvas = document.getElementById('garage-tank-preview');
        if (!canvas || typeof THREE === 'undefined') return;
        try {
        this.garagePreviewScene = new THREE.Scene();
        this.garagePreviewScene.background = new THREE.Color(0x1a1a2e);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.garagePreviewScene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.garagePreviewScene.add(directionalLight);
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(6, 4, 6);
        camera.lookAt(0, 0, 0);
        this.garagePreviewCamera = camera;
        this.garagePreviewRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.garagePreviewRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.updateGaragePreview();
        this.animateGaragePreview();
        } catch (e) {
            console.warn('Could not initialize garage preview:', e);
        }
    }

    updateGaragePreview() {
        if (!this.garagePreviewScene || typeof THREE === 'undefined') return;
        try {
        if (this.garagePreviewTank) {
            this.garagePreviewScene.remove(this.garagePreviewTank);
        }
        const hullConfig = CONFIG.HULLS[this.selectedHull];
        const turretConfig = CONFIG.TURRETS[this.selectedTurret];
        const tankGroup = new THREE.Group();
        const hullGeom = new THREE.BoxGeometry(hullConfig.width, hullConfig.height, hullConfig.length);
        const hullMat = new THREE.MeshLambertMaterial({ color: hullConfig.color });
        const hullBody = new THREE.Mesh(hullGeom, hullMat);
        hullBody.position.y = hullConfig.height / 2;
        tankGroup.add(hullBody);
        const trackGeom = new THREE.BoxGeometry(0.4, hullConfig.height * 0.6, hullConfig.length * 0.95);
        const trackMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const trackLeft = new THREE.Mesh(trackGeom, trackMat);
        trackLeft.position.set(-hullConfig.width / 2 - 0.15, hullConfig.height * 0.3, 0);
        tankGroup.add(trackLeft);
        const trackRight = new THREE.Mesh(trackGeom, trackMat);
        trackRight.position.set(hullConfig.width / 2 + 0.15, hullConfig.height * 0.3, 0);
        tankGroup.add(trackRight);
        const turretBase = new THREE.Mesh(
            new THREE.CylinderGeometry(hullConfig.width * 0.35, hullConfig.width * 0.4, 0.4, 16),
            new THREE.MeshLambertMaterial({ color: hullConfig.color })
        );
        turretBase.position.y = hullConfig.height + 0.2;
        tankGroup.add(turretBase);
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 2.5, 12),
            new THREE.MeshLambertMaterial({ color: turretConfig.color })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, hullConfig.height + 0.4, 1.25);
        tankGroup.add(barrel);
        this.garagePreviewScene.add(tankGroup);
        this.garagePreviewTank = tankGroup;
        } catch (e) {
            console.warn('Could not update garage preview:', e);
        }
    }

    animateGaragePreview() {
        if (!this.garagePreviewRenderer) return;
        requestAnimationFrame(() => this.animateGaragePreview());
        if (this.garagePreviewTank) {
            this.garagePreviewTank.rotation.y += 0.01;
        }
        this.garagePreviewRenderer.render(this.garagePreviewScene, this.garagePreviewCamera);
    }

    updateRoomList(rooms) {
        const list = this.elements.roomList;
        if (!list) return;
        list.innerHTML = '';
        if (!rooms || rooms.length === 0) {
            list.innerHTML = '<div class="no-rooms">No rooms available. Create one!</div>';
            return;
        }
        rooms.forEach(room => {
            const item = document.createElement('div');
            item.className = 'room-item';
            const modeNames = { dm: 'Deathmatch', tdm: 'Team DM', ctf: 'CTF' };
            const mapNames = { sandbox: 'Sandbox', silence: 'Silence', kungur: 'Kungur' };
            item.innerHTML = `
                <div class="room-info">
                    <div class="room-name">${this.escapeHtml(room.name)}</div>
                    <div class="room-details">${mapNames[room.map] || room.map} - ${modeNames[room.mode] || room.mode}</div>
                </div>
                <div class="room-players">${room.players}/${room.maxPlayers}</div>
            `;
            item.onclick = () => this.trigger('joinRoom', room.id);
            list.appendChild(item);
        });
    }

    updateWaitingRoom(room, players) {
        if (this.elements.waitingRoomName) {
            this.elements.waitingRoomName.textContent = room.name || 'Battle Room';
        }
        const container = this.elements.waitingPlayers;
        if (!container) return;
        container.innerHTML = '';
        if (!players) return;
        Object.values(players).forEach(player => {
            const div = document.createElement('div');
            div.className = 'waiting-player';
            if (player.ready) div.classList.add('ready');
            if (player.team !== 'none') div.classList.add(player.team);
            div.textContent = player.name || 'Tank';
            container.appendChild(div);
        });
    }

    setupMinimap() {
        const canvas = this.elements.minimapCanvas;
        if (canvas) {
            this.minimapCtx = canvas.getContext('2d');
            canvas.width = 180;
            canvas.height = 180;
        }
    }

    updateMinimap(players, localPlayerId, mapConfig, flags) {
        const ctx = this.minimapCtx;
        if (!ctx || !mapConfig) return;
        const canvas = this.elements.minimapCanvas;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const scaleX = canvas.width / mapConfig.width;
        const scaleY = canvas.height / mapConfig.height;
        const offsetX = canvas.width / 2;
        const offsetY = canvas.height / 2;
        if (flags) {
            ['red', 'blue'].forEach(team => {
                if (flags[team] && !flags[team].carrier) {
                    const fx = flags[team].x * scaleX + offsetX;
                    const fy = -flags[team].z * scaleY + offsetY;
                    ctx.fillStyle = team === 'red' ? '#ff4444' : '#4444ff';
                    ctx.beginPath();
                    ctx.moveTo(fx, fy - 8);
                    ctx.lineTo(fx + 6, fy);
                    ctx.lineTo(fx, fy + 2);
                    ctx.closePath();
                    ctx.fill();
                }
            });
        }
        if (players) {
            Object.values(players).forEach(player => {
                if (!player.alive) return;
                const px = player.x * scaleX + offsetX;
                const py = -player.z * scaleY + offsetY;
                if (player.id === localPlayerId) {
                    ctx.fillStyle = '#00ff88';
                } else if (player.team === 'red') {
                    ctx.fillStyle = '#ff4444';
                } else if (player.team === 'blue') {
                    ctx.fillStyle = '#4444ff';
                } else {
                    ctx.fillStyle = '#ffff00';
                }
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + Math.sin(player.rotation) * 8, py - Math.cos(player.rotation) * 8);
                ctx.stroke();
            });
        }
    }

    updateHealth(hp, maxHp) {
        const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
        if (this.elements.healthFill) {
            this.elements.healthFill.style.width = percent + '%';
            if (percent < 25) {
                this.elements.healthFill.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
            } else if (percent < 50) {
                this.elements.healthFill.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
            } else {
                this.elements.healthFill.style.background = 'linear-gradient(90deg, #00ff88, #00cc6a)';
            }
        }
        if (this.elements.healthText) {
            this.elements.healthText.textContent = Math.round(hp) + '/' + maxHp;
        }
    }

    updateReload(percent) {
        if (this.elements.reloadFill) {
            this.elements.reloadFill.style.width = Math.min(100, percent) + '%';
        }
    }

    updateKills(kills) {
        if (this.elements.killsCount) {
            this.elements.killsCount.textContent = kills;
        }
    }

    updateTimer(timeRemaining) {
        if (this.elements.gameTimer) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = Math.floor(timeRemaining % 60);
            this.elements.gameTimer.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }

    updateScores(mode, scores) {
        if (!this.elements.scoreContainer) return;
        if (mode === 'dm') {
            this.elements.scoreContainer.innerHTML = '<span>Kills: <span id="kills-count">0</span></span>';
            this.elements.killsCount = document.getElementById('kills-count');
        } else {
            this.elements.scoreContainer.innerHTML = `
                <span class="red-score">Red: ${scores.red || 0}</span>
                <span class="blue-score">Blue: ${scores.blue || 0}</span>
            `;
        }
    }

    addKillMessage(killer, victim) {
        if (!this.elements.killFeed) return;
        const msg = document.createElement('div');
        msg.className = 'kill-message';
        msg.innerHTML = `<span style="color:#00ff88">${this.escapeHtml(killer)}</span> eliminated <span style="color:#ff4444">${this.escapeHtml(victim)}</span>`;
        this.elements.killFeed.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
    }

    showRespawn(seconds) {
        if (this.elements.respawnOverlay) {
            this.elements.respawnOverlay.style.display = 'block';
        }
        if (this.elements.respawnTimer) {
            this.elements.respawnTimer.textContent = Math.ceil(seconds);
        }
    }

    hideRespawn() {
        if (this.elements.respawnOverlay) {
            this.elements.respawnOverlay.style.display = 'none';
        }
    }

    addChatMessage(playerName, message) {
        if (!this.elements.chatMessages) return;
        const msg = document.createElement('div');
        msg.className = 'chat-message';
        msg.innerHTML = `<span class="player-name">${this.escapeHtml(playerName)}:</span> ${this.escapeHtml(message)}`;
        this.elements.chatMessages.appendChild(msg);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    showChatInput() {
        if (this.elements.chatInput) {
            this.elements.chatInput.style.display = 'block';
            this.elements.chatInput.focus();
        }
    }

    hideChatInput() {
        if (this.elements.chatInput) {
            this.elements.chatInput.style.display = 'none';
            this.elements.chatInput.value = '';
        }
    }

    showScoreboard(players) {
        if (!this.elements.scoreboard || !this.elements.scoreboardBody) return;
        this.elements.scoreboard.style.display = 'block';
        this.elements.scoreboardBody.innerHTML = '';
        const sorted = Object.values(players).sort((a, b) => b.kills - a.kills);
        sorted.forEach(player => {
            const row = document.createElement('tr');
            if (player.team !== 'none') row.className = player.team;
            row.innerHTML = `<td>${this.escapeHtml(player.name)}</td><td>${player.kills}</td><td>${player.deaths}</td>`;
            this.elements.scoreboardBody.appendChild(row);
        });
    }

    hideScoreboard() {
        if (this.elements.scoreboard) {
            this.elements.scoreboard.style.display = 'none';
        }
    }

    showGameover(results) {
        this.showScreen('gameover');
        if (this.elements.gameoverWinner) {
            this.elements.gameoverWinner.textContent = 'Winner: ' + results.winner;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPlayerName() {
        return this.elements.playerName ? this.elements.playerName.value.trim() : '';
    }

    getRoomConfig() {
        return {
            name: this.elements.roomName ? this.elements.roomName.value.trim() : 'Battle Room',
            map: this.elements.roomMap ? this.elements.roomMap.value : 'sandbox',
            mode: this.elements.roomMode ? this.elements.roomMode.value : 'dm',
            maxPlayers: this.elements.roomPlayers ? parseInt(this.elements.roomPlayers.value) : 8
        };
    }

    getTankConfig() {
        return {
            hull: this.selectedHull,
            turret: this.selectedTurret
        };
    }
}

window.UI = UI;
