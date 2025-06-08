import { PieceType, TeamType } from "../Types";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class SimplifiedPiece {
    position: Position;
    type: PieceType;
    team: TeamType;
    possibleMoves: Position[];
    constructor(piece: Piece) {
        this.position = piece.position.clone();
        this.type = piece.type;
        this.team = piece.team;
        this.possibleMoves = piece.possibleMoves.map(p => p.clone());
    }
    clone() {
        return new SimplifiedPiece(
            new Piece(
                this.position.clone(),
                this.type,
                this.team,
                false,
                this.possibleMoves.map(p => p.clone())
            ));
    }
}