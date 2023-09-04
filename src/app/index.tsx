import { Text, View } from "react-native";
import ChessGame from "@/components/gameboard/ChessGame";

export default function HomePage() {
  return (
    <View className="flex items-center p-5">
      <Text>Game</Text>
      <ChessGame />
    </View>
  );
}
