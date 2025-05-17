import { PieceType, TeamType } from "../Types";
import { Position } from "./Position";

export interface PieceData {
  position: Position;
  type: PieceType;
  team: TeamType;
  possibleMoves: Position[];
}
export class Piece {
    image: string;
    position: Position;
    type: PieceType;
    team: TeamType;
    possibleMoves : Position[];
    constructor(position: Position, type: PieceType, team: TeamType, possibleMoves : Position[] = []) {
        this.image = `src/assets/pieces/${type}_${team}.png`;
        this.position = position;
        this.type = type;
        this.team = team;
        this.possibleMoves = possibleMoves;
    }

    get isPawn() : boolean{
        return this.type === PieceType.PAWN;
    }
    get isBishop() : boolean{
        return this.type === PieceType.BISHOP;
    }
    get isRook() : boolean{
        return this.type === PieceType.ROOK;
    }
    get isKnight() : boolean{
        return this.type === PieceType.KNIGHT;
    }
    get isQueen() : boolean{
        return this.type === PieceType.QUEEN;
    }
    get isKing() : boolean{
        return this.type === PieceType.KING;
    }
    samePiecePosition(otherPiece: Piece): boolean {
        return this.position.equals(otherPiece.position);
    }
    samePosition(otherPosition: Position): boolean {
        return this.position.equals(otherPosition);
    }
    clone(overrides: Partial<PieceData> = {}): Piece {
        const data = this.getData();

        return new Piece(
            overrides.position ?? data.position.clone(),
            overrides.type ?? data.type,
            overrides.team ?? data.team,
            overrides.possibleMoves ?? data.possibleMoves.map(p => p.clone())
        );
    }
    getData(): PieceData {
        return {
            position: this.position,
            type: this.type,
            team: this.team,
            possibleMoves: this.possibleMoves
        };
    }
}