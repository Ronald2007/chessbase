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
  let className: string = "";
  switch (type) {
    case "prev-start":
      className = "bg-blue-300";
      break;
    case "prev-end":
      className = "bg-blue-600";
      break;
    case "over":
      className = "z-10";
      break;
  }

  return (
    <View
      className={`w-[12.5%] h-[12.5%] absolute flex items-center justify-center ${className}`}
      style={{ left: point.x, top: point.y }}
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
