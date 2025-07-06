const  { createClient } = require('redis');

async function getRedisClient() {
    const client = createClient({
        url: process.env.REDIS_URL || 'redis://0.0.0.0:6379'
      });

    client.on('error', err => console.log('[Redis] Client Error:', err));

    await client.connect();
    return client;
}

async function closeRedisClient(client) {
    await client.disconnect();
}

async function createNewGame(game) {
    const client = await getRedisClient();
    const gameId = game.gameId;
    await client.hSet(`games:${gameId}`, {gameId: gameId, createdAt : Date.now().toString()});
    if(game.white) {
        await client.hSet(`games:${gameId}`, {white: game.white, createdAt : Date.now().toString(), updatedAt : Date.now().toString(), whiteTime: game.time, blackTime: game.time});
    } else if(game.black) {
        await client.hSet(`games:${gameId}`, {black: game.black, createdAt : Date.now().toString(), updatedAt : Date.now().toString(), whiteTime: game.time, blackTime: game.time});
    }
    await closeRedisClient(client);
}

async function getGame(gameId) {
    const client = await getRedisClient();
    const game = await client.hGetAll(`games:${gameId}`);
    await closeRedisClient(client);
    return game;
}

async function addMoves(gameId, moves) {
    const client = await getRedisClient();
    await client.hSet(`games:${gameId}`, {
        moves: JSON.stringify(moves)
    });
    await closeRedisClient(client);
}

async function updateGame(game) {
    const client = await getRedisClient();
    game.updatedAt = Date.now().toString();
    await client.hSet(`games:${game.gameId}`, game);

    const {isDraw, isStatemate, winningTeam} = game;
    if (isDraw || isStatemate || winningTeam) {
        await client.expire(`games:${game.gameId}`, 24 * 60 * 60);
    }
    await closeRedisClient(client);
}

async function addUser(userId, gameId, socketId) {
    const client = await getRedisClient();
    
    await client.hSet(`users:${userId}`, {gameId: gameId, socketId: socketId});
    await client.expire(`users:${userId}`, 24 * 60 * 60 * 7);

    await closeRedisClient(client);
}

async function checkUser(userId, gameId) {
    const client = await getRedisClient();

    let userExists = false;
    const {gameId: existingGameId} = await client.hGetAll(`users:${userId}`);

    if (existingGameId == gameId) {
        userExists = true;
    } else {
        console.log(`[Redis] User ${userId} does NOT have game ${gameId}`);
    }

    await closeRedisClient(client);
    return userExists;
}

async function getSessionForUser(userId) {
    const client = await getRedisClient();
    const session = await client.hGetAll(`users:${userId}`);
    await closeRedisClient(client);
    return session;
}

async function updateSession(userId, socketId) {
    const client = await getRedisClient();
    await client.hSet(`users:${userId}`, {socketId: socketId});
    await closeRedisClient(client);
}

module.exports = {
    createNewGame,
    getGame,
    updateGame,
    addUser,
    checkUser,
    getSessionForUser,
    addMoves,
    updateSession
};