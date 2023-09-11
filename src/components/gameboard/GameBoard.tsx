import { StatusBar, View, Animated } from "react-native";
import {
  DropEndInfo,
  DropResult,
  GameMove,
  Move,
  SquarePoint,
  LayoutRect,
  DropType,
  GameBoard,
  PieceMove,
  PieceMoveAnimation,
} from "@/types";
import Square from "./Square";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { findAllMoves } from "./lib/moves";
import {
  convertIndexToPoint,
  findDifferences,
  getSquare,
  isValidIndex,
  makeMove,
} from "./lib/utils";
import { convertBoardtoFEN, convertFENtoBoard } from "./lib/fen";
import {
  ANIMATION_DURATION,
  testFEN1,
  testFEN2,
  testFEN3,
  testFEN4,
} from "./lib/settings";
import Piece from "./Piece";
import BrownBoard from "@/../assets/boards/brown.svg";
import { PieceSVG } from "./lib/pieces";
import Empty from "./Empty";

interface Props {
  position: GameMove;
  addMove: (newMove: GameMove) => void;
  flip?: boolean;
}

export default function ChessBoard({ position, addMove, flip }: Props) {
  const [drag, setDrag] = useState<SquarePoint | null>(null);
  const [allMoves, setAllMoves] = useState<Record<number, Move[]>>({});
  const [animations, setAnimations] = useState<PieceMove[]>([]);
  const [layoutRect, setLayoutRect] = useState<LayoutRect>();
  const animationTimeout = useRef<NodeJS.Timeout>();
  const skipAnimsRef = useRef<boolean>(false);
  const boardViewRef = useRef<View | null>(null);
  const prevBoard = useRef<GameBoard>(convertFENtoBoard(testFEN4)!);
  const [board, setBoard] = useState(prevBoard.current ?? position.board);

  useEffect(() => {
    setAllMoves(findAllMoves(position.board, position.turn, position));
    if (prevBoard.current) {
      const anims = findDifferences(prevBoard.current, position.board);
      // console.log("anims: ", anims);
      if (skipAnimsRef.current) {
        setAnimations([]);
        setBoard(position.board);
        skipAnimsRef.current = false;
        return;
      }
      setAnimations(anims);
      animationTimeout.current = setTimeout(() => {
        setAnimations([]);
        setBoard(position.board);
      }, ANIMATION_DURATION);
    }
  }, [position]);

  useEffect(() => {
    if (drag) {
      // console.log(layoutRect);
      if (animationTimeout.current) {
        clearInterval(animationTimeout.current);
        setAnimations([]);
        setBoard(position.board);
        animationTimeout.current = undefined;
      }
    }
  }, [drag]);

  useEffect(() => {
    if (layoutRect) return;
    // boardViewRef.current?.measureInWindow((x, y, w, h) => {
    //   console.log(x, y, w, h);
    //   setLayoutRect({
    //     x: x,
    //     y: y,
    //     height: h,
    //     width: w,
    //   });
    // });
    boardViewRef.current?.measure((x, y, w, h, px, py) => {
      console.log(x, y, w, h, px, py);
      setLayoutRect({
        x: px,
        y: py,
        height: h,
        width: w,
      });
    });
  }, [boardViewRef]);

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
    prevBoard.current = board;
    if (type === "drag") {
      skipAnimsRef.current = true;
    }
    addMove({ ...newMove, fen: convertBoardtoFEN(newMove.board) });

    return true;
  }

  /* Converts coordinates of dropped piece to an index and calls playMove */
  function drop(event: DropEndInfo): DropResult | undefined {
    if (!layoutRect) return;
    const end = event.end;

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
    const { x: endXCenter, y: endYCenter } = convertIndexToPoint(
      end_index,
      layoutRect,
      !!flip
    );
    const end_sqr = getSquare(board, end_index);

    if (!end_sqr) return;

    if (end_sqr.color === position.turn && event.type === "touch") {
      setDrag({ point: end, payload: end_sqr });
      return {} as any;
    }

    const start = drag?.point;
    if (!start) return;

    // find start index
    const start_row = Math.floor(drag.payload.index / 10);
    const start_col = drag.payload.index % 10;
    const start_index = start_row * 10 + start_col;

    const { x: startXCenter, y: startYCenter } = convertIndexToPoint(
      start_index,
      layoutRect,
      !!flip
    );

    if (start_index === end_index) {
      return;
    }

    if (!isValidIndex(start_index) || !isValidIndex(end_index)) {
      return;
    }

    const result = playMove(start_index, end_index, event.type);
    if (!result) return;

    setDrag(null);

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
      className="bg-gray-200 flex flex-row flex-wrap w-full aspect-square border border-zinc-100 relative"
      ref={boardViewRef}
      onStartShouldSetResponderCapture={(e) => {
        const point = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };

        const result = dp.current({ end: point, type: "touch" });
        if (!result) {
          setDrag(null);
          return true;
        }

        return false;
      }}
    >
      <BrownBoard className="absolute" />
      {drag && layoutRect && (
        <View
          className="w-[12.5%] h-[12.5%] bg-red-500 absolute"
          style={{
            transform: [
              {
                translateX:
                  (drag.payload.index % 10) * ((layoutRect.width - 2) / 8),
              },
              {
                translateY:
                  Math.floor(drag.payload.index / 10) *
                  ((layoutRect.height - 2) / 8),
              },
            ],
          }}
        />
      )}

      {drag &&
        layoutRect &&
        allMoves[drag.payload.index]?.map((move) => (
          <View
            key={move.to}
            className="w-[12.6%] h-[12.6%] bg-yellow-300 absolute"
            style={{
              transform: [
                {
                  translateX: (move.to % 10) * ((layoutRect.width - 2) / 8),
                },
                {
                  translateY:
                    Math.floor(move.to / 10) * ((layoutRect.height - 2) / 8),
                },
              ],
            }}
          />
        ))}

      {(flip ? [...board].reverse() : board).map((row) =>
        (flip ? [...row].reverse() : row).map((sqr) => {
          const { piece, id, color, index } = sqr;
          const pieceMove = animations.find((anim) => {
            if (anim.from === index) return true;
            // else if (anim.from < 0) {
            //   return anim.to === index;
            // }
          });
          // const pieceMove = pmidx >= 0 ? animations[pmidx] : undefined;
          const moveAnimation: PieceMoveAnimation | undefined = pieceMove &&
            layoutRect && {
              ...pieceMove,
              start: convertIndexToPoint(pieceMove.from, layoutRect, !!flip),
              end: convertIndexToPoint(pieceMove.to, layoutRect, !!flip),
            };

          const appear = animations.find((anim) => {
            if (anim.from < 0 && anim.to === index) return true;
            // else if (anim.from < 0) {
            //   return anim.to === index;
            // }
          });
          // const pieceMove = pmidx >= 0 ? animations[pmidx] : undefined;
          const appearAnimation: PieceMoveAnimation | undefined = appear &&
            layoutRect && {
              ...appear,
              start: convertIndexToPoint(appear.from, layoutRect, !!flip),
              end: convertIndexToPoint(appear.to, layoutRect, !!flip),
            };

          return (
            <Fragment key={index}>
              {useMemo(() => {
                return piece && id && color !== undefined ? (
                  <Piece
                    key={index}
                    piece={piece}
                    color={color}
                    index={index}
                    id={id}
                    setDrag={setDrag}
                    drop={dp}
                    animation={moveAnimation}
                  />
                ) : (
                  <View
                    key={index}
                    className="w-[12.5%] h-[12.5%] flex text-center items-center justify-center relative"
                  ></View>
                );
              }, [piece, color, moveAnimation, id])}
              {appearAnimation && (
                <Empty
                  key={100 + index}
                  index={index}
                  animation={appearAnimation}
                />
              )}
            </Fragment>
          );
        })
      )}
    </View>
  );
}
