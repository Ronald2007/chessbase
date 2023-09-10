import { useEffect, useRef } from "react";
import { Text, PanResponder, Animated } from "react-native";
import { ANIMATION_DURATION, pieces } from "./lib/settings";
import { PieceSVG } from "./lib/pieces";
import { DropResult, DropType, Point, SquarePoint } from "@/types";

interface Props {
  piece: string;
  color: boolean;
  index: number;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  drop: (end: Point, type: DropType) => DropResult | undefined;
  animateTo?: DropResult;
}

export default function Piece({
  piece,
  color,
  index,
  animateTo,
  setDrag,
  drop,
}: Props) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e, g) => {
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
        const result = drop(end, "drag");

        pan.flattenOffset();

        // console.log("dragged");

        if (!result) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start(() => {
            pan.extractOffset();
          });
        } else {
          // const animateTo = {
          //   x: result.endPoint.x - result.startPoint.x,
          //   y: result.endPoint.y - result.startPoint.y,
          // };
          // console.log(animateTo);
          // setDrag(null);
          // Animated.timing(pan, {
          //   toValue: animateTo,
          //   useNativeDriver: true,
          //   duration: 100,
          // }).start(() => {
          //   pan.extractOffset();
          // });
          setDrag(null);
          pan.extractOffset();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (
      animateTo &&
      animateTo.type === "touch" &&
      animateTo.startIndex === index
    ) {
      const goTo = {
        x: animateTo.endPoint.x - animateTo.startPoint.x,
        y: animateTo.endPoint.y - animateTo.startPoint.y,
      };
      Animated.timing(pan, {
        toValue: goTo,
        useNativeDriver: true,
        duration: ANIMATION_DURATION,
      }).start(() => {
        pan.extractOffset();
      });
    }
  }, [animateTo]);

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
