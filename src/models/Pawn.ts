import { PieceType, TeamType } from "../Types";
import { Piece, PieceData } from "./Piece";
import { Position } from "./Position";

interface PawnData extends PieceData {
    enPassant: boolean;
}
export class Pawn extends Piece {
    enPassant: boolean;
    constructor(position: Position, team: TeamType, enPassant: boolean = false, possibleMoves? : Position[]) {
        super(position, PieceType.PAWN, team, possibleMoves);
        this.enPassant = enPassant;
    }
    override clone(overrides: Partial<PawnData> = {}): Pawn {
    const data = this.getData() as PawnData;
    return new Pawn(
      overrides.position ?? data.position.clone(),
      overrides.team ?? data.team,
      overrides.enPassant ?? this.enPassant,
      overrides.possibleMoves ?? data.possibleMoves
    );
  }

  override getData(): PawnData {
    return {
      ...super.getData(),
      enPassant: this.enPassant
    };
  }
}