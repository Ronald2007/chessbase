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

export type DropInfo = {
  payload: BoardSquare;
  start?: Point;
  end: Point;
  type: DropType;
};
export type DropEndInfo = Omit<DropInfo, "payload" | "start">;

export type Point = { x: number; y: number };
export type MovePoints = { start: Point; end: Point };
export type SquarePoint = { point: Point; payload: BoardSquare };

export type Move = {
  from: number;
  to: number;
  type: MoveType;
};
export type MoveType = "normal" | "castle" | "enpassant" | "promotion";

export type GameMove = GamePosition & { prevMove?: Move };

export type NewBoardProps = Omit<GamePosition, "fen" | "turn" | "hm" | "fm">;

export type DropResult = {
  startIndex: number;
  endIndex: number;
  startPoint: Point;
  endPoint: Point;
  type: DropType;
};

export type DropType = "touch" | "drag" | "promotion";

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PieceMove = {
  id: string;
  to: number;
  from: number;
  payload: Required<BoardSquare>;
  skip?: boolean;
};

export type PieceMoveAnimation = PieceMove & {
  start: Point;
  end: Point;
};

export type Promotion = {
  from: number;
  to: number;
  newMove: GameMove;
  piece?: string;
};

// utilities
export type FEN = `${string} ${string} ${string} ${string} ${string} ${string}`;
export type FENarray = [string, string, string, string, string, string];
export type Letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
export type Numbers = [1, 2, 3, 4, 5, 6, 7, 8];
export type Pieces = ["r", "n", "b", "q", "k", "p"];
export type Color = "w" | "b";
