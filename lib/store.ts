import { create } from "zustand";

// Zustand store for the Functional Programming demo
interface PipelineState {
  inputValue: number;
  transforms: { id: string; label: string; fn: string }[];
  setInputValue: (value: number) => void;
  addTransform: (transform: { id: string; label: string; fn: string }) => void;
  removeTransform: (id: string) => void;
  clearTransforms: () => void;
  reorderTransforms: (fromIndex: number, toIndex: number) => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  inputValue: 10,
  transforms: [],
  setInputValue: (value) => set({ inputValue: value }),
  addTransform: (transform) =>
    set((state) => ({
      transforms: [...state.transforms, transform],
    })),
  removeTransform: (id) =>
    set((state) => ({
      transforms: state.transforms.filter((t) => t.id !== id),
    })),
  clearTransforms: () => set({ transforms: [] }),
  reorderTransforms: (fromIndex, toIndex) =>
    set((state) => {
      const newTransforms = [...state.transforms];
      const [moved] = newTransforms.splice(fromIndex, 1);
      newTransforms.splice(toIndex, 0, moved);
      return { transforms: newTransforms };
    }),
}));

// Counter store for demonstrating Zustand basics
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
}));
