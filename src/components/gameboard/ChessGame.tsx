import { BoardStyle, GameControl, GameMove } from "@/types";
import { useState, forwardRef, useImperativeHandle } from "react";
import { View, Text } from "react-native";
import { initialFEN } from "./lib/settings";
import { convertFENtoGame } from "./lib/fen";
import ChessBoard from "./ChessBoard";
import { numberClamp } from "./lib/utils";

interface GameProps {
  startFEN?: string;
  flip?: boolean;
  playable?: boolean;
  boardStyle?: BoardStyle;
  onPlay?: (moves: GameMove[]) => void;
}

export default forwardRef<GameControl, GameProps>(function ChessGame(
  {
    startFEN = initialFEN,
    flip = false,
    playable = true,
    boardStyle = "green",
    onPlay,
  },
  controlRef
) {
  const startPosition =
    convertFENtoGame(startFEN) ?? convertFENtoGame(initialFEN)!;
  const [moves, setMoves] = useState<GameMove[]>([
    { ...startPosition, variations: [] },
  ]);
  const [moveNumber, setMoveNumber] = useState(0);

  useImperativeHandle(
    controlRef,
    () => ({
      back: () => setMoveNumber((v) => moveNumberClamp(v - 1)),
      forward: () => setMoveNumber((v) => moveNumberClamp(v + 1)),
      goToMove: (num) => setMoveNumber(moveNumberClamp(num)),
      reset: (fen: string = initialFEN) => {
        const resetPos = convertFENtoGame(fen) ?? convertFENtoGame(initialFEN)!;
        setMoves([{ ...resetPos, variations: [] }]);
        setMoveNumber(0);
      },
    }),
    [moveNumber, setMoveNumber]
  );

  function moveNumberClamp(num: number) {
    return numberClamp(num, moves.length - 1, 0);
  }

  function addMove(newMove: GameMove) {
    const newMoves = [...moves, newMove];
    onPlay?.(newMoves);
    setMoves([...newMoves]);
    setMoveNumber(newMoves.length - 1);
  }

  if (!moves[moveNumber] || !moves[moveNumber].board) {
    return (
      <View className="bg-gray-200 flex w-full aspect-square border border-zinc-100 items-center justify-center">
        <Text>Could not display board</Text>
      </View>
    );
  }

  return (
    <ChessBoard
      flip={flip}
      position={moves[moveNumber]}
      playable={playable}
      boardStyle={boardStyle}
      addMove={addMove}
    />
  );
});
