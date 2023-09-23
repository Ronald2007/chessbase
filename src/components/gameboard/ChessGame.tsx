import { GameMove } from "@/types";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { initialFEN } from "./lib/settings";
import { convertFENtoGame } from "./lib/fen";
import ChessBoard from "./ChessBoard";

interface GameProps {
  flip?: boolean;
  startFEN?: string;
  move?: number;
  onPlay?: (move: GameMove) => any;
}

export default function ChessGame({
  flip = false,
  startFEN,
  move = 0,
  onPlay,
}: GameProps) {
  const [moves, setMoves] = useState<GameMove[]>([
    convertFENtoGame(startFEN ?? initialFEN)!,
  ]);
  const [position, setPosition] = useState(moves[move]);

  useEffect(() => {
    let num = 0;
    if (!move || move < 0) {
      num = 0;
    } else if (move > moves.length - 1) {
      num = moves.length - 1;
    } else {
      num = move ?? 0;
    }
    setPosition(moves[num]);
  }, [move]);

  if (!position || !position.board) {
    return (
      <View className="bg-gray-200 flex w-full aspect-square border border-zinc-100 items-center justify-center">
        <Text>Could not display board</Text>
      </View>
    );
  }

  function addMove(newMove: GameMove) {
    onPlay?.(newMove);
    setMoves([...moves, newMove]);
    setPosition(newMove);
  }

  return <ChessBoard position={position} addMove={addMove} />;
}
