import { LayoutRect } from "@/types";
import React from "react";
import { View, Pressable } from "react-native";
import { PieceSVG } from "./lib/pieces";

interface Props {
  index: number;
  layoutRect: LayoutRect;
  selectPiece: (piece: string) => void;
}

export default function SelectPromotion({
  index,
  layoutRect,
  selectPiece,
}: Props): JSX.Element {
  const color = Math.floor(index / 10) === 0;
  const dx = (index % 10) * ((layoutRect.width - 2) / 8);
  const dy = color ? 0 : 8 * ((layoutRect.height - 2) / 16);
  const pieces = ["q", "r", "b", "n"];

  return (
    <View
      className={`w-[12.6%] h-[50%] absolute flex z-30 items-center justify-center bg-gray-200 ${
        color ? "flex-col" : "flex-col-reverse"
      }`}
      style={{
        transform: [{ translateX: dx }, { translateY: dy }],
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
