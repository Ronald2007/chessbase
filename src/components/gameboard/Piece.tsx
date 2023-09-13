import { useEffect, useRef, useState } from "react";
import { Text, PanResponder, Animated } from "react-native";
import { ANIMATION_DURATION, pieces } from "./lib/settings";
import { PieceSVG } from "./lib/pieces";
import {
  DropEndInfo,
  DropResult,
  DropType,
  PieceMoveAnimation,
  Point,
  SquarePoint,
} from "@/types";

interface Props {
  piece: string;
  color: boolean;
  index: number;
  id: string;
  setDrag: React.Dispatch<React.SetStateAction<SquarePoint | null>>;
  drop: React.MutableRefObject<(event: DropEndInfo) => DropResult | undefined>;
  animation?: PieceMoveAnimation;
  isDragging: boolean;
}

export default function Piece({
  piece,
  color,
  index,
  id: _,
  setDrag,
  drop,
  animation,
  isDragging,
}: Props) {
  const [fade] = useState(new Animated.Value(1));
  const pan = useRef(new Animated.ValueXY()).current;
  const [panValues, setPanValues] = useState<Point>({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e, g) => {
        const dis = { x: g.dx - g.x0, y: g.dy - g.y0 };
        pan.setOffset(dis);

        return true;
      },
      onPanResponderMove: (e, g) => {
        setPanValues({ x: g.dx, y: g.dy });

        return Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(e, g);
      },
      onPanResponderRelease: (e, g) => {
        const end = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        const result = drop.current({ end, type: "drag" });

        if (!result) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start(() => pan.extractOffset());
        } else {
          setDrag(null);
          pan.extractOffset();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (animation) {
      if (animation.to < 0) {
        // fade out
        const fadeAnim = Animated.timing(fade, {
          toValue: 0,
          useNativeDriver: true,
          duration: ANIMATION_DURATION,
        });

        fadeAnim.start(() => {
          fade.setValue(1);
          fade.stopAnimation();
          animation = undefined;
          fadeAnim.stop();
        });
      } else {
        // move out
        const promoting =
          animation?.payload.piece === "p" &&
          (Math.floor(animation.to / 10) === 0 ||
            Math.floor(animation.to / 10) === 7);

        const goTo = {
          x: animation.end.x - animation.start.x - panValues.x,
          y: animation.end.y - animation.start.y - panValues.y,
        };

        const anim = Animated.timing(pan, {
          toValue: goTo,
          useNativeDriver: true,
          duration: ANIMATION_DURATION,
        });

        anim.start(() => {
          if (promoting) return;
          pan.setValue({ x: 0, y: 0 });
          pan.extractOffset();
          animation = undefined;
          anim.stop();
        });
      }
    } else {
      pan.setValue({ x: panValues.x * -1, y: panValues.y * -1 });
      pan.extractOffset();
      pan.resetAnimation();
      pan.stopAnimation();
      fade.resetAnimation();
      fade.stopAnimation();
      setPanValues({ x: 0, y: 0 });
    }
  }, [animation]);

  if (!pieces.includes(piece)) return <Text>-1</Text>;

  return (
    <Animated.View
      className="w-[12.5%] h-[12.5%] flex text-center items-center justify-center relative"
      style={{
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        zIndex: animation?.from === index || isDragging ? 20 : 0,
        opacity: fade,
      }}
      {...panResponder.panHandlers}
    >
      <PieceSVG piece={piece} color={color} />
    </Animated.View>
  );
}
