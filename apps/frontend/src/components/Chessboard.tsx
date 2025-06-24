import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import { TILE_SIZE } from "../Constants";
import { Piece, Position } from "@letsplaychess/models";
import { TeamType } from "@letsplaychess/types";


function generateTiles(
    pieces: Piece[],
    grabPosition: Position,
    activePiece: HTMLDivElement | null,
    playerColor: TeamType
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

            // Number can be used for alternating tile color (optional)
            const number = x + y;

            tiles.push(
                <Tile
                    key={`${x},${y}`}
                    image={image}
                    number={number}
                    highlight={highlight}
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
    isGameStarted: boolean
}

export function Chessboard({ playMove, pieces, pieceColor, isGameStarted }: Props) {
    const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
    const [activePiece, setActivePiece] = useState<HTMLDivElement | null>(null);
    const chessboardRef = useRef<HTMLDivElement>(null);

    const grabPiece = (e: React.MouseEvent) => {
        if (!isGameStarted) return;

        const chessboard = chessboardRef.current;
        const element = e.target as HTMLDivElement;
        if (chessboard && element.classList.contains("chess-piece")) {
            const rect = chessboard.getBoundingClientRect();

            const rawX = Math.floor((e.clientX - rect.left + 1) / TILE_SIZE);
            const rawY = Math.floor((e.clientY - rect.top) / TILE_SIZE);

            const grabX = pieceColor === TeamType.WHITE ? rawX : 7 - rawX;
            const grabY = pieceColor === TeamType.WHITE ? 7 - rawY : rawY;

            const grabPiece = pieces.find(p => p.samePosition(new Position(grabX, grabY)));
            if (!grabPiece || grabPiece.team !== pieceColor) return;

            setGrabPosition(new Position(grabX, grabY));

            // ✅ Corrected local coordinates
            let x = e.clientX - rect.left - TILE_SIZE / 2;
            let y = e.clientY - rect.top - TILE_SIZE / 2;

            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.zIndex = "1000";

            setActivePiece(element);
        }
    };

    const movePiece = (e: MouseEvent) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const rect = chessboard.getBoundingClientRect();
            const offset = TILE_SIZE / 4;
            const grabOffset = TILE_SIZE / 2;

            const minX = -offset;
            const minY = -offset;
            const maxX = (TILE_SIZE * 8) - (TILE_SIZE - offset);
            const maxY = (TILE_SIZE * 8) - (TILE_SIZE - offset);

            // ✅ FIXED: Convert to local coordinates first
            let x = e.clientX - rect.left - grabOffset;
            let y = e.clientY - rect.top - grabOffset;

            if (x > maxX) x = maxX;
            if (y > maxY) y = maxY;
            if (x < minX) x = minX;
            if (y < minY) y = minY;

            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
        }
    };

    const dropPiece = (e: MouseEvent) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const rect = chessboard.getBoundingClientRect();

            const rawX = Math.floor((e.clientX - rect.left + 1) / TILE_SIZE);
            const rawY = Math.floor((e.clientY - rect.top) / TILE_SIZE);

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

    useEffect(() => {
        if (activePiece) {
            document.addEventListener("mousemove", movePiece);
            document.addEventListener("mouseup", dropPiece);
        } else {
            document.removeEventListener("mousemove", movePiece);
            document.removeEventListener("mouseup", dropPiece);
        }

        return () => {
            document.removeEventListener("mousemove", movePiece);
            document.removeEventListener("mouseup", dropPiece);
        };
    }, [activePiece]);

    const board = generateTiles(pieces, grabPosition, activePiece, pieceColor);
    return (
        <div className="relative">
            <div
                onMouseDown={grabPiece}
                ref={chessboardRef}
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(8, ${TILE_SIZE}px)`,
                    gridTemplateRows: `repeat(8, ${TILE_SIZE}px)`,
                    width: `${TILE_SIZE * 8}px`,
                    height: `${TILE_SIZE * 8}px`,
                }}
            >
                {board}
            </div>
        </div>
    );
}