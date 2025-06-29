import { useEffect, useRef, useState } from "react";
import { Users, Zap, Crown, Shield } from "lucide-react";
import { initialBoard } from "../Constants";
import { PieceType, TeamType } from "../Types";
import { Board, Piece, Position } from "../models";
import { isEnPassantMove } from "../referee/rules";
import { ClockDisplay } from "./ClockDisplay";
import Moves from "./Moves";
import { Chessboard } from "./Chessboard";
import FenUtil from "../util/FenUtil";


interface AIGameRoomProps {
    playerColor: TeamType;
    gameStarted: boolean;
    gameTime: number;
    aiLevel: number;
}
function getAIDelayByLevel(level: number): number {
    switch (level) {
        case 1: return 800;
        case 2: return 1300;
        case 3: return 3000;
        case 4: return 5000;
        case 5: return 8000;
        default: return 800;
    }
}
function getDepthByLevel(level: number): number {
    switch (level) {
        case 1: return 3;
        case 2: return 5;
        case 3: return 8;
        case 4: return 12;
        case 5: return 16;
        default: return 3;
    }
}

export default function GameRoom({ playerColor, gameStarted, gameTime, aiLevel }: AIGameRoomProps) {
    const [board, setBoard] = useState<Board>(initialBoard.clone());
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [endgameMsg, setEndgameMsg] = useState("Draw");
    const [whiteTime, setWhiteTime] = useState<number>(gameTime);
    const [blackTime, setBlackTime] = useState<number>(gameTime);
    const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const endgameModalRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const stockfishRef = useRef<Worker | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [pendingAIMove, setPendingAIMove] = useState<{ from: Position, to: Position } | null>(null);

    useEffect(() => {
        try {
            const wasmSupported = typeof WebAssembly === 'object' &&
                WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

            const useWasm = wasmSupported;

            const stockfishUrl = useWasm
                ? '/stockfish.wasm.js'
                : '/stockfish.js';

            console.log('[React] Loading Stockfish from:', stockfishUrl);
            stockfishRef.current = new Worker(stockfishUrl);

            // Handle messages from Stockfish
            stockfishRef.current.addEventListener('message', (e) => {
                const message = e.data;
                // Check if engine is ready
                if (message === 'readyok') {
                    setIsReady(true);
                }
                if (message.startsWith('bestmove')) {
                    const move = message.split(' ')[1];

                    const from = FenUtil.algebraicToPosition(move.substring(0, 2));
                    const to = FenUtil.algebraicToPosition(move.substring(2, 5));
                    const uiDelay = getAIDelayByLevel(1);
                    const aiTeam = playerColor === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
                    const reaminingTime = aiTeam === TeamType.WHITE ? whiteTime : blackTime;
                    setTimeout(() => {
                        setPendingAIMove({ from, to });
                    }, Math.min(uiDelay, reaminingTime * 1000));
                }
            });

            // Handle worker errors
            stockfishRef.current.addEventListener('error', (error) => {
                console.error('[React] Stockfish error:', error);
            });

            // Initialize UCI
            setTimeout(() => {
                if (stockfishRef.current) {
                    stockfishRef.current.postMessage('uci');
                    stockfishRef.current.postMessage('isready');
                }
            }, 1000);

        } catch (err: any) {
            console.error('[React] Failed to initialize Stockfish:', err);
        }

        return () => {
            stockfishRef.current?.terminate();
        };
    }, []);

    const sendCommand = (command: string) => {
        if (!stockfishRef.current) {
            return;
        }
        console.log('[React] Sending command:', command);
        stockfishRef.current.postMessage(command);
    };
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
        if (!pendingAIMove) return;
        if (board.currentTeam === playerColor) return; // not AI's turn yet

        const { from, to } = pendingAIMove;
        const piece = board.pieces.find(p => p.position.equals(from));
        if (!piece) {
            console.error("piece not found");
            return;
        }
        if (board.currentTeam !== playerColor) {
            const success = playMove(piece, to);
            if (success) {
                setPendingAIMove(null); // clear the queue
            }
        }
    }, [board, pendingAIMove]);

    useEffect(() => {

        if (whiteTime === 0 || blackTime === 0) {
            const updatedBoard = board.clone();
            updatedBoard.winningTeam = whiteTime === 0 ? TeamType.BLACK : TeamType.WHITE;
            setBoard(updatedBoard);
            checkForEndGame(updatedBoard);
        }
    }, [whiteTime, blackTime]);

    useEffect(() => {
        if (board.totalTurns == 0 && board.currentTeam === TeamType.WHITE && playerColor !== TeamType.WHITE && stockfishRef.current) {
            setTimeout(() => {
                sendCommand("position fen " + FenUtil.boardToFen(board));
                sendCommand(`go depth ${getDepthByLevel(aiLevel)}`);
            }, 2000)
        }
    });
    // Auto-scroll on move
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [board.moves.length]);

    function playMove(playedPiece: Piece, destination: Position): boolean {
        if (playedPiece.possibleMoves === undefined) return false;
        console.log(board);
        console.log(board.currentTeam)
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
            sendCommand("position fen " + FenUtil.boardToFen(newBoard));
            sendCommand(`go depth ${getDepthByLevel(aiLevel)}`);
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

    function handleResination() {
        const cloned = board.clone();
        cloned.winningTeam = playerColor === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
        checkForEndGame(cloned);
        setBoard(cloned);
    }
    function restartGame() {
        endgameModalRef.current?.classList.add("hidden");
        setWhiteTime(gameTime);
        setBlackTime(gameTime);
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
    {
        return !isReady ? <div>Loading...</div> :
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Enhanced Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
                    </div>

                    {/* Chess pattern overlay */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="grid grid-cols-16 h-full">
                            {Array.from({ length: 256 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`${(Math.floor(i / 16) + (i % 16)) % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>
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
                                        {board.winningTeam === TeamType.WHITE ? '🤍' : board.winningTeam === TeamType.BLACK ? '⚫' : '🤝'}
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
                {/* Main Game Container */}
                <div className="flex flex-col p-4">
                    {/* Enhanced Game Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-purple-400 border-opacity-50">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                    Let's Play Chess
                                </h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    <p className="text-gray-300 text-sm">
                                        Playing as <span className="text-purple-400 font-semibold capitalize">{playerColor === TeamType.WHITE ? 'White' : 'Black'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Game Status */}
                        <div className="flex items-center space-x-4">
                            <div className="bg-slate-800 bg-opacity-60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-slate-600">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${gameStarted ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`}></div>
                                    <span className="text-gray-200 text-sm font-medium">
                                        {gameStarted ? 'Live Game' : 'Connecting...'}
                                    </span>
                                    <Users className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center grid">
                        {/* 📌 Opponent Clock (Top) */}
                        <ClockDisplay
                            time={playerColor === TeamType.WHITE ? blackTime : whiteTime}
                            label={playerColor === TeamType.WHITE ? "Black" : "White"}
                            isActive={board.currentTeam !== playerColor}
                        />

                        {/* ♟️ Game UI (Board + Moves) */}
                        <div className="flex gap-4 items-center">
                            <Chessboard playMove={playMove} pieces={board.pieces} pieceColor={playerColor} isGameStarted={gameStarted} />
                            <Moves board={board} handleResination={handleResination} />
                        </div>

                        {/* ⌛ Player Clock (Bottom) */}
                        <ClockDisplay
                            time={playerColor === TeamType.WHITE ? whiteTime : blackTime}
                            label={playerColor === TeamType.WHITE ? "White" : "Black"}
                            isActive={board.currentTeam === playerColor}
                        />
                    </div>
                    {/* Enhanced Turn Indicator */}
                    <div className="flex items-center justify-center">
                        <div className={`px-8 py-4 rounded-3xl border-2 transition-all duration-500 transform ${board.currentTeam === playerColor
                            ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-400 text-white shadow-2xl shadow-green-500/25 scale-105'
                            : 'bg-gradient-to-r from-red-600 to-red-700 border-red-400 text-white shadow-2xl shadow-red-500/25'
                            }`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full animate-pulse ${board.currentTeam === playerColor ? 'bg-green-200' : 'bg-red-200'
                                    }`}></div>
                                <span className="font-bold text-lg">
                                    {board.currentTeam === playerColor ? "Your Turn" : `${playerColor === TeamType.WHITE ? "Black" : "White"}'s Turn`}
                                </span>
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    }
}