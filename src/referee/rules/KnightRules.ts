import {Position, Piece, TeamType} from "../../Constants";
import {tileEmptyOrOccupiedByOpponent} from "./GeneralRules";
export const knightMove = (initialPosition: Position, finalPosition: Position, boardState: Piece[], team: TeamType): boolean => {
    if(Math.abs(finalPosition.x - initialPosition.x) == 2 && Math.abs(finalPosition.y -  initialPosition.y) == 1) {
        if(tileEmptyOrOccupiedByOpponent(finalPosition.x , finalPosition.y, boardState, team)) {
            return true;
        }
    }
    if(Math.abs(finalPosition.x  -  initialPosition.x) == 1 && Math.abs(finalPosition.y - initialPosition.y) == 2) {
        if(tileEmptyOrOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
            return true;
        }
    }
    return false;
}