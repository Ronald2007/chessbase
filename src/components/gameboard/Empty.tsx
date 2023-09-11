import { PieceMoveAnimation } from "@/types";
import React, { useEffect, useState } from "react";
import { View, Animated } from "react-native";
import { PieceSVG } from "./lib/pieces";
import { ANIMATION_DURATION } from "./lib/settings";

interface Props {
  index: number;
  animation?: PieceMoveAnimation;
}

export default function Empty({ index, animation }: Props): JSX.Element {
  const [fade] = useState(new Animated.Value(0));

  useEffect(() => {
    if (animation && animation.from < 0) {
      const fadeAnim = Animated.timing(fade, {
        toValue: 1,
        useNativeDriver: true,
        duration: ANIMATION_DURATION,
      });

      fadeAnim.start(() => {
        fade.setValue(0);
        fadeAnim.stop();
      });
    }
  }, [animation]);

  return (
    <View
      key={index}
      className="w-[12.5%] h-[12.5%] flex text-center items-center justify-center absolute"
      style={{
        transform: [
          {
            translateX: (index % 10) * ((320 - 2) / 8),
          },
          {
            translateY: Math.floor(index / 10) * ((320 - 2) / 8),
          },
        ],
      }}
    >
      {animation && animation.from < 0 && animation.to === index && (
        <Animated.View style={{ opacity: fade }}>
          <PieceSVG {...animation.payload} />
        </Animated.View>
      )}
    </View>
  );
}
