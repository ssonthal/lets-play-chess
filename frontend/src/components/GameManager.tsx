import { Socket } from "socket.io-client";
import GameRoom from "./GameRoom";
import { TeamType } from "../Types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NewGameRoom from "./NewGameRoom";

export default function GameManager({ socket }: { socket: Socket }) {
    const navigate = useNavigate();
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const [playerColor, setPlayerColor] = useState<TeamType | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    useEffect(() => {
        const color: TeamType =
            location?.state?.playerColor === "w"
                ? TeamType.WHITE
                : TeamType.BLACK;

        setPlayerColor(color);
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
    return (
        <>
            {/* <div className="grid place-items-center bg-[#202020] h-screen"> */}
            <NewGameRoom socket={socket} playerColor={playerColor} gameStarted={gameStarted} gameId={gameId} />
            {/* </div> */}
        </>
    );
}