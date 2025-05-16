import { PieceType, TeamType } from "../Types";
import { Position } from "./Position";

interface PieceData {
  position: Position;
  type: PieceType;
  team: TeamType;
  possibleMoves?: Position[];
  enPassant?: boolean;
}
export class Piece {
    image: string;
    position: Position;
    type: PieceType;
    team: TeamType;
    enPassant? : boolean;
    possibleMoves? : Position[];
    constructor(position: Position, type: PieceType, team: TeamType, possibleMoves? : Position[], enPassant? : boolean) {
        this.image = `src/assets/pieces/${type}_${team}.png`;
        this.position = position;
        this.type = type;
        this.team = team;
        this.possibleMoves = possibleMoves;
        this.enPassant = enPassant;
    }

    isPawn() : boolean{
        return this.type === PieceType.PAWN;
    }
    isBishop() : boolean{
        return this.type === PieceType.BISHOP;
    }
    isRook() : boolean{
        return this.type === PieceType.ROOK;
    }
    isKnight() : boolean{
        return this.type === PieceType.KNIGHT;
    }
    isQueen() : boolean{
        return this.type === PieceType.QUEEN;
    }
    isKing() : boolean{
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
            overrides.position ?? data.position,
            overrides.type ?? data.type,
            overrides.team ?? data.team,
            overrides.possibleMoves ?? data.possibleMoves,
            overrides.enPassant ?? data.enPassant
        );
    }
    private getData(): PieceData {
        return {
            position: this.position,
            type: this.type,
            team: this.team,
            possibleMoves: this.possibleMoves,
            enPassant: this.enPassant,
        };
    }
}