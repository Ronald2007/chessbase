import { GameMove } from "@/types";
import { View, Text, Pressable } from "react-native";
import { Fragment } from "react";
import { PieceSVG } from "./gameboard/lib/pieces";

interface Props {
  moves: GameMove[];
  level: number;
  currMove: number[];
  onTap: (nums: number[]) => void;
  figurines?: boolean;
}

export default function NotationView({
  moves,
  level,
  currMove,
  onTap,
  figurines = true,
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
                  currMove={currMove}
                  onTap={onTap}
                  figurines={figurines}
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
                    figurines={figurines}
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
  currMove: number[];
  onTap: (nums: number[]) => void;
  figurines?: boolean;
}

function Notation({
  move,
  first,
  currMove,
  onTap,
  figurines = true,
}: NotationProps) {
  if (!move.prevMove) return <></>;
  const numbering = !move.turn ? move.fm + "." : first ? move.fm + "..." : "";
  const notation = move.prevMove.notation;
  const selected =
    currMove.length === move.positionNumber.length &&
    currMove.filter((m, idx) => m === move.positionNumber[idx]).length ===
      currMove.length;
  // displayNotation =
  let figurineNotation =
    figurines &&
    move.prevMove.type === "normal" &&
    notation[0] === notation[0].toUpperCase()
      ? notation.slice(1)
      : notation;
  if (move.prevMove.type === "promotion") {
    figurineNotation = figurineNotation.slice(0, -1);
  }

  return (
    <Pressable
      className={`px-1 rounded-md flex flex-row items-center ${
        selected ? "bg-gray-200" : ""
      }`}
      onPress={() => onTap(move.positionNumber)}
    >
      {figurines ? (
        <>
          <Text className="text-base">{numbering}</Text>
          <PieceSVG
            piece={move.prevMove.notation[0].toLowerCase()}
            color={!move.turn}
            height={16}
            width={16}
          />
          <Text className="text-base">{figurineNotation}</Text>
          {move.prevMove.type === "promotion" && (
            <PieceSVG
              piece={notation.at(-1)!.toLowerCase()}
              color={!move.turn}
              height={16}
              width={16}
            />
          )}
        </>
      ) : (
        <Text className="text-base">
          {numbering}
          {notation}
        </Text>
      )}
    </Pressable>
  );
}
