import {
  BoardSquare,
  DropEndInfo,
  DropResult,
  DropType,
  PieceMoveAnimation,
  Point,
  SquarePoint,
} from "@/types";
import { View } from "react-native";
import Piece from "./Piece";
import { useEffect, useMemo } from "react";

type Props = BoardSquare & {
  drop: React.MutableRefObject<(event: DropEndInfo) => DropResult | undefined>;
  drag: SquarePoint | null;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  isPossibleMove: boolean;
  turn: boolean;
  animation?: PieceMoveAnimation;
};

export default function Square({
  index,
  piece,
  color,
  id,
  drop,
  drag,
  setDrag,
  isPossibleMove,
  turn,
  animation,
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

  const dropPiece = (end: Point, type: DropType) => {
    const result = drop.current({
      payload: { piece, color, index, id },
      end,
      type: type,
    });

    return result;
  };

  // useEffect(() => {
  //   if (index === 73) {
  //     console.log(piece, " : ", animation);
  //   }
  // }, [piece, animation]);

  return (
    <View
      onTouchStart={(e) => {
        const point = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        // update drag if piece can move
        if (draggable) {
          return setDrag({ point, payload: { piece, color, index, id } });
        }
        // set drag only if there is a piece and same color
        if (!drag && draggable) {
          return setDrag(null);
        }
        // has drag and touched potential move
        const result = dropPiece(point, "touch");

        setDrag(null);
      }}
      onStartShouldSetResponderCapture={() => {
        return !draggable;
      }}
      className={`w-[12.5%] h-[12.5%] flex text-center items-center justify-center relative ${colorClass.join(
        " "
      )}`}
      style={
        {
          // zIndex: animation || isDragging ? 10 : 0,
          // opacity: piece && animation?.to === -1 ? 0.5 : 1,
        }
      }
      key={index}
    >
      {useMemo(() => {
        const anim = animation && animation.to > -1 ? animation : undefined;
        return (
          piece &&
          id &&
          color !== undefined && (
            <Piece
              piece={piece}
              color={color}
              index={index}
              id={id}
              setDrag={setDrag}
              drop={dropPiece}
              animation={anim}
            />
          )
        );
      }, [piece, color, animation?.from, id])}
    </View>
  );
}
