import {TeamType} from "../../Constants";
import { Piece, Position } from "../../models";
export const tileEmptyOrOccupiedByOpponent = (x: number, y: number, boardState: Piece[], team: TeamType) : boolean => {
        const piece = boardState.find(p => p.position.equals(new Position(x, y)));
        if(piece && piece.team == team) return false;
        return true;
}
export const tileOccupied = (x: number, y: number, boardState: Piece[]) : boolean => {
        const piece = boardState.find(p => p.position.equals(new Position(x, y)));
        if(piece) return true;
        return false;
}

export const tileOccupiedByOpponent = (x: number, y: number, boardState: Piece[], team: TeamType) : boolean  => {
        const piece = boardState.find(p => p.position.equals(new Position(x, y)));
        if(piece && piece.team != team) return true;
        return false;
}