import React from "react";
import { View } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { pgnSample, sample1, sample2, sample3 } from "@/lib/constants";

interface Props {
  onGameLoad: (pgn: string) => void;
}

export default function Header({ onGameLoad }: Props): JSX.Element {
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
        <AntDesign
          name="folderopen"
          size={size}
          color="black"
          onPress={() => {
            onGameLoad(sample3);
          }}
        />
        <MaterialCommunityIcons
          name="dots-vertical"
          size={size}
          color="black"
        />
      </View>
    </View>
  );
}
