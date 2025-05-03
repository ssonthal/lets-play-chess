import { Piece, PieceType, TeamType } from "../components/Chessboard";
export default class Referee {

    tilesOccupied(x: number, y: number, pieces: Piece[]) : boolean{
        const piece = pieces.find(p => p.x == x && p.y == y);
        if(piece) return true;
        return false;
    }
    isValidMove(px: number, py: number, x: number, y:number, type: PieceType, team: TeamType, boardState: Piece[]) : boolean {
        if(type == PieceType.PAWN) {
            const spclRow = (team == TeamType.WHITE) ? 1 : 6;
            const pawnDirection = (team == TeamType.WHITE) ? 1 : -1;

            // movement logic
            if(px == x && py === spclRow && y - py == 2*pawnDirection) {
                if(!this.tilesOccupied(x, y, boardState) && !this.tilesOccupied(x, y - 1, boardState)) {
                        return true;
                }
            }
            else if(px == x && y - py == pawnDirection) {
                if(!this.tilesOccupied(x, y, boardState)) {
                    return true;
                }
            }

            // attacking logic
            else if (Math.abs(x - px) == 1 && y - py == pawnDirection) {
                
            }
        }
        return false;
    }
}