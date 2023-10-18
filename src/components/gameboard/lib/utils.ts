import {
  EmptySquare,
  GameBoard,
  GamePosition,
  Layout,
  Move,
  NewBoardProps,
  PieceMove,
  Point,
} from "@/types";
import { letters, numbers } from "./constants";
import { clone } from "@/lib/utils";

export function isValidIndex(index: number) {
  if (index < 0 || index > 77 || index % 10 > 7) return false;
  return true;
}

export function getSquare(board: GameBoard, index: number) {
  if (!isValidIndex(index)) return;

  const [row, col] = convertIndexToRowCol(index);
  return board[row][col];
}

export function convertIndexToRowCol(index: number): [number, number] {
  return [Math.floor(index / 10), index % 10];
}

export function makeMove(
  actualBoard: GameBoard,
  move: Move,
  lastMove: GamePosition
): NewBoardProps {
  const board = clone(actualBoard);
  if (move.from === move.to) return { board, cr: null, target: null };

  /* get values */
  const start = move.from;
  const end = move.to;
  const [srow, scol] = convertIndexToRowCol(start);
  const [erow, ecol] = convertIndexToRowCol(end);
  let startBlock = board[srow]?.at(scol);
  let endBlock = board[erow]?.at(ecol);
  if (!startBlock?.id || !endBlock) return { board, cr: null, target: null };
  const colorValue = startBlock.color ? 1 : -1;

  /* Update board */
  board[erow][ecol] = { ...startBlock, index: endBlock.index };
  board[srow][scol] = { index: startBlock.index } as EmptySquare;

  /* Promotion */
  if (move.type === "promotion" && board[erow][ecol].piece === "p") {
    const newpiece = move.notation.split("=").at(1)?.at(0);
    if (newpiece) {
      board[erow][ecol].piece = newpiece.toLowerCase();
      board[erow][ecol].id = newpiece + board[erow][ecol].id?.slice(1);
    }
  }
  startBlock = board[srow][scol];
  endBlock = board[erow][ecol];

  /* Remove captured pawn by enpassant */
  if (move.type === "enpassant") {
    const capturedPawnIdx = end + 10 * colorValue;
    const [cprow, cpcol] = convertIndexToRowCol(capturedPawnIdx);
    board[cprow][cpcol] = { index: capturedPawnIdx };
  }

  /* Update rook position if castling */
  if (
    endBlock.piece === "k" &&
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
    endBlock.piece === "p" &&
    Math.abs(Math.floor((start - end) / 10)) === 2
  ) {
    const targetIdx = end + 10 * colorValue;
    enpassantTarget = convertIndexToSquare(targetIdx);
  }

  /* Set castling rights */
  let cr = lastMove.cr ?? "";
  // check king movement
  if (endBlock.piece === "k") {
    if (endBlock.color) {
      cr = cr.replace("K", "").replace("Q", "");
    } else {
      cr = cr.replace("k", "").replace("q", "");
    }
  }
  // check rook movement
  for (const block of [startBlock, endBlock]) {
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
            payload: psqr,
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
            payload: csqr,
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
  const row = Math.floor(point.y / (layout.h / 8));
  const col = Math.floor(point.x / (layout.w / 8));

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

export function convertIndexToSquare(index: number) {
  const letter = letters[numberClamp(index % 10, 7)];
  const number = numbers[numberClamp(Math.floor(index / 10), 7)];
  return letter + number;
}

export function convertSquareToIndex(square: string) {
  const row = numbers.indexOf(parseInt(square[1]));
  const col = letters.indexOf(square[0]);
  const index = row * 10 + col;
  return isValidIndex(index) ? index : -1;
}
