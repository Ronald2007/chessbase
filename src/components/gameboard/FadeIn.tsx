import { Animation } from "@/types";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { PieceSVG } from "./lib/pieces";
import { ANIMATION_DURATION } from "./lib/settings";

interface Props {
  animation: Animation;
}

export default function FadeIn({ animation }: Props): JSX.Element {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animation || animation.from >= 0) return;
    Animated.timing(fade, {
      toValue: 1,
      useNativeDriver: true,
      duration: ANIMATION_DURATION,
    }).start();
  }, [animation]);

  return (
    <Animated.View
      className="w-[12.5%] h-[12.5%] absolute"
      style={{ left: animation.end.x, top: animation.end.y, opacity: fade }}
    >
      <PieceSVG {...animation.payload} />
    </Animated.View>
  );
}
