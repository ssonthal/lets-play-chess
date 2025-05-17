import { pawnMove, rookMove, bishopMove, kingMove, knightMove, isEnPassantMove} from "../referee/rules";
import { PieceType, TeamType } from "../Types";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Board {
    pieces: Piece[];
    constructor(pieces: Piece[]) {
        this.pieces = pieces;
    }
    calculateAllMoves() {
        for(const piece of this.pieces) {
            piece.possibleMoves = this.getValidMoves(piece.position, piece.type, piece.team, this.pieces);
        }
    }
    getValidMoves(initialPosition: Position, type: PieceType, team: TeamType, currentBoardState: Piece[]): Position[] {
        const validMoves: Position[] = [];
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (x == initialPosition.x && y == initialPosition.y) continue
                const finalPosition = new Position(x, y);
                switch(type) {
                    case PieceType.PAWN:
                        if(pawnMove(initialPosition, finalPosition, currentBoardState, team) || isEnPassantMove(initialPosition.x, initialPosition.y, finalPosition.x, finalPosition.y, team, currentBoardState)) {validMoves.push(finalPosition)}
                        break;
                    case PieceType.ROOK:
                        if(rookMove(initialPosition, finalPosition, currentBoardState, team)) {validMoves.push(finalPosition)}
                        break;
                    case PieceType.KNIGHT:
                        if(knightMove(initialPosition, finalPosition, currentBoardState, team)) {validMoves.push(finalPosition)}
                        break;
                    case PieceType.BISHOP:
                        if(bishopMove(initialPosition, finalPosition, currentBoardState, team)) {validMoves.push(finalPosition)}
                        break;
                    case PieceType.QUEEN:
                        if(rookMove(initialPosition, finalPosition, currentBoardState, team) || bishopMove(initialPosition, finalPosition, currentBoardState, team)) {validMoves.push(finalPosition)}
                        break;
                    case PieceType.KING:
                        if(kingMove(initialPosition, finalPosition, currentBoardState, team)) {validMoves.push(finalPosition)}
                        break;
                }
            }
        }
        return validMoves;
    }
    playMove(isEnPassant: boolean, playedPiece: Piece, destination: Position) : Board {
        const clonedBoard = this.clone();
        // special case for an en passant move
        if (isEnPassant) {
            const pawnDirection = playedPiece.team == TeamType.WHITE ? 1 : -1;
            clonedBoard.pieces  = clonedBoard.pieces.map(p => {
                const isSamePiece = p.samePiecePosition(playedPiece);
                const isOneRowBack = p.samePosition(new Position(destination.x, destination.y - pawnDirection));
                
                // updating the position of the moved pawn
                if (isSamePiece && p.isPawn) {
                    const newPosition = new Position(destination.x, destination.y);
                    const updatedPiece = (p as Pawn).clone({
                        position: newPosition,
                        enPassant: false
                    });
                    return updatedPiece;
                // removing the piece that was captured
                } else if (isOneRowBack) {
                    return null;
                }
                if (p.isPawn) {
                    return (p as Pawn).clone({ enPassant: false });
                }
                return p.clone();
            }).filter(p => p !== null);
        } else {
            clonedBoard.pieces = clonedBoard.pieces
            .map(p => {
                const isSamePiece = p.samePiecePosition(playedPiece);
                const isDestination = p.samePosition(destination);
                // updating the location of the moved piece
                if (isSamePiece) {
                    const newPosition = new Position(destination.x, destination.y);
                    const shouldEnPassant = Math.abs(destination.y - p.position.y) === 2;
                    let updatedPiece = p.clone({ position: newPosition });
                    if (p.isPawn) {
                        updatedPiece = (p as Pawn).clone({
                            position: newPosition,
                            enPassant: shouldEnPassant
                        });
                    }
                    return updatedPiece;
                }
                // removing the capture piece
                else if (isDestination) {
                    return null;
                }
                if (p.isPawn) {
                    return (p as Pawn).clone({
                        enPassant: false
                    })
                }
                return p.clone();
            }).filter(p => p !== null);
        }
        clonedBoard.calculateAllMoves();
        return clonedBoard;
    }
    clone({ pieces }: { pieces: Piece[] } = { pieces: this.pieces }) {
        const clonedPieces = pieces.map(p => p.clone());
        return new Board(clonedPieces);
    }
}