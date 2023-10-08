import { BoardStyle, GameControl, GameMove, GamePosition } from "@/types";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { View, Text } from "react-native";
import { initialFEN } from "./gameboard/lib/settings";
import { convertFENtoGame } from "./gameboard/lib/fen";
import ChessBoard from "./gameboard/ChessBoard";
import { numberClamp } from "./gameboard/lib/utils";
import { addNewMove, findPosition, getVariation } from "@/lib/utils";

interface GameProps {
  startFEN?: string;
  flip?: boolean;
  playable?: boolean;
  boardStyle?: BoardStyle;
  onPlay?: (moves: GameMove[]) => void;
  onMoveChange?: (moveNumber: number[]) => void;
}

export default forwardRef<GameControl, GameProps>(function ChessGame(
  {
    startFEN = initialFEN,
    flip = false,
    playable = true,
    boardStyle = "green",
    onPlay,
    onMoveChange,
  },
  controlRef
) {
  const startPosition =
    convertFENtoGame(startFEN) ?? convertFENtoGame(initialFEN)!;
  const [moves, setMoves] = useState<GameMove[]>([
    { ...startPosition, variations: [], comments: [], positionNumber: [0] },
  ]);
  const [moveNumber, setMoveNumber] = useState([0]);
  const [position, setPosition] = useState<GameMove | undefined>(moves[0]);

  useEffect(() => {
    onMoveChange?.(moveNumber);
    const pos = findPosition(moves, moveNumber);
    setPosition(pos);
  }, [moveNumber, moves]);

  useImperativeHandle(
    controlRef,
    () => ({
      back: () => {
        const num = moveNumber.at(-1)! - 1;
        if (num < 0 && moveNumber.length > 1) {
          moveNumber.pop();
          moveNumber.pop();
          moveNumber[moveNumber.length - 1] -= 1;
        } else {
          moveNumber[moveNumber.length - 1] = moveNumberClamp(num);
        }
        setMoveNumber([...moveNumber]);
      },
      forward: () => {
        const num = moveNumberClamp((moveNumber.at(-1) ?? 0) + 1);
        moveNumber[moveNumber.length - 1] = num;
        setMoveNumber([...moveNumber]);
      },
      goToMove: (nums) => {
        setMoveNumber([...nums]);
      },
      reset: (fen: string = initialFEN) => {
        const resetPos = convertFENtoGame(fen) ?? convertFENtoGame(initialFEN)!;
        setMoves([
          { ...resetPos, variations: [], comments: [], positionNumber: [0] },
        ]);
        setMoveNumber([0]);
      },
      setGame: (newMoves: GameMove[]) => {
        setMoves([...newMoves]);
        setMoveNumber([newMoves.length - 1]);
      },
    }),
    [moveNumber, setMoveNumber, moves, setMoves]
  );

  function moveNumberClamp(num: number) {
    return numberClamp(num, getVariation(moves, moveNumber).length - 1, 0);
  }

  function addMove(newPosition: GamePosition) {
    const newMove: GameMove = {
      ...newPosition,
      variations: [],
      positionNumber: moveNumber,
      comments: [],
    };
    const { newMoves, newMoveNumber } = addNewMove(moves, newMove);
    onPlay?.(newMoves);
    setMoves([...newMoves]);
    setMoveNumber([...newMoveNumber]);
  }

  if (!position || !position.board) {
    return (
      <View className="bg-gray-200 flex w-full aspect-square border border-zinc-100 items-center justify-center">
        <Text>Could not display board</Text>
      </View>
    );
  }

  return (
    <ChessBoard
      flip={flip}
      position={position}
      playable={playable}
      boardStyle={boardStyle}
      addMove={addMove}
    />
  );
});
