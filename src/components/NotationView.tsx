import { GameMove } from "@/types";
import { View, Text } from "react-native";
import { Fragment } from "react";

interface Props {
  moves: GameMove[];
  level: number;
  currMove: number[];
  onTap: (nums: number[]) => void;
}

export default function NotationView({
  moves,
  level,
  currMove,
  onTap,
}: Props): JSX.Element {
  return (
    <>
      <View className="w-full h-0"></View>
      <View
        className="flex flex-row flex-wrap justify-start w-full items-center"
        style={{ paddingLeft: level * 16 }}
      >
        {level > 0 && <Text className="text-base">{"["}</Text>}
        {moves.map((move, idx) => {
          return (
            <Fragment key={idx}>
              <View key={idx} className="">
                <Notation
                  move={move}
                  first={idx === 0}
                  level={level}
                  currMove={currMove}
                  onTap={onTap}
                />
              </View>
              {move.variations.length > 0 &&
                move.variations.map((variation, idx) => (
                  <NotationView
                    key={idx}
                    moves={variation}
                    level={level + 1}
                    currMove={currMove}
                    onTap={onTap}
                  />
                ))}
            </Fragment>
          );
        })}
        {level > 0 && <Text className="text-base">{"]"}</Text>}
      </View>
    </>
  );
}

interface NotationProps {
  move: GameMove;
  first: boolean;
  level: number;
  currMove: number[];
  onTap: (nums: number[]) => void;
}

function Notation({ move, first, currMove, onTap }: NotationProps) {
  if (!move.prevMove) return <></>;
  const notation =
    // (first ? "      ".repeat(level) : " ") +
    (!move.turn ? move.fm + "." : first ? move.fm + "..." : "") +
    move.prevMove.notation;
  const selected =
    currMove.length === move.positionNumber.length &&
    currMove.filter((m, idx) => m === move.positionNumber[idx]).length ===
      currMove.length;

  return (
    <Text
      className={`text-base px-1 rounded-md ${selected ? "bg-gray-200" : ""}`}
      onPress={() => onTap(move.positionNumber)}
    >
      {notation}
    </Text>
  );
}
