import { Board, Pawn, Piece, Position } from "../models";
import { TeamType } from "../Types";

const typeMap = {
    pawn: 'p',
    rook: 'r',
    knight: 'n',
    bishop: 'b',
    queen: 'q',
    king: 'k'
};
export default class FenUtil {
    static toAlgebraic(pos: Position): string {
        const file = String.fromCharCode('a'.charCodeAt(0) + pos.x);
        const rank = (pos.y + 1).toString();
        return `${file}${rank}`;
    }
    static algebraicToPosition(move:string): Position {
        const pos = new Position (move.charCodeAt(0) - 'a'.charCodeAt(0), parseInt(move.slice(1)) - 1 );
        return pos;
    }
    static getCastlingRights(pieces: Piece[]): string {
        let rights = '';
      
        const whiteKing = pieces.find(p => p.isKing && p.team === TeamType.WHITE);
        const blackKing = pieces.find(p => p.isKing && p.team === TeamType.BLACK);
      
        const whiteRookKS = pieces.find(p => p.isRook && p.team === TeamType.WHITE && p.position.x === 7 && p.position.y === 0);
        const whiteRookQS = pieces.find(p => p.isRook && p.team === TeamType.WHITE && p.position.x === 0 && p.position.y === 0);
      
        const blackRookKS = pieces.find(p => p.isRook && p.team === TeamType.BLACK && p.position.x === 7 && p.position.y === 7);
        const blackRookQS = pieces.find(p => p.isRook && p.team === TeamType.BLACK && p.position.x === 0 && p.position.y === 7);
      
        if (whiteKing && whiteRookKS && !whiteKing.hasMoved && !whiteRookKS.hasMoved) rights += 'K';
        if (whiteKing && whiteRookQS && !whiteKing.hasMoved && !whiteRookQS.hasMoved) rights += 'Q';
        if (blackKing && blackRookKS && !blackKing.hasMoved && !blackRookKS.hasMoved) rights += 'k';
        if (blackKing && blackRookQS && !blackKing.hasMoved && !blackRookQS.hasMoved) rights += 'q';

        return rights || '-';
      }
    static boardToFen(board: Board) : string {
        // rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
        const pieces = board.pieces;
        let fen = "";

        // check for piece positions
        for(let i = 7; i >= 0; i--) {
            let empty = 0;
            for(let j = 0; j < 8; j++) {
                const piece = pieces.find(p => p.position.x === j && p.position.y === i);
                if(!piece) {
                    empty++;
                } else {
                    if(empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece.team === TeamType.WHITE ? typeMap[piece.type].toUpperCase() : typeMap[piece.type].toLowerCase();
                }
            }
            if(empty > 0) {
                fen += empty;
                empty = 0;
            }
            if (i > 0) fen += "/";
        }
        fen += " ";
        
        // check for current team
        fen += board.currentTeam === TeamType.WHITE ? "w" : "b";
        fen += " ";

        // check for castling possibility
        fen += FenUtil.getCastlingRights(pieces);
        fen += " ";

        // check for enPassant piece
        const pawn = pieces.filter(p => p.isPawn && (p as Pawn).enPassant)[0];
        if(pawn) {
            fen += pawn.team === TeamType.WHITE ? FenUtil.toAlgebraic(new Position(pawn.position.x, pawn.position.y - 1)) : FenUtil.toAlgebraic(new Position(pawn.position.x, pawn.position.y + 1));
        } else {
            fen += "-";
        }
        fen += " ";

        // check for halfmoves
        fen += board.turnsWithNoCaptureOrPawnMove.toString();
        fen += " ";
        // check for fullmoves
        fen += Math.floor(board.totalTurns/2) + 1;
        return fen;
    }
    static fenToBoard(board:Board) {
    }
}