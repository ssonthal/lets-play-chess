import { useEffect, useRef, useState } from "react";
import { INITIAL_TIME, initialBoard, TILE_SIZE } from "../Constants";
import { Piece, Position, Board } from "../models";
import { Chessboard } from "./Chessboard";
import { isEnPassantMove } from "../referee/rules";
import { PieceType, TeamType } from "../Types";
import { Socket } from "socket.io-client";
import { ClockDisplay } from "./ClockDisplay";
import Moves from "./Moves";
import { useNavigate } from "react-router-dom";

// 👇 Pass these props from parent
interface GameRoomProps {
    socket: Socket;
    playerColor: TeamType;
    gameStarted: boolean;
    gameId: string;
}

export default function GameRoom({ socket, playerColor, gameStarted, gameId }: GameRoomProps) {
    const [board, setBoard] = useState<Board>(initialBoard.clone());
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [endgameMsg, setEndgameMsg] = useState("Draw");
    const [whiteTime, setWhiteTime] = useState<number>(INITIAL_TIME);
    const [blackTime, setBlackTime] = useState<number>(INITIAL_TIME);
    const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const endgameModalRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!gameStarted) return;
        // Stop the clock if game ends
        if (board.draw || board.winningTeam !== undefined || board.statemate) {
            if (intervalId) clearInterval(intervalId);
            setIntervalId(null);
            return;
        }
        // Clear any existing interval before starting a new one
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        // Set ticking for the current team
        const id = setInterval(() => {
            if (board.currentTeam === TeamType.WHITE) {
                setWhiteTime((prev) => Math.max(prev - 1, 0));
            } else {
                setBlackTime((prev) => Math.max(prev - 1, 0));
            }
        }, 1000);
        setIntervalId(id);

        // Cleanup on dependency change
        return () => {
            clearInterval(id);
            setIntervalId(null);
        };
    }, [board.currentTeam, board.draw, board.winningTeam, board.statemate, gameStarted]);

    useEffect(() => {

        if (whiteTime === 0 || blackTime === 0) {
            const updatedBoard = board.clone();
            updatedBoard.winningTeam = whiteTime === 0 ? TeamType.BLACK : TeamType.WHITE;
            setBoard(updatedBoard);
            checkForEndGame(updatedBoard);
        }
    }, [whiteTime, blackTime]);
    // Auto-scroll on move
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [board.moves.length]);

    useEffect(() => {
        const handler = ({ from, to }: { from: Position, to: Position }) => {
            const fromPos = new Position(from.x, from.y);
            const toPos = new Position(to.x, to.y);
            const movingPiece = board.pieces.find(p => p.samePosition(fromPos));
            if (movingPiece) {
                playMove(movingPiece, toPos, false);
            }
        };
        socket.on('opponent-move', handler);
        return () => {
            socket.off('opponent-move', handler);
        };
    }, [board, socket]);

    function playMove(playedPiece: Piece, destination: Position, shouldEmit = true): boolean {
        if (playedPiece.possibleMoves === undefined) return false;

        const validMove = playedPiece.possibleMoves.some(p => p.equals(destination));
        console.log(validMove, "validMove");
        if (!validMove) return false;
        const isEnPassant = isEnPassantMove(
            playedPiece.position.x,
            playedPiece.position.y,
            destination.x,
            destination.y,
            playedPiece.team,
            board.pieces
        );

        if (validMove || isEnPassant) {
            const newBoard = board.playMove(isEnPassant, playedPiece, destination);

            setBoard(newBoard);
            checkForEndGame(newBoard);

            // ♟️ Handle promotion UI
            const promotionRow = playedPiece.team === TeamType.WHITE ? 7 : 0;
            if (destination.y === promotionRow && playedPiece.type === PieceType.PAWN) {
                modalRef.current?.classList.remove("hidden");
                setPromotionPawn(newBoard.pieces.find(p => p.samePosition(destination)));
            }

            if (shouldEmit) {
                socket.emit("move", {
                    gameId,
                    move: {
                        from: playedPiece.position,
                        to: destination,
                    },
                });
            }

            return true;
        }
        return false;
    }

    function promotePawn(pieceType: PieceType) {
        if (!promotionPawn) return;

        const updatedPieces = board.pieces.map(p =>
            p.samePiecePosition(promotionPawn)
                ? new Piece(promotionPawn.position.clone(), pieceType, promotionPawn.team, true)
                : p
        );

        const updatedBoard = board.clone(updatedPieces);
        updatedBoard.calculateAllMoves();
        setBoard(updatedBoard);
        checkForEndGame(updatedBoard);
        modalRef.current?.classList.add("hidden");
    }

    function setPromotionTeam(): string {
        return promotionPawn?.team === TeamType.WHITE ? "w" : "b";
    }

    function restartGame() {
        endgameModalRef.current?.classList.add("hidden");
        setBoard(initialBoard.clone());
        socket.emit("game-over", gameId);
    }

    function checkForEndGame(newBoard: Board) {
        if (newBoard.draw) {
            endgameModalRef.current?.classList.remove("hidden");
            setEndgameMsg("Draw!");
        } else if (newBoard.winningTeam !== undefined) {
            endgameModalRef.current?.classList.remove("hidden");
            setEndgameMsg(newBoard.winningTeam === TeamType.WHITE ? "White wins" : "Black wins");
        } else if (newBoard.winningTeam === undefined && newBoard.statemate) {
            endgameModalRef.current?.classList.remove("hidden");
            setEndgameMsg("Stalemate");
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col h-full">
                {/* 📌 Opponent Clock (Top) */}
                <ClockDisplay
                    time={playerColor === TeamType.WHITE ? blackTime : whiteTime}
                    label={playerColor === TeamType.WHITE ? "Black" : "White"}
                    isActive={board.currentTeam !== playerColor}
                />

                {/* ♟️ Game UI (Board + Moves) */}
                <div className="flex gap-4">
                    <Chessboard playMove={playMove} pieces={board.pieces} pieceColor={playerColor} isGameStarted={gameStarted} />
                    <Moves movesFromBoard={board.moves} />
                </div>

                {/* ⌛ Player Clock (Bottom) */}
                <ClockDisplay
                    time={playerColor === TeamType.WHITE ? whiteTime : blackTime}
                    label={playerColor === TeamType.WHITE ? "White" : "Black"}
                    isActive={board.currentTeam === playerColor}
                />
            </div>
            {/* Promotion Modal */}
            <div className="absolute inset-0 hidden" ref={modalRef}>
                <div className="h-[300px] w-[800px] bg-[rgba(0,0,0,0.3)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-around">
                    {["rook", "bishop", "queen", "knight"].map((type, idx) => (
                        <img
                            key={idx}
                            onClick={() =>
                                promotePawn(PieceType[type.toUpperCase() as keyof typeof PieceType])
                            }
                            className="hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)] active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]"
                            src={`src/assets/pieces/${type}_${setPromotionTeam()}.png`}
                        />
                    ))}
                </div>
            </div>

            {/* Endgame Modal */}
            <div className="absolute inset-0 hidden z-50" ref={endgameModalRef}>
                <div className="h-[300px] w-[800px] bg-[rgba(0,0,0,0.3)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-around">
                    <div className="flex flex-col gap-8">
                        <span className="text-2xl text-white">{endgameMsg}</span>
                        <button
                            onClick={restartGame}
                            className="px-2 py-4 bg-[#b58962] text-2xl text-white rounded transition rounded-lg cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
