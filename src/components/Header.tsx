import React from "react";
import { View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Header(): JSX.Element {
  const size = 30;

  return (
    <View className="w-full px-2 py-1 justify-between flex-row bg-white shadow-md shadow-black">
      {/* left */}
      <View>
        <Ionicons name="arrow-back" size={size} color="black" />
      </View>
      {/* middle */}
      <View></View>
      {/* right */}
      <View className="flex-row">
        <MaterialCommunityIcons
          name="dots-vertical"
          size={size}
          color="black"
        />
      </View>
    </View>
  );
}
