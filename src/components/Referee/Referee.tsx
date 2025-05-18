import { useEffect, useRef, useState } from "react";
import { initialBoard } from "../../Constants";
import { Piece, Position, Board } from "../../models";
import { Chessboard } from "../Chessboard";
import { isEnPassantMove } from "../../referee/rules";
import { PieceType, TeamType } from "../../Types";

export default function Referee() {
    const [board, setBoard] = useState<Board>(initialBoard);
    const modalRef = useRef<HTMLDivElement>(null);
    const [promotionPawn, setPromotionPawn] = useState<Piece>()

    useEffect(() => {
        board.calculateAllMoves();
        setBoard(board);
    }, []);


    function playMove(playedPiece: Piece, destination: Position): boolean {
        if (playedPiece.possibleMoves === undefined) return false;
        const validMove = playedPiece.possibleMoves.some(p => p.equals(destination));
        if (!validMove) return false;
        const isEnPassant = isEnPassantMove(playedPiece.position.x, playedPiece.position.y, destination.x, destination.y, playedPiece.team, board.pieces);
        if (validMove || isEnPassant) {
            const newBoard = board.playMove(isEnPassant, playedPiece, destination);
            setBoard(newBoard);
            const promotionRow = playedPiece.team === TeamType.WHITE ? 7 : 0;
            if (destination.y === promotionRow && playedPiece.type === PieceType.PAWN) {
                modalRef.current?.classList.remove("hidden");
                setPromotionPawn(newBoard.pieces.find(p => p.samePosition(destination)));
            }
            return true;
        }
        return false;
    }
    function promotePawn(pieceType: PieceType) {
        if (promotionPawn === undefined) return;
        const updatedPieces = board.pieces.map(p => {
            if (p.samePiecePosition(promotionPawn)) {
                return new Piece(promotionPawn.position.clone(), pieceType, promotionPawn.team);
            }
            return p;
        });
        const updatedBoard = board.clone({ pieces: updatedPieces });
        updatedBoard.calculateAllMoves();
        setBoard(updatedBoard);
        modalRef.current?.classList.add("hidden");
    }

    function setPromotionTeam(): string {
        if (promotionPawn === undefined) return "";
        return promotionPawn.team === TeamType.WHITE ? "w" : "b";
    }
    return (
        <>
            <div className="absolute inset-0 hidden" ref={modalRef}>
                <div className="h-[300px] w-[800px] bg-[rgba(0,0,0,0.3)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-around">
                    <img onClick={() => promotePawn(PieceType.ROOK)} className="hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)] active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src={`src/assets/pieces/rook_${setPromotionTeam()}.png`}></img>
                    <img onClick={() => promotePawn(PieceType.BISHOP)} className="hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)]  active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src={`src/assets/pieces/bishop_${setPromotionTeam()}.png`}></img>
                    <img onClick={() => promotePawn(PieceType.QUEEN)} className="hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)]  active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src={`src/assets/pieces/queen_${setPromotionTeam()}.png`}></img>
                    <img onClick={() => promotePawn(PieceType.KNIGHT)} className="hover:cursor-grab hover:bg-[rgba(255,255,255,0.5)]  active:cursor-grabbing h-[_120px] rounded-[_50%] p-[_20px]" src={`src/assets/pieces/knight_${setPromotionTeam()}.png`}></img>

                </div>
            </div>
            <Chessboard
                playMove={playMove}
                pieces={board.pieces}
            />
        </>
    )
}