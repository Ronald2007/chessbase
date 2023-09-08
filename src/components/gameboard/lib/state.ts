import { create } from "zustand";

interface DragStoreState {
  drag: {
    payload: {
      piece: string;
      color: boolean;
      index: number;
    };
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
  } | null;
}

interface DragStoreActions {
  setDrag: (drag: DragStoreState["drag"]) => void;
  drop: () => void;
}

export const useDragStore = create<DragStoreState & DragStoreActions>(
  (set, get) => ({
    drag: null,
    setDrag: (drag) => set(() => ({ drag })),
    drop: () => {
      const drag = get().drag;
      // console.log(drag);
    },
  })
);
