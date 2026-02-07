"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { CodeDemo } from "@/components/code-demo";

const sortingCode = `// Sorting Algorithms Visualized

// Bubble Sort - O(n²)
function* bubbleSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      yield { array: [...a], comparing: [j, j + 1] };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { array: [...a], swapped: [j, j + 1] };
      }
    }
  }
  yield { array: [...a], sorted: true };
}

// Selection Sort - O(n²)
function* selectionSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      yield { array: [...a], comparing: [minIdx, j] };
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield { array: [...a], swapped: [i, minIdx] };
    }
  }
  yield { array: [...a], sorted: true };
}

// Quick Sort - O(n log n) average
function* quickSort(arr: number[], lo = 0, hi = arr.length - 1) {
  if (lo < hi) {
    const pivot = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield { array: [...arr], comparing: [j, hi] };
      if (arr[j] < pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    yield* quickSort(arr, lo, i - 1);
    yield* quickSort(arr, i + 1, hi);
  }
}`;

interface SortStep {
  array: number[];
  comparing?: [number, number];
  swapped?: [number, number];
  sorted?: boolean;
}

type AlgorithmName = "bubble" | "selection" | "insertion" | "quick";

function* bubbleSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      yield { array: [...a], comparing: [j, j + 1] };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { array: [...a], swapped: [j, j + 1] };
      }
    }
  }
  yield { array: [...a], sorted: true };
}

function* selectionSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      yield { array: [...a], comparing: [minIdx, j] };
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      yield { array: [...a], swapped: [i, minIdx] };
    }
  }
  yield { array: [...a], sorted: true };
}

function* insertionSortGen(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    yield { array: [...a], comparing: [i, j >= 0 ? j : 0] };
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      yield { array: [...a], swapped: [j, j + 1] };
      j--;
    }
    a[j + 1] = key;
    yield { array: [...a] };
  }
  yield { array: [...a], sorted: true };
}

function* quickSortGen(
  arr: number[],
  lo = 0,
  hi = arr.length - 1
): Generator<SortStep> {
  if (lo < hi) {
    const pivot = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield { array: [...arr], comparing: [j, hi] };
      if (arr[j] < pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        yield { array: [...arr], swapped: [i, j] };
        i++;
      }
    }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    yield { array: [...arr], swapped: [i, hi] };
    yield* quickSortGen(arr, lo, i - 1);
    yield* quickSortGen(arr, i + 1, hi);
  }
}

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

const algorithms: Record<AlgorithmName, {
  name: string;
  complexity: string;
  gen: (arr: number[]) => Generator<SortStep>;
}> = {
  bubble: { name: "Bubble Sort", complexity: "O(n²)", gen: bubbleSortGen },
  selection: { name: "Selection Sort", complexity: "O(n²)", gen: selectionSortGen },
  insertion: { name: "Insertion Sort", complexity: "O(n²)", gen: insertionSortGen },
  quick: { name: "Quick Sort", complexity: "O(n log n)", gen: quickSortGen },
};

export function SortingVisualizerDemo() {
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<AlgorithmName>("bubble");
  const [array, setArray] = useState(() => generateArray(30));
  const [comparing, setComparing] = useState<[number, number] | undefined>();
  const [swapped, setSwapped] = useState<[number, number] | undefined>();
  const [isSorted, setIsSorted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  const genRef = useRef<Generator<SortStep> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxVal = Math.max(...array);

  const step = useCallback(() => {
    if (!genRef.current) {
      genRef.current = algorithms[algorithm].gen([...array]);
    }
    const result = genRef.current.next();
    if (result.done) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return false;
    }
    const s = result.value;
    setArray(s.array);
    setComparing(s.comparing);
    setSwapped(s.swapped);
    setStepCount((c) => c + 1);
    if (s.sorted) {
      setIsSorted(true);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return false;
    }
    return true;
  }, [algorithm, array]);

  const play = useCallback(() => {
    setIsPlaying(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!step()) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, Math.max(5, 200 - speed * 2));
  }, [step, speed]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    pause();
    genRef.current = null;
    const newArr = generateArray(size);
    setArray(newArr);
    setComparing(undefined);
    setSwapped(undefined);
    setIsSorted(false);
    setStepCount(0);
  }, [size, pause]);

  // Reset on algorithm or size change
  useEffect(() => {
    reset();
  }, [algorithm, size]);

  // Update interval speed when speed changes during play
  useEffect(() => {
    if (isPlaying) {
      play();
    }
  }, [speed]);

  return (
    <CodeDemo
      title="Sorting Algorithm Visualizer"
      description="Watch sorting algorithms in action with animated bar charts."
      code={sortingCode}
    >
      <div className="space-y-4">
        {/* Algorithm selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(algorithms) as [AlgorithmName, typeof algorithms[AlgorithmName]][]).map(
            ([key, algo]) => (
              <button
                key={key}
                onClick={() => setAlgorithm(key)}
                disabled={isPlaying}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  algorithm === key
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                } disabled:opacity-50`}
              >
                {algo.name}
                <span className="ml-1 text-[10px] opacity-70">{algo.complexity}</span>
              </button>
            )
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? pause : play}
            disabled={isSorted}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={step}
            disabled={isPlaying || isSorted}
            className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <span className="text-xs text-muted-foreground ml-auto">
            Steps: {stepCount}
          </span>
        </div>

        {/* Speed and size */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-muted-foreground w-12">Speed:</label>
            <input
              type="range"
              min={1}
              max={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-muted-foreground w-12">Size:</label>
            <input
              type="range"
              min={10}
              max={80}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              disabled={isPlaying}
              className="flex-1"
            />
            <span className="text-xs font-mono w-6">{size}</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-lg bg-code-bg p-4">
          <div
            className="flex items-end gap-px"
            style={{ height: 200 }}
          >
            {array.map((val, i) => {
              const isComparing = comparing?.includes(i);
              const isSwapped = swapped?.includes(i);
              return (
                <motion.div
                  key={i}
                  layout
                  className={`rounded-t-sm flex-1 min-w-[2px] ${
                    isSorted
                      ? "bg-success"
                      : isSwapped
                      ? "bg-error"
                      : isComparing
                      ? "bg-warning"
                      : "bg-accent/60"
                  }`}
                  style={{
                    height: `${(val / maxVal) * 100}%`,
                  }}
                  transition={{ duration: 0.05 }}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-accent/60" />
            Unsorted
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-warning" />
            Comparing
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-error" />
            Swapping
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-success" />
            Sorted
          </span>
        </div>
      </div>
    </CodeDemo>
  );
}
