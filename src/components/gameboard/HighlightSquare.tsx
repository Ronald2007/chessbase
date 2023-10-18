import { Point } from "@/types";
import React from "react";
import { View } from "react-native";

interface Props {
  point: Point;
  type: "possible" | "prev-start" | "prev-end" | "over";
  isCapture?: boolean;
}

export default function HighlightSquare({
  point,
  type,
  isCapture,
}: Props): JSX.Element {
  const bgcolor =
    type === "prev-start"
      ? "#93c5fd"
      : type === "prev-end"
      ? "#2563eb"
      : undefined;

  return (
    <View
      className="w-[12.5%] h-[12.5%] absolute flex items-center justify-center"
      style={{
        left: point.x,
        top: point.y,
        zIndex: type === "over" || type === "possible" ? 15 : undefined,
        backgroundColor: bgcolor,
      }}
      pointerEvents="none"
    >
      {type === "over" && (
        <View className="w-[200%] h-[200%] bg-black opacity-30 rounded-full" />
      )}
      {type === "possible" &&
        (isCapture ? (
          <View className="w-full h-full border-4 border-black opacity-30 rounded-full" />
        ) : (
          <View className="w-1/3 h-1/3 bg-black opacity-30 rounded-full" />
        ))}
    </View>
  );
}
