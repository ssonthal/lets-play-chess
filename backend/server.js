// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const {createNewGame, getGame, updateGame, checkUser, addUser, getSessionForUser, addMoves, updateSession} = require("./redisClient");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all clients for dev
  },
});

const PORT = 3000;

function toAlgebraic(pos) {
  const file = String.fromCharCode('a'.charCodeAt(0) + pos.x);
  const rank = (pos.y + 1).toString();
  return `${file}${rank}`;
}

io.on("connection", (socket) => {
  console.log(`⚡ New connection: ${socket.id}`);


  socket.on("create-game", async ({userId, gameId, color, time}) => {
    const game = await getGame(gameId);
    if (Object.keys(game).length !== 0) {
      socket.emit("error", "Game ID already exists.");
      return;
    }
    if(color === 'w') {
      await createNewGame({gameId: gameId, white: userId, time: time.toString(), whiteTime: time.toString(), blackTime: time.toString()});
      
    } else {
      await createNewGame({gameId: gameId, black: userId, time: time.toString(), whitetime : time.toString(), blackTime: time.toString()});
    }
    socket.join(gameId);
    await addUser(userId, gameId, socket.id);
    console.log(`🎯 Game created: ${gameId}`);
  });

  socket.on("join-game", async ({ userId, gameId }) => {
    const existingGame = await getGame(gameId);
  
    if (!existingGame || Object.keys(existingGame).length === 0) {
      socket.emit("error", "Game ID not found.");
      return;
    }
  
    if (existingGame.white === userId || existingGame.black === userId) {
      socket.emit("error", "You are already in this game.");
      return;
    }
  
    if (existingGame.white && existingGame.black) {
      socket.emit("error", "Game already has two players.");
      return;
    }
    const currentGame = { ...existingGame };
    let userColor = 'w';
  
    if (!currentGame.white) {
      currentGame.white = userId;
      userColor = 'w';
    } else {
      currentGame.black = userId;
      userColor = 'b';
    }

    socket.join(gameId);
    console.log(`🎯 Player ${userId} joined game: ${gameId} as ${userColor}`);
  
    // Save updated game and player mapping
    await updateGame(currentGame);
    await addUser(userId, gameId, socket.id);
  
    socket.emit("game-created", {
      gameId,
      color: userColor,
      time: currentGame.time,
    });
  
    const opponentUserId = userColor === 'w' ? currentGame.black : currentGame.white;
    if (opponentUserId) {
      const {socketId: opponentSocketId} = await getSessionForUser(opponentUserId);
      if (opponentSocketId) {
        io.to(opponentSocketId).emit("game-created", {
          gameId,
          color: userColor === 'w' ? 'b' : 'w',
          time: currentGame.time,
        });
      }
    }
  });
  
  socket.on("move", async ({ userId, gameId, move, whiteTime, blackTime, currentTurn, isDraw, isStalemate, winningTeam}) => {
    const validUser = await checkUser(userId, gameId);
    
    if(!validUser) {
      socket.emit("error", "You are not authorized to update this game.");
      return;
    }
    const  existingGame = await getGame(gameId);
    
    const moves = existingGame.moves ? JSON.parse(existingGame.moves) : [];
    if(move.promotionType && move.promotionType.length > 0) {
      moves.push(`${toAlgebraic(move.from)}${toAlgebraic(move.to)}${move.promotionType}`);
    }else {
      moves.push(`${toAlgebraic(move.from)}${toAlgebraic(move.to)}`);
    }
    
    const game = {...existingGame};
    game.moves = JSON.stringify(moves);
    game.whiteTime = whiteTime.toString();
    game.blackTime = blackTime.toString();
    game.currentTurn = currentTurn;
    game.isDraw = isDraw.toString();
    game.isStalemate = isStalemate.toString();
    game.lastMoveAt = Date.now().toString();

    if(winningTeam != null) {
      game.winningTeam = winningTeam;
    }
    await updateGame(game);
    
    if(userId === game.white) {
      const {socketId: opponentSocketId} = await getSessionForUser(game.black);
      if(opponentSocketId) {
        io.to(opponentSocketId).emit("opponent-move", move);
      }
    } else if(userId === game.black) {
      const {socketId: opponentSocketId} = await getSessionForUser(game.white);
      if(opponentSocketId) {
        io.to(opponentSocketId).emit("opponent-move", move);
      }
    }
  });

  socket.on("game-over", async ({userId, gameId}) => {
    const validUser = await checkUser(userId, gameId);
    if(!validUser) {
      socket.emit("error", "You are not authorized to update this game.");
    }
    const {white, black} = await getGame(gameId);
    const {socketId: opponentSocketId} = userId === white ? await getSessionForUser(black) : await getSessionForUser(white);
    if(opponentSocketId) {
      io.to(opponentSocketId).emit("game-ended");
    }
  });

  socket.on("opponent-resigned", async({userId, gameId}) => {
    const validUser = await checkUser(userId, gameId);
    if(!validUser) {
      socket.emit("error", "You are not authorized to update this game.");
    }
    const {white, black} = await getGame(gameId);
    const {socketId: opponentSocketId} = userId === white ? await getSessionForUser(black) : await getSessionForUser(white);
    if(opponentSocketId) {
      io.to(opponentSocketId).emit("opponent-resigned");
    }
  });

  socket.on("check-for-existing-game", async ({ userId: userId, gameId: gameId}) => {
    const isValid = await checkUser(userId, gameId);
    if(isValid) {
      const game = await getGame(gameId);
      if(Object.keys(game).length > 0) {
        socket.join(gameId);
        await updateSession(userId, socket.id);
        const now = Date.now();
        const elapsedMs = now - parseInt(game.lastMoveAt || now.toString(), 10);
        const elapsedSec = Math.floor(elapsedMs / 1000);
        if (game.currentTurn === 'w') {
          game.whiteTime = Math.max(0, parseInt(game.whiteTime) - elapsedSec);
        } else {
          game.blackTime = Math.max(0, parseInt(game.blackTime) - elapsedSec);
        }
        socket.emit("game-exists", game);
      }
    }
  });

  socket.on("draw-offer-created", async ({ userId: userId, gameId: gameId}) => {
    const validUser = await checkUser(userId, gameId);
    if(!validUser) {
      socket.emit("error", "You are not authorized to update this game.");
    }
    const {white, black} = await getGame(gameId);
    const {socketId: opponentSocketId} = userId === white ? await getSessionForUser(black) : await getSessionForUser(white);
    if(opponentSocketId) {
      io.to(opponentSocketId).emit("opponent-offer-draw");
    }
  })
  socket.on("draw-offer-accepted", async ({ userId: userId, gameId: gameId}) => {
    const validUser = await checkUser(userId, gameId);
    if(!validUser) {
      socket.emit("error", "You are not authorized to update this game.");
    }
    const {white, black} = await getGame(gameId);
    const {socketId: opponentSocketId} = userId === white ? await getSessionForUser(black) : await getSessionForUser(white);
    if(opponentSocketId) {
      io.to(opponentSocketId).emit("draw-offer-accepted");
    }
  })
  socket.on("draw-offer-rejected", async ({ userId: userId, gameId: gameId}) => {
    const validUser = await checkUser(userId, gameId);
    if(!validUser) {
      socket.emit("error", "You are not authorized to update this game.");
    }
    const {white, black} = await getGame(gameId);
    const {socketId: opponentSocketId} = userId === white ? await getSessionForUser(black) : await getSessionForUser(white);
    if(opponentSocketId) {
      io.to(opponentSocketId).emit("draw-offer-rejected");
    }
  })

});
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
