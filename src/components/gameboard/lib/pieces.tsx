// Black
import BB from "@/assets/pieces/bb.svg";
import BK from "@/assets/pieces/bk.svg";
import BQ from "@/assets/pieces/bq.svg";
import BN from "@/assets/pieces/bn.svg";
import BR from "@/assets/pieces/br.svg";
import BP from "@/assets/pieces/bp.svg";

// White
import WK from "@/assets/pieces/wk.svg";
import WQ from "@/assets/pieces/wq.svg";
import WB from "@/assets/pieces/wb.svg";
import WN from "@/assets/pieces/wn.svg";
import WR from "@/assets/pieces/wr.svg";
import WP from "@/assets/pieces/wp.svg";
import { pieces } from "./settings";
import { SvgProps } from "react-native-svg";

export { WK, WQ, WB, WN, WR, WP, BK, BQ, BB, BN, BR, BP };

type Props = Omit<SvgProps, "color"> & {
  piece: string;
  color: boolean;
};

export function PieceSVG({ piece, color, ...props }: Props) {
  const pieceIdx = pieces.findIndex((p) => p === piece);
  if (pieceIdx < 0) {
    return <></>;
  }

  const SVGPieces = [WR, WN, WB, WQ, WK, WP, BR, BN, BB, BQ, BK, BP];
  const Piece = SVGPieces[pieceIdx + (color ? 0 : 6)];

  return <Piece {...props} width="100%" height="100%" />;
}
