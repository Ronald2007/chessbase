import { BoardSquare, DragInfo, Point, SquarePoint } from "@/types";
import { View } from "react-native";
import Piece from "./Piece";

type Props = BoardSquare & {
  drop: React.MutableRefObject<(event: DragInfo) => boolean>;
  drag: SquarePoint | null;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  isPossibleMove: boolean;
};

export default function Square({
  index,
  piece,
  color,
  drop,
  drag,
  setDrag,
  isPossibleMove,
}: Props) {
  const isDragging = drag && drag.payload.index === index;
  const dark = (Math.floor(index / 10) + (index % 10)) % 2 !== 0;
  const colorClass = !isDragging
    ? !isPossibleMove
      ? dark
        ? "bg-slate-700"
        : "bg-white"
      : "bg-yellow-300"
    : "z-10 bg-red-500";

  const dropPiece = (end: Point) => {
    const result = drop.current({
      payload: { piece, color, index },
      start: drag?.point,
      end,
    });

    return result;
  };

  return (
    <View
      onTouchStart={(e) => {
        const point = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };

        // set drag only if there is a piece and same color
        if (piece && (!drag || drag?.payload.color === color)) {
          return setDrag({ point, payload: { piece, color, index } });
        }
        // if (drag?.payload.color === color) {
        //   return setDrag({ point, payload: { piece, color, index } });
        // }

        // const result = dropPiece(point, drag?.point ?? undefined);
        const result = dropPiece(point);
        if (result) {
          e.stopPropagation();
        }
        setDrag(null);
      }}
      // onMoveShouldSetResponder={(e) => {
      //   console.log("move start");
      //   const end_points = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
      //   const result = dropPiece(end_points);
      //   if (result) {
      //     e.stopPropagation();
      //     setDrag(null);
      //   }
      //   return false;
      // }}
      className={`w-[12.5%] h-[12.5%] flex text-center items-center justify-center ${colorClass}`}
      key={index}
    >
      {piece && color !== undefined && (
        <Piece
          piece={piece}
          color={color}
          index={index}
          setDrag={setDrag}
          drop={dropPiece}
        />
      )}
    </View>
  );
}
