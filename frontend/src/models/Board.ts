import {getValidKnightMoves, getValidRookMoves, getValidBishopMoves, getValidPawnMoves, getValidKingMoves, getCastlingMoves} from "../referee/rules";
import { PieceType, TeamType } from "../Types";
import { Move } from "./Move";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";
import { SimplifiedPiece } from "./SimplifiedPiece";

export class Board {
    
    pieces: Piece[];
    totalTurns : number;
    winningTeam?: TeamType;
    statemate : boolean;    
    moves: Move[];
    draw: boolean;
    boardHistory: {[key: string]: number};
    turnsWithNoCaptureOrPawnMove : number;
    
    constructor(pieces: Piece[], totalTurns: number, moves: Move[], boardHistory: {[key: string]: number} = {}, turnsWithNoCaptureOrPawnMove = 0) {
        this.pieces = pieces;
        this.totalTurns = totalTurns;
        this.moves = moves;
        this.statemate = false;
        this.draw = false;
        this.boardHistory = boardHistory;
        this.turnsWithNoCaptureOrPawnMove = turnsWithNoCaptureOrPawnMove;
    }
    
    calculateAllMoves() {
        // calculate the moves of all pieces
        for(const piece of this.pieces) {
            piece.possibleMoves = this.getValidMoves(piece);
        }
        
        // calculate castling moves
        for(const king of this.pieces.filter(p => p.isKing)) {
            if(king.possibleMoves === undefined)continue;
            king.possibleMoves = [
                ...king.possibleMoves, 
                ...getCastlingMoves(king, this.pieces)
            ];
        }
        // check if the current team moves are valid
        this.checkCurrentTeamMoves();  

        const enemyMoves = this.pieces.filter(p => p.team !== this.currentTeam).flatMap(p => p.possibleMoves);
        
        // remove the possilbe moves for the team that is not playing
        for(const piece of this.pieces) {
            if(piece.team !== this.currentTeam) {
                piece.possibleMoves = [];
            }
        }
        this.checkForDraw();
        this.checkforThreeFoldRepitition();
        this.checkForFiftyMoveRule();
        // check if the playing team still has moves left
        // otherwise, checkmate!!
        if(this.pieces.filter(p => p.team === this.currentTeam).some(p => p.possibleMoves.length > 0)) return;
        this.checkStaleMate(enemyMoves);
    }
    get currentTeam() : TeamType{
        return this.totalTurns % 2 == 0 ? TeamType.WHITE : TeamType.BLACK;
    }

    checkCurrentTeamMoves() {
        for(const piece of this.pieces.filter(p => p.team === this.currentTeam)) {
            if(piece.possibleMoves === undefined)continue;
            for(const move of piece.possibleMoves) {
                const simulatedBoard = this.clone();
                
                // remove the piece at destination
                simulatedBoard.pieces = simulatedBoard.pieces.filter(p => !p.samePosition(move));

                // get piece of the cloned board
                const clonedPiece = simulatedBoard.pieces.find(p => p.samePiecePosition(piece));

                // get king of the cloned board
                const clonedKing = simulatedBoard.pieces.find(p => p.isKing && p.team === simulatedBoard.currentTeam);
                
                clonedPiece!.position = move;

                // loop through all enemy pieces, check their possible moves and
                // check if the current team's king will be in danger
                for(const enemy of simulatedBoard.pieces.filter(p => p.team !== simulatedBoard.currentTeam)) {
                    enemy.possibleMoves = simulatedBoard.getValidMoves(enemy);
                    if(enemy.isPawn) {
                        if(enemy.possibleMoves.some(m => m.x !== enemy.position.x && m.equals(clonedKing!.position))) {
                            piece.possibleMoves = piece.possibleMoves.filter(m => !m.equals(move));
                        }
                    }
                    if(enemy.possibleMoves.some(m => m.equals(clonedKing!.position))) {
                        piece.possibleMoves = piece.possibleMoves.filter(m => !m.equals(move));
                    }
                }

            }
        }
    }
    getValidMoves(piece: Piece): Position[] {
        switch(piece.type) {
            case PieceType.PAWN:
                return getValidPawnMoves(piece.position, this.pieces, piece.team);
            case PieceType.ROOK:
                return getValidRookMoves(piece.position, this.pieces, piece.team);
            case PieceType.KNIGHT:
                return getValidKnightMoves(piece.position, this.pieces, piece.team);
            case PieceType.BISHOP:
                return getValidBishopMoves(piece.position, this.pieces, piece.team);
            case PieceType.QUEEN:
                return [
                    ...getValidRookMoves(piece.position, this.pieces, piece.team),
                    ...getValidBishopMoves(piece.position, this.pieces, piece.team)
                ];
            case PieceType.KING:
                return getValidKingMoves(piece.position, this.pieces, piece.team);
            default:
                return [];
        }
    }
    playMove(isEnPassant: boolean, playedPiece: Piece, destination: Position) : Board {
        const clonedBoard = this.clone();
        clonedBoard.totalTurns++;
        let piecesBeforeMove = clonedBoard.pieces.length;
        // castling
        if(playedPiece.isKing && (destination.x === playedPiece.position.x + 2 || destination.x === playedPiece.position.x - 2)) {
            const castlingRookPosition = destination.x > playedPiece.position.x ? new Position(7, playedPiece.position.y) : new Position(0, playedPiece.position.y);
            clonedBoard.pieces = clonedBoard.pieces.map(p => {
                if (p.samePiecePosition(playedPiece)) {
                    p.position = new Position(destination.x, destination.y);
                }
                else if (p.samePosition(castlingRookPosition)) {
                    p.position = destination.x > playedPiece.position.x ? new Position(destination.x - 1, destination.y) : new Position(destination.x + 1, destination.y);
                }
                return p.clone();
            });
        }
        // en-passant move
        else if (isEnPassant) {
            const pawnDirection = playedPiece.team == TeamType.WHITE ? 1 : -1;
            clonedBoard.pieces  = clonedBoard.pieces.map(p => {
                const isSamePiece = p.samePiecePosition(playedPiece);
                const isOneRowBack = p.samePosition(new Position(destination.x, destination.y - pawnDirection));
                
                // updating the position of the moved pawn
                if (isSamePiece && p.isPawn) {
                    const newPosition = new Position(destination.x, destination.y);
                    const updatedPiece = (p as Pawn).clone({
                        position: newPosition,
                        enPassant: false,
                        hasMoved: true
                    });
                    return updatedPiece;
                // removing the piece that was captured
                } else if (isOneRowBack) {
                    return null;
                }
                if (p.isPawn) {
                    return (p as Pawn).clone({ enPassant: false });
                }
                return p.clone();
            }).filter(p => p !== null);
        } else {
            clonedBoard.pieces = clonedBoard.pieces
            .map(p => {
                const isSamePiece = p.samePiecePosition(playedPiece);
                const isDestination = p.samePosition(destination);
                // updating the location of the moved piece
                if (isSamePiece) {
                    const newPosition = new Position(destination.x, destination.y);
                    const shouldEnPassant = Math.abs(destination.y - p.position.y) === 2;
                    let updatedPiece = p.clone({ position: newPosition });
                    if (p.isPawn) {
                        updatedPiece = (p as Pawn).clone({
                            position: newPosition,
                            enPassant: shouldEnPassant,
                            hasMoved: true
                        });
                    }
                    return updatedPiece;
                }
                // removing the capture piece
                else if (isDestination) {
                    return null;
                }
                if (p.isPawn) {
                    return (p as Pawn).clone({
                        enPassant: false
                    })
                }
                return p.clone();
            }).filter(p => p !== null);
        }

        if(playedPiece.type === PieceType.PAWN || clonedBoard.pieces.length < piecesBeforeMove) {
            clonedBoard.turnsWithNoCaptureOrPawnMove = 0;
        } else {
            clonedBoard.turnsWithNoCaptureOrPawnMove++;
        }

        clonedBoard.calculateAllMoves();
        clonedBoard.moves.push(new Move(
            playedPiece.team,
            playedPiece.type,
            playedPiece.position, destination, this.pieces.find(p => p.samePosition(destination))));
            
        return clonedBoard;
    }
    checkForFiftyMoveRule(): void {
        if(this.turnsWithNoCaptureOrPawnMove >= 50) {
            this.draw = true;
        }
    }
    checkStaleMate(enemyMoves: (Position | undefined)[]): void {
        // check if the other team still has moves left
        // otherwise, stalemate!!
        const kingPosition = this.pieces.find(p => p.isKing && p.team === this.currentTeam)!.position;
        if(!enemyMoves.some(p => p?.equals(kingPosition))) {
            // stalemate !!
            this.statemate = true;
        } else {
            // checkmate !!
            this.winningTeam = this.currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
        }
    }
    checkforThreeFoldRepitition() : void {
        const simplifiedPieces = this.pieces.map(p => new SimplifiedPiece(p));
        const simplifiedPiecesStringified = JSON.stringify(simplifiedPieces);
        const valFromArray = this.boardHistory[simplifiedPiecesStringified];
        if (valFromArray === undefined) {
            this.boardHistory[simplifiedPiecesStringified] = 1;
        } else {
            this.boardHistory[simplifiedPiecesStringified] += 1;
        }
        if(this.boardHistory[simplifiedPiecesStringified] === 3) {
            this.draw = true;
        }
    }
    checkForDraw() : void {
        // Check for draw
        const whiteEligibleForDraw = 
        this.pieces.filter(p => p.team == TeamType.WHITE).length == 1 || (this.pieces.filter(p => p.team === TeamType.WHITE).length == 2 && this.pieces.filter(p => p.team === TeamType.WHITE && (p.isKing || p.isKnight || p.isBishop)).length === 2);
        
        const blackEligibleForDraw = 
        this.pieces.filter(p => p.team == TeamType.BLACK).length == 1 || (this.pieces.filter(p => p.team === TeamType.BLACK).length == 2 && this.pieces.filter(p => p.team === TeamType.BLACK && (p.isKing || p.isKnight || p.isBishop)).length === 2);
        
        if (whiteEligibleForDraw && blackEligibleForDraw){
            this.draw = true;
        } else if (this.pieces.filter(p => p.team === TeamType.WHITE).length == 3 && this.pieces.filter(p => p.team === TeamType.WHITE && p.isKnight).length == 2 && this.pieces.filter(p => p.team === TeamType.BLACK).length == 1){
            // One lone king and one king with 2 knights is draw (white team)
            this.draw = true;
        } else if (this.pieces.filter(p => p.team === TeamType.BLACK).length == 3 && this.pieces.filter(p => p.team === TeamType.BLACK && p.isKnight).length == 2 && this.pieces.filter(p => p.team === TeamType.WHITE).length == 1){
            // One lone king and one king with 2 knights is draw (black team)
            this.draw = true;
        }
    }
    clone(overrides?: Piece[]): Board {
        const clonedPieces = (overrides ?? this.pieces).map(p => p.clone());
        return new Board(clonedPieces, this.totalTurns, this.moves.map(m => m.clone()), this.boardHistory, this.turnsWithNoCaptureOrPawnMove);
    }
}