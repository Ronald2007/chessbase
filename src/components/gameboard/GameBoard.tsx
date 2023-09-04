import { View } from "react-native";
import { DragInfo, GameBoard } from "@/types";
import Square from "./Square";
import { useCallback, useEffect, useRef, useState } from "react";

interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  board: GameBoard;
}

export default function ChessBoard({ board }: Props) {
  const [layoutRect, setLayoutRect] = useState<LayoutRect>();

  function drop(event: DragInfo) {
    if (!layoutRect) return;
    const end_row = Math.floor(
      (event.end.y - layoutRect.y) / (layoutRect.height / 8) - 1
    );
    const end_col = Math.floor(
      (event.end.x - layoutRect.x) / (layoutRect.width / 8)
    );

    console.log("end - row: ", end_row, " col: ", end_col);

    const start_row = Math.floor(
      (event.start.y - layoutRect.y) / (layoutRect.height / 8) - 1
    );
    const start_col = Math.floor(
      (event.start.x - layoutRect.x) / (layoutRect.width / 8)
    );

    console.log("start - row: ", start_row, " col: ", start_col);
  }

  const dp = useRef<typeof drop>(drop);
  useEffect(() => {
    dp.current = drop;
  });

  return (
    <View
      className="bg-gray-200 flex flex-row flex-wrap w-full aspect-square border border-zinc-100"
      onLayout={(event) => setLayoutRect(event.nativeEvent.layout)}
    >
      {board.map((row) =>
        row.map((sqr) => <Square key={sqr.index} {...sqr} drop={dp} />)
      )}
    </View>
  );
}
