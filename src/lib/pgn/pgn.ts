// tags
// /\[\s*[A-Za-z0-9_]+\s*".+"\s*\]/gm
// const games = pgn.split(/(?<=[A-Za-z0-9])\s*(?=\[)/gm);
// for (let i = 0; i < games.length; i++) {
// const s = movetext.split(/\{.*\}/gms);
// const moveList: string[] = s.join("").match(/[A-Za-z][a-zA-Z0-9=-]+/gm) ?? [];

import { createGame, extractMovesFromPGN, extractTagsFromPGN } from "./helpers";

export function pgnToGame(pgn: string) {
  console.log("pgn convert");
  const gamepgn = pgn.replaceAll(/^%.+\n/g, "");
  const [tagtext, movetext] = gamepgn.split(/(?<=\])\s*(?=[A-Za-z0-9.])/gm);

  /* Get Tags */
  const tags = extractTagsFromPGN(tagtext);

  /* Get moves */
  const moveList = extractMovesFromPGN(movetext);
  // console.log(moveList);

  /* Create game */
  const game = createGame(moveList);

  return game;
}
