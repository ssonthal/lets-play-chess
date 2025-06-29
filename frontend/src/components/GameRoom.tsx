import { useEffect, useRef, useState } from "react";
import { Users, Crown, Shield } from "lucide-react";
import { initialBoard } from "../Constants";
import { PieceType, TeamType } from "../Types";
import { Socket } from "socket.io-client";
import { Board, Piece, Position } from "../models";
import { isEnPassantMove } from "../referee/rules";
import { ClockDisplay } from "./ClockDisplay";
import Moves from "./Moves";
import { Chessboard } from "./Chessboard";
import { GameRoomBackground } from "./UI/GameRoomBackground";
import { PromotionModal } from "./UI/PromotionModal";
import { EndgameModal } from "./UI/EndgameModalRef";

interface GameRoomProps {
  socket: Socket;
  playerColor: TeamType;
  gameStarted: boolean;
  gameId: string;
  gameTime: number;
}

export default function GameRoom({ socket, playerColor, gameStarted, gameId, gameTime }: GameRoomProps) {
  const [board, setBoard] = useState<Board>(initialBoard.clone());
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  const [endgameMsg, setEndgameMsg] = useState("Draw");
  const [whiteTime, setWhiteTime] = useState<number>(gameTime);
  const [blackTime, setBlackTime] = useState<number>(gameTime);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const promotionModalRef = useRef<HTMLDivElement>(null);
  const endgameModalRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastMove, setLastMove] = useState<{ from: Position, to: Position } | undefined>(undefined);

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
    if (board.moves.length > 0) {
      setLastMove({ from: board.moves[board.moves.length - 1].fromPosition, to: board.moves[board.moves.length - 1].toPosition });
    }
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
  }, [board]);

  useEffect(() => {
    socket.on("opponent-resigned", () => {
      const cloned = board.clone();
      cloned.winningTeam = playerColor;
      setBoard(cloned);
      endgameModalRef.current?.classList.remove("hidden");
      setEndgameMsg(cloned.winningTeam === TeamType.WHITE ? "Black Resigned. You Won!" : "White Resigned. You Won!");
    })
  }, []);

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
        promotionModalRef.current?.classList.remove("hidden");
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
    socket.emit("opponent-resigned", gameId);
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
  );
}