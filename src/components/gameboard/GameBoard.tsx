import { View, StatusBar } from "react-native";
import {
  DragInfo,
  GameBoard,
  GameMove,
  Move,
  Point,
  SquarePoint,
} from "@/types";
import Square from "./Square";
import { useEffect, useRef, useState } from "react";
import { findMoves } from "./lib/moves";
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
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [layoutRect, setLayoutRect] = useState<LayoutRect>();
  const [board] = useState<GameBoard>(position.board);
  let prevDrag: Point | null = null;

  // console.log(position.fm);

  useEffect(() => {
    if (drag) {
      const moves = findMoves(board, drag.payload.index, position);
      setPossibleMoves(moves);
    } else {
      setPossibleMoves([]);
    }
  }, [drag, board]);

  function playMove(start: number, end: number) {
    const move = possibleMoves.find((m) => m.to === end);
    if (start === end || !move) return false;

    const block = getSquare(board, move.from);
    const newPosition = makeMove(board, move, position);
    // setBoard([...newPosition.board]);
    const newMove = {
      board: newPosition.board,
      cr: newPosition.cr,
      target: newPosition.target,
      turn: !position.turn,
      fm: !position.turn ? position.fm + 1 : position.fm,
      hm: block?.piece === "p" ? 0 : position.hm,
    };
    // console.log("newMove: ", newMove);
    addMove({ ...newMove, fen: convertBoardtoFEN(newMove.board) });
    return true;
  }

  function drop(event: DragInfo): boolean {
    if (!layoutRect) return false;
    const start = drag?.point ?? event.start ?? prevDrag;
    if (!start) return false;
    const block_height = (layoutRect.height - 2) / 8;
    const block_width = (layoutRect.width - 2) / 8;
    // find end index
    const end_row = Math.floor(
      (event.end.y - layoutRect.y - (StatusBar.currentHeight ?? 0)) /
        block_height
    );
    const end_col = Math.floor((event.end.x - layoutRect.x) / block_width);
    const end_index = end_row * 10 + end_col;
    // find start index
    const start_row = Math.floor(
      (start.y - layoutRect.y - (StatusBar.currentHeight ?? 0)) / block_height
    );
    const start_col = Math.floor((start.x - layoutRect.x) / block_width);
    const start_index = start_row * 10 + start_col;

    // console.log(start_index, " : ", end_index);

    if (end_row === start_row && end_col === start_col) {
      prevDrag = start;
      return false;
    }
    if (!isValidIndex(start_index) || !isValidIndex(end_index)) {
      prevDrag = null;
      return false;
    }
    const result = playMove(start_index, end_index);
    prevDrag = null;
    return result;
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
            isPossibleMove={!!possibleMoves.find((m) => m.to === sqr.index)}
          />
        ))
      )}
    </View>
  );
}
