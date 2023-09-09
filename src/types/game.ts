export type GameBoard = BoardSquare[][];
export type BoardSquare = {
  index: number;
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

export type DragInfo = {
  payload: BoardSquare;
  start?: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
};
export type DragEndInfo = Omit<DragInfo, "start">;

export type Point = { x: number; y: number };
export type MovePoints = { start: Point; end: Point };
export type SquarePoint = { point: Point; payload: BoardSquare };

export type Move = {
  from: number;
  to: number;
  type: "normal" | "castle" | "enpassant";
};

export type GameMove = GamePosition & { prevMove?: Move };

export type NewBoardProps = Omit<GamePosition, "fen" | "turn" | "hm" | "fm">;
// const ab: a = {  }

// interface NewBoardProps {
//   board: GameBoard;
//   cr: string | null;
//   target: string | null;
// }

// utilities
export type FEN = `${string} ${string} ${string} ${string} ${string} ${string}`;
export type FENarray = [string, string, string, string, string, string];
export type Letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
export type Numbers = [1, 2, 3, 4, 5, 6, 7, 8];
export type Pieces = ["r", "n", "b", "q", "k", "p"];
export type Color = "w" | "b";
