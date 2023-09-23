import { BoardSquare, Point } from "@/types";
import React from "react";
import { View } from "react-native";
import { isValidIndex } from "./lib/utils";
import { PieceSVG } from "./lib/pieces";

interface Props {
  square: Required<BoardSquare>;
  point: Point;
}

export default function GhostPiece({ square, point }: Props): JSX.Element {
  const { index, color, piece } = square;
  if (!isValidIndex(index) || !piece || color === undefined) return <></>;

  return (
    <View
      className={`w-[12.5%] h-[12.5%] absolute opacity-50 z-10`}
      style={{ left: point.x, top: point.y }}
    >
      <PieceSVG piece={piece} color={color} />
    </View>
  );
}
