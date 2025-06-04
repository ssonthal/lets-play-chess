import { useEffect, useRef, useState } from "react";
import { initialBoard, TILE_SIZE } from "../Constants";
import { Piece, Position, Board } from "../models";
import { Chessboard } from "./Chessboard";
import { isEnPassantMove } from "../referee/rules";
import { PieceType, TeamType } from "../Types";
import { Socket } from "socket.io-client";

// 👇 Pass these props from parent
interface GameRoomProps {
    socket: Socket;
    gameId: string;
    playerColor: TeamType;
}

export default function GameRoom({ socket, gameId, playerColor }: GameRoomProps) {
    const [board, setBoard] = useState<Board>(initialBoard.clone());
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [endgameMsg, setEndgameMsg] = useState("Draw");

    const modalRef = useRef<HTMLDivElement>(null);
    const endgameModalRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on move
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [board.moves.length]);

    useEffect(() => {
        console.log(board.pieces, "board.pieces");
    }, []);

    useEffect(() => {
        socket.on('opponent-move', ({ from, to }: { from: Position, to: Position }) => {
            const fromPos = new Position(from.x, from.y);
            const toPos = new Position(to.x, to.y);
            console.log("Opponent moved", fromPos, toPos);

            const movingPiece = board.pieces.find(p => p.samePosition(fromPos));
            if (movingPiece) {
                console.log("moving piece found", movingPiece);
                playMove(movingPiece, toPos, false);
            } else {
                console.warn("No piece found at opponent's from position", fromPos);
            }
            return () => socket.off("opponent-move");
        })
    }, [board]);




    function playMove(playedPiece: Piece, destination: Position, shouldEmit = true): boolean {
        if (playedPiece.possibleMoves === undefined) return false;

        const validMove = playedPiece.possibleMoves.some(p => p.equals(destination));
        console.log("validMove", validMove);
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

            // 📡 Emit to opponent
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
        <>
            {/* Promotion Modal */}
            <div className="absolute inset-0 hidden" ref={modalRef}>
                <div className="h-[300px] w-[800px] bg-[rgba(0,0,0,0.3)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-around">
                    {["rook", "bishop", "queen", "knight"].map((type, idx) => (
                        <img
                            key={idx}
                            onClick={() => promotePawn(PieceType[type.toUpperCase() as keyof typeof PieceType])}
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
                        <button onClick={restartGame} className="px-2 py-4 bg-[#b58962] text-2xl text-white rounded transition rounded-lg cursor-pointer">
                            Play Again
                        </button>
                    </div>
                </div>
            </div>

            {/* Main UI */}
            <main className="flex gap-4">
                <Chessboard playMove={playMove} pieces={board.pieces} pieceColor={playerColor} />

                {/* Sidebar */}
                <div
                    className="w-[240px] p-4 bg-[rgba(255,255,255,0.1)] rounded-md text-white flex flex-col"
                    style={{ maxHeight: `${8 * TILE_SIZE}px` }}
                >
                    <div className="text-xl text-center mb-2">
                        <p>Total Turns: {board.totalTurns}</p>
                        <p>Current team: {board.currentTeam === TeamType.WHITE ? "White" : "Black"}</p>
                    </div>

                    <div className="flex flex-col h-[calc(100%-58px)] overflow-y-auto scrollable p-2 gap-3 text-sm">
                        {board.moves.map((move, index) => (
                            <p className="mt-auto" key={index}>
                                {index + 1}. {move.toMessage()}
                            </p>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>
            </main>
        </>
    );
}
