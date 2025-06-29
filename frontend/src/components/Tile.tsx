import React from "react";

export default function Tile({
    image,
    number,
    highlight,
    isLastMove,
    isLastMoveFrom,
    tileSize
}: {
    image: string | undefined;
    number: number;
    highlight: boolean;
    isLastMove?: boolean;
    isLastMoveFrom?: boolean;
    tileSize: number;
}): React.ReactNode {
    const pieceStyle = {
        width: `${tileSize}px`,
        height: `${tileSize}px`,
        backgroundImage: `url(${image})`,
    };
    const highlightDotStyle = {
        width: `${tileSize / 4}px`,
        height: `${tileSize / 4}px`,
    };
    const highlightBorderStyle = {
        width: `${tileSize}px`,
        height: `${tileSize}px`,
    };

    // Determine base tile color - add last move highlighting
    const isLightTile = number % 2 === 0;
    let baseTileColor = isLightTile ? 'bg-[#b58962]' : 'bg-[#ebecd0]';

    // Override with last move colors if applicable
    if (isLastMove) {
        if (isLastMoveFrom) {
            // Source square highlighting
            baseTileColor = isLightTile ? 'bg-[#f7dc6f]' : 'bg-[#f4d03f]'; // Yellow tones
        } else {
            // Destination square highlighting  
            baseTileColor = isLightTile ? 'bg-[#82e0aa]' : 'bg-[#58d68d]'; // Green tones
        }
    }

    return (
        <div
            className={`grid place-items-center ${baseTileColor}`}
            style={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
            }}
        >
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
                        className="absolute border-4 border-[rgba(0,0,0,0.4)] border-solid rounded-full"
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