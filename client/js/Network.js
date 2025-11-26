// Network Manager - Socket.io client
class Network {
    constructor() {
        this.socket = null;
        this.playerId = null;
        this.playerName = '';
        this.connected = false;
        this.currentRoom = null;
        this.callbacks = {};
    }

    connect() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            this.connected = true;
            this.playerId = this.socket.id;
            console.log('Connected to server:', this.playerId);
            this.trigger('connected');
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('Disconnected from server');
            this.trigger('disconnected');
        });

        this.socket.on('nameSet', (name) => {
            this.playerName = name;
            this.trigger('nameSet', name);
        });

        this.socket.on('roomList', (rooms) => {
            this.trigger('roomList', rooms);
        });

        this.socket.on('roomCreated', (room) => {
            this.trigger('roomCreated', room);
        });

        this.socket.on('joinedRoom', (room) => {
            this.currentRoom = room;
            this.trigger('joinedRoom', room);
        });

        this.socket.on('joinError', (error) => {
            this.trigger('joinError', error);
        });

        this.socket.on('playerJoined', (player) => {
            this.trigger('playerJoined', player);
        });

        this.socket.on('playerLeft', (playerId) => {
            this.trigger('playerLeft', playerId);
        });

        this.socket.on('playerUpdated', (data) => {
            this.trigger('playerUpdated', data);
        });

        this.socket.on('playerReady', (playerId) => {
            this.trigger('playerReady', playerId);
        });

        this.socket.on('gameState', (state) => {
            this.trigger('gameState', state);
        });

        this.socket.on('gameStart', (state) => {
            this.trigger('gameStart', state);
        });

        this.socket.on('gameUpdate', (state) => {
            this.trigger('gameUpdate', state);
        });

        this.socket.on('projectileSpawned', (projectile) => {
            this.trigger('projectileSpawned', projectile);
        });

        this.socket.on('gameOver', (results) => {
            this.trigger('gameOver', results);
        });

        this.socket.on('chat', (message) => {
            this.trigger('chat', message);
        });
    }

    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(data));
        }
    }

    setName(name) {
        this.socket.emit('setName', name);
    }

    getRooms() {
        this.socket.emit('getRooms');
    }

    createRoom(options) {
        this.socket.emit('createRoom', options);
    }

    joinRoom(roomId) {
        this.socket.emit('joinRoom', roomId);
    }

    leaveRoom() {
        this.socket.emit('leaveRoom');
        this.currentRoom = null;
    }

    selectTank(config) {
        this.socket.emit('selectTank', config);
    }

    setReady() {
        this.socket.emit('playerReady');
    }

    sendInput(input) {
        this.socket.emit('input', input);
    }

    shoot(data) {
        this.socket.emit('shoot', data || {});
    }

    sendChat(message) {
        this.socket.emit('chat', message);
    }
}

window.Network = Network;
