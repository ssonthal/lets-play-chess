import { useEffect, useState } from "react";
import socket from "../socket";
import { Move } from "../models/Move";

export default function GameRoom() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);

  const createGame = () => {
    socket.emit('create-game', ({ gameId, color }: { gameId: string, color: string }) => {
      setGameId(gameId);
      setColor(color);
      setIsMyTurn(color === 'white');
    });
  };

  const joinGame = (id: string) => {
    socket.emit('join-game', id, ({ success, color }: { success: boolean, color: string }) => {
      if (success) {
        setGameId(id);
        setColor(color);
        setIsMyTurn(color === 'white');
      } else {
        alert('Failed to join game');
      }
    });
  };

  const makeMove = (move: Move) => {
    socket.emit('move', { gameId, move });
    setIsMyTurn(false);
  };

  useEffect(() => {
    socket.on('opponent-move', (move) => {
      // Handle move in your Board class
      console.log("Opponent moved", move);
      setIsMyTurn(true);
    });

    socket.on('start-game', () => {
      console.log('Game started');
    });

    return () => {
      socket.off('opponent-move');
      socket.off('start-game');
    };
  }, []);
  const handleJoinRoom = () => {
    const gameId = prompt("Enter Game ID");
    if (gameId) {
      joinGame(gameId);
    }
  }
  return (
    <div>
      {!gameId && (
        <>
          <button onClick={createGame}>Create Game</button>
          <button onClick={handleJoinRoom}>Join Game</button>
        </>
      )}

      {gameId && <div>Game ID: {gameId} | You are: {color}</div>}
      {/* Pass makeMove to your Chessboard here */}
    </div>
  );
}

