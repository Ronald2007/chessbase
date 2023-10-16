import { pgnSample } from "@/lib/pgn/samples";
import { pgnToGame } from "@/lib/pgn";
import { dividePGNGames, extractTagsFromPGN } from "@/lib/pgn/helpers";

describe("PGN Converter", () => {
  const pgns = dividePGNGames(pgnSample);

  it("divide database into list of game pgns", () => {
    expect(pgns.length).toEqual(15);
  });

  it("get details of game", () => {
    const tags0 = {
      Event: "Florida State Championship ",
      Site: "West Palm Beach",
      Date: "2019.10.05",
      Round: "1",
      White: "Ronald Hernadez",
      Black: "Julio Becerra",
      Result: "0-1",
      ECO: "C55",
      WhiteElo: "2126",
      BlackElo: "2599",
      PlyCount: "57",
      EventDate: "2019.??.??",
    };
    expect(extractTagsFromPGN(pgns[0])).toEqual(tags0);
  });

  it("converts pgn to game", () => {
    for (const pgn of pgns) {
      const { moves } = pgnToGame(pgn);
      expect(moves.length).toBeGreaterThan(1);
    }
  });
});
