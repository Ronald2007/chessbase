import { useRef, useState } from "react";
import { Text, PanResponder, Animated } from "react-native";
import { pieces } from "./lib/settings";
import { PieceSVG } from "./lib/pieces";
import { DragInfo, MovePoints, Point } from "@/types";

interface Props {
  piece: string;
  color: boolean;
  index: number;
  setDrag: React.Dispatch<React.SetStateAction<Point | null>>;
  drop: (points: MovePoints) => void;
}

export default function Piece({ piece, color, index, setDrag, drop }: Props) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, g) => {
        console.log("moved");
        setDrag({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
        return true;
      },
      // onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, g) => {
        // setDrag({
        //   start: { x: g.x0, y: g.y0 },
        //   end: { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY },
        //   payload: { piece, color, index },
        // });
        return Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(e, g);
      },
      onPanResponderRelease: (e, g) => {
        // setDrag({
        //   start: { x: g.x0, y: g.y0 },
        //   end: { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY },
        //   payload: { piece, color, index },
        // });
        const end = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        const start = { x: end.x - g.dx, y: end.y - g.dy };
        drop({ start, end });
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setDrag(null);
            pan.extractOffset();
          }
        });
      },
    })
  ).current;

  if (!pieces.includes(piece)) return <Text>-1</Text>;

  return (
    <Animated.View
      style={{
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
      }}
      {...panResponder.panHandlers}
    >
      <PieceSVG piece={piece} color={color} />
    </Animated.View>
  );
}
