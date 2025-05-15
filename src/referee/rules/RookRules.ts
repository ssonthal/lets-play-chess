import {TeamType} from "../../Constants";
import { Piece, Position } from "../../models";
import {tileOccupied, tileEmptyOrOccupiedByOpponent} from "./GeneralRules";
export const rookMove = (initialPosition: Position, finalPosition: Position, boardState: Piece[], team: TeamType): boolean => {
    if(finalPosition.x == initialPosition.x || finalPosition.y == initialPosition.y) {
        const directionX = finalPosition.x > initialPosition.x ? 1 : -1;
        const directionY = finalPosition.y > initialPosition.y ? 1 : -1;
        const diff = finalPosition.x == initialPosition.x ? Math.abs(finalPosition.y - initialPosition.y) : Math.abs(finalPosition.x - initialPosition.x);
        for(let i = 1; i < diff; i++) {
            if(finalPosition.x == initialPosition.x) {
                if(tileOccupied(initialPosition.x, initialPosition.y + i*directionY, boardState)) {
                            return false;
                }
            } else if(finalPosition.y == initialPosition.y) {
                        if(tileOccupied(initialPosition.x + i*directionX, initialPosition.y, boardState)) {
                            return false;
                        }
                    }
        }
        if(tileEmptyOrOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
            return true;
        }
    }
    return false;
}