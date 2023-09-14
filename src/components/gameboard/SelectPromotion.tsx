import { LayoutRect } from "@/types";
import React from "react";
import { View, Pressable } from "react-native";
import { PieceSVG } from "./lib/pieces";

interface Props {
  index: number;
  layoutRect: LayoutRect;
  selectPiece: (piece: string) => void;
  flip?: boolean;
}

export default function SelectPromotion({
  index,
  layoutRect,
  selectPiece,
  flip,
}: Props): JSX.Element {
  const color = Math.floor(index / 10) === 0;
  const row = Math.abs((flip ? 8 : 0) - (color ? 0 : 8));
  const col = Math.abs((flip ? 7 : 0) - (index % 10));
  const dx = col * ((layoutRect.width - layoutRect.border) / 8);
  const dy = row * ((layoutRect.height - layoutRect.border) / 16);
  const pieces = ["q", "r", "b", "n"];

  return (
    <View
      className={`w-[12.5%] h-[50%] absolute flex z-30 items-center justify-center bg-gray-200 ${
        color && !flip ? "flex-col" : "flex-col-reverse"
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
