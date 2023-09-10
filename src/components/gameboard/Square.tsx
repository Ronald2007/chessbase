import {
  BoardSquare,
  DropEndInfo,
  DropInfo,
  DropResult,
  DropType,
  Point,
  SquarePoint,
} from "@/types";
import { View } from "react-native";
import Piece from "./Piece";
import { ComponentProps, memo, useMemo, useRef, useState } from "react";

type Props = BoardSquare & {
  drop: React.MutableRefObject<(event: DropEndInfo) => DropResult | undefined>;
  // drop: (event: DragInfo) => boolean;
  drag: SquarePoint | null;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  isPossibleMove: boolean;
  turn: boolean;
  animateTo?: DropResult;
  setAnimateTo: React.Dispatch<React.SetStateAction<DropResult | undefined>>;
};

export default function Square({
  index,
  piece,
  color,
  drop,
  drag,
  setDrag,
  isPossibleMove,
  turn,
  animateTo,
  setAnimateTo,
}: Props) {
  const isDragging = drag && drag.payload.index === index;
  const dark = (Math.floor(index / 10) + (index % 10)) % 2 !== 0;
  const colorClass = [
    !isDragging
      ? !isPossibleMove
        ? dark
          ? "bg-slate-700"
          : "bg-white"
        : "bg-yellow-300"
      : "z-10 bg-red-500",
  ];
  let draggable = turn === color;
  const isAnimating = animateTo?.startIndex === index;

  const dropPiece = (end: Point, type: DropType) => {
    const result = drop.current({
      payload: { piece, color, index },
      end,
      type: type,
    });

    return result;
  };

  return (
    <View
      onTouchStart={(e) => {
        const point = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        // update drag if piece can move
        if (draggable) {
          return setDrag({ point, payload: { piece, color, index } });
        }
        // set drag only if there is a piece and same color
        if (!drag && draggable) {
          return setDrag(null);
        }
        // has drag and touched potential move
        const result = dropPiece(point, "touch");

        if (result) {
          setAnimateTo(result);
          // draggable = !draggable;
          // setDraggable((v) => !v);
        }

        setDrag(null);
      }}
      onStartShouldSetResponderCapture={() => {
        // console.log("ontouch ", !draggable);
        // return animateTo ? turn === color : turn !== color;
        return !draggable;
      }}
      className={`w-[12.5%] h-[12.5%] flex text-center items-center justify-center ${colorClass.join(
        " "
      )}`}
      style={{
        zIndex: isAnimating || isDragging ? 10 : 0,
        opacity: piece && animateTo?.endIndex === index ? 0.5 : 1,
      }}
      key={index}
    >
      {useMemo(() => {
        return (
          piece &&
          color !== undefined && (
            <Piece
              piece={piece}
              color={color}
              index={index}
              setDrag={setDrag}
              drop={dropPiece}
              animateTo={animateTo}
            />
          )
        );
      }, [piece, color, isAnimating])}
    </View>
  );
}
