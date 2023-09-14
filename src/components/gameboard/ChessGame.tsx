import { GameMove } from "@/types";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { initialFEN } from "./lib/settings";
import { convertFENtoGame } from "./lib/fen";
import ChessBoard from "./GameBoard";

interface GameProps {
  flip?: boolean;
  startFEN?: string;
  move?: number;
  onPlay?: (move: GameMove) => any;
}

export default function ChessGame({ flip, startFEN, move, onPlay }: GameProps) {
  const [moveNumber, setMoveNumber] = useState(move ?? 0);
  const [moves, setMoves] = useState<GameMove[]>([
    convertFENtoGame(startFEN ?? initialFEN)!,
  ]);
  const [position, setPosition] = useState(moves[moveNumber]);

  console.log("num", moveNumber);

  useEffect(() => {
    // setPosition(moves[moveNumber]);
    setMoveNumber(move ?? moveNumber);
    setPosition(moves[move ?? moveNumber]);
  }, [move]);

  if (!position || !position.board) {
    return (
      <View className="bg-gray-200 flex w-full aspect-square border border-zinc-100 items-center justify-center">
        <Text>Could not display board</Text>
      </View>
    );
  }

  function addMove(newMove: GameMove) {
    console.log("new move added");
    onPlay?.(newMove);
    setMoves([...moves, newMove]);
    setPosition(newMove);
  }

  return <ChessBoard position={position} addMove={addMove} flip={flip} />;
}
