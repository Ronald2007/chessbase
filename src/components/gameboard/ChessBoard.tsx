import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, GestureResponderEvent } from "react-native";
import BoardSVG from "@/../assets/boards/brown.svg";
import {
  BoardSquare,
  GameMove,
  Layout,
  Point,
  DragPayload,
  PieceMoves,
  Promotion,
  Animation,
  GameBoard,
} from "@/types";
import Piece from "./Piece";
import {
  convertIndexToPoint,
  convertPointToIndex,
  findDifferences,
  getSquare,
  isValidIndex,
  makeMove,
  flipBoard,
} from "./lib/utils";
import { convertGameToFEN } from "./lib/fen";
import { findAllMoves } from "./lib/moves";
import HighlightSquare from "./HighlightSquare";
import GhostPiece from "./Ghost";
import SelectPromotion from "./SelectPromotion";
import { ANIMATION_DURATION } from "./lib/settings";
import FadeIn from "./FadeIn";

interface Props {
  flip: boolean;
  position: GameMove;
  addMove: (newMove: GameMove) => void;
}

export default function ChessBoard({
  flip,
  position,
  addMove,
}: Props): JSX.Element {
  const layoutRef = useRef<Layout>({ x: 0, y: 0, w: 0, h: 0 });
  const [board, setBoard] = useState<GameBoard>(position.board);
  const [selected, setSelected] = useState<DragPayload>();
  const [allMoves, setAllMoves] = useState<PieceMoves[]>([]);
  const [over, setOver] = useState<Point>();
  const [promotion, setPromotion] = useState<Promotion>();
  const [animations, setAnimations] = useState<Animation[]>([]);
  const prevBoard = useRef<GameBoard>();
  const skipAnimationsRef = useRef<boolean>(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const updateBoard = () => {
    clearInterval(animationTimeoutRef.current);
    setAnimations([]);
    setBoard(position.board);
    prevBoard.current = position.board;
    animationTimeoutRef.current = undefined;
    skipAnimationsRef.current = false;
  };

  /* Only runs when position changes */
  useEffect(() => {
    // find all new moves
    setAllMoves(findAllMoves(position));
    // updates board skipping all animations, ie. drag
    if (skipAnimationsRef.current) return updateBoard();

    // if animations are running still, update board so new ones are created
    if (animations.length > 0) {
      setAnimations([]);
      clearTimeout(animationTimeoutRef.current);
      if (prevBoard.current) {
        setBoard([...prevBoard.current]);
      } else {
        setBoard([...position.board]);
      }
    }
    // finds differences between old and current boards to animate
    const diffs = findDifferences(prevBoard.current ?? board, position.board);
    prevBoard.current = position.board;
    // if board hasn't changed, skip everything
    if (diffs.length === 0) return;
    // convert differences into Animation objects and sets new animations
    setAnimations(
      diffs.map((anim) => ({
        ...anim,
        start: convertIndexToPoint(anim.from, layoutRef.current),
        end: convertIndexToPoint(anim.to, layoutRef.current),
      }))
    );
    // set timeout for animations to run, and assign it to var so it can be cleared
    animationTimeoutRef.current = setTimeout(() => {
      updateBoard();
    }, ANIMATION_DURATION);
  }, [position]);

  useEffect(() => {
    if (selected && animationTimeoutRef.current) {
      updateBoard();
    }
  }, [selected, animationTimeoutRef.current]);

  // only run when empty square are touched
  function handleTouch(e: GestureResponderEvent) {
    if (promotion) {
      setPromotion(undefined);
      setBoard(position.board);
    }

    const point: Point = {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };

    const movePlayed = endMove(point, "touch");
    if (!movePlayed) setSelected(undefined);

    return movePlayed;
  }

  // if true, move was played
  function moveOnDrag(
    point: Point,
    sqr: Required<BoardSquare>,
    type: "start" | "end"
  ) {
    const square = getSquare(position.board, sqr.index);
    if (!square || !square.piece) return true;
    if (promotion) {
      setPromotion(undefined);
      setBoard(position.board);
    }
    // call drop function
    if (selected) {
      // select piece if same color
      if (
        selected.sqr.id !== square.id &&
        selected.sqr.color === square.color
      ) {
        setSelected({ point, sqr: sqr });
        return false;
      }
      return endMove(point, type === "start" ? "touch" : "drag");
    }
    if (square.color !== position.turn) return false;

    console.log(point);
    setSelected({ point, sqr: sqr });
    return false;
  }

  // if true, move was played
  function endMove(point: Point, type: "touch" | "drag"): boolean {
    if (!selected) return false;

    const endIndex = convertPointToIndex(point, layoutRef.current);
    // same square drop
    if (selected.sqr.index === endIndex) {
      return false;
    }

    const endSquare = getSquare(board, endIndex);
    if (!endSquare) return false;

    const movePlayed = playMove(selected.sqr.index, endIndex, type);
    return movePlayed;
  }

  // if true, move was played
  function playMove(from: number, to: number, type: "touch" | "drag") {
    // find possible move
    const move = allMoves
      .find((pm) => pm.index === from)
      ?.moves.find((move) => move.to === to);
    if (!move) return false;

    const fromSquare = getSquare(position.board, from);
    if (!fromSquare) return false;

    const changed = makeMove(position.board, move, position);
    // setBoard(changed.board);
    const newMove: GameMove = {
      board: changed.board,
      turn: !position.turn,
      cr: changed.cr,
      target: changed.target,
      hm: fromSquare.piece === "p" ? 0 : position.hm,
      fm: !position.turn ? position.fm + 1 : position.fm,
      fen: convertGameToFEN(position),
      prevMove: move,
    };

    if (type === "drag") {
      skipAnimationsRef.current = true;
    }
    if (move.type === "promotion") {
      setPromotion({ move, newMove });
      setBoard(newMove.board);
      return true;
    }

    setAnimations([]);
    addMove({ ...newMove });
    setSelected(undefined);

    return true;
  }

  const selectPiece = (piece: string) => {
    if (!promotion) return;
    promotion.newMove.board[Math.floor(promotion.move.to / 10)][
      promotion.move.to % 10
    ].piece = piece;

    addMove({ ...promotion.newMove });
    setPromotion(undefined);
    setSelected(undefined);
  };

  const moveOnDragRef = useRef(moveOnDrag);
  useEffect(() => {
    moveOnDragRef.current = moveOnDrag;
  }, [selected, promotion, position]);

  return (
    <View
      className={`w-full aspect-square relative flex flex-wrap flex-row bg-red-500 ${
        flip ? "rotate-180" : ""
      }`}
      onLayout={(e) => {
        const { x, y, height: h, width: w } = e.nativeEvent.layout;
        layoutRef.current = { x, y, h, w };
        setBoard([...board]);
      }}
      onStartShouldSetResponder={handleTouch}
    >
      <BoardSVG className="absolute -z-10" />

      {/* previous move */}
      {position.prevMove && (
        <>
          <HighlightSquare
            point={convertIndexToPoint(
              position.prevMove.from,
              layoutRef.current
            )}
            type="prev-start"
          />
          <HighlightSquare
            point={convertIndexToPoint(position.prevMove.to, layoutRef.current)}
            type="prev-end"
          />
        </>
      )}

      {/* possible moves */}
      {selected &&
        allMoves
          .find((move) => move.index === selected.sqr.index)
          ?.moves.map((move) => {
            const point = convertIndexToPoint(move.to, layoutRef.current);
            return (
              <HighlightSquare
                key={move.to}
                point={point}
                type="possible"
                isCapture={!!getSquare(board, move.to)?.piece}
              />
            );
          })}

      {/* Hover over */}
      {selected &&
        over &&
        isValidIndex(convertPointToIndex(over, layoutRef.current)) && (
          <HighlightSquare
            point={convertIndexToPoint(
              convertPointToIndex(over, layoutRef.current),
              layoutRef.current
            )}
            type="over"
          />
        )}

      {/* show faded piece at start square */}
      {selected && (
        <GhostPiece square={selected.sqr} point={selected.point} flip={flip} />
      )}

      {/* promotion */}
      {promotion && (
        <SelectPromotion
          point={convertIndexToPoint(
            position.turn ? promotion.move.to : promotion.move.to - 30,
            layoutRef.current
          )}
          color={position.turn}
          selectPiece={selectPiece}
          flip={flip}
        />
      )}

      {/* Fade in piece */}
      {animations
        .filter((a) => a.from === -1)
        .map((animation) => (
          <FadeIn key={animation.id} animation={animation} flip={flip} />
        ))}

      {board.map((row) =>
        row.map((sqr) => {
          const point: Point = convertIndexToPoint(
            sqr.index,
            layoutRef.current
          );
          const animation = animations.find((a) => a.from === sqr.index);

          return useMemo(
            () =>
              sqr.id &&
              sqr.piece &&
              sqr.color !== undefined && (
                <Piece
                  key={sqr.index}
                  sqr={{ ...sqr } as any} // safe
                  point={point}
                  moveOnDragRef={moveOnDragRef}
                  canMove={position.turn === sqr.color}
                  setOver={setOver}
                  size={{
                    w: layoutRef.current.w / 8,
                    h: layoutRef.current.h / 8,
                  }}
                  animation={animation}
                  flip={flip}
                />
              ),
            [sqr.id, point.x, point.y, position.turn, animation?.id, flip]
          );
        })
      )}
    </View>
  );
}
