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
    const [gameTime, setGametime] = useState<number>(300);
    const [level, setGameLevel] = useState<number>(1);
    const [gameStarted, setGameStarted] = useState<boolean>(true);
    const [vsAi, setVsAi] = useState<boolean>(false);
    useEffect(() => {
        const color: TeamType =
            location?.state?.playerColor === "w"
                ? TeamType.WHITE
                : TeamType.BLACK;

        setPlayerColor(color);
        const isAi: boolean = location?.state?.ai;
        const time: number = location?.state?.time;
        const level: number = location?.state?.level;

        if (time) {
            setGametime(time);
        }
        if (level) {
            setGameLevel(level);
        }
        if (isAi) {
            setVsAi(true);
        }
    }, [gameId, location]);

    useEffect(() => {
        socket.on("game-ended", () => {
            setGameStarted(false);
            setPlayerColor(null);
            navigate("/");
        });
        return () => {
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
                <AIGameRoom playerColor={playerColor} gameStarted={gameStarted} gameTime={gameTime} aiLevel={level} />
            </>
        )
    }
    return (
        <>
            <GameRoom socket={socket} playerColor={playerColor} gameStarted={gameStarted} gameId={gameId} gameTime={gameTime} />
        </>
    );
}