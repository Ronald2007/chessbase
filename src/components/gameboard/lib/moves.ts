import {
  BoardSquare,
  GameBoard,
  GameMove,
  Move,
  MoveType,
  PieceMoves,
} from "@/types";
import { getSquare, isValidIndex, makeMove } from "./utils";
import { letters, numbers } from "./settings";

export function findMoves(
  board: GameBoard,
  index: number,
  lastMove: GameMove
): Move[] {
  const sqr = isValidIndex(index) && getSquare(board, index);
  if (!sqr) return [];

  /* Finds moves without checking for checks */
  let moves: Move[] = [];
  if (sqr.piece === "n") {
    moves = findKnightMoves(board, sqr);
  } else if (sqr.piece === "r") {
    moves = findRookMoves(board, sqr);
  } else if (sqr.piece === "b") {
    moves = findBishopMoves(board, sqr);
  } else if (sqr.piece === "q") {
    moves = findQueenMoves(board, sqr);
  } else if (sqr.piece === "k") {
    moves = findKingMoves(board, sqr, lastMove?.cr);
  } else if (sqr.piece === "p") {
    moves = findPawnMoves(board, sqr, lastMove?.target);
  }

  /* Moves that don't end up in check */
  const newMoves = checkForChecks(
    JSON.parse(JSON.stringify(board)),
    moves,
    lastMove
  );

  return newMoves;
}

export function findKnightMoves(board: GameBoard, sqr: BoardSquare): Move[] {
  const knightMoves = [-12, -21, -19, -8, 8, 19, 21, 12];
  const moves: Move[] = [];

  for (let i = 0; i < knightMoves.length; i++) {
    const move = sqr.index + knightMoves[i];
    if (!isValidIndex(move)) continue;
    const moveSqr = getSquare(board, move);
    if (!moveSqr || moveSqr.color !== sqr.color) {
      moves.push({ to: move, from: sqr.index, type: "normal" });
    }
  }

  return moves;
}

export function findKingMoves(
  board: GameBoard,
  sqr: BoardSquare,
  cr?: string | null
): Move[] {
  const kingMoves = [-11, -10, -9, 1, 11, 10, 9, -1];
  const moves: Move[] = [];

  for (let i = 0; i < kingMoves.length; i++) {
    const move = sqr.index + kingMoves[i];
    if (!isValidIndex(move)) continue;
    const moveSqr = getSquare(board, move);
    if (!moveSqr || moveSqr.color !== sqr.color) {
      moves.push({ to: move, from: sqr.index, type: "normal" });
    }
  }

  if (!cr) return moves;

  /* Handle castling */
  if (sqr.color && sqr.index === 74) {
    const srook = getSquare(board, 77);
    const lrook = getSquare(board, 70);
    if (
      cr.includes("K") &&
      !getSquare(board, 75)?.piece &&
      !getSquare(board, 76)?.piece &&
      srook?.piece === "r" &&
      srook?.color
    ) {
      moves.push({ to: 76, from: 74, type: "castle" });
    }
    if (
      cr.includes("Q") &&
      !getSquare(board, 73)?.piece &&
      !getSquare(board, 72)?.piece &&
      !getSquare(board, 71)?.piece &&
      lrook?.piece === "r" &&
      lrook?.color
    ) {
      moves.push({ to: 72, from: 74, type: "castle" });
    }
  } else if (sqr.color === false && sqr.index === 4) {
    const srook = getSquare(board, 7);
    const lrook = getSquare(board, 0);
    if (
      cr.includes("k") &&
      !getSquare(board, 5)?.piece &&
      !getSquare(board, 6)?.piece &&
      srook?.piece === "r" &&
      srook?.color === false
    ) {
      moves.push({ to: 6, from: 4, type: "castle" });
    }
    if (
      cr.includes("q") &&
      !getSquare(board, 3)?.piece &&
      !getSquare(board, 2)?.piece &&
      !getSquare(board, 1)?.piece &&
      lrook?.piece === "r" &&
      lrook?.color === false
    ) {
      moves.push({ to: 2, from: 4, type: "castle" });
    }
  }

  return moves;
}

export function findRookMoves(board: GameBoard, sqr: BoardSquare): Move[] {
  const moves: Move[] = [];

  const increments = [-1, 1, -10, 10];
  for (let i = 0; i < increments.length; i++) {
    let j = sqr.index + increments[i];
    while (isValidIndex(j)) {
      const moveSqr = getSquare(board, j);
      if (!moveSqr || moveSqr.color === sqr.color) break;
      else if (moveSqr.color !== undefined && moveSqr.color !== sqr.color) {
        moves.push({ to: j, from: sqr.index, type: "normal" });
        break;
      } else {
        moves.push({ to: j, from: sqr.index, type: "normal" });
        j = j + increments[i];
      }
    }
  }

  return moves;
}

export function findBishopMoves(board: GameBoard, sqr: BoardSquare): Move[] {
  const moves: Move[] = [];

  const increments = [11, -11, 9, -9];
  for (let i = 0; i < increments.length; i++) {
    let j = sqr.index + increments[i];
    while (isValidIndex(j)) {
      const moveSqr = board[Math.floor(j / 10)][j % 10];
      if (!moveSqr || moveSqr.color === sqr.color) break;
      else if (moveSqr.color !== undefined && moveSqr.color !== sqr.color) {
        moves.push({ to: j, from: sqr.index, type: "normal" });
        break;
      } else {
        moves.push({ to: j, from: sqr.index, type: "normal" });
        j = j + increments[i];
      }
    }
  }

  return moves;
}

/* Rook moves and bishop moves combined */
export function findQueenMoves(board: GameBoard, sqr: BoardSquare): Move[] {
  return [...findRookMoves(board, sqr), ...findBishopMoves(board, sqr)];
}

export function findPawnMoves(
  board: GameBoard,
  sqr: BoardSquare,
  target?: string | null
): Move[] {
  const moves: Move[] = [];
  const colorValue = sqr.color ? 1 : -1;
  const row = Math.floor(sqr.index / 10);

  if (row === 0 || row === 7) return [];

  /* Advances */
  const frontSqr = board[row - colorValue][sqr.index % 10];
  if (!frontSqr?.piece) {
    moves.push({ to: frontSqr.index, from: sqr.index, type: "normal" });
    let secondSqrIdx: number | null = null;
    if (sqr.color && row === 6) {
      secondSqrIdx = 4;
    } else if (sqr.color === false && row === 1) {
      secondSqrIdx = 3;
    }
    if (secondSqrIdx) {
      const secondFrontSqr = board[secondSqrIdx][sqr.index % 10];
      if (!secondFrontSqr.piece) {
        moves.push({
          to: secondFrontSqr.index,
          from: sqr.index,
          type: "normal",
        });
      }
    }
  }

  /* Captures */
  for (let i of [1, -1]) {
    const possibleCapture = board[row - colorValue][(sqr.index % 10) + i];
    if (
      possibleCapture &&
      possibleCapture.color !== undefined &&
      possibleCapture.color !== sqr.color
    ) {
      moves.push({
        to: possibleCapture.index,
        from: sqr.index,
        type: "normal",
      });
    }
  }

  moves.forEach((move) => {
    const currRow = Math.floor(move.to / 10);
    if (currRow === 7 || currRow === 0) {
      move.type = "promotion";
    }
  });

  /* Enpassant */
  if (!(target?.length === 2)) return moves;
  const col = letters.findIndex((l) => l === target[0]);
  const trow = numbers.findIndex((n) => n === parseInt(target[1]));
  if (trow < 0 || col < 0) return moves;
  const targetIdx = trow * 10 + col;
  const targetPawnIdx = targetIdx + 10 * colorValue;

  for (let i of [1, -1]) {
    const possibleCapture = board[row - colorValue][(sqr.index % 10) + i];
    const targetSqr = getSquare(board, targetPawnIdx);
    if (
      possibleCapture &&
      targetSqr &&
      targetSqr.piece === "p" &&
      possibleCapture.index === targetIdx &&
      targetSqr.color !== sqr.color
    ) {
      moves.push({
        to: possibleCapture.index,
        from: sqr.index,
        type: "enpassant",
      });
    }
  }

  return moves;
}

export function isKingInCheck(
  board: GameBoard,
  move: Move,
  lastMove: GameMove,
  kingSqr?: BoardSquare
): boolean {
  const sqr = getSquare(board, move.from);
  if (!sqr) return false;

  /* Find position of king */
  let dummyKingSqr: BoardSquare;
  if (!kingSqr) {
    let kingPosition: number | null = null;
    if (sqr.piece === "k") kingPosition = sqr.index;
    else {
      for (let row of board) {
        for (let col of row) {
          if (col && col.piece === "k" && col.color === sqr.color) {
            kingPosition = col.index;
          }
        }
      }
    }
    if (!kingPosition) return false;
    dummyKingSqr = {
      id: `${sqr.color ? "K" : "k"}0`,
      piece: "k",
      color: sqr.color,
      index: kingPosition,
    };
  } else {
    dummyKingSqr = kingSqr;
  }

  /* If the piece moved was the king, update its position */
  if (sqr.piece === "k") {
    dummyKingSqr.index = move.to;
  }

  /* Create clone of the board */
  let tempBoard: GameBoard = JSON.parse(JSON.stringify(board));

  /* Make move, otherwise no move was done */
  if (move.from !== move.to) {
    // makeMove takes care of complex moves
    tempBoard = makeMove(tempBoard, move, lastMove).board;
  }

  /* Check for knight threats */
  const knightThreats = findKnightMoves(tempBoard, dummyKingSqr);
  for (let t of knightThreats) {
    const tsqr = getSquare(tempBoard, t.to);
    if (tsqr && tsqr.piece === "n" && tsqr.color !== sqr.color) {
      return true;
    }
  }

  /* Check for threats on columns or file */
  const rookThreats = findRookMoves(tempBoard, dummyKingSqr);
  for (let t of rookThreats) {
    const tsqr = getSquare(tempBoard, t.to);
    if (
      tsqr &&
      (tsqr.piece === "r" || tsqr.piece === "q") &&
      tsqr.color !== sqr.color
    ) {
      return true;
    }
  }

  /* Check for threats along diagonals */
  const bishopThreats = findBishopMoves(tempBoard, dummyKingSqr);
  for (let t of bishopThreats) {
    const tsqr = getSquare(tempBoard, t.to);
    if (
      tsqr &&
      (tsqr.piece === "b" || tsqr.piece === "q") &&
      tsqr.color !== sqr.color
    ) {
      return true;
    }
  }

  /* Check for pawn threats, enpassant doesn't need to be checked */
  const colorValue = sqr.color ? 1 : -1;
  const kpos = dummyKingSqr.index;
  for (let c of [-1, 1]) {
    const tsqr = tempBoard[Math.floor(kpos / 10) - colorValue][(kpos % 10) + c];
    if (tsqr && tsqr.piece === "p" && tsqr.color !== sqr.color) {
      return true;
    }
  }

  return false;
}

export function checkForChecks(
  board: GameBoard,
  moves: Move[],
  lastMove: GameMove
) {
  if (moves.length === 0) return [];
  const sqr = getSquare(board, moves[0].from);
  if (!sqr) return [];

  /* Find king position, so that isKingInCheck doesn't need to */
  let kingPosition: number | null = null;
  if (sqr.piece === "k") kingPosition = sqr.index;
  else {
    for (let row of board) {
      for (let col of row) {
        if (col && col.piece === "k" && col.color === sqr.color) {
          kingPosition = col.index;
        }
      }
    }
  }
  if (!kingPosition) return [];
  const dummyKingSqr: Required<BoardSquare> = {
    id: `${sqr.color ? "K" : "k"}0`,
    piece: "k",
    color: sqr.color ?? false,
    index: kingPosition,
  };

  /* Go through every possible move */
  // stores moves to be deleted
  const movesToDelete: number[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    /* Check square before castling */
    if (move.type === "castle" && sqr.piece === "k") {
      const self_move = { ...move, to: move.from };
      if (isKingInCheck(board, self_move, lastMove, dummyKingSqr)) {
        movesToDelete.push(move.to);
        continue;
      }

      let toDelete = false;
      for (let mi of [74, 4]) {
        if (toDelete) break;
        for (let increment of [1, -1]) {
          if (
            move.from === mi &&
            move.to === move.from + 2 * increment &&
            isKingInCheck(
              board,
              { ...move, to: mi + increment },
              lastMove,
              dummyKingSqr
            )
          ) {
            toDelete = true;
            break;
          }
        }
      }
      if (toDelete) {
        movesToDelete.push(move.to);
        continue;
      }
    }

    /* Check actual square */
    if (isKingInCheck(board, move, lastMove, dummyKingSqr)) {
      movesToDelete.push(move.to);
    }
  }

  /* Delete moves that had checks */
  for (let d of movesToDelete) {
    const idx = moves.findIndex((m) => m.to === d);
    if (idx > -1) {
      moves.splice(idx, 1);
    }
  }

  return moves;
}

/* Find moves for all playable pieces */
export function findAllMoves(lastMove: GameMove) {
  const board = lastMove.board;
  const turn = lastMove.turn;
  const allMoves: PieceMoves[] = [];
  for (let row of board) {
    for (let sqr of row) {
      if (sqr.color === turn) {
        allMoves.push({
          index: sqr.index,
          moves: findMoves(board, sqr.index, lastMove),
        });
      }
    }
  }

  return allMoves;
}
