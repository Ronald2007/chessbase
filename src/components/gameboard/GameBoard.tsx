import { View, StatusBar } from "react-native";
import {
  DragEndInfo,
  DragInfo,
  GameBoard,
  GameMove,
  Move,
  Point,
  SquarePoint,
} from "@/types";
import Square from "./Square";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { findAllMoves, findMoves } from "./lib/moves";
import { getSquare, isValidIndex, makeMove } from "./lib/utils";
import { convertBoardtoFEN } from "./lib/fen";

interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  position: GameMove;
  addMove: (newMove: GameMove) => void;
}

export default function ChessBoard({ position, addMove }: Props) {
  const [drag, setDrag] = useState<SquarePoint | null>(null);
  const [allMoves, setAllMoves] = useState<Record<number, Move[]>>({});
  const [layoutRect, setLayoutRect] = useState<LayoutRect>();
  const board = position.board;

  useEffect(() => {
    setAllMoves(findAllMoves(board, position.turn, position));
  }, [board, position]);

  function playMove(start: number, end: number) {
    const possibleMoves = allMoves[start];
    const move = possibleMoves?.find((m) => m.to === end);
    if (start === end || !move) return false;

    const block = getSquare(board, move.from);
    const newPosition = makeMove(board, move, position);
    const newMove = {
      board: newPosition.board,
      cr: newPosition.cr,
      target: newPosition.target,
      turn: !position.turn,
      fm: !position.turn ? position.fm + 1 : position.fm,
      hm: block?.piece === "p" ? 0 : position.hm,
    };
    addMove({ ...newMove, fen: convertBoardtoFEN(newMove.board) });
    return true;
  }

  function drop(event: DragEndInfo): boolean {
    if (!layoutRect) return false;
    const start = drag?.point; // ?? event.start;
    const end = event.end;

    if (!start) return false;

    const block_height = (layoutRect.height - 2) / 8;
    const block_width = (layoutRect.width - 2) / 8;
    // find end index
    const end_row = Math.floor(
      (end.y - layoutRect.y - (StatusBar.currentHeight ?? 0)) / block_height
    );
    const end_col = Math.floor((end.x - layoutRect.x) / block_width);
    const end_index = end_row * 10 + end_col;
    // find start index
    const start_row = Math.floor(drag.payload.index / 10);
    const start_col = drag.payload.index % 10;
    const start_index = start_row * 10 + start_col;

    if (start_index === end_index) {
      return false;
    }
    if (!isValidIndex(start_index) || !isValidIndex(end_index)) {
      return false;
    }

    const result = playMove(start_index, end_index);
    return result;
  }

  const dp = useRef<typeof drop>(drop);
  useEffect(() => {
    dp.current = drop;
  });

  return (
    <View
      className="bg-gray-200 flex flex-row flex-wrap w-full aspect-square border border-zinc-100"
      onLayout={(event) => {
        setLayoutRect(event.nativeEvent.layout);
      }}
    >
      {board.map((row) =>
        row.map((sqr) => {
          const isPossible = !!(
            drag &&
            allMoves[drag.payload.index]?.find((m) => m.to === sqr.index)
          );
          return useMemo(
            () => (
              <Square
                key={sqr.index}
                {...sqr}
                isPossibleMove={isPossible}
                turn={position.turn}
                drag={drag}
                drop={dp}
                setDrag={setDrag}
              />
            ),
            [sqr.piece, sqr.color, isPossible, drag, position.turn]
          );
        })
      )}
    </View>
  );
}
