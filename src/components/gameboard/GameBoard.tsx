import { View, StatusBar } from "react-native";
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
  Promotion,
  Point,
} from "@/types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { findAllMoves } from "./lib/moves";
import {
  convertIndexToPoint,
  convertPointToIndex,
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
import Empty from "./Empty";
import HighlightSquare from "./HighlightSquare";
import SelectPromotion from "./SelectPromotion";
import GhostPiece from "./Ghost";

interface Props {
  position: GameMove;
  addMove: (newMove: GameMove) => void;
  flip?: boolean;
}

export default function ChessBoard({ position, addMove, flip }: Props) {
  const [drag, setDrag] = useState<SquarePoint | null>(null);
  const [allMoves, setAllMoves] = useState<Record<number, Move[]>>({});
  const [animations, setAnimations] = useState<PieceMove[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const skipAnimsRef = useRef<boolean>(false);
  const prevBoard = useRef<GameBoard | undefined>();
  const [board, setBoard] = useState(prevBoard.current ?? position.board);
  const [layoutRect, setLayoutRect] = useState<LayoutRect>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    border: 0,
  });
  const boardViewRef = useRef<View | null>(null);
  const [promotion, setPromotion] = useState<Promotion>();
  const [over, setOver] = useState<Point | null>(null);
  const updateBoard = () => {
    clearInterval(animationTimeoutRef.current);
    setAnimations([]);
    setBoard(position.board);
    animationTimeoutRef.current = undefined;
    skipAnimsRef.current = false;
  };

  /* Sets timeout for animations to occur when position changes */
  useEffect(() => {
    setAllMoves(findAllMoves(position));
    if (prevBoard.current) {
      if (skipAnimsRef.current) return updateBoard();
      const anims = findDifferences(prevBoard.current, position.board);
      setAnimations(anims);

      animationTimeoutRef.current = setTimeout(
        () => updateBoard(),
        ANIMATION_DURATION
      );
    }
  }, [position]);

  /* Updates board if piece is dragged and animations are not done  */
  useEffect(() => {
    if (drag && animationTimeoutRef.current) {
      updateBoard();
    }
  }, [drag, animationTimeoutRef]);

  /* Sets layout values when component is mounted */
  useEffect(() => {
    if (layoutRect.height > 0) return;
    boardViewRef.current?.measure((x, y, w, h, px, py) => {
      console.log(x, y, w, h, px, py);
      StatusBar.currentHeight ?? 0;
      setLayoutRect({
        x: px,
        y: py,
        height: h,
        width: w,
        border: 2,
      });
    });
  }, [boardViewRef, layoutRect]);

  /* Handle promotion */
  useEffect(() => {
    if (promotion && promotion.piece) {
      const { from, to, newMove, piece } = promotion;
      newMove.board[Math.floor(to / 10)][promotion.to % 10] = {
        index: to,
        piece,
        color: position.turn,
        id: `${position.turn ? piece.toUpperCase() : piece}2`,
      };

      // sets previous board to be able to animate
      prevBoard.current = board;
      // if piece was dragged, skip animations
      skipAnimsRef.current = true;
      setAllMoves({});
      addMove({ ...newMove });
      setPromotion(undefined);
      setDrag(null);
    } else if (!promotion) {
      setAllMoves(findAllMoves(position));
      setAnimations([]);
    }
  }, [promotion]);

  /* Plays move */
  function playMove(start: number, end: number, type: DropType): boolean {
    if (!isValidIndex(start) || !isValidIndex(end) || start === end)
      return false;
    const possibleMoves = allMoves[start];
    console.log(possibleMoves);
    const move = possibleMoves?.find((m) => m.to === end);
    if (!move) return false;

    /* Create game move */
    const block = getSquare(board, move.from);
    if (!block || !block.id || !block.piece) return false;

    const newPosition = makeMove(board, move, position);
    const newMove: GameMove = {
      board: newPosition.board,
      cr: newPosition.cr,
      target: newPosition.target,
      turn: !position.turn,
      fm: !position.turn ? position.fm + 1 : position.fm,
      hm: block.piece === "p" ? 0 : position.hm,
      fen: convertBoardtoFEN(newPosition.board),
      prevMove: move,
    };

    if (move.type === "promotion") {
      setAnimations([
        {
          id: block.id,
          // from: type === "drag" ? move.to : move.from,
          from: move.from,
          to: move.to,
          payload: block as any,
          skip: type === "drag",
        },
      ]);
      setAllMoves([]);
      setPromotion({ to: move.to, from: move.from, newMove, payload: block });
      return false;
    }

    // sets previous board to be able to animate
    prevBoard.current = board;
    // if piece was dragged, skip animations
    skipAnimsRef.current = type === "drag";
    setAnimations([]);
    setAllMoves({});
    addMove({ ...newMove });
    return true;
  }

  /* Converts coordinates of dropped piece to an index and calls playMove */
  function drop(event: DropEndInfo): DropResult | undefined {
    if (!layoutRect) return;
    const end = event.end;

    const block_height = (layoutRect.height - layoutRect.border) / 8;
    const block_width = (layoutRect.width - layoutRect.border) / 8;
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

    if (promotion) {
      // clicked on piece selection
      if (
        end_col === promotion.to % 10 &&
        Math.abs(promotion.to - end_index) < 40
      ) {
        return {} as any;
      } else {
        setAnimations([]);
        setPromotion(undefined);
      }
    }

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

    if (start_index === end_index) return;

    if (!isValidIndex(start_index) || !isValidIndex(end_index)) return;

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

  /* Otherwise drop function uses old values */
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
      onMoveShouldSetResponderCapture={() => !drag}
    >
      {/* Board SVG */}
      <BrownBoard className="absolute" />

      {/* Previous move start */}
      {layoutRect && position.prevMove && (
        <>
          <HighlightSquare
            index={position.prevMove.from}
            layoutRect={layoutRect}
            type="prev-start"
            flip={flip}
          />
          <HighlightSquare
            index={position.prevMove.to}
            layoutRect={layoutRect}
            type="prev-end"
            flip={flip}
          />
        </>
      )}

      {/* Possible squares for piece to move to */}
      {drag &&
        layoutRect &&
        allMoves[drag.payload.index]?.map((move) => (
          <HighlightSquare
            key={move.to}
            index={move.to}
            layoutRect={layoutRect}
            type="possible"
            isCapture={!!getSquare(board, move.to)?.piece}
            flip={flip}
          />
        ))}

      {/* Hover over */}
      {drag && layoutRect && over && (
        <HighlightSquare
          index={convertPointToIndex(
            { x: drag.point.x + over.x, y: drag.point.y + over.y },
            layoutRect,
            !!flip
          )}
          layoutRect={layoutRect}
          type="over"
          flip={flip}
        />
      )}

      {/* Start square indication */}
      {useMemo(
        () =>
          drag &&
          layoutRect && (
            <GhostPiece drag={drag} layoutRect={layoutRect} flip={flip} />
          ),
        [drag, layoutRect, flip]
      )}

      {/* Promotion */}
      {promotion && layoutRect && (
        <>
          <SelectPromotion
            index={promotion.to}
            layoutRect={layoutRect}
            selectPiece={(piece) => {
              if (!promotion) return;
              setPromotion({ ...promotion, piece });
            }}
            flip={flip}
          />
          <GhostPiece
            drag={{
              point: convertIndexToPoint(promotion.to, layoutRect, !!flip),
              payload: promotion.payload,
            }}
            layoutRect={layoutRect}
            flip={flip}
          />
        </>
      )}

      {/* Renders all pieces and empty squares */}
      {(flip ? [...board].reverse() : board).map((row) =>
        (flip ? [...row].reverse() : row).map((sqr) => {
          const { piece, id, color, index } = sqr;
          // animation for moving and fading out
          const pieceMove = animations.find((anim) => anim.from === index);
          const isDragging = drag?.payload.index === index;

          const moveAnimation: PieceMoveAnimation | undefined = pieceMove &&
            layoutRect && {
              ...pieceMove,
              start: convertIndexToPoint(pieceMove.from, layoutRect, !!flip),
              end: convertIndexToPoint(pieceMove.to, layoutRect, !!flip),
            };

          // animation for fading in pieces
          const appear = animations.find(
            (anim) => anim.from < 0 && anim.to === index
          );
          const appearAnimation: PieceMoveAnimation | undefined = appear &&
            layoutRect && {
              ...appear,
              start: convertIndexToPoint(appear.from, layoutRect, !!flip),
              end: convertIndexToPoint(appear.to, layoutRect, !!flip),
            };

          return (
            <Fragment key={index}>
              {/* Renders piece or empty square */}
              {useMemo(() => {
                return piece &&
                  id &&
                  color !== undefined &&
                  layoutRect.height > 0 ? (
                  <Piece
                    key={index}
                    piece={piece}
                    color={color}
                    index={index}
                    id={id}
                    setDrag={setDrag}
                    drop={dp}
                    animation={moveAnimation}
                    isDragging={isDragging}
                    setOver={setOver}
                    layoutRect={layoutRect}
                  />
                ) : (
                  <View
                    key={index}
                    className="w-[12.5%] h-[12.5%] flex text-center items-center justify-center relative"
                  />
                );
              }, [piece, color, moveAnimation, id, isDragging, layoutRect])}
              {/* Renders square for fading in piece */}
              {appearAnimation && layoutRect && (
                <Empty
                  key={100 + index}
                  index={index}
                  layoutRect={layoutRect}
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
