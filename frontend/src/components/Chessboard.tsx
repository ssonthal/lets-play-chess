import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import { Piece, Position } from "../models";
import { TeamType } from "../Types";

// Enhanced responsive tile size calculation for larger boards
const getResponsiveTileSize = () => {
    if (typeof window === 'undefined') return 80; // Default for SSR

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Calculate maximum possible tile size based on viewport dimensions
    // More generous space allocation - reduced UI element estimates
    const maxWidthTileSize = Math.floor((screenWidth - 32) / 8); // Reduced padding
    const maxHeightTileSize = Math.floor((screenHeight - 200) / 8); // Much more generous height

    // Use the smaller of the two to ensure board fits in viewport
    const viewportConstrainedSize = Math.min(maxWidthTileSize, maxHeightTileSize);

    // Increased device-specific constraints for larger boards
    let deviceMaxSize;
    if (screenWidth < 400) deviceMaxSize = 42;       // Increased from 35
    else if (screenWidth < 480) deviceMaxSize = 50;  // Increased from 40
    else if (screenWidth < 640) deviceMaxSize = 60;  // Increased from 45
    else if (screenWidth < 768) deviceMaxSize = 70;  // Increased from 50
    else if (screenWidth < 1024) deviceMaxSize = 85; // Increased from 60
    else if (screenWidth < 1280) deviceMaxSize = 95; // New breakpoint
    else if (screenWidth < 1440) deviceMaxSize = 105; // New breakpoint
    else if (screenWidth < 1920) deviceMaxSize = 115; // New breakpoint
    else deviceMaxSize = 125; // Much larger for big screens (was 75)

    // Return the smaller of viewport-constrained size and device max size
    // Increased minimum size for better usability
    return Math.max(35, Math.min(viewportConstrainedSize, deviceMaxSize));
};

function generateTiles(
    pieces: Piece[],
    grabPosition: Position,
    activePiece: HTMLDivElement | null,
    playerColor: TeamType,
    tileSize: number,
    lastMove?: { from: Position, to: Position }
) {
    const isWhite = playerColor === TeamType.WHITE;
    const tiles = [];

    // Loop over rows and columns in *display* order
    const rows = isWhite ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
    const cols = isWhite ? [...Array(8).keys()] : [...Array(8).keys()].reverse();

    for (let y of rows) {
        for (let x of cols) {
            const pos = new Position(x, y);
            const piece = pieces.find(p => p.samePosition(pos));
            const image = piece ? piece.image : undefined;

            const currentPiece = pieces.find(p => p.samePosition(grabPosition));
            const highlight = activePiece && currentPiece?.possibleMoves
                ? currentPiece.possibleMoves.some(p => p.equals(pos))
                : false;

            // Check if this position is part of the last move
            const isLastMoveFrom = lastMove && lastMove.from.equals(pos);
            const isLastMoveTo = lastMove && lastMove.to.equals(pos);
            const isLastMove = isLastMoveFrom || isLastMoveTo;

            // Number can be used for alternating tile color (optional)
            const number = x + y;

            tiles.push(
                <Tile
                    key={`${x},${y}`}
                    image={image}
                    number={number}
                    highlight={highlight}
                    isLastMove={isLastMove}
                    isLastMoveFrom={isLastMoveFrom}
                    tileSize={tileSize} // Pass tileSize to Tile component
                />
            );
        }
    }

    return tiles;
}

interface Props {
    playMove: (piece: Piece, destination: Position) => boolean
    pieceColor: TeamType
    pieces: Piece[],
    isGameStarted: boolean,
    lastMove?: { from: Position, to: Position }
}

export function Chessboard({ playMove, pieces, pieceColor, isGameStarted, lastMove }: Props) {
    const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
    const [activePiece, setActivePiece] = useState<HTMLDivElement | null>(null);
    const [tileSize, setTileSize] = useState<number>(getResponsiveTileSize());
    const chessboardRef = useRef<HTMLDivElement>(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setTileSize(getResponsiveTileSize());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Unified grab function for both mouse and touch
    const grabPiece = (clientX: number, clientY: number, element: HTMLDivElement) => {
        if (!isGameStarted) return;

        const chessboard = chessboardRef.current;
        if (chessboard && element.classList.contains("chess-piece")) {
            const rect = chessboard.getBoundingClientRect();

            const rawX = Math.floor((clientX - rect.left + 1) / tileSize);
            const rawY = Math.floor((clientY - rect.top) / tileSize);

            const grabX = pieceColor === TeamType.WHITE ? rawX : 7 - rawX;
            const grabY = pieceColor === TeamType.WHITE ? 7 - rawY : rawY;

            const grabPiece = pieces.find(p => p.samePosition(new Position(grabX, grabY)));
            if (!grabPiece || grabPiece.team !== pieceColor) return;

            setGrabPosition(new Position(grabX, grabY));

            // Corrected local coordinates
            let x = clientX - rect.left - tileSize / 2;
            let y = clientY - rect.top - tileSize / 2;

            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            setActivePiece(element);
        }
    };

    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        const element = e.target as HTMLDivElement;
        grabPiece(e.clientX, e.clientY, element);
    };

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        const element = e.target as HTMLDivElement;
        grabPiece(touch.clientX, touch.clientY, element);
    };

    // Unified move function for both mouse and touch
    const movePiece = (clientX: number, clientY: number) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const rect = chessboard.getBoundingClientRect();
            const offset = tileSize / 4;
            const grabOffset = tileSize / 2;

            const minX = -offset;
            const minY = -offset;
            const maxX = (tileSize * 8) - (tileSize - offset);
            const maxY = (tileSize * 8) - (tileSize - offset);

            // Convert to local coordinates first
            let x = clientX - rect.left - grabOffset;
            let y = clientY - rect.top - grabOffset;

            if (x > maxX) x = maxX;
            if (y > maxY) y = maxY;
            if (x < minX) x = minX;
            if (y < minY) y = minY;

            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        movePiece(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        movePiece(touch.clientX, touch.clientY);
    };

    // Unified drop function for both mouse and touch
    const dropPiece = (clientX: number, clientY: number) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const rect = chessboard.getBoundingClientRect();

            const rawX = Math.floor((clientX - rect.left + 1) / tileSize);
            const rawY = Math.floor((clientY - rect.top) / tileSize);

            const x = pieceColor === TeamType.WHITE ? rawX : 7 - rawX;
            const y = pieceColor === TeamType.WHITE ? 7 - rawY : rawY;

            const currentPiece = pieces.find(p => p.samePosition(grabPosition));
            if (currentPiece) {
                const success = playMove(currentPiece, new Position(x, y));
                if (!success) {
                    activePiece.style.position = "relative";
                    activePiece.style.removeProperty("left");
                    activePiece.style.removeProperty("top");
                }
            }
            setActivePiece(null);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        dropPiece(e.clientX, e.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        // Use the last known touch position or changedTouches for the end position
        const touch = e.changedTouches[0];
        dropPiece(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        if (activePiece) {
            // Mouse events
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);

            // Touch events
            document.addEventListener("touchmove", handleTouchMove, { passive: false });
            document.addEventListener("touchend", handleTouchEnd, { passive: false });
        } else {
            // Remove mouse events
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            // Remove touch events
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        }

        return () => {
            // Cleanup mouse events
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            // Cleanup touch events
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [activePiece, tileSize]);

    const board = generateTiles(pieces, grabPosition, activePiece, pieceColor, tileSize, lastMove);

    return (
        <div className="relative flex items-center justify-center min-h-0">
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                ref={chessboardRef}
                className="grid shadow-2xl rounded-lg overflow-hidden"
                style={{
                    gridTemplateColumns: `repeat(8, ${tileSize}px)`,
                    gridTemplateRows: `repeat(8, ${tileSize}px)`,
                    width: `${tileSize * 8}px`,
                    height: `${tileSize * 8}px`,
                    touchAction: 'none', // Prevent default touch behaviors
                }}
            >
                {board}
            </div>
        </div>
    );
}