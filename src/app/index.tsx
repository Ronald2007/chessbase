import { Text, TouchableOpacity, View } from "react-native";
import ChessGame from "@/components/gameboard/ChessGame";
import { useRef, useState } from "react";
import // promoteFEN,
// promoteFEN1,
// testFEN1,
// testFEN3,
"@/components/gameboard/lib/settings";
import { GameControl, GameMove } from "@/types";
import { baseController } from "@/lib/utils";

export default function HomePage() {
  const [flip, setFlip] = useState(false);
  const gameControllerRef = useRef<GameControl>(baseController);
  const [notation, setNotation] = useState<string[]>([]);

  function onNewMove(prevMoves: GameMove[], newMove: GameMove) {
    if (!newMove.prevMove) return;

    setNotation([...notation, newMove.prevMove.notation]);
  }

  return (
    <View className="flex items-center p-2 space-y-10">
      <View className="flex items-center">
        <ChessGame
          ref={gameControllerRef}
          // startFEN={promoteFEN1}
          flip={flip}
          onPlay={onNewMove}
        />
      </View>
      <Text>{notation}</Text>
      <View className="flex-row w-full justify-around">
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => setFlip(!flip)}
        >
          <Text>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => gameControllerRef.current.reset()}
        >
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Arrows */}
      <View className="flex-row w-full justify-around">
        {/* Back arrow */}
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => gameControllerRef.current.back()}
        >
          <Text>Back</Text>
        </TouchableOpacity>
        {/* Forward */}
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => gameControllerRef.current.forward()}
        >
          <Text>Forward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
