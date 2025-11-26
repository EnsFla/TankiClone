// Main Entry Point - Tanki Online Classic
(function() {
    'use strict';
    
    let ui, network, game;
    let currentRoom = null;
    
    function init() {
        console.log('Tanki Online Classic - Initializing...');
        
        // Initialize UI manager
        ui = new UI();
        
        // Initialize network
        network = new Network();
        
        // Initialize game (but don't init the 3D scene yet)
        const canvas = document.getElementById('game-canvas');
        game = new Game(canvas, ui, network);
        // Don't call game.init() yet - will be called when game starts
        
        // Setup UI callbacks
        setupUICallbacks();
        
        // Setup network callbacks
        setupNetworkCallbacks();
        
        // Connect to server
        network.connect();
        
        console.log('Initialization complete!');
    }
    
    function setupUICallbacks() {
        // Play button
        ui.elements.btnPlay.addEventListener('click', () => {
            const name = ui.getPlayerName();
            if (name) {
                network.setName(name);
                ui.showScreen('browser');
                network.getRooms();
            } else {
                alert('Please enter your name!');
            }
        });
        
        // Garage button
        ui.elements.btnGarage.addEventListener('click', () => {
            ui.showScreen('garage');
        });
        
        // Garage back button
        ui.elements.btnGarageBack.addEventListener('click', () => {
            ui.showScreen('mainMenu');
        });
        
        // Browser back button
        ui.elements.btnBrowserBack.addEventListener('click', () => {
            ui.showScreen('mainMenu');
        });
        
        // Create room button
        ui.elements.btnCreateRoom.addEventListener('click', () => {
            const config = ui.getRoomConfig();
            if (config.name) {
                network.createRoom(config);
            } else {
                alert('Please enter a room name!');
            }
        });
        
        // Ready button
        ui.elements.btnReady.addEventListener('click', () => {
            network.selectTank(ui.getTankConfig());
            network.setReady();
            ui.elements.btnReady.disabled = true;
            ui.elements.btnReady.textContent = 'WAITING...';
        });
        
        // Leave room button
        ui.elements.btnLeaveRoom.addEventListener('click', () => {
            network.leaveRoom();
            currentRoom = null;
            ui.showScreen('browser');
            network.getRooms();
            ui.elements.btnReady.disabled = false;
            ui.elements.btnReady.textContent = 'READY';
        });
        
        // Game over continue button
        ui.elements.btnGameoverContinue.addEventListener('click', () => {
            game.stop();
            game.cleanup();
            network.leaveRoom();
            currentRoom = null;
            ui.showScreen('browser');
            network.getRooms();
            ui.elements.btnReady.disabled = false;
            ui.elements.btnReady.textContent = 'READY';
        });
        
        // Join room callback
        ui.on('joinRoom', (roomId) => {
            network.joinRoom(roomId);
        });
        
        // Tank changed callback
        ui.on('tankChanged', (config) => {
            if (currentRoom) {
                network.selectTank(config);
            }
        });
        
        // Enter key in name field
        ui.elements.playerName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                ui.elements.btnPlay.click();
            }
        });
        
        // Enter key in room name field
        ui.elements.roomName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                ui.elements.btnCreateRoom.click();
            }
        });
    }
    
    function setupNetworkCallbacks() {
        // Connected to server
        network.on('connected', () => {
            console.log('Connected to game server');
        });
        
        // Disconnected from server
        network.on('disconnected', () => {
            console.log('Disconnected from server');
            game.stop();
            ui.showScreen('mainMenu');
            alert('Disconnected from server!');
        });
        
        // Room list received
        network.on('roomList', (rooms) => {
            ui.updateRoomList(rooms);
        });
        
        // Room created
        network.on('roomCreated', (room) => {
            network.joinRoom(room.id);
        });
        
        // Joined a room
        network.on('joinedRoom', (room) => {
            currentRoom = room;
            game.setRoomInfo(room);
            game.setLocalPlayerId(network.playerId);
            ui.showScreen('waiting');
            ui.elements.waitingRoomName.textContent = room.name;
        });
        
        // Error joining room
        network.on('joinError', (error) => {
            alert('Could not join room: ' + error);
        });
        
        // Player joined room
        network.on('playerJoined', (player) => {
            console.log('Player joined:', player.name);
        });
        
        // Player left room
        network.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId);
            game.removeTank(playerId);
        });
        
        // Player updated
        network.on('playerUpdated', (data) => {
            console.log('Player updated:', data.id);
        });
        
        // Player ready
        network.on('playerReady', (playerId) => {
            console.log('Player ready:', playerId);
        });
        
        // Initial game state
        network.on('gameState', (state) => {
            ui.updateWaitingRoom(currentRoom, state.players);
            if (game.scene) {
                game.onGameState(state);
            }
        });
        
        // Game started
        network.on('gameStart', (state) => {
            console.log('Game starting!');
            ui.showScreen('game');
            game.init();  // Initialize 3D scene now
            game.loadMap(currentRoom.map);
            game.onGameState(state);
            game.start();
            
            // Set up initial HUD based on game mode
            if (currentRoom.mode === 'dm') {
                ui.updateScores('dm', {});
            } else {
                ui.updateScores(currentRoom.mode, state.scores || { red: 0, blue: 0 });
            }
        });
        
        // Game update (tick)
        network.on('gameUpdate', (state) => {
            game.onGameUpdate(state);
            
            // Detect kills
            if (game.gameState) {
                Object.entries(state.players).forEach(([id, newData]) => {
                    const oldData = game.gameState.players[id];
                    if (oldData && oldData.alive && !newData.alive) {
                        // Find killer
                        let killer = { name: 'Unknown' };
                        Object.values(state.players).forEach(p => {
                            if (p.kills > (game.gameState.players[p.id]?.kills || 0)) {
                                killer = p;
                            }
                        });
                        game.onPlayerKilled(killer, newData);
                    }
                });
            }
        });
        
        // Projectile spawned
        network.on('projectileSpawned', (projectile) => {
            game.onProjectileSpawned(projectile);
        });
        
        // Game over
        network.on('gameOver', (results) => {
            console.log('Game over!', results);
            game.stop();
            ui.showGameover(results);
        });
        
        // Chat message
        network.on('chat', (data) => {
            game.onChatMessage(data);
        });
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
