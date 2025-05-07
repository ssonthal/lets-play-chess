import { Piece, PieceType, Position, TeamType } from "../Constants";
import {pawnMove, rookMove, kingMove, bishopMove, knightMove} from "./rules";
export default class Referee {
    isEnPassantMove(
        px: number, 
        py: number,
        x: number, 
        y: number, 
        type: PieceType, 
        team: TeamType, 
        boardState: Piece[]) : boolean {
            if(type != PieceType.PAWN) return false;
            const pawnDirection = team == TeamType.WHITE ? 1 : -1;
            if (Math.abs(x - px) === 1 && y - py === pawnDirection) {
                const piece = boardState.find(p => p.position.x === x && p.position.y === y -   pawnDirection && p.team !== team && p.enPassant === true);
                if(piece) return true; 
            }
            return false;
    }
    isValidMove(initialPosition: Position, finalPosition:Position, type: PieceType, team: TeamType, boardState: Piece[]) : boolean {
        if(type == PieceType.PAWN) {
            return  pawnMove(initialPosition, finalPosition, boardState, team);
        } else if (type == PieceType.KNIGHT) {
            return knightMove(initialPosition, finalPosition, boardState, team);
        } else if(type == PieceType.BISHOP) {
            return bishopMove(initialPosition, finalPosition, boardState, team);
        } else if(type == PieceType.ROOK) {
            return rookMove(initialPosition, finalPosition, boardState, team);
        } else if(type == PieceType.QUEEN) {
            return rookMove(initialPosition, finalPosition, boardState, team) || bishopMove(initialPosition, finalPosition, boardState, team);
        } else if(type == PieceType.KING) {
            return kingMove(initialPosition, finalPosition, boardState, team);
        }
        return false;
    }
    isPawnPromotion(finalPosition: Position, team: TeamType) : boolean {
        return team == TeamType.WHITE && finalPosition.y == 0 || team == TeamType.BLACK && finalPosition.y == 7;
    }
}