import { useCallback, useEffect, useRef, useState } from "react";
import { BoardSquare, DragInfo, MovePoints, Point } from "@/types";
import { View } from "react-native";
import Piece from "./Piece";
// import { useDragStore } from "./lib/state";

type Props = BoardSquare & {
  // drop: (e: DragInfo) => void
  drop: React.MutableRefObject<(event: DragInfo) => void>;
};

export default function Square({ index, piece, color, drop }: Props) {
  const dark = (Math.floor(index / 10) + (index % 10)) % 2 !== 0;
  const colorClass = dark ? "bg-slate-700 text-white" : "bg-white";
  const [drag, setDrag] = useState<Point | null>(null);

  const dropPiece = ({ start, end }: MovePoints) => {
    if (!piece) return;
    drop.current({
      payload: { piece, color, index },
      start,
      end,
    });
  };

  return (
    <View
      className={`w-[12.5%] h-[12.5%] flex text-center items-center justify-center ${colorClass} ${
        drag ? "z-10 bg-red-500" : ""
      }`}
      key={index}
    >
      {piece && (
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
