import React from "react";
import GreenBoard from "@/assets/boards/green.svg";
import BrownBoard from "@/assets/boards/brown.svg";
import { SvgProps } from "react-native-svg";
import { BoardStyle } from "@/types";

interface Props extends SvgProps {
  name: BoardStyle;
}

export default function Board({ name, ...props }: Props): JSX.Element {
  let BoardSVG: React.FC<SvgProps>;

  if (name === "green") BoardSVG = GreenBoard;
  else if (name === "brown") BoardSVG = BrownBoard;
  else BoardSVG = GreenBoard;

  return <BoardSVG {...props} />;
}
