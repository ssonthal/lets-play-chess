import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

export default function Landing({ socket }: { socket: Socket }) {
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("game-created", ({ gameId, color }) => {
            navigate(`/game/${gameId}`, {
                state: {
                    playerColor: color
                },
            });
        });

        return () => {
            socket.off("game-created");
        };
    }, []);

    const handleCreateGame = () => {
        socket.emit("create-game");
    };

    const handleJoinGame = (id: string) => {
        socket.emit("join-game", id);
    };

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
