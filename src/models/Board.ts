import { pawnMove, rookMove, bishopMove, kingMove, isEnPassantMove, getValidKnightMoves, getValidRookMoves, getValidBishopMoves, getValidPawnMoves, getValidKingMoves} from "../referee/rules";
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
            piece.possibleMoves = this.getValidMoves(piece);
        }
        this.checkKingMoves();   
    }
    checkKingMoves() {
        const kings = this.pieces.filter(p => p.isKing);
        for(const kingPiece of kings) {
            for(const move of kingPiece.possibleMoves) {
                const simulatedBoard = this.clone();
                const pieceAtDestination = simulatedBoard.pieces.find(p => p.samePosition(move));
                if(pieceAtDestination !== undefined) {
                    simulatedBoard.pieces = simulatedBoard.pieces.filter(p => !p.samePiecePosition(pieceAtDestination));
                }
                const simulatedKing = simulatedBoard.pieces.find(p => p.isKing && p.team === kingPiece.team);
                
                simulatedKing!.position = move;
                
                let safe = true;
                for(const enemy of simulatedBoard.pieces.filter(p => p.team !== kingPiece.team)) {
                    enemy.possibleMoves = simulatedBoard.getValidMoves(enemy);
                    if(enemy.isPawn) {
                        if(enemy.possibleMoves.some(m => m.x !== simulatedKing!.position.x && m.equals(simulatedKing!.position))) {
                            safe = false;
                            break;
                        }
                    }
                    if(enemy.possibleMoves.some(m => m.equals(simulatedKing!.position))) {
                        safe = false;
                        break;
                    }
                }
                if(!safe) {
                    // remove the move from possible moves
                    kingPiece.possibleMoves = kingPiece.possibleMoves.filter(m => !m.equals(move));
                }
            }
        }
    }
    getValidMoves(piece: Piece): Position[] {
        switch(piece.type) {
            case PieceType.PAWN:
                return getValidPawnMoves(piece.position, this.pieces, piece.team);
            case PieceType.ROOK:
                return getValidRookMoves(piece.position, this.pieces, piece.team);
            case PieceType.KNIGHT:
                return getValidKnightMoves(piece.position, this.pieces, piece.team);
            case PieceType.BISHOP:
                return getValidBishopMoves(piece.position, this.pieces, piece.team);
            case PieceType.QUEEN:
                return [
                    ...getValidRookMoves(piece.position, this.pieces, piece.team),
                    ...getValidBishopMoves(piece.position, this.pieces, piece.team)
                ];
            case PieceType.KING:
                return getValidKingMoves(piece.position, this.pieces, piece.team);
            default:
                return [];
        }
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