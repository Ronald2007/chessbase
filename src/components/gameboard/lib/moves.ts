import {
  GameBoard,
  GamePosition,
  Move,
  PieceMoves,
  PieceSquare,
} from "@/types";
import {
  convertIndexToRowCol,
  convertIndexToSquare,
  convertSquareToIndex,
  getSquare,
  isValidIndex,
  makeMove,
} from "./utils";
import { letters, numbers } from "./constants";
import { clone } from "@/lib/utils";

export function findMoves(
  board: GameBoard,
  index: number,
  lastMove: GamePosition
): Move[] {
  const sqr = getSquare(board, index);
  if (!sqr || sqr.id === undefined) return [];

  /* Finds moves without checking for checks */
  const piece = sqr.piece.toLowerCase();
  let moves: Move[] = [];
  if (piece === "n") {
    moves = findKnightMoves(board, sqr);
  } else if (piece === "r") {
    moves = findRookMoves(board, sqr);
  } else if (piece === "b") {
    moves = findBishopMoves(board, sqr);
  } else if (piece === "q") {
    moves = findQueenMoves(board, sqr);
  } else if (piece === "k") {
    moves = findKingMoves(board, sqr, lastMove?.cr);
  } else if (piece === "p") {
    moves = findPawnMoves(board, sqr, lastMove?.target);
  } else return [];

  /* Moves that don't end up in check */
  const newMoves = checkForChecks(clone(board), moves, lastMove);

  return newMoves;
}

export function findKnightMoves(board: GameBoard, sqr: PieceSquare): Move[] {
  const knightMoves = [-12, -21, -19, -8, 8, 19, 21, 12];
  const moves: Move[] = [];

  for (let i = 0; i < knightMoves.length; i++) {
    const move = sqr.index + knightMoves[i];
    if (!isValidIndex(move)) continue;
    const moveSqr = getSquare(board, move);
    if (!moveSqr || moveSqr.color !== sqr.color) {
      const notation =
        "N" + (moveSqr?.id ? "x" : "") + convertIndexToSquare(move);
      moves.push({ to: move, from: sqr.index, type: "normal", notation });
    }
  }

  return moves;
}

export function findKingMoves(
  board: GameBoard,
  sqr: PieceSquare,
  cr?: string | null
): Move[] {
  const kingMoves = [-11, -10, -9, 1, 11, 10, 9, -1];
  const moves: Move[] = [];

  for (let i = 0; i < kingMoves.length; i++) {
    const move = sqr.index + kingMoves[i];
    if (!isValidIndex(move)) continue;
    const moveSqr = getSquare(board, move);
    if (!moveSqr || moveSqr.color !== sqr.color) {
      const notation =
        "K" + (moveSqr?.id ? "x" : "") + convertIndexToSquare(move);
      moves.push({ to: move, from: sqr.index, type: "normal", notation });
    }
  }

  if (!cr) return moves;

  /* Handle castling */
  if (sqr.color && sqr.index === 74) {
    const srook = getSquare(board, 77);
    if (
      cr.includes("K") &&
      !getSquare(board, 75)?.piece &&
      !getSquare(board, 76)?.piece &&
      srook?.piece === "r" &&
      srook.color
    ) {
      moves.push({ to: 76, from: 74, type: "castle", notation: "O-O" });
    }
    const lrook = getSquare(board, 70);
    if (
      cr.includes("Q") &&
      !getSquare(board, 73)?.piece &&
      !getSquare(board, 72)?.piece &&
      !getSquare(board, 71)?.piece &&
      lrook?.piece === "r" &&
      lrook.color
    ) {
      moves.push({ to: 72, from: 74, type: "castle", notation: "O-O-O" });
    }
  } else if (!sqr.color && sqr.index === 4) {
    const srook = getSquare(board, 7);
    if (
      cr.includes("k") &&
      !getSquare(board, 5)?.piece &&
      !getSquare(board, 6)?.piece &&
      srook?.piece === "r" &&
      srook.color === false
    ) {
      moves.push({ to: 6, from: 4, type: "castle", notation: "O-O" });
    }
    const lrook = getSquare(board, 0);
    if (
      cr.includes("q") &&
      !getSquare(board, 3)?.piece &&
      !getSquare(board, 2)?.piece &&
      !getSquare(board, 1)?.piece &&
      lrook?.piece === "r" &&
      lrook.color === false
    ) {
      moves.push({ to: 2, from: 4, type: "castle", notation: "O-O-O" });
    }
  }

  return moves;
}

export function findRookMoves(board: GameBoard, sqr: PieceSquare): Move[] {
  const moves: Move[] = [];

  const increments = [-1, 1, -10, 10];
  for (let i = 0; i < increments.length; i++) {
    let j = sqr.index + increments[i];
    while (isValidIndex(j)) {
      const moveSqr = getSquare(board, j);
      if (!moveSqr || moveSqr.color === sqr.color) break;
      const notation = "R" + (moveSqr?.id ? "x" : "") + convertIndexToSquare(j);
      moves.push({ to: j, from: sqr.index, type: "normal", notation });
      if (moveSqr.id && moveSqr.color !== sqr.color) break;
      else j = j + increments[i];
    }
  }

  return moves;
}

export function findBishopMoves(board: GameBoard, sqr: PieceSquare): Move[] {
  const moves: Move[] = [];

  const increments = [11, -11, 9, -9];
  for (let i = 0; i < increments.length; i++) {
    let j = sqr.index + increments[i];
    while (isValidIndex(j)) {
      const moveSqr = board[Math.floor(j / 10)][j % 10];
      if (!moveSqr || moveSqr.color === sqr.color) break;
      const notation = "B" + (moveSqr?.id ? "x" : "") + convertIndexToSquare(j);
      moves.push({ to: j, from: sqr.index, type: "normal", notation });
      if (moveSqr.id && moveSqr.color !== sqr.color) break;
      else j = j + increments[i];
    }
  }

  return moves;
}

/* Rook moves and bishop moves combined */
export function findQueenMoves(board: GameBoard, sqr: PieceSquare): Move[] {
  const moves = [...findRookMoves(board, sqr), ...findBishopMoves(board, sqr)];
  return moves.map((move) => ({
    ...move,
    notation: "Q" + move.notation.slice(1),
  }));
}

export function findPawnMoves(
  board: GameBoard,
  sqr: PieceSquare,
  target?: string | null
): Move[] {
  const moves: Move[] = [];
  const colorValue = sqr.color ? 1 : -1;
  const [row, col] = convertIndexToRowCol(sqr.index);

  if (row === 0 || row === 7) return [];

  /* Advances */
  const frontSqr = board[row - colorValue][col];
  if (frontSqr.id === undefined) {
    const notation = convertIndexToSquare(frontSqr.index);
    moves.push({
      to: frontSqr.index,
      from: sqr.index,
      type: "normal",
      notation,
    });
    let secondSqrIdx: number | null = null;
    if (sqr.color && row === 6) {
      secondSqrIdx = 4;
    } else if (!sqr.color && row === 1) {
      secondSqrIdx = 3;
    }
    if (secondSqrIdx) {
      const secondFrontSqr = board[secondSqrIdx][col];
      if (secondFrontSqr.id === undefined) {
        const secondNotation = convertIndexToSquare(secondFrontSqr.index);
        moves.push({
          to: secondFrontSqr.index,
          from: sqr.index,
          type: "normal",
          notation: secondNotation,
        });
      }
    }
  }

  /* Captures */
  for (const i of [1, -1]) {
    const possibleCapture = board[row - colorValue][col + i];
    if (possibleCapture?.id && possibleCapture.color !== sqr.color) {
      const notation =
        letters[col] + "x" + convertIndexToSquare(possibleCapture.index);
      moves.push({
        to: possibleCapture.index,
        from: sqr.index,
        type: "normal",
        notation,
      });
    }
  }

  moves.forEach((move) => {
    const currRow = Math.floor(move.to / 10);
    if (currRow === 7 || currRow === 0) move.type = "promotion";
  });

  /* Enpassant */
  if (!(target?.length === 2)) return moves;
  const [trow, tcol] = convertIndexToRowCol(convertSquareToIndex(target));
  const targetIdx = trow * 10 + tcol;
  if (!isValidIndex(targetIdx)) return moves;
  for (const i of [1, -1]) {
    const capturingPawnIdx = targetIdx + 10 * colorValue + i;
    if (capturingPawnIdx === sqr.index) {
      const notation = letters[col] + "x" + convertIndexToSquare(targetIdx);
      moves.push({
        to: targetIdx,
        from: sqr.index,
        type: "enpassant",
        notation,
      });
    }
  }

  return moves;
}

export function isKingInCheck(
  board: GameBoard,
  move: Move,
  lastMove: GamePosition,
  kingColor: boolean,
  kingSqr?: PieceSquare
): boolean {
  const sqr = getSquare(board, move.from);
  if (!sqr || sqr.id === undefined) return false;

  /* Find position of king */
  let dummyKingSqr: PieceSquare;
  if (kingSqr) {
    dummyKingSqr = kingSqr;
  } else {
    let kingPosition = -1;
    if (sqr.piece === "k" && sqr.color === kingColor) kingPosition = sqr.index;
    else {
      for (const row of board) {
        for (const col of row) {
          if (col && col.piece === "k" && col.color === kingColor) {
            kingPosition = col.index;
          }
        }
      }
    }
    if (!isValidIndex(kingPosition)) return false;
    dummyKingSqr = {
      id: `${kingColor ? "K" : "k"}0`,
      piece: "k",
      color: kingColor,
      index: kingPosition,
    };
  }

  /* If the piece moved was the king, update its position */
  if (sqr.piece === "k" && sqr.color === dummyKingSqr.color) {
    dummyKingSqr.index = move.to;
  }

  /* Create clone of the board */
  let tempBoard: GameBoard = clone(board);

  /* Make move, otherwise no move was done */
  if (move.from !== move.to) {
    // makeMove takes care of complex moves
    tempBoard = makeMove(tempBoard, move, lastMove).board;
  }

  /* Check for knight threats */
  const knightThreats = findKnightMoves(tempBoard, dummyKingSqr);
  for (const t of knightThreats) {
    const tsqr = getSquare(tempBoard, t.to);
    if (tsqr && tsqr.piece === "n" && tsqr.color !== kingColor) {
      return true;
    }
  }

  /* Check for threats on columns or file */
  const rookThreats = findRookMoves(tempBoard, dummyKingSqr);
  for (const t of rookThreats) {
    const tsqr = getSquare(tempBoard, t.to);
    if (
      tsqr &&
      (tsqr.piece === "r" || tsqr.piece === "q") &&
      tsqr.color !== kingColor
    ) {
      return true;
    }
  }

  /* Check for threats along diagonals */
  const bishopThreats = findBishopMoves(tempBoard, dummyKingSqr);
  for (const t of bishopThreats) {
    const tsqr = getSquare(tempBoard, t.to);
    if (
      tsqr &&
      (tsqr.piece === "b" || tsqr.piece === "q") &&
      tsqr.color !== kingColor
    ) {
      return true;
    }
  }

  /* Check for pawn threats, enpassant doesn't need to be checked */
  const colorValue = kingColor ? 1 : -1;
  const [krow, kcol] = convertIndexToRowCol(dummyKingSqr.index);
  for (const c of [-1, 1]) {
    const tsqr = tempBoard[krow - colorValue]?.at(kcol + c);
    if (tsqr && tsqr.piece === "p" && tsqr.color !== kingColor) {
      return true;
    }
  }

  return false;
}

export function checkForChecks(
  board: GameBoard,
  moves: Move[],
  lastMove: GamePosition
) {
  if (moves.length === 0) return [];
  const sqr = getSquare(board, moves[0].from);
  if (!sqr || sqr.id === undefined) return [];

  /* Find king position, so that isKingInCheck doesn't need to */
  let kingPosition = -1;
  let enemyKingPos = -1;
  if (sqr.piece === "k") kingPosition = sqr.index;
  else {
    for (const row of board) {
      for (const col of row) {
        if (col && col.piece === "k") {
          if (col.color === sqr.color) kingPosition = col.index;
          else enemyKingPos = col.index;
        }
      }
    }
  }
  const dummyKingSqr = getSquare(board, kingPosition);
  if (!dummyKingSqr || dummyKingSqr.id === undefined) return [];

  // stores moves to be deleted
  const movesToDelete: number[] = [];
  /* Go through every possible move */
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    /* Check square before castling */
    const self_move = { ...move, to: move.from };
    if (move.type === "castle" && sqr.piece === "k") {
      if (isKingInCheck(board, self_move, lastMove, sqr.color, dummyKingSqr)) {
        movesToDelete.push(move.to);
        continue;
      }
      let toDelete = false;
      for (const increment of [1, -1]) {
        if (
          move.to === move.from + 2 * increment &&
          isKingInCheck(
            board,
            { ...move, to: move.from + increment },
            lastMove,
            sqr.color,
            dummyKingSqr
          )
        ) {
          toDelete = true;
          break;
        }
      }
      if (toDelete) {
        movesToDelete.push(move.to);
        continue;
      }
    }

    /* Check actual square */
    if (isKingInCheck(board, move, lastMove, sqr.color, dummyKingSqr)) {
      movesToDelete.push(move.to);
      continue;
    }

    /* Check if enemy king is in check */
    const enemyKingSqr = getSquare(board, enemyKingPos);
    if (!enemyKingSqr || enemyKingSqr?.id === undefined) continue;
    if (isKingInCheck(board, move, lastMove, !sqr.color, enemyKingSqr)) {
      move.notation += "+";
    }
  }

  /* Delete moves that had checks */
  return moves.filter((m) => !movesToDelete.includes(m.to));
}

/* Find moves for all playable pieces */
export function findAllMoves(lastMove: GamePosition) {
  const board = lastMove.board;
  const turn = lastMove.turn;
  const allMoves: PieceMoves[] = [];
  for (const row of board) {
    for (const sqr of row) {
      if (sqr.color === turn) {
        allMoves.push({
          ...sqr,
          moves: findMoves(board, sqr.index, lastMove),
        });
      }
    }
  }

  // find same pieces that have same moves
  for (let i = 0; i < allMoves.length; i++) {
    const pieceMove = allMoves[i];
    const fromSquare = getSquare(board, pieceMove.index);
    if (!fromSquare || fromSquare.id === undefined) continue;
    if (fromSquare.piece !== "r" && fromSquare.piece !== "n") continue;

    for (let j = 0; j < pieceMove.moves.length; j++) {
      const move = pieceMove.moves[j];
      if (move.type !== "normal") break;
      const other = allMoves.find(
        (sqr) =>
          sqr.index !== fromSquare.index &&
          sqr.id[0] === fromSquare.id[0] &&
          sqr.moves.find((m) => m.to === move.to)
      );
      if (!other) continue;
      // different columns
      if (other.index % 10 !== fromSquare.index % 10) {
        move.notation =
          move.notation[0] +
          letters[fromSquare.index % 10] +
          move.notation.slice(1);
      } else if (
        Math.floor(other.index / 10) !== Math.floor(fromSquare.index / 10)
      ) {
        move.notation =
          move.notation[0] +
          numbers[Math.floor(fromSquare.index / 10)] +
          move.notation.slice(1);
      }
    }
  }

  return allMoves;
}
