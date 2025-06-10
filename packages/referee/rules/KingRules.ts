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

export const getCastlingMoves = (king: Piece, boardState: Piece[]) : Position[] => {
    const validMoves: Position[] = [];

    if(king.hasMoved) return validMoves;

    // get the rooks from the king's team which haven't moved...
    const rooks = boardState.filter(p => p.isRook && p.team === king.team && !p.hasMoved);

    // loop through the rooks
    for(const rook of rooks) {

        const dx = (king.position.x - rook.position.x > 0) ? 1 : -1;
        const adjacentPosition = king.position.clone();
        adjacentPosition.x -= dx;

        if(!rook.possibleMoves?.some(m => m.equals(adjacentPosition))) continue;

        // getting valid moves for rook at the same row level
        const concerningTiles = rook.possibleMoves.filter(m => m.y === king.position.y);

        let valid = true;
        
        // iterating over all the enemy moves and checking if they are on the concerned tiles
        for(const enemy of boardState.filter(p => p.team !== king.team)) {
            for(const possibleMove of enemy.possibleMoves) {
                if(king.position.equals(possibleMove)) {
                    valid = false;
                }
                else if(rook.position.equals(possibleMove)) {
                    valid = false;
                }
                for(const tile of concerningTiles) {
                    if(possibleMove.equals(tile)) {
                        valid = false;
                    }
                }
            }
        }
        if(!valid) continue;
        // pushing castling position (2 moves to the side) as valid moves for the king.
        validMoves.push(new Position(king.position.x - 2 * dx, king.position.y));
    }
    return validMoves;
}