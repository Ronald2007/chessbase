import {
  initialFEN,
  testFEN1,
  testFEN2,
  testFEN3,
  testFEN4,
} from "@/lib/fen/samples";
import { convertFENtoGame, convertGameToFEN } from "@/lib/fen";

describe("FEN conversion", () => {
  it("conversion", () => {
    const fens = [initialFEN, testFEN1, testFEN2, testFEN3, testFEN4];
    // const m0 = performance.now();
    for (const fen of fens) {
      expect(convertGameToFEN(convertFENtoGame(fen)!)).toEqual(fen);
    }
    // const m1 = performance.now();
    // console.log("time: ", m1 - m0);
  });
});
