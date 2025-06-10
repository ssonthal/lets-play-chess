import { Piece, Position } from '@letsplaychess/models';
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

export const getValidBishopMoves = (
  initialPosition: Position,
  boardState: Piece[],
  team: TeamType
): Position[] => {
  const validMoves: Position[] = [];

  const directions = [ 
        [-1, 1], // top left 
        [1, -1], // bottom right 
        [-1, -1], // bottom left 
        [1, 1] // top right
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
        break;
      }
      x += dir[0];
      y += dir[1];
    }
  }

  return validMoves;
};