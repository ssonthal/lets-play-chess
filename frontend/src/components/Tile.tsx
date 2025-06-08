import React from "react";
import { TILE_SIZE } from "../Constants";

export default function Tile({
    image,
    number,
    highlight,
}: {
    image: string | undefined;
    number: number;
    highlight: boolean;
}): React.ReactNode {
    const tileStyle = `w-[${TILE_SIZE}px] h-[${TILE_SIZE}px] grid place-items-center`;
    const pieceStyle = {
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        backgroundImage: `url(${image})`,
    };
    const highlightDotStyle = {
        width: `${TILE_SIZE / 4}px`,
        height: `${TILE_SIZE / 4}px`,
    };
    const highlightBorderStyle = {
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
    };

    return number % 2 === 0 ? (
        <div className={`${tileStyle} bg-[#b58962]`}>
            {!highlight && image && (
                <div
                    className="chess-piece bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing"
                    style={pieceStyle}
                ></div>
            )}
            {highlight && !image && (
                <div
                    className="absolute bg-[rgba(0,0,0,0.4)] rounded-full"
                    style={highlightDotStyle}
                ></div>
            )}
            {highlight && image && (
                <div>
                    <div
                        className="absolute border-5 border-[rgba(0,0,0,0.4)] border-solid rounded-full"
                        style={highlightBorderStyle}
                    ></div>
                    <div
                        className="chess-piece bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing"
                        style={pieceStyle}
                    ></div>
                </div>
            )}
        </div>
    ) : (
        <div className={`${tileStyle} bg-[#ebecd0]`}>
            {!highlight && image && (
                <div
                    className="chess-piece bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing"
                    style={pieceStyle}
                ></div>
            )}
            {highlight && !image && (
                <div
                    className="absolute bg-[rgba(0,0,0,0.4)] rounded-full"
                    style={highlightDotStyle}
                ></div>
            )}
            {highlight && image && (
                <div>
                    <div
                        className="absolute border-5 border-[rgba(0,0,0,0.4)] border-solid rounded-full"
                        style={highlightBorderStyle}
                    ></div>
                    <div
                        className="chess-piece bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing"
                        style={pieceStyle}
                    ></div>
                </div>
            )}
        </div>
    );
}