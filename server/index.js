const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const GameManager = require('./GameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Game manager instance
const gameManager = new GameManager(io);

// Socket connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Player joins with name
    socket.on('setName', (name) => {
        socket.playerName = name || 'Tank' + Math.floor(Math.random() * 1000);
        socket.emit('nameSet', socket.playerName);
        console.log(`Player ${socket.id} set name to: ${socket.playerName}`);
    });
    
    // Get list of game rooms
    socket.on('getRooms', () => {
        socket.emit('roomList', gameManager.getRoomList());
    });
    
    // Create a new game room
    socket.on('createRoom', (options) => {
        const room = gameManager.createRoom(options);
        if (room) {
            socket.emit('roomCreated', room.getInfo());
            io.emit('roomList', gameManager.getRoomList());
        }
    });
    
    // Join a game room
    socket.on('joinRoom', (roomId) => {
        const result = gameManager.joinRoom(roomId, socket);
        if (result.success) {
            socket.roomId = roomId;
            socket.join(roomId);
            socket.emit('joinedRoom', result.room.getInfo());
            io.to(roomId).emit('playerJoined', result.player);
            io.to(roomId).emit('gameState', result.room.getState());
            io.emit('roomList', gameManager.getRoomList());
        } else {
            socket.emit('joinError', result.error);
        }
    });
    
    // Leave current room
    socket.on('leaveRoom', () => {
        if (socket.roomId) {
            gameManager.leaveRoom(socket.roomId, socket.id);
            socket.leave(socket.roomId);
            io.to(socket.roomId).emit('playerLeft', socket.id);
            io.emit('roomList', gameManager.getRoomList());
            socket.roomId = null;
        }
    });
    
    // Player selects tank configuration
    socket.on('selectTank', (config) => {
        if (socket.roomId) {
            gameManager.updatePlayerTank(socket.roomId, socket.id, config);
            io.to(socket.roomId).emit('playerUpdated', {
                id: socket.id,
                config: config
            });
        }
    });
    
    // Player ready to start
    socket.on('playerReady', () => {
        if (socket.roomId) {
            const room = gameManager.getRoom(socket.roomId);
            if (room) {
                room.setPlayerReady(socket.id, true);
                io.to(socket.roomId).emit('playerReady', socket.id);
                
                // Check if all players are ready
                if (room.allPlayersReady()) {
                    room.startGame();
                    io.to(socket.roomId).emit('gameStart', room.getState());
                }
            }
        }
    });
    
    // Player input (movement, aiming, shooting)
    socket.on('input', (input) => {
        if (socket.roomId) {
            gameManager.handleInput(socket.roomId, socket.id, input);
        }
    });
    
    // Player shoots
    socket.on('shoot', (data) => {
        if (socket.roomId) {
            const projectile = gameManager.handleShoot(socket.roomId, socket.id, data);
            if (projectile) {
                io.to(socket.roomId).emit('projectileSpawned', projectile);
            }
        }
    });
    
    // Chat message
    socket.on('chat', (message) => {
        if (socket.roomId && socket.playerName) {
            io.to(socket.roomId).emit('chat', {
                player: socket.playerName,
                message: message,
                timestamp: Date.now()
            });
        }
    });
    
    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        if (socket.roomId) {
            gameManager.leaveRoom(socket.roomId, socket.id);
            io.to(socket.roomId).emit('playerLeft', socket.id);
            io.emit('roomList', gameManager.getRoomList());
        }
    });
});

// Game loop - 60 FPS server tick
const TICK_RATE = 1000 / 60;
setInterval(() => {
    gameManager.update(TICK_RATE / 1000);
    
    // Send game state to all rooms
    gameManager.rooms.forEach((room, roomId) => {
        if (room.isActive) {
            const state = room.getState();
            io.to(roomId).emit('gameUpdate', state);
            
            // Check for game end
            if (room.isGameOver()) {
                io.to(roomId).emit('gameOver', room.getResults());
                room.reset();
            }
        }
    });
}, TICK_RATE);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     TANKI ONLINE CLASSIC - SERVER          ║
╠════════════════════════════════════════════╣
║  Server running on port ${PORT}               ║
║  Open http://localhost:${PORT} to play        ║
║                                            ║
║  Share your IP with friends to play        ║
║  together over LAN!                        ║
╚════════════════════════════════════════════╝
    `);
});
