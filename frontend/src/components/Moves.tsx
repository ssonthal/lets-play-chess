import { Undo2, Flag, RotateCcw, CrossIcon, Cross, X } from "lucide-react";
import { useRef, useEffect } from "react";
import { Move } from "../models/Move";
import { TeamType } from "../Types";
import "../App.css";
import { Board } from "../models";

function toAlgebraic(pos: { x: number; y: number }): string {
    const file = String.fromCharCode('a'.charCodeAt(0) + pos.x);
    const rank = (8 - pos.y).toString(); // Assuming y=0 is top
    return `${file}${rank}`;
}

type FormattedMove = {
    moveNumber: number;
    white?: string;
    black?: string;
};

function formatMoveHistory(moves: Move[]): FormattedMove[] {
    const formatted: FormattedMove[] = [];
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const algebraic = toAlgebraic(move.toPosition); // TODO: enhance with piece symbol
        const moveNumber = Math.floor(i / 2) + 1;

        if (move.team === TeamType.WHITE) {
            formatted.push({ moveNumber, white: algebraic });
        } else {
            if (formatted[moveNumber - 1]) {
                formatted[moveNumber - 1].black = algebraic;
            } else {
                formatted.push({ moveNumber, black: algebraic });
            }
        }
    }
    return formatted;
}

export default function NewMoves({ board, handleResination }: { board: Board, handleResination: () => void }) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const moves = formatMoveHistory(board.moves);
    const lastIndex = board.moves.length - 1;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [board.moves.length]);

    function handleDrawOffer() {
        // show draw modal
    }

    return (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-xl w-80 h-96 shadow-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-700/70 bg-slate-800/50 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200 tracking-wide">GAME MOVES</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-400">Live</span>
                    </div>
                </div>
            </div>

            {/* Moves List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 scrollable">
                <div className="space-y-1">
                    {moves.map(({ moveNumber, white, black }, i) => {
                        const whiteIndex = i * 2;
                        const blackIndex = i * 2 + 1;
                        return (
                            <div key={i} className="group hover:bg-slate-800/30 rounded-lg transition-colors duration-150">
                                <div className="flex items-center py-2 px-3">
                                    {/* Move Number */}
                                    <div className="w-8 text-xs font-medium text-slate-400 select-none">
                                        {moveNumber}.
                                    </div>

                                    {/* White Move */}
                                    <button
                                        className={`flex-1 text-left px-3 py-1.5 mx-1 rounded-md text-sm font-mono transition-all duration-200 hover:bg-slate-700/50 ${lastIndex === whiteIndex
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/50"
                                            : "text-slate-200 hover:text-white"
                                            }`}
                                    >
                                        {white}
                                    </button>

                                    {/* Black Move */}
                                    <button
                                        className={`flex-1 text-left px-3 py-1.5 mx-1 rounded-md text-sm font-mono transition-all duration-200 hover:bg-slate-700/50 ${lastIndex === blackIndex
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/50"
                                            : "text-slate-200 hover:text-white"
                                            } ${!black ? "opacity-50" : ""}`}
                                    >
                                        {black || "..."}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Enhanced Control Bar */}
            <div className="px-4 py-4 border-t border-slate-700/70 bg-slate-800/30 rounded-b-xl">
                <div className="flex flex-row justify-around">
                    <button
                        className="px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-200 text-lg font-medium text-slate-400 hover:text-white"
                        title="Offer Draw"
                        onClick={() => handleDrawOffer()}
                    >
                        ½-½
                    </button>
                    <button
                        onClick={() => handleResination()}
                        className="p-2.5 hover:bg-slate-600/20 hover:text-white-400 rounded-lg transition-colors duration-200 group"
                        title="Resign"
                    >
                        <Flag size={24} className="text-slate-400 group-hover:text-slate-400 transition-colors" />
                    </button>
                    <button
                        className="p-2.5 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors duration-200 group"
                        title="Abort"
                    >
                        <X size={24} className="text-slate-400 group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </div>
        </div >
    );
}