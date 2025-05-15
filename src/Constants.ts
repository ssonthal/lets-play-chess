import { Piece } from "./models/Piece";
import { Position } from "./models/Position";

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const GRID_SIZE = 100;

export enum PieceType {
    PAWN = "pawn",
    KNIGHT = "knight",
    BISHOP = "bishop",
    ROOK = "rook",
    QUEEN = "queen",
    KING = "king"
}

export enum TeamType {
    BLACK = "b",
    WHITE = "w"
}

export const INITIAL_STATE:Piece[] = [
    new Piece(new Position(0, 7), PieceType.ROOK, TeamType.BLACK),
    new Piece(new Position(1, 7), PieceType.KNIGHT, TeamType.BLACK),
    new Piece(new Position(2, 7), PieceType.BISHOP, TeamType.BLACK),
    new Piece(new Position(3, 7), PieceType.QUEEN, TeamType.BLACK),
    new Piece(new Position(4, 7), PieceType.KING, TeamType.BLACK),
    new Piece(new Position(5, 7), PieceType.BISHOP, TeamType.BLACK),
    new Piece(new Position(6, 7), PieceType.KNIGHT, TeamType.BLACK),
    new Piece(new Position(7, 7), PieceType.ROOK, TeamType.BLACK),
    new Piece(new Position(0, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(1, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(2, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(3, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(4, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(5, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(6, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(7, 6), PieceType.PAWN, TeamType.BLACK),
    new Piece(new Position(0, 1), PieceType.PAWN, TeamType.WHITE),
    new Piece(new Position(1, 1), PieceType.PAWN, TeamType.WHITE),
    new Piece(new Position(2, 1), PieceType.PAWN, TeamType.WHITE),            
    new Piece(new Position(3, 1), PieceType.PAWN, TeamType.WHITE),            
    new Piece(new Position(4, 1), PieceType.PAWN, TeamType.WHITE),            
    new Piece(new Position(5, 1), PieceType.PAWN, TeamType.WHITE),            
    new Piece(new Position(6, 1), PieceType.PAWN, TeamType.WHITE),            
    new Piece(new Position(7, 1), PieceType.PAWN, TeamType.WHITE),            
    new Piece(new Position(0, 0), PieceType.ROOK, TeamType.WHITE),
    new Piece(new Position(1, 0), PieceType.KNIGHT, TeamType.WHITE),
    new Piece(new Position(2, 0), PieceType.BISHOP, TeamType.WHITE),
    new Piece(new Position(3, 0), PieceType.QUEEN, TeamType.WHITE),            
    new Piece(new Position(4, 0), PieceType.KING, TeamType.WHITE),            
    new Piece(new Position(5, 0), PieceType.BISHOP, TeamType.WHITE),            
    new Piece(new Position(6, 0), PieceType.KNIGHT, TeamType.WHITE),            
    new Piece(new Position(7, 0), PieceType.ROOK, TeamType.WHITE)
];