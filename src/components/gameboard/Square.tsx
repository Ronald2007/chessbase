import {
  BoardSquare,
  DragEndInfo,
  DragInfo,
  Point,
  SquarePoint,
} from "@/types";
import { View } from "react-native";
import Piece from "./Piece";
import { ComponentProps, memo, useMemo, useRef, useState } from "react";

type Props = BoardSquare & {
  drop: React.MutableRefObject<(event: DragEndInfo) => boolean>;
  // drop: (event: DragInfo) => boolean;
  drag: SquarePoint | null;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  isPossibleMove: boolean;
  turn: boolean;
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
}: Props) {
  console.log("refreshed square: ", index);
  const isDragging = drag && drag.payload.index === index;
  const dark = (Math.floor(index / 10) + (index % 10)) % 2 !== 0;
  const colorClass = !isDragging
    ? !isPossibleMove
      ? dark
        ? "bg-slate-700"
        : "bg-white"
      : "bg-yellow-300"
    : "z-10 bg-red-500";
  // const [draggable, setDraggable] = useState(turn === color);
  const draggable = turn === color;

  const dropPiece = (end: Point) => {
    const result = drop.current({
      payload: { piece, color, index },
      end,
    });

    return result;
  };

  return (
    <View
      onTouchStart={(e) => {
        const point = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        // update drag if piece can move
        if (turn === color) {
          return setDrag({ point, payload: { piece, color, index } });
        }
        // set drag only if there is a piece and same color
        if (!drag && turn !== color) {
          return setDrag(null);
        }
        // has drag and touched potential move
        const result = dropPiece(point);

        setDrag(null);
      }}
      onStartShouldSetResponderCapture={() => !draggable}
      className={`w-[12.5%] h-[12.5%] flex text-center items-center justify-center ${colorClass}`}
      key={index}
    >
      {piece &&
        color !== undefined &&
        useMemo(() => {
          return (
            <Piece
              piece={piece}
              color={color}
              index={index}
              setDrag={setDrag}
              drop={dropPiece}
            />
          );
        }, [piece, color])}
    </View>
  );
}
