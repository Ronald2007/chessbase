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
  const [key, setKey] = useState(Math.random());
  const [moveNumber, setMoveNumber] = useState(0);

  return (
    <View className="flex items-center p-2 space-y-10">
      <View className="flex items-center">
        <Text>Game</Text>
        <ChessGame
          key={key}
          flip={flip}
          move={moveNumber}
          onPlay={() => setMoveNumber((v) => v + 1)}
        />
      </View>
      <View className="flex-row w-full justify-around">
        <View>
          <TouchableOpacity
            className="py-2 px-5 bg-gray-200"
            onPress={() => setFlip(!flip)}
          >
            <Text>Flip</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            className="py-2 px-5 bg-gray-200"
            onPress={() => {
              setKey(Math.random());
              setMoveNumber(0);
            }}
          >
            <Text>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arrows */}
      <View className="flex-row w-full justify-around">
        <View>
          <TouchableOpacity
            className="py-2 px-5 bg-gray-200"
            onPress={() => setMoveNumber((v) => (v > 0 ? v - 1 : 0))}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            className="py-2 px-5 bg-gray-200"
            onPress={() => setMoveNumber(moveNumber + 1)}
          >
            <Text>Forward</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
