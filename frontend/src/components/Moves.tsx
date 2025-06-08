import { Undo2, Flag } from "lucide-react";
import { Move } from "../models/Move";
import { TeamType } from "../Types";
import { useEffect, useRef } from "react";
import "../App.css";

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

export const Moves = ({ movesFromBoard }: { movesFromBoard: Move[] }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const moves = formatMoveHistory(movesFromBoard);
    const lastIndex = movesFromBoard.length - 1;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [movesFromBoard.length]);

    return (
        <div className="bg-zinc-900 text-white p-4 rounded-md w-64 shadow-md text-sm font-mono flex flex-col justify-between h-100 mt-[100px]">
            <div className="flex flex-col overflow-y-auto scrollable p-2 gap-3 text-sm">
                {moves.map(({ moveNumber, white, black }, i) => {
                    const whiteIndex = i * 2;
                    const blackIndex = i * 2 + 1;
                    return (
                        <div key={i} className="flex">
                            <div className="w-6">{moveNumber}</div>
                            <div className={`w-14 px-1 rounded ${lastIndex === whiteIndex ? "bg-blue-600" : ""}`}>
                                {white}
                            </div>
                            <div className={`w-14 px-1 rounded ${lastIndex === blackIndex ? "bg-blue-600" : ""}`}>
                                {black}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Control Bar */}
            <div className="flex justify-between pt-3 mt-3 border-t border-zinc-700">
                <button className="p-1 hover:bg-zinc-800 rounded"><Undo2 size={16} /></button>
                <button className="p-1 hover:bg-zinc-800 rounded">½</button>
                <button className="p-1 hover:bg-zinc-800 rounded"><Flag size={16} /></button>
            </div>
        </div>
    );
};

export default Moves;
