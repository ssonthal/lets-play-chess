import React, {useMemo, useRef, useState } from "react";
import Referee from "../referee/Referee";
import Tile from "./Tile";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export interface Piece {
    image: string
    x: number
    y: number
    type: PieceType, 
    team: TeamType
}

export enum PieceType {
    PAWN = "pawn",
    KNIGHT = "knight",
    BISHOP = "bishop",
    ROOK = "rook",
    QUEEN = "queen",
    KING = "king"
}

export enum TeamType {
    BLACK = "black",
    WHITE = "white"
}

const initialPiecesState: Piece[] = [];
for(let p = 0; p < 2; p++) {
    const teamType = (p == 0) ? TeamType.BLACK : TeamType.WHITE;
    const type = (p == 0) ? "b" : "w";
    const y = (p == 0) ? 7 : 0;
        initialPiecesState.push({image: `src/assets/rook_${type}.png`, x: 7, y: y, type: PieceType.ROOK, team: teamType})
        initialPiecesState.push({image: `src/assets/rook_${type}.png`, x: 0, y: y, type: PieceType.ROOK, team: teamType})
        initialPiecesState.push({image: `src/assets/knight_${type}.png`, x: 1, y: y, type:PieceType.KNIGHT, team: teamType})
        initialPiecesState.push({image: `src/assets/knight_${type}.png`, x: 6, y: y, type: PieceType.KNIGHT, team: teamType})
        initialPiecesState.push({image: `src/assets/bishop_${type}.png`, x: 2, y: y, type:PieceType.BISHOP, team: teamType})
        initialPiecesState.push({image: `src/assets/bishop_${type}.png`, x: 5, y: y, type: PieceType.BISHOP, team: teamType})
        initialPiecesState.push({image: `src/assets/queen_${type}.png`, x: 3, y: y, type: PieceType.QUEEN, team: teamType});
        initialPiecesState.push({image: `src/assets/king_${type}.png`, x: 4, y: y, type: PieceType.KING, team: teamType});
    }
for(let i = 0; i < 8; i++) {
    initialPiecesState.push({image: `src/assets/pawn_w.png`, x: i, y: 1, type: PieceType.PAWN, team: TeamType.WHITE});
}
for(let i = 0; i < 8; i++) {
    initialPiecesState.push({image: `src/assets/pawn_b.png`, x: i, y: 6, type: PieceType.PAWN, team: TeamType.BLACK});
}
function generateTiles(pieces: Piece[]) {
    let cells = [];
        for(let j = verticalAxis.length - 1; j >= 0; j--) {
            for(let i = 0; i < horizontalAxis.length; i++) {
                const number = j + i;
                let image:string = "";
                pieces.forEach(p => {
                    p.x == i && p.y == j ? image = p.image : null
                })
                if(number % 2 == 0) {
                    cells.push(<Tile image = {image}variant = "black" key = {`${i},${j}`}/>)
                }
                else {
                    cells.push(<Tile image = {image} variant = "white" key = {`${i},${j}`}/>)
                }
            }
        }
        return cells;
}

export function Chessboard() {
    const [gridX, setGridX] = useState(0);
    const [gridY, setGridY] = useState(0);
    const [pieces, setPieces] = useState<Piece[]>(initialPiecesState);
    const chessboardRef = useRef<HTMLDivElement>(null);
    const [activePiece, setActivePiece]= useState<HTMLDivElement | null>(null);
    const referee = new Referee();
    const grabPiece = (e: React.MouseEvent) => {
        const chessboard = chessboardRef.current;
        const element = e.target as HTMLDivElement;
        if (chessboard && element.classList.contains("chess-piece")) {

            setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
            setGridY(Math.abs(Math.ceil((e.clientY - chessboard.offsetTop) / 100) - 8));

            let x  = e.clientX - 50;
            let y  = e.clientY - 50;
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
            let x = e.clientX - 50;
            let y = e.clientY - 50;

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
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop- 800) / 100));
            
            setPieces((value) => {
                const pieces = value.map(p => {
                    if(p.x == gridX && p.y == gridY) {
                        if(referee.isValidMove(gridX, gridY, x, y, p.type, p.team, value)) {
                            p.x = x;
                            p.y = y;
                        }
                        else {
                            activePiece.style.position = "relative";
                            activePiece.style.removeProperty("top");
                            activePiece.style.removeProperty("left");
                        }
                    }
                    return p;
                })
                return pieces;
            })
            setActivePiece(null);
        }
    }
    const board:any = useMemo(() => {
        return generateTiles(pieces);
    }, [pieces]);
    
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