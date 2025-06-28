import { Socket } from "socket.io-client";
import { TeamType } from "../Types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import GameRoom from "./GameRoom";
import AIGameRoom from "./AIGameRoom";

export default function GameManager({ socket }: { socket: Socket }) {
    const navigate = useNavigate();
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const [playerColor, setPlayerColor] = useState<TeamType | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [vsAi, setVsAi] = useState<boolean>(false);
    useEffect(() => {
        const color: TeamType =
            location?.state?.playerColor === "w"
                ? TeamType.WHITE
                : TeamType.BLACK;

        setPlayerColor(color);
        const isAi: boolean = location?.state?.ai;
        if (isAi) {
            setVsAi(true);
            setGameStarted(true);
        }
    }, [gameId, location]);

    useEffect(() => {
        socket.on("game-ended", () => {
            setGameStarted(false);
            setPlayerColor(null);
            navigate("/");
        });
        socket.on("game-started", () => {
            setGameStarted(true);
        })
        socket.emit("black-ready", gameId);
        return () => {
            socket.off("game-started");
            socket.off("game-ended");
        };
    }, []);

    if (!gameId || !playerColor) {
        // Could show a loading spinner here
        return <div>Connecting to server...</div>;
    }
    if (vsAi) {
        return (
            <>
                <AIGameRoom playerColor={playerColor} gameStarted={gameStarted} />
            </>
        )
    }
    return (
        <>
            <GameRoom socket={socket} playerColor={playerColor} gameStarted={gameStarted} gameId={gameId} />
        </>
    );
}