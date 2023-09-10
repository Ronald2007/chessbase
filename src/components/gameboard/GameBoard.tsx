import { View } from "react-native";
import {
  DropEndInfo,
  DropResult,
  GameMove,
  Move,
  SquarePoint,
  LayoutRect,
  DropType,
} from "@/types";
import Square from "./Square";
import { useEffect, useMemo, useRef, useState } from "react";
import { findAllMoves } from "./lib/moves";
import { getSquare, isValidIndex, makeMove } from "./lib/utils";
import { convertBoardtoFEN } from "./lib/fen";
import { ANIMATION_DURATION } from "./lib/settings";

interface Props {
  position: GameMove;
  addMove: (newMove: GameMove) => void;
  flip?: boolean;
}

export default function ChessBoard({ position, addMove, flip }: Props) {
  const [drag, setDrag] = useState<SquarePoint | null>(null);
  const [allMoves, setAllMoves] = useState<Record<number, Move[]>>({});
  // const [layoutRect, setLayoutRect] = useState<LayoutRect>();
  const [animateTo, setAnimateTo] = useState<DropResult>();
  const board = position.board;
  const animationTimeout = useRef<NodeJS.Timeout>();
  const playMoveRef = useRef<() => any>();
  let layoutRect: LayoutRect;
  // const boardRef = useRef<View | null>(null)

  useEffect(() => {
    setAllMoves(findAllMoves(board, position.turn, position));
  }, [board, position]);

  useEffect(() => {
    if (drag) {
      setAnimateTo(undefined);
      playMoveRef.current?.();
      playMoveRef.current = undefined;
      clearInterval(animationTimeout.current);
      animationTimeout.current = undefined;
    }
  }, [drag]);

  /* Plays move */
  function playMove(start: number, end: number, type: DropType) {
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
    position.turn = newMove.turn;
    playMoveRef.current = () => {
      addMove({ ...newMove, fen: convertBoardtoFEN(newMove.board) });
      setAnimateTo(undefined);
      animationTimeout.current = undefined;
      playMoveRef.current = undefined;
    };
    animationTimeout.current = setTimeout(
      () => {
        playMoveRef.current?.();
        playMoveRef.current = undefined;
      },
      type === "touch" ? ANIMATION_DURATION : 1
    );

    return true;
  }

  /* Converts coordinates of dropped piece to an index and calls playMove */
  function drop(event: DropEndInfo): DropResult | undefined {
    // const layoutRect = boardRef.current?.
    if (!layoutRect) return;
    const start = drag?.point;
    const end = event.end;

    if (!start) return;

    const block_height = (layoutRect.height - 2) / 8;
    const block_width = (layoutRect.width - 2) / 8;
    // find end index
    const end_row = Math.abs(
      (flip ? 7 : 0) - Math.floor((end.y - layoutRect.y) / block_height)
    );

    const end_col = Math.abs(
      (flip ? 7 : 0) - Math.floor((end.x - layoutRect.x) / block_width)
    );

    const end_index = end_row * 10 + end_col;
    const endYCenter =
      Math.abs((flip ? layoutRect.height : 0) - end_row * block_height) +
      layoutRect.y;
    const endXCenter =
      Math.abs((flip ? layoutRect.width : 0) - end_col * block_width) +
      layoutRect.x;
    // find start index
    const start_row = Math.floor(drag.payload.index / 10);
    const start_col = drag.payload.index % 10;
    const start_index = start_row * 10 + start_col;
    const startYCenter =
      Math.abs((flip ? layoutRect.height : 0) - start_row * block_height) +
      layoutRect.y;
    const startXCenter =
      Math.abs((flip ? layoutRect.width : 0) - start_col * block_width) +
      layoutRect.x;

    if (start_index === end_index) {
      return;
    }
    if (!isValidIndex(start_index) || !isValidIndex(end_index)) {
      return;
    }

    const result = playMove(start_index, end_index, event.type);
    if (!result) return;

    return {
      startIndex: start_index,
      endIndex: end_index,
      startPoint: { x: startXCenter, y: startYCenter },
      endPoint: { x: endXCenter, y: endYCenter },
      type: event.type,
    };
  }

  const dp = useRef<typeof drop>(drop);
  useEffect(() => {
    dp.current = drop;
  });

  return (
    <View
      className="bg-gray-200 flex flex-row flex-wrap w-full aspect-square border border-zinc-100"
      // onLayout={(event) => {
      //   setLayoutRect(event.nativeEvent.layout);
      // }}
      ref={(ref) =>
        ref?.measure((x, y, w, h, px, py) => {
          layoutRect = {
            x: px,
            y: py,
            height: h,
            width: w,
          };
        })
      }
    >
      {(flip ? [...board].reverse() : board).map((row) =>
        (flip ? [...row].reverse() : row).map((sqr) => {
          const isPossible = !!(
            drag &&
            allMoves[drag.payload.index]?.find((m) => m.to === sqr.index)
          );
          const isAnimating =
            animateTo?.startIndex === sqr.index ||
            animateTo?.endIndex === sqr.index;
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
                setAnimateTo={setAnimateTo}
                animateTo={animateTo}
              />
            ),
            [sqr.piece, sqr.color, isPossible, drag, position.turn, isAnimating]
          );
        })
      )}
    </View>
  );
}
