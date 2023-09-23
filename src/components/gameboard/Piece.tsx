import { BoardSquare, Animation, Point } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";
import { PieceSVG } from "./lib/pieces";
import { ANIMATION_DURATION } from "./lib/settings";

interface Props {
  sqr: Required<BoardSquare>;
  point: Point;
  moveOnDragRef: React.MutableRefObject<
    (
      point: Point,
      square: Required<BoardSquare>,
      type: "start" | "end"
    ) => boolean
  >;
  canMove: boolean;
  setOver: React.Dispatch<React.SetStateAction<Point | undefined>>;
  size: { w: number; h: number };
  animation?: Animation;
}

export default function Piece({
  sqr,
  point,
  moveOnDragRef,
  canMove,
  setOver,
  size,
  animation,
}: Props): JSX.Element {
  const { id, index, color, piece } = sqr;
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const offset = { x: size.w / 2, y: size.h / 2 };
  const fadeOut = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e) => {
      e.stopPropagation();
      const canDrag = !moveOnDragRef.current(point, sqr, "start");
      if (!canMove || !canDrag) return false;
      setIsDragging(true);

      return true;
    },
    onPanResponderMove: (_, g) => {
      // position of the touch, relative to board
      const curr = {
        x: point.x + g.dx + offset.x,
        y: point.y + g.dy + offset.y,
      };

      // clamp position
      if (curr.y > size.h * 8) curr.y = size.h * 8;
      if (curr.x > size.w * 8) curr.x = size.w * 8;
      if (curr.y < 0) curr.y = 0;
      if (curr.x < 0) curr.x = 0;

      setOver(curr);

      Animated.event([{ x: pan.x, y: pan.y }], {
        useNativeDriver: false,
      })({ x: curr.x - point.x - offset.x, y: curr.y - point.y - offset.y });
    },
    onPanResponderEnd: (_, g) => {
      // position of the touch, relative to board
      const endPoint = {
        x: point.x + g.dx + offset.x,
        y: point.y + g.dy + offset.y,
      };

      setIsDragging(false);
      setOver(undefined);

      const movePlayed = moveOnDragRef.current(endPoint, sqr, "end");
      setIsAnimating(true);
      if (!movePlayed) {
        // spring back to start square
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start(() => setIsAnimating(false));
      } else {
        // spring to new square so it is smooth
        Animated.spring(pan, {
          toValue: {
            x: Math.floor(endPoint.x / size.w) * size.w - size.w * (index % 10),
            y:
              Math.floor(endPoint.y / size.h) * size.h -
              size.h * Math.floor(index / 10),
          },
          useNativeDriver: true,
        }).start(() => setIsAnimating(false));
      }
    },
  });

  useEffect(() => {
    // reset values
    pan.setValue({ x: 0, y: 0 });
    fadeOut.setValue(1);

    if (!animation || animation.id !== id) {
      return;
    }
    if (animation.to >= 0) {
      // piece move animation
      setIsAnimating(true);
      Animated.timing(pan, {
        toValue: {
          x: animation.end.x - animation.start.x,
          y: animation.end.y - animation.start.y,
        },
        useNativeDriver: true,
        duration: ANIMATION_DURATION,
      }).start(() => setIsAnimating(false));
    } else {
      // fade out piece
      Animated.timing(fadeOut, {
        toValue: 0,
        useNativeDriver: true,
        duration: ANIMATION_DURATION,
      }).start();
    }
  }, [animation]);

  return (
    <Animated.View
      key={index}
      className="w-[12.5%] h-[12.5%] absolute"
      style={{
        zIndex: isDragging || isAnimating ? 20 : 10,
        left: point.x,
        top: point.y,
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { scale: isDragging ? 1.5 : 1 },
        ],
        opacity: fadeOut,
      }}
      {...panResponder.panHandlers}
    >
      <PieceSVG piece={piece} color={color} />
    </Animated.View>
  );
}
