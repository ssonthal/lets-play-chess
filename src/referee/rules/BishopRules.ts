import { Piece, Position } from '../../models';
import { TeamType } from '../../Types';
import {tileOccupied, tileEmptyOrOccupiedByOpponent} from './GeneralRules';
export const bishopMove = (initialPosition: Position, finalPosition: Position, boardState: Piece[], team: TeamType): boolean => {
    if(Math.abs(finalPosition.x - initialPosition.x) == Math.abs(finalPosition.y - initialPosition.y)) {
            const directionX = finalPosition.x > initialPosition.x ? 1 : -1;
            const directionY = finalPosition.y > initialPosition.y ? 1 : -1;
            for(let i = 1; i < Math.abs(finalPosition.x - initialPosition.x); i++) {
                if(tileOccupied(initialPosition.x + i * directionX, initialPosition.y + i * directionY, boardState)) {
                    return false;
                }
            }
            if(tileEmptyOrOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
                return true;
            }
        }
    return false;
}