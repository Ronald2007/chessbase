import { GameMove } from "./game";

export interface GameControl {
  back: () => void;
  forward: () => void;
  goToMove: (moveNumber: number[]) => void;
  reset: () => void;
  setGame: (moves: GameMove[]) => void;
}
export type BoardStyle = "brown" | "green";
export interface Notation {
  positionNumber: number[];
  notation: string;
  moveNumber: number;
  color: boolean;
  variations: Notation[][];
}
