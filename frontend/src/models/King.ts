import { PieceType, TeamType } from "../Types";
import { Piece, PieceData } from "./Piece";
import { Position } from "./Position";

interface KingData extends PieceData {
    queenSideCastled: boolean;
    kingSideCastled: boolean;
}
export class King extends Piece {
    queenSideCastled: boolean = false;
    kingSideCastled: boolean = false;
    constructor(position: Position, team: TeamType, hasMoved: boolean = false, queenSideCastled: boolean = false, kingSideCastled: boolean = false, possibleMoves? : Position[]) {
        super(position, PieceType.KING, team, hasMoved, possibleMoves);
        this.queenSideCastled = queenSideCastled;
        this.kingSideCastled = kingSideCastled;
    }
    override clone(overrides: Partial<KingData> = {}): King {
    const data = this.getData() as KingData;
    return new King(
      overrides.position ?? data.position.clone(),
      overrides.team ?? data.team,
      overrides.hasMoved ?? data.hasMoved,
      overrides.queenSideCastled ?? data.queenSideCastled,
      overrides.kingSideCastled ?? data.kingSideCastled,
      overrides.possibleMoves ?? data.possibleMoves
    );
  }

  override getData(): KingData {
    return {
      ...super.getData(),
      queenSideCastled: this.queenSideCastled,
      kingSideCastled: this.kingSideCastled
    };
  }
}