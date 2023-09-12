import { LayoutRect, PieceMoveAnimation } from "@/types";
import React, { useEffect, useState } from "react";
import { View, Animated } from "react-native";
import { PieceSVG } from "./lib/pieces";
import { ANIMATION_DURATION } from "./lib/settings";

interface Props {
  index: number;
  layoutRect: LayoutRect;
  animation?: PieceMoveAnimation;
}

export default function Empty({
  index,
  animation,
  layoutRect,
}: Props): JSX.Element {
  const [fade] = useState(new Animated.Value(0));
  const dx = (index % 10) * ((layoutRect.width - 2) / 8);
  const dy = Math.floor(index / 10) * ((layoutRect.height - 2) / 8);

  useEffect(() => {
    if (animation && animation.from < 0) {
      const fadeAnim = Animated.timing(fade, {
        toValue: 1,
        useNativeDriver: true,
        duration: ANIMATION_DURATION,
      });

      fadeAnim.start(() => {
        fade.setValue(0);
        fade.extractOffset();
        animation = undefined;
        fadeAnim.stop();
      });
    } else {
      fade.stopAnimation();
    }
  }, [animation]);

  return (
    <View
      key={index}
      className="w-[12.5%] h-[12.5%] flex text-center items-center justify-center absolute"
      style={{ transform: [{ translateX: dx }, { translateY: dy }] }}
    >
      {animation && animation.from < 0 && animation.to === index && (
        <Animated.View style={{ opacity: fade }}>
          <PieceSVG {...animation.payload} />
        </Animated.View>
      )}
    </View>
  );
}
