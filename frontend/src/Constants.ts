import { Board } from "./models/Board";
import {Pawn} from "./models/Pawn";
import { Piece } from "./models/Piece";
import { Position } from "./models/Position";
import { PieceType, TeamType } from "./Types";

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const TILE_SIZE = 75;

export const INITIAL_TIME = 5 * 60; // 5 minutes


export const initialBoard: Board = new Board([
    new Piece(new Position(0, 7), PieceType.ROOK, TeamType.BLACK),
    new Piece(new Position(1, 7), PieceType.KNIGHT, TeamType.BLACK),
    new Piece(new Position(2, 7), PieceType.BISHOP, TeamType.BLACK),
    new Piece(new Position(3, 7), PieceType.QUEEN, TeamType.BLACK),
    new Piece(new Position(4, 7), PieceType.KING, TeamType.BLACK),
    new Piece(new Position(5, 7), PieceType.BISHOP, TeamType.BLACK),
    new Piece(new Position(6, 7), PieceType.KNIGHT, TeamType.BLACK),
    new Piece(new Position(7, 7), PieceType.ROOK, TeamType.BLACK),
    new Pawn(new Position(0, 6), TeamType.BLACK),
    new Pawn(new Position(1, 6), TeamType.BLACK),
    new Pawn(new Position(2, 6), TeamType.BLACK),
    new Pawn(new Position(3, 6), TeamType.BLACK),
    new Pawn(new Position(4, 6), TeamType.BLACK),
    new Pawn(new Position(5, 6), TeamType.BLACK),
    new Pawn(new Position(6, 6), TeamType.BLACK),
    new Pawn(new Position(7, 6), TeamType.BLACK),
    new Pawn(new Position(0, 1), TeamType.WHITE),
    new Pawn(new Position(1, 1), TeamType.WHITE),
    new Pawn(new Position(2, 1), TeamType.WHITE),            
    new Pawn(new Position(3, 1), TeamType.WHITE),            
    new Pawn(new Position(4, 1), TeamType.WHITE),            
    new Pawn(new Position(5, 1), TeamType.WHITE),            
    new Pawn(new Position(6, 1), TeamType.WHITE),            
    new Pawn(new Position(7, 1), TeamType.WHITE),            
    new Piece(new Position(0, 0), PieceType.ROOK, TeamType.WHITE),
    new Piece(new Position(1, 0), PieceType.KNIGHT, TeamType.WHITE),
    new Piece(new Position(2, 0), PieceType.BISHOP, TeamType.WHITE),
    new Piece(new Position(3, 0), PieceType.QUEEN, TeamType.WHITE),            
    new Piece(new Position(4, 0), PieceType.KING, TeamType.WHITE),           
    new Piece(new Position(5, 0), PieceType.BISHOP, TeamType.WHITE),            
    new Piece(new Position(6, 0), PieceType.KNIGHT, TeamType.WHITE),            
    new Piece(new Position(7, 0), PieceType.ROOK, TeamType.WHITE)
], 0, []);

initialBoard.calculateAllMoves();