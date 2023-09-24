import { Notation } from "@/types";
import React from "react";
import { Text } from "react-native";

interface Props {
  note: Notation;
  first: boolean;
  onTap: (num: number) => void;
}

export default function MoveNotation({
  note,
  first,
  onTap,
}: Props): JSX.Element {
  const notation =
    (first ? "" : " ") +
    (note.color
      ? note.moveNumber + "."
      : first
      ? note.moveNumber + "..."
      : "") +
    note.notation;
  return (
    <Text onPress={() => onTap(note.positionNumber)} className="text-lg">
      {notation}
    </Text>
  );
}
