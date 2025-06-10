import { Piece, Position } from "../../models";
import { PieceType, TeamType } from "../../Types";
import { bishopMove } from "./BishopRules";
import { kingMove } from "./KingRules";
import { knightMove } from "./KnightRules";
import { pawnMove } from "./PawnRules";
import { rookMove } from "./RookRules";

export const isValidMove = (initialPosition: Position, finalPosition: Position, type: PieceType, team: TeamType, currentBoardState: Piece[]): boolean => {
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
export const tileEmptyOrOccupiedByOpponent = (x: number, y: number, boardState: Piece[], team: TeamType) : boolean => {
        const piece = boardState.find(p => p.samePosition(new Position(x, y)));
        if(piece && piece.team == team) return false;
        return true;
}
export const tileOccupied = (x: number, y: number, boardState: Piece[]) : boolean => {
        const piece = boardState.find(p => p.samePosition(new Position(x, y)));
        if(piece) return true;
        return false;
}

export const tileOccupiedByOpponent = (x: number, y: number, boardState: Piece[], team: TeamType) : boolean  => {
        const piece = boardState.find(p => p.samePosition(new Position(x, y)));
        if(piece && piece.team != team) return true;
        return false;
}