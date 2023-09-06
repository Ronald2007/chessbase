import { BoardSquare, GameBoard } from "@/types";
import { isValidIndex } from "./utils";

export function findMoves(board: GameBoard, index: number): number[] {
  const sqr = board[Math.floor(index / 10)][index % 10];
  if (!sqr) return [];

  let moves: number[] = [];
  if (sqr.piece === "n") {
    moves = findKnightMoves(board, sqr);
  } else if (sqr.piece === "r") {
    moves = findRookMoves(board, sqr);
  } else if (sqr.piece === "b") {
    moves = findBishopMoves(board, sqr);
  } else if (sqr.piece === "q") {
    moves = [...findRookMoves(board, sqr), ...findBishopMoves(board, sqr)];
  } else if (sqr.piece === "k") {
    moves = findKingMoves(board, sqr);
  } else if (sqr.piece === "p") {
    moves = findPawnMoves(board, sqr);
  }

  return moves;
}

export function findKnightMoves(board: GameBoard, sqr: BoardSquare): number[] {
  const knightMoves = [-12, -21, -19, -8, 8, 19, 21, 12];
  const moves: number[] = [];

  for (let i = 0; i < knightMoves.length; i++) {
    const move = sqr.index + knightMoves[i];
    if (!isValidIndex(move)) continue;
    const moveSqr = board[Math.floor(move / 10)][move % 10];
    if (!moveSqr || moveSqr.color !== sqr.color) {
      moves.push(move);
    }
  }

  return moves;
}

export function findKingMoves(board: GameBoard, sqr: BoardSquare): number[] {
  const kingMoves = [-11, -10, -9, 1, 11, 10, 9, -1];
  const moves: number[] = [];

  for (let i = 0; i < kingMoves.length; i++) {
    const move = sqr.index + kingMoves[i];
    if (!isValidIndex(move)) continue;
    const moveSqr = board[Math.floor(move / 10)][move % 10];
    if (!moveSqr || moveSqr.color !== sqr.color) {
      moves.push(move);
    }
  }

  return moves;
}

export function findRookMoves(board: GameBoard, sqr: BoardSquare): number[] {
  const moves: number[] = [];

  const increments = [-1, 1, -10, 10];
  for (let i = 0; i < increments.length; i++) {
    let j = sqr.index + increments[i];
    while (isValidIndex(j)) {
      const moveSqr = board[Math.floor(j / 10)][j % 10];
      if (!moveSqr || moveSqr.color === sqr.color) break;
      else if (moveSqr.color !== undefined && moveSqr.color !== sqr.color) {
        moves.push(j);
        break;
      } else {
        moves.push(j);
        j = j + increments[i];
      }
    }
  }

  return moves;
}

export function findBishopMoves(board: GameBoard, sqr: BoardSquare): number[] {
  const moves: number[] = [];

  const increments = [11, -11, 9, -9];
  for (let i = 0; i < increments.length; i++) {
    let j = sqr.index + increments[i];
    while (isValidIndex(j)) {
      const moveSqr = board[Math.floor(j / 10)][j % 10];
      if (!moveSqr || moveSqr.color === sqr.color) break;
      else if (moveSqr.color !== undefined && moveSqr.color !== sqr.color) {
        moves.push(j);
        break;
      } else {
        moves.push(j);
        j = j + increments[i];
      }
    }
  }

  return moves;
}

export function findPawnMoves(board: GameBoard, sqr: BoardSquare): number[] {
  const moves: number[] = [];
  const colorValue = sqr.color ? 1 : -1;
  const row = Math.floor(sqr.index / 10);

  //  advance
  const frontSqr = board[row - colorValue][sqr.index % 10];
  if (!frontSqr?.piece) {
    moves.push(frontSqr.index);
    let secondSqrIdx: number | null = null;
    if (sqr.color && row === 6) {
      secondSqrIdx = 4;
    } else if (sqr.color === false && row === 1) {
      secondSqrIdx = 3;
    }
    if (secondSqrIdx) {
      const secondFrontSqr = board[secondSqrIdx][sqr.index % 10];
      if (!secondFrontSqr.piece) {
        moves.push(secondFrontSqr.index);
      }
    }
  }

  // capture
  for (let i of [1, -1]) {
    const possibleCapture = board[row - colorValue][(sqr.index % 10) + i];
    if (
      possibleCapture &&
      possibleCapture.color !== undefined &&
      possibleCapture.color !== sqr.color
    ) {
      moves.push(possibleCapture.index);
    }
  }

  return moves;
}
