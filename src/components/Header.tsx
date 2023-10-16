import React from "react";
import { View } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { sample1 } from "@/lib/pgn/samples";

interface Props {
  onGameLoad: (pgn: string) => void;
}

export default function Header({ onGameLoad }: Props): JSX.Element {
  const size = 30;

  async function pickPGNFile() {
    const doc = await DocumentPicker.getDocumentAsync({
      type: "application/x-chess-pgn",
      multiple: false,
      copyToCacheDirectory: true,
    });
    console.log(doc);
    if (!doc.assets || doc.canceled) return;
    const text = await FileSystem.readAsStringAsync(doc.assets[0].uri);
    const games = text.split(/(?<=[A-Za-z0-9])\s*(?=\[)/gm);
    if (games.length === 0) return;

    onGameLoad(games[0]);
  }

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
          onPress={pickPGNFile}
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
