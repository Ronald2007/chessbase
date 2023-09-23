import { Text, TouchableOpacity, View } from "react-native";
import ChessGame from "@/components/gameboard/ChessGame";
import { useState } from "react";
import {
  promoteFEN,
  promoteFEN1,
  testFEN1,
  testFEN3,
} from "@/components/gameboard/lib/settings";

export default function HomePage() {
  const [flip, setFlip] = useState(false);
  const [moveNumber, setMoveNumber] = useState(0);

  return (
    <View className="flex items-center p-2 space-y-10">
      <View className="flex items-center">
        <Text>Game</Text>
        <ChessGame
          startFEN={testFEN3}
          flip={flip}
          move={moveNumber}
          onPlay={() => setMoveNumber((v) => v + 1)}
        />
      </View>
      <View className="flex-row w-full justify-around">
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => setFlip(!flip)}
        >
          <Text>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => {
            setMoveNumber(0);
          }}
        >
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Arrows */}
      <View className="flex-row w-full justify-around">
        {/* Back arrow */}
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => setMoveNumber((v) => v - 1)}
        >
          <Text>Back</Text>
        </TouchableOpacity>
        {/* Forward */}
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => setMoveNumber((v) => v + 1)}
        >
          <Text>Forward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
