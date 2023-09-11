import { Pressable, Text, View } from "react-native";
import ChessGame from "@/components/gameboard/ChessGame";
import { useState } from "react";
import { testFEN3 } from "@/components/gameboard/lib/settings";

export default function HomePage() {
  const [flip, setFlip] = useState(false);

  return (
    <View className="flex items-center p-5 space-y-10">
      <View className="flex items-center">
        <Text>Game</Text>
        <ChessGame flip={flip} startFEN={testFEN3} />
      </View>
      <View>
        <Pressable onPress={() => setFlip(!flip)}>
          <Text>Flip</Text>
        </Pressable>
      </View>
    </View>
  );
}
