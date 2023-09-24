import { View } from "react-native";
import ChessGame from "@/components/gameboard/ChessGame";
import { useRef, useState } from "react";
import { GameControl, GameMove, Notation } from "@/types";
import { baseController } from "@/lib/utils";
import MoveNotation from "@/components/Notation";
import GameControls from "@/components/GameControls";
import Header from "@/components/Header";

export default function HomePage() {
  const [flip, setFlip] = useState(false);
  const [notations, setNotations] = useState<Notation[]>([]);
  const gameControllerRef = useRef<GameControl>(baseController);

  function onNewMove(moves: GameMove[]) {
    const newMove = moves[moves.length - 1];
    if (!newMove.prevMove) return;

    setNotations([
      ...notations,
      {
        notation: newMove.prevMove.notation,
        positionNumber: moves.length - 1,
        moveNumber: newMove.fm,
        color: !newMove.turn,
      },
    ]);
  }

  return (
    <View className="h-full w-full flex-col">
      <Header />
      <View className="flex flex-grow items-center px-1 py-2 space-y-4">
        {/* Chess Game */}
        <ChessGame ref={gameControllerRef} flip={flip} onPlay={onNewMove} />
        {/* Notation of moves */}
        <View className="flex-row w-full flex-wrap">
          {notations.map((note, idx) => (
            <MoveNotation
              key={idx}
              note={note}
              first={idx === 0}
              onTap={gameControllerRef.current.goToMove}
            />
          ))}
        </View>
      </View>
      {/* Game Navigation */}
      <View className="w-full">
        <GameControls
          back={() => gameControllerRef.current.back()}
          forward={() => gameControllerRef.current.forward()}
          reset={() => {
            gameControllerRef.current.reset();
            setNotations([]);
          }}
          flip={() => setFlip(!flip)}
        />
      </View>
    </View>
  );
}
