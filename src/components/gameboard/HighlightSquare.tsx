import { LayoutRect } from "@/types";
import React from "react";
import { View } from "react-native";
import { isValidIndex } from "./lib/utils";

interface Props {
  index: number;
  layoutRect: LayoutRect;
  type: "start" | "possible" | "prev-start" | "prev-end" | "over";
  isCapture?: boolean;
  flip?: boolean;
}

export default function HighlightSquare({
  index,
  layoutRect,
  type,
  flip,
  isCapture,
}: Props): JSX.Element {
  if (!isValidIndex(index)) return <></>;

  let colorClass: string = "";
  switch (type) {
    case "start":
      colorClass = "bg-red-500";
      break;
    // case "possible":
    //   colorClass = "bg-yellow-300";
    //   break;
    case "prev-start":
      colorClass = "bg-blue-300";
      break;
    case "prev-end":
      colorClass = "bg-blue-600";
      break;
    case "over":
      colorClass = "z-10";
      break;
  }

  const dx =
    Math.abs((flip ? 7 : 0) - (index % 10)) *
    ((layoutRect.width - layoutRect.border) / 8);
  const dy =
    Math.abs((flip ? 7 : 0) - Math.floor(index / 10)) *
    ((layoutRect.height - layoutRect.border) / 8);

  return (
    <View
      className={`w-[12.5%] h-[12.5%] absolute flex items-center justify-center ${colorClass}`}
      style={{ transform: [{ translateX: dx }, { translateY: dy }] }}
    >
      {type === "over" && (
        <View className="w-[150%] h-[150%] bg-black opacity-30 rounded-full" />
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
