import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import GameRoom from "./components/GameRoom";
import { TeamType } from "./Types";

const socket: Socket = io("http://localhost:3000"); // your backend URL

function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<TeamType | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    // When server assigns player color
    socket.on("game-start", ({ gameId, color }: { gameId: string; color: TeamType }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setIsGameStarted(true);
    });

    return () => {
      socket.off("game-start");
    };
  }, []);

  const handleCreateGame = () => {
    socket.emit("create-game");
  };

  const handleJoinGame = (id: string) => {
    socket.emit("join-game", id);
  };

  if (!isGameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-white">
        <button onClick={handleCreateGame} className="bg-blue-500 px-4 py-2 rounded">Create Game</button>
        <input
          type="text"
          placeholder="Enter Game ID to Join"
          className="text-black px-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJoinGame((e.target as HTMLInputElement).value);
          }}
        />
      </div>
    );
  }

  return (
    <>
      {gameId && playerColor !== null && (
        <GameRoom socket={socket} gameId={gameId} playerColor={playerColor} />
      )}
    </>
  );
}

export default App;
