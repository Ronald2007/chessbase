import { Point } from "@/types";
import React from "react";
import { View, Pressable } from "react-native";
import { PieceSVG } from "./lib/pieces";

interface Props {
  point: Point;
  color: boolean;
  selectPiece: (piece: string) => void;
}

export default function SelectPromotion({
  point,
  color,
  selectPiece,
}: Props): JSX.Element {
  const pieces = ["q", "r", "b", "n"];

  return (
    <View
      className={`w-[12.5%] h-[50%] absolute flex z-30 items-center justify-center bg-gray-200 ${
        color ? "flex-col" : "flex-col-reverse"
      }`}
      style={{
        left: point.x,
        top: point.y,
      }}
    >
      {pieces.map((piece) => {
        return (
          <Pressable
            key={piece}
            className={`w-full h-[25%] flex items-center justify-center border`}
            onPress={() => {
              selectPiece(piece);
            }}
          >
            <PieceSVG piece={piece} color={color} />
          </Pressable>
        );
      })}
    </View>
  );
}
