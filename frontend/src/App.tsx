import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import GameRoom from "./components/GameRoom";
import { TeamType } from "./Types";


function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<TeamType | null>(null);
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // When server assigns player color
    socket.on("game-created", ({ gameId, color }: { gameId: string; color: string }) => {
      setGameId(gameId);
      setPlayerColor(color === "w" ? TeamType.WHITE : TeamType.BLACK);
      setIsGameCreated(true);
    });

    socket.on("game-started", () => {
      setIsGameStarted(true);
    });

    return () => {
      socket.off("game-created");
    };
  }, [socket]);

  const handleCreateGame = () => {
    if (!socket) return;
    socket.emit("create-game");
  };

  const handleJoinGame = (id: string) => {
    if (!socket) return;
    socket.emit("join-game", id);
  };

  if (!isGameCreated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-white bg-[#202020]">
        <button onClick={handleCreateGame} className="bg-blue-500 px-4 py-2 rounded">Create Game</button>
        <input
          type="text"
          placeholder="Enter Game ID to Join"
          className="border border-gray-300 px-4 py-2 rounded"
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
        <div className="grid place-items-center bg-[#202020] h-screen">
          <GameRoom socket={socket!} gameId={gameId} playerColor={playerColor} gameStarted={isGameStarted} />
        </div>
      )}
    </>

  );
}

export default App;
