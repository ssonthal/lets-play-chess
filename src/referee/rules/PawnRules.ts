import { Piece, Position } from "../../models";
import { Pawn } from "../../models/Pawn";
import { TeamType } from "../../Types";
import { tileOccupied, tileOccupiedByOpponent } from "./GeneralRules";

export const pawnMove = (initialPosition: Position, finalPosition: Position, boardState: Piece[], team: TeamType): boolean  => {
    const spclRow = (team == TeamType.WHITE) ? 1 : 6;
    const pawnDirection = (team == TeamType.WHITE) ? 1 : -1;

    // movement logic
    if(initialPosition.x == finalPosition.x && initialPosition.y === spclRow && finalPosition.y - initialPosition.y == 2*pawnDirection) {
        if(!tileOccupied(finalPosition.x, finalPosition.y, boardState) && !tileOccupied(finalPosition.x, finalPosition.y - pawnDirection, boardState)) {
                return true;
        }
    }
    else if(initialPosition.x == finalPosition.x && finalPosition.y - initialPosition.y == pawnDirection) {
        if(!tileOccupied(finalPosition.x, finalPosition.y, boardState)) {
            return true;
        }
    }

    // attacking logic
    else if (finalPosition.x - initialPosition.x === 1 && finalPosition.y - initialPosition.y == pawnDirection) {
        if(tileOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
            return true;
        }
    }
    else if (finalPosition.x - initialPosition.x === -1 && finalPosition.y - initialPosition.y == pawnDirection) {
        if(tileOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
            return true;
        }
    }
    return false;
}

export const isEnPassantMove = (
    px: number,
    py: number,
    x: number,
    y: number,
    team: TeamType,
    currentBoardState: Piece[]): boolean => {
    const pawnDirection = team == TeamType.WHITE ? 1 : -1;
    if (Math.abs(x - px) === 1 && y - py === pawnDirection) {
        const piece = currentBoardState.find(p => p.position.x === x && p.position.y === y - pawnDirection && p.team !== team && (p as Pawn).enPassant === true);
        if (piece) return true;
    }
    return false;
}