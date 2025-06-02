import { PieceType, TeamType } from "../Types";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Move {
    team: TeamType;
    piece: PieceType;
    fromPosition: Position;
    toPosition: Position;
    capturedPiece?: Piece;
    constructor (team : TeamType, piece: PieceType, fromPosition: Position, toPosition: Position, capturedPiece?: Piece) {
        this.team = team;
        this.piece = piece;
        this.fromPosition = fromPosition;
        this.toPosition = toPosition;
        this.capturedPiece = capturedPiece;
    }
    toMessage() {
        return `${this.team === TeamType.WHITE ? "White" : "Black" } moved ${this.piece} from position [${this.fromPosition.x}, ${this.fromPosition.y}] to position [${this.toPosition.x}, ${this.toPosition.y}].`;
    }
    clone() {
        return new Move(this.team, this.piece, this.fromPosition.clone(), this.toPosition.clone(), this.capturedPiece);
    }
}