import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, TILE_SIZE } from "../Constants";
import { Piece, Position } from "../models";

function generateTiles(pieces: Piece[], grabPosition: Position, activePiece: HTMLDivElement | null) {
    let cells = [];
    for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
        for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
            const number = j + i;
            let piece = pieces.find(p => p.samePosition(new Position(i, j)));
            let image = piece ? piece.image : undefined;

            let currentPiece = pieces.find(p =>
                p.samePosition(grabPosition));
            let highlight = activePiece && currentPiece?.possibleMoves
                ? currentPiece.possibleMoves.some(p => p.equals(new Position(i, j)))
                : false;

            cells.push(<Tile image={image} key={`${i},${j}`} number={number} highlight={highlight} />);
        }
    }
    return cells;
}

interface Props {
    playMove: (piece: Piece, destination: Position) => boolean
    pieces: Piece[]
}

export function Chessboard({ playMove, pieces }: Props) {
    const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
    const [activePiece, setActivePiece] = useState<HTMLDivElement | null>(null);
    const chessboardRef = useRef<HTMLDivElement>(null);

    const grabPiece = (e: React.MouseEvent) => {
        const chessboard = chessboardRef.current;
        const element = e.target as HTMLDivElement;
        if (chessboard && element.classList.contains("chess-piece")) {
            const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / TILE_SIZE);
            const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - TILE_SIZE * 8) / TILE_SIZE));
            setGrabPosition(new Position(grabX, grabY));
            let x = e.clientX - TILE_SIZE / 2;
            let y = e.clientY - TILE_SIZE / 2;
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            setActivePiece(element);
        }
    };

    const movePiece = (e: MouseEvent) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const offset = TILE_SIZE / 4; // 25 when TILE_SIZE = 100
            const grabOffset = TILE_SIZE / 2;

            const minX = chessboard.offsetLeft - offset;
            const minY = chessboard.offsetTop - offset;
            const maxX = chessboard.offsetLeft + chessboard.offsetWidth - (TILE_SIZE - offset);
            const maxY = chessboard.offsetTop + chessboard.offsetHeight - (TILE_SIZE - offset);

            let x = e.clientX - grabOffset;
            let y = e.clientY - grabOffset;

            // Clamp to bounds
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
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / TILE_SIZE);
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 8 * TILE_SIZE) / TILE_SIZE));
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

    const board = generateTiles(pieces, grabPosition, activePiece);

    return (
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
    );
}
