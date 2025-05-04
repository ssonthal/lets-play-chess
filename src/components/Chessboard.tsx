import React, {useMemo, useRef, useState } from "react";
import Referee from "../referee/Referee";
import Tile from "./Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, INITIAL_STATE, GRID_SIZE,PieceType, TeamType, Piece, Position, samePosition} from "../Constants";

function generateTiles(pieces: Piece[]) {
    let cells = [];
        for(let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
            for(let i = 0; i < HORIZONTAL_AXIS.length; i++) {
                const number = j + i;
                let piece = pieces.find(p => samePosition(p.position, {x: i, y: j}));
                let image = piece ? piece.image : undefined;
                cells.push(<Tile image = {image} key = {`${i},${j}`}number = {number} />);
            }
        }
        return cells;
}

export function Chessboard() {
    const [grabPosition, setGrabPosition] = useState<Position>({x : -1, y: -1});
    const [pieces, setPieces] = useState<Piece[]>(INITIAL_STATE);
    const chessboardRef = useRef<HTMLDivElement>(null);
    const [activePiece, setActivePiece]= useState<HTMLDivElement | null>(null);
    const referee = new Referee();
    const grabPiece = (e: React.MouseEvent) => {
        const chessboard = chessboardRef.current;
        const element = e.target as HTMLDivElement;
        if (chessboard && element.classList.contains("chess-piece")) {
            const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
            const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
            setGrabPosition({x: grabX, y: grabY});
            let x  = e.clientX - GRID_SIZE/2;
            let y  = e.clientY - GRID_SIZE/2;
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
            let x = e.clientX - GRID_SIZE/2;
            let y = e.clientY - GRID_SIZE/2;

            if(x > maxX) x = maxX;
            if(y > maxY) y = maxY;
            if(x < minX) x = minX;
            if(y < minY) y = minY;

            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
            setActivePiece(activePiece)
        }
    }

    const dropPiece = (e: React.MouseEvent)  => {
        const chessboard = chessboardRef.current;
        if(activePiece && chessboard) {
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
            const currentPiece = pieces.find(p => samePosition(p.position, grabPosition));
            if(currentPiece) {
                const validMove = referee.isValidMove(grabPosition.x, grabPosition.y, x, y, currentPiece.type, currentPiece.team, pieces);
                const isEnPassantMove = referee.isEnPassantMove(grabPosition.x, grabPosition.y,x, y, currentPiece.type, currentPiece.team, pieces);
                const pawnDirection = currentPiece.team == TeamType.WHITE ? 1 : -1;
                if(isEnPassantMove) {
                        const updatedPieces = pieces.reduce((results, piece) => {
                            if(samePosition(grabPosition, piece.position)) {
                                piece.enPassant = false;
                                piece.position.x = x;
                                piece.position.y = y;
                                results.push(piece);
                            } else if(
                                !(samePosition(piece.position, {x: x, y: y - pawnDirection}))) {
                                piece.enPassant = false;
                                results.push(piece);
                            }
                            return results;
                        }, [] as Piece[]);
                        setPieces(updatedPieces);
                } else if(validMove) {
                    const updatedPieces = pieces.reduce((results, piece) => {
                            if(samePosition(piece.position, grabPosition)) {
                                piece.enPassant = Math.abs(grabPosition.y - y) == 2 && piece.type == PieceType.PAWN;
                                piece.position.x = x;
                                piece.position.y = y;
                                results.push(piece);
                            } else if(!(samePosition(piece.position, {x, y}))) {
                                piece.enPassant = false;
                                results.push(piece);
                            }
                            return results;
                        }, [] as Piece[]);
                    setPieces(updatedPieces);
                }
                else {
                    activePiece.style.position = "relative"
                    activePiece.style.removeProperty("left");
                    activePiece.style.removeProperty("top");
                }
            }
            setActivePiece(null);
        }
    }
    let board = useMemo(() => generateTiles(pieces), [pieces]);
    return (
        <div 
        onMouseDown = {e => grabPiece(e)}
        onMouseMove = {e => movePiece(e)}
        onMouseUp = {e => dropPiece(e)}
        ref = {chessboardRef}
        className = "grid grid-cols-[repeat(8,_100px)] grid-rows-[repeat(8,_100px)] w-[800px] h-[800px]">
            {board}
        </div>
    )
}