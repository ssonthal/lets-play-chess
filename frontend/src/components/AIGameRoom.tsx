import { useEffect, useRef, useState } from "react";
import { Users, Crown, Shield } from "lucide-react";
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
    const [lastMove, setLastMove] = useState<{ from: Position, to: Position } | undefined>(undefined);
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
        if (board.moves.length > 0) {
            setLastMove({ from: board.moves[board.moves.length - 1].fromPosition, to: board.moves[board.moves.length - 1].toPosition });
        }
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
        setLastMove(undefined);
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
        return !isReady ? <div></div> :
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Enhanced Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
                    </div>
                </div>
                {/* Promotion Modal - Responsive */}
                <div className="absolute inset-0 hidden z-40" ref={modalRef}>
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white bg-opacity-85 backdrop-blur-xs rounded-2xl shadow-xl p-4 sm:p-6 border border-white border-opacity-30 w-full max-w-sm sm:max-w-md">
                            <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 justify-center">
                                {["queen", "rook", "bishop", "knight"].map((type, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() =>
                                            promotePawn(PieceType[type.toUpperCase() as keyof typeof PieceType])
                                        }
                                        className="group relative flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-70 rounded-xl shadow-md border border-purple-200 border-opacity-50 group-hover:border-purple-400 group-hover:shadow-lg transition-all duration-200 flex items-center justify-center mb-2">
                                            <img
                                                className="w-10 h-10 sm:w-14 sm:h-14 transition-transform duration-200 group-hover:scale-110"
                                                src={`/assets/pieces/${type}_${setPromotionTeam()}.png`}
                                                alt={type}
                                            />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize group-hover:text-purple-600 transition-colors duration-200">
                                            {type}
                                        </span>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Endgame Modal - Responsive */}
                <div className="absolute inset-0 hidden z-50" ref={endgameModalRef}>
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6 sm:py-8 text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2Z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Over</h2>
                                <p className="text-purple-100 text-base sm:text-lg">{endgameMsg}</p>
                            </div>

                            <div className="px-6 py-6">
                                <div className="text-center mb-6">
                                    <p className="text-gray-600 text-sm">
                                        {board.winningTeam === TeamType.WHITE ? '🤍' : board.winningTeam === TeamType.BLACK ? '⚫' : '🤝'}
                                        {' '}Well played! Ready for another game?
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={restartGame}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                                    >
                                        🎯 Play Again
                                    </button>
                                </div>
                            </div>

                            <div className="h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500"></div>
                        </div>
                    </div>
                </div>

                {/* Main Game Container - Responsive */}
                <div className="flex flex-col p-2 sm:p-4">
                    {/* Enhanced Game Header - Responsive */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-0">
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-purple-400 border-opacity-50">
                                    <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-ping"></div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                    Let's Play Chess
                                </h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                                    <p className="text-gray-300 text-xs sm:text-sm">
                                        Playing as <span className="text-purple-400 font-semibold capitalize">{playerColor === TeamType.WHITE ? 'White' : 'Black'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Game Status - Responsive */}
                        <div className="flex items-center space-x-4">
                            <div className="bg-slate-800 bg-opacity-60 backdrop-blur-sm rounded-2xl px-3 py-2 sm:px-4 border border-slate-600">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${gameStarted ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`}></div>
                                    <span className="text-gray-200 text-xs sm:text-sm font-medium">
                                        {gameStarted ? 'Live Game' : 'Connecting...'}
                                    </span>
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Layout - Responsive Clock Positioning */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-center w-full">
                            {/* Left Panel: Board + Clocks (Vertical Layout) */}
                            <div className="flex-shrink-0">
                                <div className="flex flex-col space-y-4">
                                    {/* Opponent Clock - Above board in vertical, hidden in horizontal */}
                                    <div className="lg:hidden w-full max-w-sm">
                                        <ClockDisplay
                                            time={playerColor === TeamType.WHITE ? blackTime : whiteTime}
                                            label={playerColor === TeamType.WHITE ? "Black" : "White"}
                                            isActive={board.currentTeam !== playerColor}
                                        />
                                    </div>

                                    {/* Chessboard */}
                                    <Chessboard
                                        playMove={playMove}
                                        pieces={board.pieces}
                                        pieceColor={playerColor}
                                        isGameStarted={gameStarted}
                                        lastMove={lastMove}
                                    />

                                    {/* Player Clock - Below board in vertical, hidden in horizontal */}
                                    <div className="lg:hidden w-full max-w-sm">
                                        <ClockDisplay
                                            time={playerColor === TeamType.WHITE ? whiteTime : blackTime}
                                            label={playerColor === TeamType.WHITE ? "White" : "Black"}
                                            isActive={board.currentTeam === playerColor}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Clocks and Moves (Horizontal Layout) */}
                            <div className="w-full lg:w-auto lg:flex-shrink-0">
                                <div className="flex flex-col items-center lg:items-start space-y-4">
                                    {/* Desktop Clocks - Only visible in horizontal layout */}
                                    <div className="hidden lg:block">
                                        <ClockDisplay
                                            time={playerColor === TeamType.WHITE ? blackTime : whiteTime}
                                            label={playerColor === TeamType.WHITE ? "Black" : "White"}
                                            isActive={board.currentTeam !== playerColor}
                                        />
                                    </div>

                                    {/* Moves Panel */}
                                    <div className="block sm:hidden">
                                        {/* Mobile: Compact moves display */}
                                        <div className="bg-slate-800 bg-opacity-60 backdrop-blur-sm rounded-lg p-3 border border-slate-600 max-w-sm mx-auto">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-300 text-sm font-medium">Moves: {board.moves.length}</span>
                                                <button
                                                    onClick={handleResination}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors"
                                                >
                                                    Resign
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        {/* Desktop: Full moves panel */}
                                        <Moves board={board} handleResination={handleResination} />
                                    </div>

                                    {/* Desktop Player Clock - Only visible in horizontal layout */}
                                    <div className="hidden lg:block">
                                        <ClockDisplay
                                            time={playerColor === TeamType.WHITE ? whiteTime : blackTime}
                                            label={playerColor === TeamType.WHITE ? "White" : "Black"}
                                            isActive={board.currentTeam === playerColor}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    }
}