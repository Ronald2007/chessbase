import { useRef } from "react";
import { Text, PanResponder, Animated } from "react-native";
import { pieces } from "./lib/settings";
import { PieceSVG } from "./lib/pieces";
import { Point, SquarePoint } from "@/types";

interface Props {
  piece: string;
  color: boolean;
  index: number;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  drop: (end: Point) => boolean;
}

export default function Piece({ piece, color, index, setDrag, drop }: Props) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, g) => {
        const dis = { x: g.dx - g.x0, y: g.dy - g.y0 };
        pan.setOffset(dis);

        return true;
      },
      onPanResponderMove: (e, g) => {
        return Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(e, g);
      },
      onPanResponderRelease: (e, g) => {
        const end = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        // const start = { x: end.x - g.dx, y: end.y - g.dy };
        const result = drop(end);

        pan.flattenOffset();

        if (!result) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            pan.extractOffset();
          });
        } else {
          setDrag(null);
          pan.extractOffset();
        }
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
