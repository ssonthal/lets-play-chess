import { Piece, Position } from "../../models";
import { TeamType } from "../../Types";
import {tileEmptyOrOccupiedByOpponent} from "./GeneralRules";

export const knightMove = (
  initialPosition: Position,
  finalPosition: Position,
  boardState: Piece[],
  team: TeamType
): boolean => {
  const dx = Math.abs(finalPosition.x - initialPosition.x);
  const dy = Math.abs(finalPosition.y - initialPosition.y);

  const isLShape = (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
  return (
    isLShape &&
    tileEmptyOrOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)
  );
};

export const getValidKnightMoves = (
    initialPosition: Position,
    boardState: Piece[], 
    team: TeamType
): Position[] => {
    const deltas = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
    let moves:Position[] = [];
    for (const [dx, dy] of deltas) {
        const x = initialPosition.x + dx;
        const y = initialPosition.y + dy;
        if (x >= 0 && x < 8 && y >= 0 && y < 8 && tileEmptyOrOccupiedByOpponent(x, y, boardState, team)) {
            moves.push(new Position(x, y));
        }
    }
    return moves;
}