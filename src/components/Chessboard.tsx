import React, { useMemo } from "react";
import Tile from "./Tile";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
    image: string
    x: number
    y: number
}
// const pieceRef = useRef<HTMLDivElement | null>(null);
const pieces: Piece[] = [];
for(let p = 0; p < 2; p++) {
    const type = (p == 0) ? "b" : "w";
    const y = (p == 0) ? 7 : 0;
    pieces.push({image: `src/assets/rook_${type}.png`, x: 7, y: y});
    pieces.push({image: `src/assets/rook_${type}.png`, x: 0, y: y});
    pieces.push({image: `src/assets/knight_${type}.png`, x: 1, y: y});
    pieces.push({image: `src/assets/knight_${type}.png`, x: 6, y: y});
    pieces.push({image: `src/assets/bishop_${type}.png`, x: 2, y: y});
    pieces.push({image: `src/assets/bishop_${type}.png`, x: 5, y: y});
    pieces.push({image: `src/assets/queen_${type}.png`, x: 3, y: y});
    pieces.push({image: `src/assets/king_${type}.png`, x: 4, y: y});
}
for(let i = 0; i < 8; i++) {
    pieces.push({image: `src/assets/pawn_w.png`, x: i, y: 1});
}
for(let i = 0; i < 8; i++) {
    pieces.push({image: `src/assets/pawn_b.png`, x: i, y: 6});
}

let offsetX = 0;
let offsetY = 0;

function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLDivElement;

    if (element.classList.contains("chess-piece")) {
        // pieceRef.current = element;
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        element.style.position = "absolute";
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }
}

export function Chessboard() {
    const board:any = useMemo(() => {
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
    }, [verticalAxis, horizontalAxis]);
    


    return (
        <div 
        onMouseDown = {e => grabPiece(e)}
        className = "grid grid-cols-[repeat(8,_100px)] grid-rows-[repeat(8,_100px)] w-[800px] h-[800px]">
            {board}
        </div>
    )
}