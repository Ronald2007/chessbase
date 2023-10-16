import { Game, GameMove } from "@/types";

export function gameToPGN(game: Game): string {
  let pgn = "";

  // tags
  const tagNames = Object.keys(game.details);
  for (const key of tagNames) {
    pgn += `[${key} "${game.details[key]}"]\r\n`;
  }

  pgn += "\r\n";

  // moves
  const tokens = convertMovesToTokens(game.moves.slice(1));

  tokens.push(game.details.Result ?? "*");

  for (const t of tokens) {
    const token = t.trim();
    if (token === "") continue;
    const lastLine = pgn.split("\r\n").at(-1) ?? "";
    if (lastLine.length + 1 + token.length > 79) {
      pgn += "\r\n";
    } else if (lastLine.length > 0) {
      pgn += " ";
    }
    pgn += token;
  }

  pgn += "\r\n";

  return pgn;
}

function convertMovesToTokens(moves: GameMove[]) {
  const tokens: string[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    // white's turn
    const numbering = !move.turn
      ? `${move.fm}.`
      : i === 0
      ? `${move.fm - 1}...`
      : "";

    const comments = move.comments.flatMap((comment) => {
      const coms = `{${comment}}`.split(" ");
      return coms;
    });
    const variations = move.variations.flatMap((v) => {
      const text = `(${convertMovesToTokens(v).join(" ")})`.split(" ");
      return text;
    });

    tokens.push(
      numbering,
      move.prevMove?.notation ?? "",
      move.prevMove?.symbol ?? "",
      ...comments,
      ...variations
    );
  }

  return tokens;
}
