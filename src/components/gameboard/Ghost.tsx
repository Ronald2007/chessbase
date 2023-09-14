import { LayoutRect, SquarePoint } from "@/types";
import React from "react";
import { View } from "react-native";
import { convertIndexToPoint, isValidIndex } from "./lib/utils";
import { PieceSVG } from "./lib/pieces";

interface Props {
  drag: SquarePoint;
  layoutRect: LayoutRect;
  flip?: boolean;
}

export default function GhostPiece({
  drag,
  layoutRect,
  flip,
}: Props): JSX.Element {
  const { index, color, piece } = drag.payload;
  console.log("ghost");
  if (!isValidIndex(index) || !piece || color === undefined) return <></>;

  const point = convertIndexToPoint(index, layoutRect, !!flip);
  console.log(point);
  const { x: dx, y: dy } = {
    x: point.x - layoutRect.x,
    y: point.y - layoutRect.y,
  };

  console.log("ghost shown");
  return (
    <View
      className={`w-[12.5%] h-[12.5%] absolute flex items-center justify-center opacity-50 z-10`}
      style={{ transform: [{ translateX: dx }, { translateY: dy }] }}
    >
      <PieceSVG piece={piece} color={color} />
    </View>
  );
}
