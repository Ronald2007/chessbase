import { GameControl, Notation } from "@/types";
import React, { Fragment } from "react";
import { Text, View } from "react-native";

interface Props {
  note: Notation;
  first: boolean;
  level: number;
  onTap: GameControl["goToMove"];
  currMove: number[];
}

export default function MoveNotation({
  note,
  first,
  level,
  onTap,
  currMove,
}: Props): JSX.Element {
  // console.log(note);
  const same = !currMove.find((m, idx) => m !== note.positionNumber[idx]);
  const notation =
    (first ? "    ".repeat(level) : " ") +
    (note.color
      ? note.moveNumber + "."
      : first
      ? note.moveNumber + "..."
      : "") +
    note.notation;
  return (
    <>
      <Text
        onPress={() => onTap(note.positionNumber)}
        className={`text-lg ${same ? "bg-blue-300" : ""}`}
        // style={{ width: note.variations.length > 0 ? "100%" : undefined }}
      >
        {notation}
      </Text>
      {note.variations.map((notations, nIdx) => (
        <Fragment key={nIdx}>
          <View className="basis-full h-0" />
          <View className="flex-row w-full flex-wrap">
            {notations.map((n, idx) => (
              <MoveNotation
                key={idx}
                note={n}
                first={idx === 0}
                level={level + 1}
                currMove={currMove}
                onTap={(nums) => onTap(nums)}
              />
            ))}
          </View>
        </Fragment>
      ))}
    </>
  );
}
