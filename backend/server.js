const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React frontend
    methods: ["GET", "POST"]
  }
});

const games = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-game', (callback) => {
    const gameId = Math.random().toString(36).substr(2, 6);
    socket.join(gameId);
    games[gameId] = { players: [socket.id] };
    callback({ gameId, color: 'white' });
  });

  socket.on('join-game', (gameId, callback) => {
    const game = games[gameId];
    if (game && game.players.length === 1) {
      socket.join(gameId);
      game.players.push(socket.id);
      callback({ success: true, color: 'black' });
      io.to(gameId).emit('start-game');
    } else {
      callback({ success: false, message: 'Invalid or full game' });
    }
  });

  socket.on('move', ({ gameId, move }) => {
    socket.to(gameId).emit('opponent-move', move);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(4000, () => {
  console.log('Socket.IO server running on port 4000');
});

