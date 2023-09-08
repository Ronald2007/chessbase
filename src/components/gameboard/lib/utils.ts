import {
  FENarray,
  GameBoard,
  GameMove,
  GamePosition,
  Move,
  NewBoardProps,
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
  board: GameBoard,
  move: Move,
  lastMove: GameMove
): NewBoardProps {
  if (move.from === move.to) return { board, cr: null, target: null };

  // get values
  const start = move.from;
  const end = move.to;
  const [start_row, start_col] = [Math.floor(start / 10), start % 10];
  const [end_row, end_col] = [Math.floor(end / 10), end % 10];
  const start_block = board[start_row][start_col];
  const end_block = board[end_row][end_col];
  const colorValue = start_block.color ? 1 : -1;

  // update board
  board[end_row][end_col] = { ...start_block, index: end_block.index };
  board[start_row][start_col] = { index: start_block.index };

  // remove captured pawn by enpassant
  if (move.type === "enpassant") {
    const capturedPawnIdx = end + 10 * colorValue;
    board[Math.floor(capturedPawnIdx / 10)][capturedPawnIdx % 10] = {
      index: capturedPawnIdx,
    };
  }

  // update rook position if castling
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

  // set enpassant target
  let enpassantTarget: string | null = null;
  if (
    start_block.piece === "p" &&
    Math.abs(Math.floor((start - end) / 10)) === 2
  ) {
    const targetIdx = end + 10 * colorValue;
    // const letter = letters[letters.length - 1 - Math.floor(targetIdx / 10)];
    // const number = numbers[targetIdx % 10];
    const letter = letters[targetIdx % 10];
    const number = numbers[Math.floor(targetIdx / 10)];
    enpassantTarget = letter + number;
  }

  // set castling rights
  let cr = lastMove.cr ?? "";
  // console.log("prevcr: ", cr);
  if (start_block.piece === "k") {
    if (start_block.color) {
      cr = cr.replace("K", "").replace("Q", "");
    } else {
      cr = cr.replace("k", "").replace("q", "");
    }
  }
  if (start_block.piece === "r") {
    if (start_block.color) {
      if (start_block.index === 77) cr = cr.replace("K", "");
      else if (start_block.index === 70) cr = cr.replace("Q", "");
    } else {
      if (start_block.index === 7) cr = cr.replace("k", "");
      else if (start_block.index === 0) cr = cr.replace("q", "");
    }
  }

  // console.log("aftercr: ", cr);

  return { board, cr: cr === "" ? null : cr, target: enpassantTarget };
}
