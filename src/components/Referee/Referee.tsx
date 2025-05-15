import { useEffect, useRef, useState } from "react";
import { INITIAL_STATE, PieceType, samePosition, TeamType } from "../../Constants";
import { Piece, Position } from "../../models";
import { Chessboard } from "../Chessboard";
import { bishopMove, kingMove, knightMove, pawnMove, rookMove } from "../../referee/rules";

export default function Referee() {
    const [pieces, setPieces] = useState<Piece[]>(INITIAL_STATE);
    const modalRef = useRef<HTMLDivElement>(null);
    const [promotionPawn, setPromotionPawn] = useState<Piece>()

    useEffect(() => {
        const updatedPieces = pieces.map(p => ({
            ...p,
            possibleMoves: getValidMoves(p.position, p.type, p.team, pieces)
        }));
        setPieces(updatedPieces);
    }, []);

    function getValidMoves(initialPosition: Position, type: PieceType, team: TeamType, currentBoardState: Piece[]): Position[] {
        const validMoves: Position[] = [];
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (x == initialPosition.x && y == initialPosition.y) continue
                const finalPosition = { x: x, y: y };
                if (isValidMove(initialPosition, finalPosition, type, team, currentBoardState) || (type == PieceType.PAWN && isEnPassantMove(initialPosition.x, initialPosition.y, x, y, type, team, currentBoardState))) {
                    validMoves.push(finalPosition);
                }
            }
        }
        return validMoves;
    }
    function isValidMove(initialPosition: Position, finalPosition: Position, type: PieceType, team: TeamType, currentBoardState: Piece[]): boolean {
        if (type == PieceType.PAWN) {
            return pawnMove(initialPosition, finalPosition, currentBoardState, team);
        } else if (type == PieceType.KNIGHT) {
            return knightMove(initialPosition, finalPosition, currentBoardState, team);
        } else if (type == PieceType.BISHOP) {
            return bishopMove(initialPosition, finalPosition, currentBoardState, team);
        } else if (type == PieceType.ROOK) {
            return rookMove(initialPosition, finalPosition, currentBoardState, team);
        } else if (type == PieceType.QUEEN) {
            return rookMove(initialPosition, finalPosition, currentBoardState, team) || bishopMove(initialPosition, finalPosition, currentBoardState, team);
        } else if (type == PieceType.KING) {
            return kingMove(initialPosition, finalPosition, currentBoardState, team);
        }
        return false;
    }
    function isEnPassantMove(
        px: number,
        py: number,
        x: number,
        y: number,
        type: PieceType,
        team: TeamType,
        currentBoardState: Piece[]): boolean {
        if (type != PieceType.PAWN) return false;
        const pawnDirection = team == TeamType.WHITE ? 1 : -1;
        if (Math.abs(x - px) === 1 && y - py === pawnDirection) {
            const piece = currentBoardState.find(p => p.position.x === x && p.position.y === y - pawnDirection && p.team !== team && p.enPassant === true);
            if (piece) return true;
        }
        return false;
    }
    function playMove(piece: Piece, destination: Position): boolean {
        const validMove = isValidMove(piece.position, destination, piece.type, piece.team, pieces);
        const isEnPassant = isEnPassantMove(piece.position.x, piece.position.y, destination.x, destination.y, piece.type, piece.team, pieces);
        if (isEnPassant) {
            const updatedPieces = pieces.map(p => {
                const isSamePiece = samePosition(p.position, piece.position);
                const isDestination = samePosition(p.position, destination);

                if (isSamePiece) {
                    const newPosition = { x: destination.x, y: destination.y };
                    const updatedPiece = {
                        ...p,
                        position: newPosition,
                        enPassant: false
                    };
                    return updatedPiece;
                } else if (isDestination) {
                    return null;
                }
                return {
                    ...p,
                    enPassant: false
                };
            }).filter(p => p !== null)

            const finalUpdatedPieces = updatedPieces.map(p => {
                return {
                    ...p,
                    possibleMoves: getValidMoves(p.position, p.type, p.team, updatedPieces)
                }
            })
            setPieces(finalUpdatedPieces);
        } else if (validMove) {
            const updatedPieces = pieces
                .map(p => {
                    const isSamePiece = samePosition(piece.position, p.position);
                    const isDestination = samePosition(p.position, destination);
                    const isPawn = p.type === PieceType.PAWN;

                    if (isSamePiece) {
                        const newPosition = { x: destination.x, y: destination.y };
                        const shouldEnPassant = Math.abs(destination.y - p.position.y) === 2 && isPawn;

                        const updatedPiece = {
                            ...p,
                            position: newPosition,
                            enPassant: shouldEnPassant
                        };
                        const promotionRow = p.team === TeamType.WHITE ? 7 : 0;
                        if (isPawn && destination.y === promotionRow) {
                            modalRef.current?.classList.remove("hidden");
                            setPromotionPawn(updatedPiece);
                        }
                        return updatedPiece;
                    }
                    if (isDestination) {
                        return null;
                    }
                    return {
                        ...p,
                        enPassant: false
                    };
                }).filter(p => p !== null);

            const finalUpdatedPieces = updatedPieces.map(p => {
                return {
                    ...p,
                    possibleMoves: getValidMoves(p.position, p.type, p.team, updatedPieces)
                }
            });
            setPieces(finalUpdatedPieces);
        } else {
            return false;
        }
        return true;
    }
    function promotePawn(pieceType: PieceType) {
        if (promotionPawn === undefined) return;
        const teamType = promotionPawn.team == TeamType.WHITE ? "w" : "b";
        const updatedPieces = pieces.map(p => {
            if (samePosition(p.position, promotionPawn.position)) {
                const updatedPiece = {
                    ...p,
                    type: pieceType,
                    image: `src/assets/pieces/${pieceType}_${teamType}.png`
                };
                return updatedPiece;
            }
            return p;
        });
        const finalUpdatedPieces = updatedPieces.map(p => {
            return {
                ...p,
                possibleMoves: getValidMoves(p.position, p.type, p.team, updatedPieces)
            }
        })
        setPieces(finalUpdatedPieces);
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
                pieces={pieces}
            />
        </>
    )
}