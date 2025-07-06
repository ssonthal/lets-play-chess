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
import FenUtil from "../util/FenUtil";
import { useNavigate, useParams } from "react-router-dom";
import { DrawOfferModal } from "./UI/DrawOfferModal";
import { Toast, ToastContainer, ToastType } from "./UI/ToastManager";

interface GameRoomProps {
  userId: string;
  socket: Socket;
  playerColor: TeamType;
  gameStarted: boolean;
  gameTime: number;
}

interface UseChessClockProps {
  board: any; // use your proper Board type if available
  setWhiteTime: React.Dispatch<React.SetStateAction<number>>;
  setBlackTime: React.Dispatch<React.SetStateAction<number>>;
}

export function useChessClock({
  board,
  setWhiteTime,
  setBlackTime
}: UseChessClockProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (board.draw || board.stalemate || board.winner !== undefined) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const id = setInterval(() => {
      if (board.currentTeam === TeamType.WHITE) {
        setWhiteTime((prev) => Math.max(prev - 1, 0));
      } else {
        setBlackTime((prev) => Math.max(prev - 1, 0));
      }
    }, 1000);

    intervalRef.current = id;

    return () => {
      clearInterval(id);
      intervalRef.current = null;
    };
  }, [board.currentTeam]);
}


export default function GameRoom({ userId, socket, playerColor, gameStarted, gameTime }: GameRoomProps) {
  const [board, setBoard] = useState<Board>(initialBoard.clone());
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position, to: Position } | null>(null);
  const [endgameMsg, setEndgameMsg] = useState("Draw");
  const { gameId } = useParams<{ gameId: string }>();
  const [whiteTime, setWhiteTime] = useState<number>(gameTime);
  const [blackTime, setBlackTime] = useState<number>(gameTime);
  const promotionModalRef = useRef<HTMLDivElement>(null);
  const endgameModalRef = useRef<HTMLDivElement>(null);
  const drawModalRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastMove, setLastMove] = useState<{ from: Position, to: Position } | undefined>(undefined);
  const [drawResponse, setDrawResponse] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();

  const addToast = (message: string, type: ToastType, title: string, duration: number = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, title, duration } as Toast;
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useChessClock({
    board,
    setWhiteTime,
    setBlackTime
  });

  useEffect(() => {
    if (whiteTime === 0 || blackTime === 0) {
      const updatedBoard = board.clone();
      updatedBoard.winningTeam = whiteTime === 0 ? TeamType.BLACK : TeamType.WHITE;
      setBoard(updatedBoard);
      checkForEndGame(updatedBoard);
    }
  }, [whiteTime, blackTime]);

  useEffect(() => {
    if (drawResponse) {
      const updatedBoard = board.clone();
      updatedBoard.draw = true;
      setBoard(updatedBoard);
      checkForEndGame(updatedBoard);
    }
  }, [drawResponse])

  useEffect(() => {
    const handleConnect = () => {
      const userId = localStorage.getItem("letsplayChessGuestUserId");
      if (userId) {
        socket.emit("check-for-existing-game", { userId: userId, gameId: gameId });
      }
    }
    socket.on("connect", handleConnect);
    if (socket.connected) {
      handleConnect();
    }
    socket.on("game-exists", (game) => {
      let board = initialBoard.clone();
      const moves: string[] = [];
      if (!game.moves) {
        return;
      }
      moves.push(...JSON.parse(game.moves));
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const fromPosition = FenUtil.algebraicToPosition(move[0] + move[1]);
        const toPosition = FenUtil.algebraicToPosition(move[2] + move[3]);
        if (move.length === 4) {
          board = handleNormalOpponentMove(board, fromPosition, toPosition);
        } else if (move.length === 5) {
          // Promotion
          board = handlePromotionCaseForOpponent(board, fromPosition, toPosition, move[4]);
        }
      }
      board.calculateAllMoves();
      setWhiteTime(Number(game.whiteTime));
      setBlackTime(Number(game.blackTime));
      board.draw = game.isDraw === "false" ? false : true;
      board.stalemate = game.isStalemate === "false" ? false : true;
      setBoard(board);
      checkForEndGame(board);
    });
    return () => {
      socket.off("game-exists");
      socket.off("connect");
    }
  }, [socket, location.pathname]);
  // Auto-scroll on move
  useEffect(() => {
    if (board.moves.length > 0) {
      setLastMove({ from: board.moves[board.moves.length - 1].fromPosition, to: board.moves[board.moves.length - 1].toPosition });
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [board.moves.length]);

  useEffect(() => {
    const handler = ({ from, to, promotionType }: { from: Position, to: Position, promotionType: string }) => {
      const fromPos = new Position(from.x, from.y);
      const toPos = new Position(to.x, to.y);
      const movingPiece = board.pieces.find(p => p.samePosition(fromPos));
      let newBoard = board.clone();
      if (movingPiece) {
        if (promotionType && promotionType.length > 0) {
          newBoard = handlePromotionCaseForOpponent(board, fromPos, toPos, promotionType);
        }
        else {
          newBoard = handleNormalOpponentMove(board, fromPos, toPos);
        }
        newBoard.calculateAllMoves();
        setBoard(newBoard);
        checkForEndGame(newBoard);
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
    });
    socket.on("opponent-offer-draw", () => {
      drawModalRef.current?.classList.remove("hidden");
    });
    socket.on("draw-offer-accepted", () => {
      const cloned = board.clone();
      cloned.draw = true;
      setBoard(cloned);
      endgameModalRef.current?.classList.remove("hidden");
      setEndgameMsg("Draw Offer Accepted. Draw");
    });
    socket.on("draw-offer-rejected", () => {
      addToast("Draw offer rejected", ToastType.Error, "Error");
    });
    return () => {
      socket.off("opponent-resigned");
      socket.off("opponent-offer-draw");
      socket.off("draw-offer-accepted");
      socket.off("draw-offer-rejected");
    }
  }, []);

  function handleNormalOpponentMove(board: Board, fromPosition: Position, toPosition: Position): Board {
    const piece = board.pieces.find(p => p.samePosition(fromPosition));
    if (!piece) {
      console.error("error in setting game state based on history");
      return board; // returning existing board
    }
    const isEnPassant = isEnPassantMove(
      fromPosition.x,
      fromPosition.y,
      toPosition.x,
      toPosition.y,
      piece.team,
      board.pieces
    );
    return board.playMove(isEnPassant, piece, toPosition);
  }
  function handlePromotionCaseForOpponent(board: Board, fromPosition: Position, toPosition: Position, pieceTypeInitial: string): Board {

    let pieceType: PieceType = PieceType.QUEEN;
    switch (pieceTypeInitial) {
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
      return board; // returning existing board
    }
    board = board.playMove(false, piece, toPosition);
    const updatedPieces = board.pieces.map(p =>
      p.samePosition(toPosition)
        ? new Piece(toPosition.clone(), pieceType, piece.team, true)
        : p
    );
    return board.clone(updatedPieces);
  }
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

      const promotionRow = playedPiece.team === TeamType.WHITE ? 7 : 0;
      if (destination.y === promotionRow && playedPiece.type === PieceType.PAWN) {
        promotionModalRef.current?.classList.remove("hidden");
        setPendingPromotion({ from: playedPiece.position, to: destination });
        return true;
      }
      socket.emit("move", {
        userId,
        gameId,
        move: {
          from: playedPiece.position,
          to: destination,
        },
        whiteTime: whiteTime,
        blackTime: blackTime,
        currentTurn: newBoard.currentTeam,
        isDraw: newBoard.draw,
        isStalemate: newBoard.stalemate,
        winningTeam: newBoard.winningTeam ? newBoard.winningTeam : null
      });

      return true;
    }
    return false;
  }

  function promotePawn(pieceType: PieceType) {
    if (!pendingPromotion) return;

    const updatedPieces = board.pieces.map(p =>
      p.samePosition(pendingPromotion.to)
        ? new Piece(pendingPromotion.to.clone(), pieceType, p.team, true)
        : p
    );

    const updatedBoard = board.clone(updatedPieces);
    updatedBoard.calculateAllMoves();
    let pieceTypeInitial = 'q';
    switch (pieceType) {
      case PieceType.ROOK:
        pieceTypeInitial = 'r';
        updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'r';
        break;
      case PieceType.KNIGHT:
        pieceTypeInitial = 'n';
        updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'n';
        break;
      case PieceType.BISHOP:
        pieceTypeInitial = 'b';
        updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'b';
        break;
      case PieceType.QUEEN:
        pieceTypeInitial = 'q';
        updatedBoard.advancedMoves[updatedBoard.advancedMoves.length - 1] += 'q';
        break;
    }
    setBoard(updatedBoard);
    checkForEndGame(updatedBoard);
    socket.emit("move", {
      userId,
      gameId,
      move: {
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotionType: pieceTypeInitial,
      },
      whiteTime: whiteTime,
      blackTime: blackTime,
      currentTurn: updatedBoard.currentTeam,
      isDraw: updatedBoard.draw,
      isStalemate: updatedBoard.stalemate,
      winningTeam: updatedBoard.winningTeam ? updatedBoard.winningTeam : null
    });
    promotionModalRef.current?.classList.add("hidden");
    setPendingPromotion(null);
  }

  function setPromotionTeam(): string {
    if (!pendingPromotion) return "";
    const piece = board.pieces.find(p => p.samePosition(pendingPromotion.to));
    if (!piece) return "";
    return piece.team === TeamType.WHITE ? "w" : "b";
  }

  function handleResination() {
    const cloned = board.clone();
    cloned.winningTeam = playerColor === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    checkForEndGame(cloned);
    setBoard(cloned);
    socket.emit("opponent-resigned", { userId: userId, gameId: gameId });
  }
  function handleDrawOffer() {
    addToast("Draw offer sent", ToastType.Info, "Info");
    socket.emit("draw-offer-created", { userId: userId, gameId: gameId });
  }

  function restartGame() {
    navigate("/");
    socket.emit("game-ended", { userId: userId, gameId: gameId });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <GameRoomBackground />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <PromotionModal promotionModalRef={promotionModalRef} promotePawn={promotePawn} setPromotionTeam={setPromotionTeam} />
      <EndgameModal endgameModalRef={endgameModalRef} board={board} endgameMsg={endgameMsg} restartGame={restartGame} />
      <DrawOfferModal drawOfferModalRef={drawModalRef} setDrawResponse={setDrawResponse} socket={socket} gameId={gameId} userId={userId} />
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
  );
}