import { View, ScrollView } from "react-native";
import ChessGame from "@/components/ChessGame";
import { useRef, useState } from "react";
import { GameControl, GameMove } from "@/types";
import { baseController } from "@/lib/utils";
import GameControls from "@/components/GameControls";
import Header from "@/components/Header";
import NotationView from "@/components/NotationView";
import { pgnToGame } from "@/lib/pgn";

export default function HomePage() {
  const [flip, setFlip] = useState(false);
  const [moves, setMoves] = useState<GameMove[]>([]);
  const [currMove, setCurrMove] = useState<number[]>([0]);
  const gameControllerRef = useRef<GameControl>(baseController);

  function onNewMove(newMoves: GameMove[]) {
    setMoves([...newMoves]);
  }

  function onMoveChange(moveNumber: number[]) {
    setCurrMove(moveNumber);
  }

  function loadGame(pgn: string) {
    const res = pgnToGame(pgn);
    gameControllerRef.current.setGame(res);
    setMoves(res);
  }

  return (
    <View className="h-full w-full flex-col">
      <Header onGameLoad={loadGame} />
      <View className="flex flex-grow px-1 py-2">
        {/* Chess Game */}
        <ChessGame
          ref={gameControllerRef}
          flip={flip}
          onPlay={onNewMove}
          onMoveChange={onMoveChange}
        />
        {/* Notation of moves */}
        <ScrollView className="w-full mt-2 h-0 min-h-fit">
          <NotationView
            moves={moves}
            level={0}
            currMove={currMove}
            onTap={(nums) => gameControllerRef.current.goToMove(nums)}
            figurines={true}
          />
        </ScrollView>
      </View>
      {/* Game Navigation */}
      <View className="w-full">
        <GameControls
          back={() => gameControllerRef.current.back()}
          forward={() => gameControllerRef.current.forward()}
          reset={() => {
            gameControllerRef.current.reset();
            setMoves([]);
          }}
          flip={() => setFlip(!flip)}
        />
      </View>
    </View>
  );
}
