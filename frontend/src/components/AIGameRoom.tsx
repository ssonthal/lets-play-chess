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
import { PromotionModal } from "./UI/PromotionModal";
import { EndgameModal } from "./UI/EndgameModalRef";
import { GameRoomBackground } from "./UI/GameRoomBackground";
import { useParams } from "react-router-dom";


interface AIGameRoomProps {
    playerColor: TeamType;
    gameStarted: boolean;
    gameTime: number;
    aiLevel: number;
}
function getAIDelayByLevel(level: number): number {
    switch (level) {
        case 1: return 2000;
        case 2: return 2300;
        case 3: return 3300;
        case 4: return 5000;
        case 5: return 8000;
        default: return 2000;
    }
}
function getDepthByLevel(level: number): number {
    switch (level) {
        case 1: return 1;
        case 2: return 3;
        case 3: return 6;
        case 4: return 12;
        case 5: return 16;
        default: return 1;
    }
}

export default function GameRoom({ playerColor, gameStarted, gameTime, aiLevel }: AIGameRoomProps) {
    const [board, setBoard] = useState<Board>(initialBoard.clone());
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const [endgameMsg, setEndgameMsg] = useState("Draw");
    const [whiteTime, setWhiteTime] = useState<number>(gameTime);
    const [blackTime, setBlackTime] = useState<number>(gameTime);
    const { gameId } = useParams<{ gameId: string }>();
    const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
    const promotionModalRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        if (!localStorage.getItem('letsplayChessGame')) {
            return;
        }
        const game: any = JSON.parse(localStorage.getItem('letsplayChessGame')!);

        if (game && game.gameId && game.gameId === gameId) {
            let board = initialBoard.clone();
            const moves: string[] = [];
            if (!game.moves) {
                return;
            }
            moves.push(...game.moves);
            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                if (move.length === 4) {
                    const fromPosition = FenUtil.algebraicToPosition(move[0] + move[1]);
                    const toPosition = FenUtil.algebraicToPosition(move[2] + move[3]);
                    const piece = board.pieces.find(p => p.samePosition(fromPosition));
                    if (!piece) {
                        console.error("error in setting game state based on history");
                        return;
                    }
                    const isEnPassant = isEnPassantMove(
                        fromPosition.x,
                        fromPosition.y,
                        toPosition.x,
                        toPosition.y,
                        piece.team,
                        board.pieces
                    );
                    board = board.playMove(isEnPassant, piece, toPosition);
                } else if (move.length === 5) {
                    // promotion case
                    const fromPosition = FenUtil.algebraicToPosition(move[0] + move[1]);
                    const toPosition = FenUtil.algebraicToPosition(move[2] + move[3]);
                    let pieceType: PieceType = PieceType.QUEEN;
                    switch (move[4]) {
                        case 'r':
                            pieceType = PieceType.ROOK;
                            break;
                        case 'n':
                            pieceType = PieceType.KNIGHT;
                            break;
                        case 'b':
                            pieceType = PieceType.BISHOP;
                            break;
                        case 'q':
                            pieceType = PieceType.QUEEN;
                            break;

                    }
                    const piece = board.pieces.find(p => p.samePosition(fromPosition));
                    if (!piece) {
                        console.error("error in setting game state based on history");
                        return;
                    }
                    board = board.playMove(false, piece, toPosition);
                    const updatedPieces = board.pieces.map(p =>
                        p.samePosition(toPosition)
                            ? new Piece(toPosition.clone(), pieceType, piece.team, true)
                            : p
                    );
                    board = board.clone(updatedPieces);
                }
            }
            board.calculateAllMoves();
            const now = Date.now();
            const elapsedMs = now - parseInt(game.lastMoveAt || now.toString(), 10);
            const elapsedSec = Math.floor(elapsedMs / 1000);
            if (game.currentTurn === 'w') {
                game.whiteTime = Math.max(0, parseInt(game.whiteTime) - elapsedSec);
            } else {
                game.blackTime = Math.max(0, parseInt(game.blackTime) - elapsedSec);
            }
            setWhiteTime(Number(game.whiteTime));
            setBlackTime(Number(game.blackTime));
            board.draw = game.isDraw === "false" ? false : true;
            board.stalemate = game.isStalemate === "false" ? false : true;
            setBoard(board);
        }
    }, [location.pathname])
    const sendCommand = (command: string) => {
        if (!stockfishRef.current) {
            return;
        }
        stockfishRef.current.postMessage(command);
    };
    useEffect(() => {
        if (!gameStarted) return;

        // Stop the clock if game ends
        if (board.draw || board.winningTeam !== undefined || board.stalemate) {
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
    }, [board.currentTeam]);

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
        const validMove = playedPiece.possibleMoves.some(p => p.equals(destination));
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
                promotionModalRef.current?.classList.remove("hidden");
                setPromotionPawn(newBoard.pieces.find(p => p.samePosition(destination)));
            }
            sendCommand("position fen " + FenUtil.boardToFen(newBoard));
            sendCommand(`go depth ${getDepthByLevel(aiLevel)}`);
            localStorage.setItem("letsplayChessGame", JSON.stringify({
                gameId: gameId,
                moves: newBoard.advancedMoves,
                whiteTime: whiteTime,
                blackTime: blackTime,
                currentTurn: newBoard.currentTeam,
                isDraw: newBoard.draw,
                isStalemate: newBoard.stalemate,
                lastMoveAt: Date.now(),
                winningTeam: newBoard.winningTeam ? newBoard.winningTeam : null
            }));
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
        switch (pieceType) {
            case PieceType.ROOK:
                updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'r';
                break;
            case PieceType.KNIGHT:
                updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'n';
                break;
            case PieceType.BISHOP:
                updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'b';
                break;
            case PieceType.QUEEN:
                updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'q';
                break;
        }
        setBoard(updatedBoard);
        checkForEndGame(updatedBoard);
        promotionModalRef.current?.classList.add("hidden");
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
    function handleDrawOffer() {
        return;
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
        } else if (newBoard.winningTeam === undefined && newBoard.stalemate) {
            endgameModalRef.current?.classList.remove("hidden");
            setEndgameMsg("Stalemate");
        }
    }
    {
        return !isReady ? <div></div> :
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <GameRoomBackground />
                <PromotionModal promotionModalRef={promotionModalRef} promotePawn={promotePawn} setPromotionTeam={setPromotionTeam} />
                <EndgameModal endgameModalRef={endgameModalRef} board={board} endgameMsg={endgameMsg} restartGame={restartGame} />

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
                                        <Moves board={board} handleResination={handleResination} handleDrawOffer={handleDrawOffer} />
                                    </div>
                                    <div className="hidden sm:block">
                                        {/* Desktop: Full moves panel */}
                                        <Moves board={board} handleResination={handleResination} handleDrawOffer={handleDrawOffer} />
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