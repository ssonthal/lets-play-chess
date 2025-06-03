// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all clients for dev
  },
});

const PORT = 3000;

// In-memory game store
const games = {}; // gameId => { white: socket.id, black: socket.id }

io.on("connection", (socket) => {
  console.log(`⚡ New connection: ${socket.id}`);

  socket.on("create-game", () => {
    const gameId = uuidv4();
    games[gameId] = { white: socket.id, black: null };
    socket.join(gameId);
    console.log(`🎯 Game created: ${gameId}`);
    socket.emit("game-start", { gameId, color: "w" });
  });

  socket.on("join-game", (gameId) => {
    const game = games[gameId];

    if (!game) {
      socket.emit("error", "Game ID not found.");
      return;
    }

    if (game.black) {
      socket.emit("error", "Game already has two players.");
      return;
    }

    game.black = socket.id;
    socket.join(gameId);
    console.log(`🎯 Player joined game: ${gameId}`);

    // Notify joining player
    socket.emit("game-start", { gameId, color: "b" });

    // Notify creator that black joined (optional)
    io.to(game.white).emit("player-joined", { message: "Black joined" });
  });

  socket.on("move", ({ gameId, move }) => {
    const game = games[gameId];
    if (!game) return;

    const opponentId = socket.id === game.white ? game.black : game.white;
    if (opponentId) {
      io.to(opponentId).emit("opponent-move", move);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔥 Disconnected: ${socket.id}`);

    // Clean up
    for (const gameId in games) {
      const game = games[gameId];
      if (game.white === socket.id || game.black === socket.id) {
        io.to(gameId).emit("opponent-disconnected");
        delete games[gameId];
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
