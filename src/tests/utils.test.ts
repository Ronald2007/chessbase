import { convertIndexToSquare } from "@/components/gameboard/lib/utils";

describe("Test utility functions", () => {
  it("converts index to letter and number", () => {
    expect(convertIndexToSquare(76)).toEqual("g1");
    expect(convertIndexToSquare(64)).toEqual("e2");
    expect(convertIndexToSquare(78)).toEqual("h1");
  });
});
