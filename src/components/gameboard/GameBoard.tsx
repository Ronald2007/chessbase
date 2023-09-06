import { View } from "react-native";
import { DragInfo, GameBoard, Point, SquarePoint } from "@/types";
import Square from "./Square";
import { useEffect, useRef, useState } from "react";
import { findMoves } from "./lib/moves";

interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  gameboard: GameBoard;
}

export default function ChessBoard({ gameboard }: Props) {
  const [drag, setDrag] = useState<SquarePoint | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<number[]>([]);
  const [layoutRect, setLayoutRect] = useState<LayoutRect>();
  const [board, setBoard] = useState(gameboard);
  let prevDrag: Point | null = null;

  useEffect(() => {
    if (drag) {
      setPossibleMoves(findMoves(board, drag.payload.index));
    } else {
      setPossibleMoves([]);
    }
  }, [drag, board]);

  function playMove(start: number, end: number) {
    if (start === end || !possibleMoves.includes(end)) return false;

    console.log("move played");
    const [start_row, start_col] = [Math.floor(start / 10), start % 10];
    const [end_row, end_col] = [Math.floor(end / 10), end % 10];
    const start_block = board[start_row][start_col];
    const end_block = board[end_row][end_col];

    board[end_row][end_col] = { ...start_block, index: end_block.index };
    board[start_row][start_col] = { index: start_block.index };
    setBoard([...board]);
  }

  // if true, move was played
  // if false, move wasn't played
  function drop(event: DragInfo): boolean {
    if (!layoutRect) return false;
    const start = event.start ?? prevDrag;
    if (!start) return false;
    const end_row = Math.floor(
      (event.end.y - layoutRect.y) / (layoutRect.height / 8) - 1
    );
    const end_col = Math.floor(
      (event.end.x - layoutRect.x) / (layoutRect.width / 8)
    );

    console.log("end - row: ", end_row, " col: ", end_col);

    const start_row = Math.floor(
      (start.y - layoutRect.y) / (layoutRect.height / 8) - 1
    );
    const start_col = Math.floor(
      (start.x - layoutRect.x) / (layoutRect.width / 8)
    );

    console.log("start - row: ", start_row, " col: ", start_col);

    if (end_row === start_row && end_col === start_col) {
      prevDrag = start;
      return false;
    }

    // move was played
    playMove(start_row * 10 + start_col, end_row * 10 + end_col);
    prevDrag = null;
    return true;
  }

  const dp = useRef<typeof drop>(drop);
  useEffect(() => {
    dp.current = drop;
  });

  return (
    <View
      className="bg-gray-200 flex flex-row flex-wrap w-full aspect-square border border-zinc-100"
      onLayout={(event) => setLayoutRect(event.nativeEvent.layout)}
    >
      {board.map((row) =>
        row.map((sqr) => (
          <Square
            key={sqr.index}
            {...sqr}
            drop={dp}
            drag={drag}
            setDrag={setDrag}
            possibleMoves={possibleMoves}
          />
        ))
      )}
    </View>
  );
}
