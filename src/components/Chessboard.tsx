import React, {useMemo, useRef, useState } from "react";
import Referee from "../referee/Referee";
import Tile from "./Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, INITIAL_STATE, GRID_SIZE,PieceType, TeamType, Piece, Position, samePosition} from "../Constants";
function generateTiles(pieces: Piece[], grabPosition: Position, activePiece: HTMLDivElement | null) {
    let cells = [];
        for(let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
            for(let i = 0; i < HORIZONTAL_AXIS.length; i++) {
                const number = j + i;
                let piece = pieces.find(p => samePosition(p.position, {x: i, y: j}));
                let image = piece ? piece.image : undefined;

                let currentPiece = pieces.find(p => samePosition(p.position, grabPosition));
                let highlight = activePiece && currentPiece?.possibleMoves ? currentPiece.possibleMoves.some(p => samePosition(p, {x: i, y: j})) : false;
                cells.push(<Tile image = {image} key = {`${i},${j}`}number = {number} highlight = {highlight}/>);
            }
        }
        return cells;
}

export function Chessboard() {
    const [grabPosition, setGrabPosition] = useState<Position>({x : -1, y: -1});
    const [pieces, setPieces] = useState<Piece[]>(INITIAL_STATE);
    const chessboardRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [promotionPawn, setPromotionPawn] = useState<Piece>()
    const [activePiece, setActivePiece]= useState<HTMLDivElement | null>(null);
    const referee = new Referee();
    const updateValidMoves = ()  => {
                const updatedPieces = pieces.map(p => {
            p.possibleMoves = referee.getValidMoves(p.position, p.type, p.team, pieces);
            return p;
        });
        setPieces(updatedPieces);
    }
    const grabPiece = (e: React.MouseEvent) => {
        updateValidMoves();
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
                const validMove = referee.isValidMove(grabPosition, {x: x, y: y}, currentPiece.type, currentPiece.team, pieces);
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
                                if(piece.type == PieceType.PAWN) {
                                    let promotion_row = piece.team == TeamType.WHITE ? 7: 0; 
                                    if(y == promotion_row) {
                                        modalRef.current?.classList.remove("hidden");
                                        setPromotionPawn(piece);
                                    }
                                }
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
    let board = useMemo(() => generateTiles(pieces, grabPosition, activePiece), [pieces, activePiece]);
    const promotePawn = (pieceType:  PieceType) => {
        if(promotionPawn === undefined)return;
        const updatedPieces = pieces.reduce((results, piece) => {
            if(samePosition(piece.position, promotionPawn.position)) {
                piece.type = pieceType;
                const teamType = promotionPawn.team == TeamType.WHITE ? "w" : "b";
                piece.image = `src/assets/pieces/${pieceType}_${teamType}.png`;
            }
            results.push(piece);
            return results;
        }, [] as Piece[]);
        setPieces(updatedPieces);
        modalRef.current?.classList.add("hidden");
    }

    const setPromotionTeam = () : string => {
        if(promotionPawn === undefined) return "";
        return promotionPawn.team === TeamType.WHITE ? "w" : "b";
    }
    return (
        <>
        <div className = "absolute inset-0 hidden" ref = {modalRef}>
            <div className = "h-[300px] w-[800px] bg-[rgba(0,0,0,0.3)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-around">
                <img onClick = {() => promotePawn(PieceType.ROOK)}className = "hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)] active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src = {`src/assets/pieces/rook_${setPromotionTeam()}.png`}></img>
                <img onClick = {() => promotePawn(PieceType.BISHOP)} className = "hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)]  active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src = {`src/assets/pieces/bishop_${setPromotionTeam()}.png`}></img>
                <img onClick = {() => promotePawn(PieceType.QUEEN)} className = "hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)]  active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src = {`src/assets/pieces/queen_${setPromotionTeam()}.png`}></img>
                <img onClick = {() => promotePawn(PieceType.KNIGHT)} className = "hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)]  active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src = {`src/assets/pieces/knight_${setPromotionTeam()}.png`}></img>

            </div>

        </div>
        <div 
            onMouseDown = {e => grabPiece(e)}
            onMouseMove = {e => movePiece(e)}
            onMouseUp = {e => dropPiece(e)}
            ref = {chessboardRef}
            className = "grid grid-cols-[repeat(8,_100px)] grid-rows-[repeat(8,_100px)] w-[800px] h-[800px]">
                {board}
        </div>
        </>
    )
}