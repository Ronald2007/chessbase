import { GameBoard, GamePosition } from "@/types";
import { useState } from "react";
import { View, Text } from "react-native";
import { initialFEN } from "./lib/settings";
import { convertFENtoGame } from "./lib/utils";
import ChessBoard from "./GameBoard";
// import { useDragStore } from "./lib/state";

// handle overall game
export default function ChessGame() {
  const [position] = useState<GamePosition | undefined>(
    convertFENtoGame(initialFEN)
  );
  // const drag = useDragStore((state) => state.drag);

  if (!position || !position.board) {
    return (
      <View className="bg-gray-200 flex w-full aspect-square border border-zinc-100 items-center justify-center">
        <Text>Could not display board</Text>
      </View>
    );
  }

  return (
    <>
      <ChessBoard gameboard={position.board} />
      {/* <Text>
        x: {drag?.end.x}, y: {drag?.end.y}
      </Text> */}
    </>
  );
}
