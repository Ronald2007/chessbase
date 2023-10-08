import { GameControl, GameMove } from "@/types";

export const baseController: GameControl = {
  back: () => {},
  forward: () => {},
  goToMove: () => {},
  reset: () => {},
  setGame: () => {},
};

type Variations<V> = {
  variations: V[][];
};

export function getVariation<T extends Variations<T>>(
  moves: T[],
  moveNumber: number[]
): T[] {
  let variations: T[] = moves;
  if (moveNumber.length > 1) {
    let i = 1;
    while (i < moveNumber.length) {
      variations = variations[moveNumber[i - 1]].variations[moveNumber[i]];
      i += 2;
    }
  }
  return variations;
}

export function addNewMove(
  moves: GameMove[],
  // nums: number[],
  newMove: GameMove
) {
  const moveNumber = newMove.positionNumber; // [...nums];
  console.log("add, ", moveNumber);
  const variation = getVariation(moves, moveNumber);

  const lastNum = moveNumber.at(-1)! + 1;
  // create variation
  if (variation[lastNum]) {
    const sameVarIdx = variation[lastNum].variations.findIndex(
      (v) => v[0]?.fen === newMove.fen
    );
    if (variation[lastNum].fen === newMove.fen) {
      moveNumber[moveNumber.length - 1] += 1;
    } else if (sameVarIdx >= 0) {
      moveNumber[moveNumber.length - 1] += 1;
      moveNumber.push(sameVarIdx);
      moveNumber.push(0);
    } else {
      variation[lastNum].variations.push([newMove]);
      moveNumber[moveNumber.length - 1] += 1;
      moveNumber.push(variation[lastNum].variations.length - 1);
      moveNumber.push(0);
    }
  } else {
    variation.push(newMove);
    moveNumber[moveNumber.length - 1] = lastNum;
  }

  return { newMoves: moves, newMoveNumber: moveNumber };
}

export function findPosition<T extends Variations<T>>(
  moves: T[],
  moveNumber: number[]
) {
  let pos: T | undefined;
  let i = 0;
  while (i < moveNumber.length) {
    const num = moveNumber[i];
    if (i === 0) {
      pos = moves[num];
      if (!pos) break;
    } else {
      pos = pos?.variations.at(moveNumber[i - 1])?.at(num);
    }
    i += 2;
  }
  return pos;
}
