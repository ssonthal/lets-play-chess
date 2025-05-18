import { Piece, Position } from "../../models";
import { TeamType } from "../../Types";
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

export const getValidRookMoves = (
  initialPosition: Position,
  boardState: Piece[],
  team: TeamType
): Position[] => {
  const validMoves: Position[] = [];

  const directions = [ 
        [-1, 0], // left 
        [1, 0], // right
        [0, 1], // uop
        [0, -1] // down
    ];

  for (const dir of directions) {
    let x = initialPosition.x + dir[0];
    let y = initialPosition.y + dir[1];

    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const targetPiece = boardState.find(
        p => p.position.x === x && p.position.y === y
      );

      if (!targetPiece) {
        validMoves.push(new Position(x,y));
      } else {
        if (targetPiece.team !== team) {
          validMoves.push(new Position(x,y));
        }
        break; // Stop — rook cannot move past this
      }
      x += dir[0];
      y += dir[1];
    }
  }

  return validMoves;
};
