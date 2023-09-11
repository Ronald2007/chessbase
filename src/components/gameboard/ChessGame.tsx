import { GameMove } from "@/types";
import { useState } from "react";
import { View, Text } from "react-native";
import { initialFEN } from "./lib/settings";
import { convertFENtoGame } from "./lib/fen";
import ChessBoard from "./GameBoard";

interface GameProps {
  flip?: boolean;
  startFEN?: string;
}

export default function ChessGame({ flip, startFEN }: GameProps) {
  const [moves, setMoves] = useState<GameMove[]>([
    convertFENtoGame(startFEN ?? initialFEN)!,
  ]);
  const [position, setPosition] = useState(moves[0]);

  if (!position || !position.board) {
    return (
      <View className="bg-gray-200 flex w-full aspect-square border border-zinc-100 items-center justify-center">
        <Text>Could not display board</Text>
      </View>
    );
  }

  function addMove(newMove: GameMove) {
    console.log("new move added");
    setMoves([...moves, newMove]);
    setPosition(newMove);
  }

  return <ChessBoard position={position} addMove={addMove} flip={flip} />;
}
