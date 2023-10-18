import { Animation, Point, PieceSquare } from "@/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";
import PieceSVG from "./lib/PieceSVG";
import { ANIMATION_DURATION } from "./lib/constants";
import { numberClamp } from "./lib/utils";

interface Props {
  sqr: PieceSquare;
  point: Point;
  moveOnDragRef: React.MutableRefObject<
    (point: Point, square: PieceSquare, type: "start" | "end") => boolean
  >;
  canMove: boolean;
  setOver: React.Dispatch<React.SetStateAction<Point | undefined>>;
  size: { w: number; h: number };
  animation?: Animation;
  flip: boolean;
}

export default function Piece({
  sqr,
  point,
  moveOnDragRef,
  canMove,
  setOver,
  size,
  animation,
  flip,
}: Props): JSX.Element {
  const { id, index, color, piece } = sqr;
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const center = { x: size.w / 2, y: size.h / 2 };
  const fadeOut = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY(point)).current;
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, g) => {
      e.stopPropagation();
      const canDrag = !moveOnDragRef.current(point, sqr, "start");
      if (!canMove || !canDrag) return false;

      // finds distance between touch and center of element
      const ofs = {
        x: (e.nativeEvent.locationX - center.x) * (flip ? -1 : 1),
        y: (e.nativeEvent.locationY - center.y) * (flip ? -1 : 1),
      };
      if (!(Math.abs(g.dx) < 5 && Math.abs(g.dy) < 5)) {
        pan.setOffset(ofs);
      }
      setOffset(ofs);

      return true;
    },
    onPanResponderMove: (_, g) => {
      if (Math.abs(g.dx) < 5 && Math.abs(g.dy) < 5) {
        return;
      }
      pan.setOffset(offset);
      setIsDragging(true);

      // position of the touch, clamped, relative to board
      const curr = {
        x: numberClamp(
          point.x + g.dx * (flip ? -1 : 1),
          size.w * 8 - offset.x - center.x,
          0 - offset.x - center.x - 1
        ),
        y: numberClamp(
          point.y + g.dy * (flip ? -1 : 1),
          size.h * 8 - offset.y - center.y,
          0 - offset.y - center.y - 1
        ),
      };

      // position of finger, center of dragged piece
      setOver({
        x: curr.x + offset.x + center.x,
        y: curr.y + offset.y + center.y,
      });

      Animated.event([{ x: pan.x, y: pan.y }], {
        useNativeDriver: false,
      })({ x: curr.x - point.x, y: curr.y - point.y });
    },
    onPanResponderEnd: (_, g) => {
      // position of the finger, relative to board
      const endPoint = {
        x: point.x + g.dx * (flip ? -1 : 1) + offset.x + center.x,
        y: point.y + g.dy * (flip ? -1 : 1) + offset.y + center.y,
      };

      setIsDragging(false);
      setOver(undefined);
      pan.flattenOffset(); // resets & merges offset to base value
      setOffset({ x: 0, y: 0 });

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
          { rotate: flip ? "180deg" : "0deg" },
        ],
        opacity: fadeOut,
      }}
      {...panResponder.panHandlers}
    >
      {useMemo(
        () => (
          <PieceSVG piece={piece} color={color} />
        ),
        [piece, color]
      )}
    </Animated.View>
  );
}
