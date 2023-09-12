import { LayoutRect } from "@/types";
import React from "react";
import { View } from "react-native";
import { isValidIndex } from "./lib/utils";

interface Props {
  index: number;
  layoutRect: LayoutRect;
  type: "start" | "possible" | "prev-start" | "prev-end";
}

export default function HighlightSquare({
  index,
  layoutRect,
  type,
}: Props): JSX.Element {
  if (!isValidIndex(index)) return <></>;

  let colorClass: string = "";
  switch (type) {
    case "start":
      colorClass = "bg-red-500";
      break;
    case "possible":
      colorClass = "bg-yellow-300";
      break;
    case "prev-start":
      colorClass = "bg-blue-300";
      break;
    case "prev-end":
      colorClass = "bg-blue-600";
      break;
  }

  const dx = (index % 10) * ((layoutRect.width - 2) / 8);
  const dy = Math.floor(index / 10) * ((layoutRect.height - 2) / 8);

  return (
    <View
      className={`w-[12.6%] h-[12.6%] absolute ${colorClass}`}
      style={{ transform: [{ translateX: dx }, { translateY: dy }] }}
    />
  );
}
