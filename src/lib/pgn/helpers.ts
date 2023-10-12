// move regex
// /(?:(?:[KQRNB][a-h]?|[a-h])?x?[a-h][1-8])|O-O|O-O-O(?:\+|#|(?:=[QRBN]))?/gmi

import { convertFENtoGame, convertGameToFEN } from "@/lib/fen";
import { findAllMoves } from "@/components/gameboard/lib/moves";
import { initialFEN } from "@/components/gameboard/lib/settings";
import {
  convertSquareToIndex,
  makeMove,
} from "@/components/gameboard/lib/utils";
import { GameMove, GamePosition, Move } from "@/types";

export function extractTagsFromPGN(tagtext: string) {
  const tagList: string[] = tagtext.match(/\[\s*\w+\s*".+"\s*\]/gm) ?? [];
  const tags: Record<string, string> = {};
  tagList.forEach((tag) => {
    const [key, value] = tag
      .trim()
      .slice(1, -1)
      .trim()
      .split(/\s*(?=".*")/m);
    tags[key] = value.slice(1, -1);
  });
  return tags;
}

export function extractMovesFromPGN(movetext: string) {
  // /(?=[A-Za-z][a-zA-Z0-9=-]+)(?!([^(]*\))|([^{]*\}))(\b)/gm
  // /(?<![({].*)\b[A-Za-z][a-zA-Z0-9=-]+\b(?!([^(]*\))|([^{]*\}))/gm
  const tokens: string[] = [];
  let item = "";
  let blank = 0;
  let pc = 0;
  let bc = 0;
  let i = 0;
  while (i < movetext.length) {
    const t = movetext[i];
    const inside = pc > 0 || bc > 0;
    const ppc = pc;
    const pbc = bc;
    if (inside) blank = 0;
    if (t === "(") pc += 1;
    else if (t === ")") pc -= 1;
    else if (t === "{") bc += 1;
    else if (t === "}") bc -= 1;
    else if (t === " " && !inside) blank += 1;
    else if ((t === "\n" || t === "\r") && !inside) {
      tokens.push(item);
      item = "";
      blank = 0;
      i += 1;
      continue;
    } else {
      if (blank > 0 && !inside) {
        tokens.push(item);
        item = "";
        blank = 0;
      }
    }
    const mod = ppc !== pc || pbc !== bc;
    if (mod) blank = 0;
    if (mod && !inside) {
      tokens.push(item);
      item = "";
    }

    item += t;
    if (pc <= 0 && bc <= 0 && mod) {
      tokens.push(item);
      item = "";
      blank = 0;
    }

    i += 1;
  }
  tokens.push(item);

  const clone = <T>(item: T): T => JSON.parse(JSON.stringify(item));

  const emptyMove: {
    notation: string | null;
    comments: string[];
    variations: string[];
  } = { notation: null, comments: [], variations: [] };
  let move = clone({ ...emptyMove });
  const moveList: (typeof move)[] = [];
  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t].trim();
    if (token === "") continue;
    if (token.match(/^\{.*\}$/ms)) {
      move.comments.push(token.slice(1, -1).trim());
    } else if (token.match(/^\(.*\)$/ms)) {
      move.variations.push(token.slice(1, -1).trim());
    } else if (token.match(/[A-Za-z][a-zA-Z0-9=+#-]+/)) {
      moveList.push(move);
      move = clone({ ...emptyMove });
      move.notation = token.replace(/\+|#/, "");
    } else continue;
  }
  moveList.push(move);

  // const rawMoves = tokens

  // console.log(rawMoves);

  // const moveList = rawMoves.map((move) => {
  //   const notation = move
  //     .match(/[A-Za-z][a-zA-Z0-9=-]+(?!([^(]*\))|([^{]*\}))/)
  //     ?.at(0);
  //   const comments = (move.match(/\{.*?[^{]*\}/g) ?? [])
  //     .map((c) => c.slice(1, -1))
  //     .filter((c) => c.trim() !== "");
  //   const variations = (move.match(/\(.*?[^(]*\)/g) ?? [])
  //     .map((v) => v.slice(1, -1))
  //     .filter((v) => v.trim() !== "");

  //   return { notation, comments, variations };
  // });

  // console.log(moveList);
  return moveList;
}

export function notationToMove(notation: string, last: GamePosition): Move {
  const move: Move = {
    from: -1,
    to: -1,
    notation: notation,
    type: "normal",
  };

  let square = notation.slice(-2);
  if (notation === "O-O" || notation === "O-O-O") {
    move.type = "castle";
    if (last.turn) {
      move.from = 74;
      if (notation === "O-O") square = "g1";
      else if (notation === "O-O-O") square = "c1";
    } else if (!last.turn) {
      move.from = 4;
      if (notation === "O-O") square = "g8";
      else if (notation === "O-O-O") square = "c8";
    }
  } else if (notation.includes("=")) {
    move.type = "promotion";
    square = notation.slice(-4, -2);
  }

  const piece =
    move.type === "castle"
      ? "K"
      : notation[0].toLowerCase() === notation[0]
      ? "p"
      : notation[0];

  move.to = convertSquareToIndex(square);
  // console.log("last: ", last);
  const moves = findAllMoves(last);
  const samePieces = moves.filter(
    (m) =>
      m.piece === piece.toLowerCase() && m.moves.find((pm) => pm.to === move.to)
  );
  if (samePieces.length === 0) return move;
  // if (samePieces.length > 1) console.log(samePieces);

  move.from = samePieces[0].moves[0].from;
  const samePiece = samePieces.find((sp) =>
    sp.moves.find((m) => m.notation === move.notation)
  );
  const foundMove = samePiece?.moves.find((m) => m.notation === move.notation);

  return foundMove ?? move;
}

export function createGame(
  moveList: ReturnType<typeof extractMovesFromPGN>,
  startMove?: GameMove,
  positionNumber: number[] = []
) {
  const startingMove = startMove ?? {
    ...convertFENtoGame(initialFEN)!,
    comments: [],
    variations: [],
    positionNumber: [0],
  };
  const game: GameMove[] = [
    // { ...startMove, variations: [], comments: [], positionNumber: [0] },
  ];
  if (positionNumber.length === 0) {
    game.push(startingMove);
  }
  // const firstMove = moveList[0];
  // if (firstMove && !firstMove.notation) {
  //   game[0].comments = firstMove.comments;
  // }

  moveList.forEach((move, idx) => {
    if (!move.notation) {
      return;
    }

    const lastMove = game[game.length - 1] ?? startingMove;
    // console.log(move.notation);
    const madeMove = notationToMove(move.notation, lastMove);
    // console.log(lastMove.turn, madeMove);
    const changed = makeMove(lastMove.board, madeMove, lastMove);
    const newMove: GamePosition = {
      board: changed.board,
      turn: !lastMove.turn,
      cr: changed.cr,
      target: changed.target,
      hm: 0,
      fm: !lastMove.turn ? lastMove.fm + 1 : lastMove.fm,
      prevMove: madeMove,
      fen: "",
    };
    newMove.fen = convertGameToFEN(newMove);
    game.push({
      ...newMove,
      variations: move.variations.map((v, vidx) =>
        createGame(extractMovesFromPGN(v), lastMove, [
          ...positionNumber,
          idx,
          vidx,
        ])
      ),
      // variations: [],
      comments: move.comments,
      positionNumber: [...positionNumber, idx],
    });
  });

  return game;
}

export function dividePGNGames(pgn: string) {
  const games = pgn.split(/(?<=[A-Za-z0-9])\s*(?=\[)/gm);
  return games;
}
