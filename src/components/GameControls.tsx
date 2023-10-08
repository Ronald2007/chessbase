import { GameControl } from "@/types";
import React from "react";
import { View } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

interface Props extends Pick<GameControl, "back" | "forward" | "reset"> {
  flip: () => void;
  size?: number;
}

export default function GameControls({
  back,
  forward,
  reset,
  flip,
  size = 30,
}: Props): JSX.Element {
  return (
    <View className="w-full flex-row px-2 justify-between py-1 border-t space-x-2">
      {/* left */}
      <View>
        <AntDesign name="sync" size={size} onPress={flip} />
      </View>
      <View className="flex-row space-x-4">
        <AntDesign name="leftcircleo" size={size} onPress={back} />
        <AntDesign name="rightcircleo" size={size} onPress={forward} />
      </View>
      {/* right */}
      <View>
        <MaterialIcons name="clear" size={size} onPress={reset} />
      </View>
    </View>
  );
}
