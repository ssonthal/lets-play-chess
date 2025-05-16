import { Piece, Position} from "../../models";
import { TeamType } from "../../Types";
import { tileEmptyOrOccupiedByOpponent } from "./GeneralRules";

export const kingMove = (initialPosition: Position, finalPosition: Position, boardState: Piece[], team: TeamType): boolean  => {
        if(Math.abs(finalPosition.x - initialPosition.x) <= 1 && Math.abs(finalPosition.y - initialPosition.y) <= 1) {
            if(tileEmptyOrOccupiedByOpponent(finalPosition.x, finalPosition.y, boardState, team)) {
                return true;
            }
        }
        return false;
}
