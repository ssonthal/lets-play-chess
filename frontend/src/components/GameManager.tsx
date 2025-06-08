import { Socket } from "socket.io-client";
import GameRoom from "./GameRoom";
import { TeamType } from "../Types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function GameManager({ socket }: { socket: Socket }) {

    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const [playerColor, setPlayerColor] = useState<TeamType | null>(null);
    const [currentGameId, setGameId] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    useEffect(() => {
        setGameId(gameId ?? null);
        const color: TeamType =
            location?.state?.playerColor === "w"
                ? TeamType.WHITE
                : TeamType.BLACK;

        setPlayerColor(color);
    }, [gameId, location]);

    useEffect(() => {
        socket.onAny((event, ...args) => {
            console.log("Received event:", event, args);
        });
        socket.on("game-started", () => {
            setGameStarted(true);
        })
        socket.emit("black-ready", gameId);
        return () => {
            socket.off("game-started");
        };
    }, []);

    if (!currentGameId || !playerColor) {
        // Could show a loading spinner here
        return <div>Connecting to server...</div>;
    }
    return (
        <>
            <div className="grid place-items-center bg-[#202020] h-screen">
                <GameRoom socket={socket} playerColor={playerColor} gameStarted={gameStarted} gameId={currentGameId} />
            </div>
        </>
    );
}