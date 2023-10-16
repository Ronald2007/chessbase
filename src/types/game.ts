/* Board */
export type GameBoard = BoardSquare[][];
export type BoardSquare = PieceSquare | EmptySquare;
export interface PieceSquare {
  index: number;
  id: string;
  piece: string;
  color: boolean;
}
export interface EmptySquare {
  index: number;
  id?: undefined;
  piece?: undefined;
  color?: undefined;
}

/* Move recording */
export interface GamePosition {
  board: GameBoard;
  turn: boolean;
  cr: string | null;
  target: string | null;
  hm: number;
  fm: number;
  fen: string;
  prevMove?: Move;
}
export type GameMove = GamePosition & {
  variations: GameMove[][];
  comments: string[];
  positionNumber: number[];
};
export interface Game {
  details: Record<string, string>;
  moves: GameMove[];
}

/* Drag and drop */
export type Layout = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };
export type DragPayload = { point: Point; sqr: Required<BoardSquare> };

export type NewBoardProps = Pick<GamePosition, "board" | "cr" | "target">;
export type Promotion = {
  move: Move;
  newMove: GamePosition;
};

/* Board Changes */
export type MoveType = "normal" | "castle" | "enpassant" | "promotion";
export type Move = {
  from: number;
  to: number;
  type: MoveType;
  notation: string;
  symbol?: string;
};
export type PieceMoves = PieceSquare & { moves: Move[] };
export type PieceMove = {
  id: string;
  to: number;
  from: number;
  payload: PieceSquare;
};
export type Animation = PieceMove & {
  start: Point;
  end: Point;
};

// helpers
export type FENarray = [string, string, string, string, string, string];
