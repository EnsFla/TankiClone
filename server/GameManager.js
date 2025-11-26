const GameRoom = require('./GameRoom');

class GameManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map();
        this.playerRooms = new Map();
    }
    
    createRoom(options) {
        const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const room = new GameRoom({
            id: roomId,
            name: options.name || 'Battle Room',
            map: options.map || 'sandbox',
            mode: options.mode || 'dm',
            maxPlayers: options.maxPlayers || 8,
            timeLimit: options.timeLimit || 10,
            scoreLimit: options.scoreLimit || 20
        });
        
        this.rooms.set(roomId, room);
        console.log(`Room created: ${roomId} - ${options.name}`);
        return room;
    }
    
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    
    getRoomList() {
        const list = [];
        this.rooms.forEach((room, id) => {
            list.push({
                id: id,
                name: room.name,
                map: room.map,
                mode: room.mode,
                players: room.getPlayerCount(),
                maxPlayers: room.maxPlayers,
                isActive: room.isActive
            });
        });
        return list;
    }
    
    joinRoom(roomId, socket) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.getPlayerCount() >= room.maxPlayers) {
            return { success: false, error: 'Room is full' };
        }
        
        const player = room.addPlayer(socket.id, socket.playerName || 'Tank' + Math.floor(Math.random() * 1000));
        this.playerRooms.set(socket.id, roomId);
        
        return { success: true, room: room, player: player };
    }
    
    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.removePlayer(playerId);
            this.playerRooms.delete(playerId);
            
            if (room.getPlayerCount() === 0) {
                this.rooms.delete(roomId);
                console.log(`Room deleted: ${roomId}`);
            }
        }
    }
    
    updatePlayerTank(roomId, playerId, config) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.updatePlayerTank(playerId, config);
        }
    }
    
    handleInput(roomId, playerId, input) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.handleInput(playerId, input);
        }
    }
    
    handleShoot(roomId, playerId, data) {
        const room = this.rooms.get(roomId);
        if (room) {
            return room.handleShoot(playerId, data);
        }
        return null;
    }
    
    update(deltaTime) {
        this.rooms.forEach((room) => {
            if (room.isActive) {
                room.update(deltaTime);
            }
        });
    }
}

module.exports = GameManager;