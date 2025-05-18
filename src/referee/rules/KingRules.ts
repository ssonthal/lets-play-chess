import { Piece, Position} from "../../models";
import { TeamType } from "../../Types";
import {tileEmptyOrOccupiedByOpponent } from "./GeneralRules";

export const kingMove = (initialPosition: Position, finalPosition: Position, boardState: Piece[], team: TeamType): boolean  => {
        if(Math.abs(finalPosition.x - initialPosition.x) <= 1 && Math.abs(finalPosition.y - initialPosition.y) <= 1) {
            if(tileEmptyOrOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
                return true;
            }
        }
        return false;
}

export const getValidKingMoves = (
    initialPosition: Position,
    boardState: Piece[],
    team: TeamType 
) : Position[] => {
    const validMoves: Position[] = [];

    const directions = [ 
        [-1, 0], // left 
        [1, 0], // right
        [0, 1], // uop
        [0, -1], // down
        [-1, 1], // top left 
        [1, -1], // bottom right 
        [-1, -1], // bottom left 
        [1, 1] // top right
    ];

    for (const dir of directions) {
        let x = initialPosition.x + dir[0];
        let y = initialPosition.y + dir[1];
        if(x >= 0 && x < 8 && y >= 0 && y < 8) {
            if(tileEmptyOrOccupiedByOpponent(x, y, boardState, team)) {
                validMoves.push(new Position(x, y));
            }
        }
    }
    return validMoves
}