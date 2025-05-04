export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const GRID_SIZE = 100;

export interface Position {
    x: number;
    y: number;
}
export function samePosition(pos1: Position, pos2: Position) : boolean {
    return pos1.x == pos2.x && pos1.y == pos2.y;
}
export enum PieceType {
    PAWN = "pawn",
    KNIGHT = "knight",
    BISHOP = "bishop",
    ROOK = "rook",
    QUEEN = "queen",
    KING = "king"
}

export enum TeamType {
    BLACK = "black",
    WHITE = "white"
}
export interface Piece {
    image: string
    position: Position
    type: PieceType, 
    team: TeamType, 
    enPassant? : boolean
}


export const INITIAL_STATE:Piece[] = [
    {
        image: "src/assets/pieces/rook_b.png",
        position: {x: 0, y: 7},
        type: PieceType.ROOK,
        team: TeamType.BLACK
    }, 
    {
        image: `src/assets/pieces/knight_b.png`,
        position: {x: 1, y: 7},
        type: PieceType.KNIGHT,
        team: TeamType.BLACK    
    }, 
    {
        image: `src/assets/pieces/bishop_b.png`,
        position: {x: 2, y: 7},
        type: PieceType.BISHOP,
        team: TeamType.BLACK
    }, 
    {
        image: `src/assets/pieces/queen_b.png`,
        position: {x: 3, y: 7},
        type: PieceType.QUEEN,
        team: TeamType.BLACK
    }, 
    {
        image: `src/assets/pieces/king_b.png`,
        position: {x: 4, y: 7},
        type: PieceType.KING,
        team: TeamType.BLACK
    }, 
    {
        image: `src/assets/pieces/bishop_b.png`,
        position: {x: 5, y: 7},
        type: PieceType.BISHOP,
        team: TeamType.BLACK
    }, 
    {
        image: `src/assets/pieces/knight_b.png`,
        position: {x: 6, y: 7},
        type: PieceType.KNIGHT,
        team: TeamType.BLACK
    }, 
    {
        image: `src/assets/pieces/rook_b.png`,
        position: {x: 7, y: 7},
        type: PieceType.ROOK,
        team: TeamType.BLACK
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 0, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 1, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 2, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 3, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK    
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 4, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK        
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 5, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK        
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 6, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK        
    },
    {
        image: `src/assets/pieces/pawn_b.png`,
        position: {x: 7, y: 6},
        type: PieceType.PAWN,
        team: TeamType.BLACK        
    },
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 0, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 1, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 2, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 3, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 4, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 5, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 6, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE        
    },      
    {
        image: `src/assets/pieces/pawn_w.png`,
        position: {x: 7, y: 1},
        type: PieceType.PAWN,
        team: TeamType.WHITE        
    },
    {
        image: `src/assets/pieces/rook_w.png`,
        position: {x: 0, y: 0},
        type: PieceType.ROOK,
        team: TeamType.WHITE
    },
    {
        image: `src/assets/pieces/knight_w.png`,
        position: {x: 1, y: 0},
        type: PieceType.KNIGHT,
        team: TeamType.WHITE
    },
    {
        image: `src/assets/pieces/bishop_w.png`,
        position: {x: 2, y: 0},
        type: PieceType.BISHOP,
        team: TeamType.WHITE
    },
    {
        image: `src/assets/pieces/queen_w.png`,
        position: {x: 3, y: 0},
        type: PieceType.QUEEN,
        team: TeamType.WHITE
    },     
    {
        image: `src/assets/pieces/king_w.png`,
        position: {x: 4, y: 0},
        type: PieceType.KING,
        team: TeamType.WHITE        
    },      
    {
        image: `src/assets/pieces/bishop_w.png`,
        position: {x: 5, y: 0},
        type: PieceType.BISHOP,
        team: TeamType.WHITE        
    },      
    {
        image: `src/assets/pieces/knight_w.png`,
        position: {x: 6, y: 0},
        type: PieceType.KNIGHT,
        team: TeamType.WHITE        
    },      
    {
        image: `src/assets/pieces/rook_w.png`,
        position: {x: 7, y: 0},
        type: PieceType.ROOK,
        team: TeamType.WHITE        
    }
];