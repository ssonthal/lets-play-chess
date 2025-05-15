import React, { useRef, useState } from "react";
import Tile from "./Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../Constants";
import { Piece, Position } from "../models";
function generateTiles(pieces: Piece[], grabPosition: Position, activePiece: HTMLDivElement | null) {
    let cells = [];
    for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
        for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
            const number = j + i;
            let piece = pieces.find(p => p.position.equals(new Position(i, j)));
            let image = piece ? piece.image : undefined;

            let currentPiece = pieces.find(p =>
                p.position.equals(grabPosition));
            let highlight = activePiece && currentPiece?.possibleMoves ? currentPiece.possibleMoves.some(p => p.equals(new Position(i, j))) : false;
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
    const chessboardRef = useRef<HTMLDivElement>(null);
    const [activePiece, setActivePiece] = useState<HTMLDivElement | null>(null);
    const grabPiece = (e: React.MouseEvent) => {
        const chessboard = chessboardRef.current;
        const element = e.target as HTMLDivElement;
        if (chessboard && element.classList.contains("chess-piece")) {
            const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
            const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
            setGrabPosition(new Position(grabX, grabY));
            let x = e.clientX - GRID_SIZE / 2;
            let y = e.clientY - GRID_SIZE / 2;
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            setActivePiece(element);
        }
    }
    const movePiece = (e: React.MouseEvent) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            let minX = chessboard.offsetLeft - 25;
            let minY = chessboard.offsetTop - 25;
            let maxX = chessboard.offsetLeft + chessboard.offsetWidth - 75;
            let maxY = chessboard.offsetTop + chessboard.offsetHeight - 75;
            let x = e.clientX - GRID_SIZE / 2;
            let y = e.clientY - GRID_SIZE / 2;

            if (x > maxX) x = maxX;
            if (y > maxY) y = maxY;
            if (x < minX) x = minX;
            if (y < minY) y = minY;

            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
            setActivePiece(activePiece);
        }
    }

    const dropPiece = (e: React.MouseEvent) => {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
            const currentPiece = pieces.find(p => p.position.equals(grabPosition));
            if (currentPiece) {
                var success = playMove(currentPiece, new Position(x, y));
                if (!success) {
                    activePiece.style.position = "relative"
                    activePiece.style.removeProperty("left");
                    activePiece.style.removeProperty("top");
                }
            }
            setActivePiece(null);
        }
    }
    const board = generateTiles(pieces, grabPosition, activePiece);
    return (
        <>

            <div
                onMouseDown={e => grabPiece(e)}
                onMouseMove={e => movePiece(e)}
                onMouseUp={e => dropPiece(e)}
                ref={chessboardRef}
                className="grid grid-cols-[repeat(8,_100px)] grid-rows-[repeat(8,_100px)] w-[800px] h-[800px]">
                {board}
            </div>
        </>
    )
}