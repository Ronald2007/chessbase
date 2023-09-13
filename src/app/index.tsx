import { Text, TouchableOpacity, View } from "react-native";
import ChessGame from "@/components/gameboard/ChessGame";
import { useState } from "react";
import {
  promoteFEN,
  promoteFEN1,
  testFEN3,
} from "@/components/gameboard/lib/settings";

export default function HomePage() {
  const [flip, setFlip] = useState(false);

  return (
    <View className="flex items-center p-5 space-y-10">
      <View className="flex items-center">
        <Text>Game</Text>
        <ChessGame flip={flip} startFEN={promoteFEN1} />
      </View>
      <View>
        <TouchableOpacity
          className="py-2 px-5 bg-gray-200"
          onPress={() => setFlip(!flip)}
        >
          <Text>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
