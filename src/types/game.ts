export type GameBoard = BoardSquare[][];
export type BoardSquare = {
  index: number;
  id?: string;
  piece?: string;
  color?: boolean;
};
export interface GamePosition {
  board: GameBoard;
  fen: string;
  turn: boolean;
  cr: string | null;
  target: string | null;
  hm: number;
  fm: number;
}
export type GameMove = GamePosition & { prevMove?: Move, variations: GameMove[][] };
export type NewBoardProps = Pick<GamePosition, "board" | "cr" | "target">;
export type Layout = { x: number; y: number; w: number; h: number };
export type Promotion = {
  move: Move;
  newMove: GameMove;
};
export type Point = { x: number; y: number };

// movement
export type DragPayload = { point: Point; sqr: Required<BoardSquare> };
export type PieceMoves = Required<BoardSquare> & { moves: Move[] };
export type Move = {
  from: number;
  to: number;
  type: MoveType;
  notation: string;
};
export type MoveType = "normal" | "castle" | "enpassant" | "promotion";
export type PieceMove = {
  id: string;
  to: number;
  from: number;
  payload: Required<BoardSquare>;
};
export type Animation = PieceMove & {
  start: Point;
  end: Point;
};

// utilities
// export type FEN = `${string} ${string} ${string} ${string} ${string} ${string}`;
export type FENarray = [string, string, string, string, string, string];
// export type Letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
// export type Numbers = [1, 2, 3, 4, 5, 6, 7, 8];
// export type Pieces = ["r", "n", "b", "q", "k", "p"];
// export type Color = "w" | "b";

export interface GameControl {
  back: () => void;
  forward: () => void;
  goToMove: (moveNumber: number) => void;
  reset: () => void;
}
export type BoardStyle = "brown" | "green";
export interface Notation {
  positionNumber: number;
  notation: string;
  moveNumber: number;
  color: boolean;
}
