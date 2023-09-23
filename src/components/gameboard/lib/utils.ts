import {
  BoardSquare,
  GameBoard,
  GameMove,
  Layout,
  Move,
  NewBoardProps,
  PieceMove,
  Point,
} from "@/types";
import { letters, numbers } from "./settings";

export function isValidIndex(index: number) {
  if (index < 0 || index > 77 || index % 10 > 7) {
    return false;
  }
  return true;
}

export function getSquare(board: GameBoard, index: number) {
  if (!isValidIndex(index)) return;

  const row = Math.floor(index / 10);
  const col = index % 10;
  return board[row][col];
}

export function makeMove(
  actualBoard: GameBoard,
  move: Move,
  lastMove: GameMove
): NewBoardProps {
  const board: GameBoard = JSON.parse(JSON.stringify(actualBoard));
  if (move.from === move.to) return { board, cr: null, target: null };

  /* get values */
  const start = move.from;
  const end = move.to;
  const [start_row, start_col] = [Math.floor(start / 10), start % 10];
  const [end_row, end_col] = [Math.floor(end / 10), end % 10];
  const start_block = board[start_row][start_col];
  const end_block = board[end_row][end_col];
  const colorValue = start_block.color ? 1 : -1;

  /* Update board */
  board[end_row][end_col] = { ...start_block, index: end_block.index };
  board[start_row][start_col] = {
    index: start_block.index,
  };

  /* Remove captured pawn by enpassant */
  if (move.type === "enpassant") {
    const capturedPawnIdx = end + 10 * colorValue;
    board[Math.floor(capturedPawnIdx / 10)][capturedPawnIdx % 10] = {
      index: capturedPawnIdx,
    };
  }

  /* Update rook position if castling */
  if (
    start_block.piece === "k" &&
    move.type === "castle" &&
    lastMove.cr &&
    move.from % 10 === 4
  ) {
    const crow = colorValue === 1 ? 7 : 0;
    if (end % 10 === 6) {
      // short castle
      board[crow][5] = { ...board[crow][7], index: crow * 10 + 5 };
      board[crow][7] = { index: crow * 10 + 7 };
    } else if (end % 10 === 2) {
      // long castle
      board[crow][3] = { ...board[crow][0], index: crow * 10 + 3 };
      board[crow][0] = { index: crow * 10 + 0 };
    }
  }

  /* Set enpassant target */
  let enpassantTarget: string | null = null;
  if (
    start_block.piece === "p" &&
    Math.abs(Math.floor((start - end) / 10)) === 2
  ) {
    const targetIdx = end + 10 * colorValue;
    const letter = letters[targetIdx % 10];
    const number = numbers[Math.floor(targetIdx / 10)];
    enpassantTarget = letter + number;
  }

  /* Set castling rights */
  let cr = lastMove.cr ?? "";
  // check king movement
  if (start_block.piece === "k") {
    if (start_block.color) {
      cr = cr.replace("K", "").replace("Q", "");
    } else {
      cr = cr.replace("k", "").replace("q", "");
    }
  }
  // check rook movement
  for (const block of [start_block, end_block]) {
    if (block.piece === "r") {
      if (block.color) {
        if (block.index === 77) cr = cr.replace("K", "");
        else if (block.index === 70) cr = cr.replace("Q", "");
      } else {
        if (block.index === 7) cr = cr.replace("k", "");
        else if (block.index === 0) cr = cr.replace("q", "");
      }
    }
  }

  return { board, cr: cr === "" ? null : cr, target: enpassantTarget };
}

/* Find differences between two boards to animate them */
export function findDifferences(prevBoard: GameBoard, board: GameBoard) {
  const animations: PieceMove[] = [];

  for (let i = 0; i < prevBoard.length; i++) {
    for (let j = 0; j < prevBoard[i].length; j++) {
      const psqr = prevBoard[i][j];
      const csqr = board[i][j];
      if (psqr.id && psqr.id !== csqr.id) {
        const aidx = animations.findIndex(
          (animation) => animation.id === psqr.id
        );
        if (aidx < 0) {
          animations.push({
            id: psqr.id,
            from: psqr.index,
            payload: psqr as Required<BoardSquare>,
            to: -1,
          });
        } else {
          animations[aidx].from = psqr.index;
        }
      }
      if (csqr.id && csqr.id !== psqr.id) {
        const aidx = animations.findIndex(
          (animation) => animation.id === csqr.id
        );
        if (aidx < 0) {
          animations.push({
            id: csqr.id,
            to: csqr.index,
            payload: csqr as Required<BoardSquare>,
            from: -1,
          });
        } else {
          animations[aidx].to = csqr.index;
        }
      }
    }
  }

  return animations;
}

export function convertPointToIndex(point: Point, layout: Layout) {
  const row = Math.floor(Math.abs(point.y) / (layout.h / 8));
  const col = Math.floor(Math.abs(point.x) / (layout.w / 8));

  const index = row * 10 + col;
  return index;
}

export function convertIndexToPoint(index: number, layout: Layout): Point {
  const x = (index % 10) * (layout.w / 8);
  const y = Math.floor(index / 10) * (layout.h / 8);

  return { x, y };
}

export function numberClamp(num: number, max: number, min: number = 0) {
  if (num < min) return min;
  else if (num > max) return max;
  else return num;
}
