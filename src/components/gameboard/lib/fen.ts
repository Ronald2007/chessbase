import { FENarray, GameBoard, GamePosition } from "@/types";

// const [pfen, turn, cr, target, hm, fm] = fen.split(" ");
export function convertFENtoBoard(fen: string) {
  const pfen = fen.split(" ")[0];
  if (!pfen) return;

  const board: GameBoard = [];
  let row = 0;
  board.push([]);
  for (let i = 0; i < pfen.length; i++) {
    if (!board[row] || !pfen[i]) return;
    if (pfen[i] === "/") {
      board.push([]);
      row++;
    } else if (parseInt(pfen[i]) <= 8) {
      for (let j = 0; j < parseInt(pfen[i]); j++) {
        board[row].push({ index: parseInt(`${row}${board[row].length}`) });
      }
    } else {
      board[row].push({
        index: parseInt(`${row}${board[row].length}`),
        piece: pfen[i].toLowerCase(),
        color: pfen[i].toLowerCase() !== pfen[i],
      });
    }
  }

  return board;
}

export function convertBoardtoFEN(board: GameBoard): string {
  let fen = "";
  for (let i = 0; i < board.length; i++) {
    let emptycount = 0;
    for (let j = 0; j < board[i].length; j++) {
      const sqr = board[i][j];
      if (!sqr.piece) {
        emptycount++;
        continue;
      } else {
        if (emptycount > 0) {
          fen += emptycount;
          emptycount = 0;
        }
        if (sqr.color) {
          fen += sqr.piece.toUpperCase();
        } else fen += sqr.piece;
      }
    }
    if (emptycount > 0) {
      fen += emptycount;
      emptycount = 0;
    }
    if (i !== board.length - 1) {
      fen += "/";
    }
  }

  return fen;
}

export function convertFENtoGame(fen: string): GamePosition | undefined {
  const fenValues = fen.split(" ") as FENarray;
  if (fenValues.length !== 6) return;

  const [pfen, turn, cr, target, hm, fm] = fenValues;
  const board = convertFENtoBoard(pfen);
  if (!board) return;

  return {
    board,
    fen,
    turn: turn === "w",
    cr: cr === "-" ? null : cr,
    target: target === "-" ? null : target,
    hm: parseInt(hm) ?? 0,
    fm: parseInt(fm) ?? 0,
  };
}
