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
            <div className="absolute inset-0 hidden z-40" ref={modalRef}>
                {/* Very light backdrop to keep board visible */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />

                {/* Modal Container */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="bg-white bg-opacity-85 backdrop-blur-xs rounded-2xl shadow-xl p-6 border border-white border-opacity-30">
                        {/* Piece Selection Grid */}
                        <div className="flex gap-4 justify-center">
                            {["queen", "rook", "bishop", "knight"].map((type, idx) => (
                                <div
                                    key={idx}
                                    onClick={() =>
                                        promotePawn(PieceType[type.toUpperCase() as keyof typeof PieceType])
                                    }
                                    className="group relative flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
                                >
                                    {/* Piece Container */}
                                    <div className="w-20 h-20 bg-white bg-opacity-70 rounded-xl shadow-md border border-purple-200 border-opacity-50 group-hover:border-purple-400 group-hover:shadow-lg transition-all duration-200 flex items-center justify-center mb-2">
                                        <img
                                            className="w-14 h-14 transition-transform duration-200 group-hover:scale-110"
                                            src={`/assets/pieces/${type}_${setPromotionTeam()}.png`}
                                            alt={type}
                                        />
                                    </div>

                                    {/* Piece Name */}
                                    <span className="text-sm font-medium text-gray-700 capitalize group-hover:text-purple-600 transition-colors duration-200">
                                        {type}
                                    </span>

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Endgame Modal */}
            <div className="absolute inset-0 hidden z-50" ref={endgameModalRef}>
                {/* Backdrop with blur effect */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />

                {/* Modal Container */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">

                        {/* Header with gradient background */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
                            <p className="text-purple-100 text-lg">{endgameMsg}</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">
                            <div className="text-center mb-6">
                                <p className="text-gray-600 text-sm">
                                    {endgameMsg.includes('White') ? '🤍' : endgameMsg.includes('Black') ? '⚫' : '🤝'}
                                    {' '}Well played! Ready for another game?
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={restartGame}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    🎯 Play Again
                                </button>
                            </div>
                        </div>

                        {/* Decorative bottom border */}
                        <div className="h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
