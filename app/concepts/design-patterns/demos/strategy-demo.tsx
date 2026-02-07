"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const strategyCode = `// Strategy Pattern: define a family of algorithms,
// encapsulate each one, and make them interchangeable

interface SortStrategy<T> {
  name: string;
  sort(arr: T[]): T[];
  description: string;
  timeComplexity: string;
}

// Bubble Sort Strategy
const bubbleSort: SortStrategy<number> = {
  name: "Bubble Sort",
  description: "Compare adjacent elements and swap if out of order",
  timeComplexity: "O(n²)",
  sort(arr) {
    const result = [...arr];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length - i - 1; j++) {
        if (result[j] > result[j + 1]) {
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  },
};

// Quick Sort Strategy
const quickSort: SortStrategy<number> = {
  name: "Quick Sort",
  timeComplexity: "O(n log n) avg",
  sort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = arr.filter(x => x < pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort.sort(left), pivot, ...quickSort.sort(right)];
  },
};

// Sorter context - uses strategy
class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    return this.strategy.sort(data);
  }
}`;

type StrategyName = "bubble" | "selection" | "insertion" | "quick";

interface SortResult {
  strategy: string;
  input: number[];
  output: number[];
  time: number;
  comparisons: number;
}

function bubbleSort(arr: number[]): { sorted: number[]; comparisons: number } {
  const result = [...arr];
  let comparisons = 0;
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - i - 1; j++) {
      comparisons++;
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return { sorted: result, comparisons };
}

function selectionSort(arr: number[]): { sorted: number[]; comparisons: number } {
  const result = [...arr];
  let comparisons = 0;
  for (let i = 0; i < result.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < result.length; j++) {
      comparisons++;
      if (result[j] < result[minIdx]) minIdx = j;
    }
    [result[i], result[minIdx]] = [result[minIdx], result[i]];
  }
  return { sorted: result, comparisons };
}

function insertionSort(arr: number[]): { sorted: number[]; comparisons: number } {
  const result = [...arr];
  let comparisons = 0;
  for (let i = 1; i < result.length; i++) {
    const key = result[i];
    let j = i - 1;
    while (j >= 0 && result[j] > key) {
      comparisons++;
      result[j + 1] = result[j];
      j--;
    }
    comparisons++;
    result[j + 1] = key;
  }
  return { sorted: result, comparisons };
}

function quickSort(arr: number[]): { sorted: number[]; comparisons: number } {
  let comparisons = 0;
  function qs(a: number[]): number[] {
    if (a.length <= 1) return a;
    const pivot = a[a.length - 1];
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i < a.length - 1; i++) {
      comparisons++;
      if (a[i] < pivot) left.push(a[i]);
      else right.push(a[i]);
    }
    return [...qs(left), pivot, ...qs(right)];
  }
  const sorted = qs(arr);
  return { sorted, comparisons };
}

const strategies: Record<
  StrategyName,
  {
    name: string;
    description: string;
    complexity: string;
    sort: (arr: number[]) => { sorted: number[]; comparisons: number };
  }
> = {
  bubble: {
    name: "Bubble Sort",
    description: "Compare adjacent, swap if out of order",
    complexity: "O(n²)",
    sort: bubbleSort,
  },
  selection: {
    name: "Selection Sort",
    description: "Find minimum, place at start",
    complexity: "O(n²)",
    sort: selectionSort,
  },
  insertion: {
    name: "Insertion Sort",
    description: "Insert each element into sorted portion",
    complexity: "O(n²)",
    sort: insertionSort,
  },
  quick: {
    name: "Quick Sort",
    description: "Divide and conquer with pivot",
    complexity: "O(n log n) avg",
    sort: quickSort,
  },
};

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100));
}

export function StrategyDemo() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyName>("bubble");
  const [arraySize, setArraySize] = useState(15);
  const [inputArray, setInputArray] = useState(() => generateArray(15));
  const [results, setResults] = useState<SortResult[]>([]);

  const runSort = () => {
    const strategy = strategies[selectedStrategy];
    const start = performance.now();
    const { sorted, comparisons } = strategy.sort(inputArray);
    const time = performance.now() - start;

    setResults((prev) => [
      {
        strategy: strategy.name,
        input: [...inputArray],
        output: sorted,
        time,
        comparisons,
      },
      ...prev.slice(0, 4),
    ]);
  };

  const runAll = () => {
    const newResults: SortResult[] = [];
    for (const [, strategy] of Object.entries(strategies)) {
      const start = performance.now();
      const { sorted, comparisons } = strategy.sort(inputArray);
      const time = performance.now() - start;
      newResults.push({
        strategy: strategy.name,
        input: [...inputArray],
        output: sorted,
        time,
        comparisons,
      });
    }
    setResults(newResults);
  };

  const regenerate = () => {
    setInputArray(generateArray(arraySize));
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Sorting Strategy Selector"
        description="Swap sorting algorithms at runtime - same interface, different behavior. Compare performance."
        code={strategyCode}
      >
        <div className="space-y-4">
          {/* Strategy selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(strategies) as [StrategyName, typeof strategies[StrategyName]][]).map(
              ([key, strategy]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStrategy(key)}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedStrategy === key
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-medium">{strategy.name}</span>
                  <span className="ml-2 text-xs opacity-70">
                    {strategy.complexity}
                  </span>
                </button>
              )
            )}
          </div>

          {/* Description */}
          <div className="rounded-lg bg-accent-light/50 border border-accent/20 p-3">
            <p className="text-sm text-accent font-medium">
              {strategies[selectedStrategy].name}
            </p>
            <p className="text-xs text-muted-foreground">
              {strategies[selectedStrategy].description} — Time: {strategies[selectedStrategy].complexity}
            </p>
          </div>

          {/* Array controls */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Size:</label>
            <input
              type="range"
              min={5}
              max={50}
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-mono w-6">{arraySize}</span>
            <button
              onClick={regenerate}
              className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Regenerate
            </button>
          </div>

          {/* Input array */}
          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Input ({inputArray.length} elements):
            </p>
            <div className="flex flex-wrap gap-1">
              {inputArray.map((n, i) => (
                <span
                  key={i}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={runSort}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Sort with {strategies[selectedStrategy].name}
            </button>
            <button
              onClick={runAll}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Compare All
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {result.strategy}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-accent">
                        {result.time.toFixed(3)}ms
                      </span>
                      <span className="text-muted-foreground">
                        {result.comparisons} comparisons
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.output.slice(0, 30).map((n, j) => (
                      <span
                        key={j}
                        className="rounded bg-success/10 px-1.5 py-0.5 font-mono text-[11px] text-success"
                      >
                        {n}
                      </span>
                    ))}
                    {result.output.length > 30 && (
                      <span className="text-[11px] text-muted-foreground">
                        ...+{result.output.length - 30}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CodeDemo>
    </div>
  );
}
