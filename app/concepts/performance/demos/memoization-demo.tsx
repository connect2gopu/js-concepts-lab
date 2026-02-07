"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const memoCode = `// Memoization: caching expensive computations

// 1. Manual memoization (closure-based cache)
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 2. React.memo - skip re-renders if props haven't changed
const ExpensiveComponent = memo(({ data }: { data: number }) => {
  // Only re-renders when 'data' changes
  const result = heavyComputation(data);
  return <div>{result}</div>;
});

// 3. useMemo - memoize computed values
function Component({ items }: { items: Item[] }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.value - b.value),
    [items] // Only recompute when items change
  );
  return <List items={sorted} />;
}

// 4. useCallback - memoize function references
function Parent() {
  const [count, setCount] = useState(0);
  
  // Without useCallback: new function every render
  // With: same reference if deps unchanged
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Stable reference
  
  return <Child onClick={handleClick} />;
}`;

// Fibonacci without memoization (intentionally slow)
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Fibonacci with memoization
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}

// Render counter for React.memo demo
let unmemoizedRenderCount = 0;
let memoizedRenderCount = 0;

function UnmemoizedChild({ label }: { label: string }) {
  unmemoizedRenderCount++;
  return (
    <div className="rounded-md border border-warning/30 bg-warning/5 p-2 text-xs">
      <span className="text-muted-foreground">UnmemoizedChild</span>
      <span className="ml-2 text-warning font-mono">
        renders: {unmemoizedRenderCount}
      </span>
      <span className="ml-2 text-muted-foreground">label: &quot;{label}&quot;</span>
    </div>
  );
}

const MemoizedChild = memo(function MemoizedChild({ label }: { label: string }) {
  memoizedRenderCount++;
  return (
    <div className="rounded-md border border-success/30 bg-success/5 p-2 text-xs">
      <span className="text-muted-foreground">MemoizedChild (React.memo)</span>
      <span className="ml-2 text-success font-mono">
        renders: {memoizedRenderCount}
      </span>
      <span className="ml-2 text-muted-foreground">label: &quot;{label}&quot;</span>
    </div>
  );
});

export function MemoizationDemo() {
  const [fibN, setFibN] = useState(35);
  const [benchResults, setBenchResults] = useState<{
    normal: { result: number; time: number } | null;
    memoized: { result: number; time: number } | null;
  }>({ normal: null, memoized: null });
  const [isRunning, setIsRunning] = useState(false);

  // React.memo demo
  const [parentCount, setParentCount] = useState(0);
  const [childLabel, setChildLabel] = useState("Hello");

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setBenchResults({ normal: null, memoized: null });

    // Run normal fib
    await new Promise((r) => setTimeout(r, 50));
    const startNormal = performance.now();
    const normalResult = fib(fibN);
    const normalTime = performance.now() - startNormal;

    setBenchResults((prev) => ({
      ...prev,
      normal: { result: normalResult, time: normalTime },
    }));

    // Run memoized fib
    await new Promise((r) => setTimeout(r, 50));
    const startMemo = performance.now();
    const memoResult = fibMemo(fibN);
    const memoTime = performance.now() - startMemo;

    setBenchResults((prev) => ({
      ...prev,
      memoized: { result: memoResult, time: memoTime },
    }));

    setIsRunning(false);
  }, [fibN]);

  // useMemo demo
  const expensiveValue = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i);
    }
    return sum.toFixed(2);
  }, []); // Only computed once

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Fibonacci: Memoized vs Unmemoized"
        description="Compare execution time of recursive fibonacci with and without memoization."
        code={memoCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">fib(n) where n =</label>
            <input
              type="range"
              min={20}
              max={42}
              value={fibN}
              onChange={(e) => setFibN(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm w-6 text-right">{fibN}</span>
            <button
              onClick={runBenchmark}
              disabled={isRunning}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Benchmark"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Normal */}
            <div className={`rounded-lg border p-4 ${benchResults.normal ? "border-warning/30 bg-warning/5" : "border-border"}`}>
              <p className="text-xs font-medium text-warning mb-2">
                Without Memoization
              </p>
              {benchResults.normal ? (
                <>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {benchResults.normal.time.toFixed(2)}ms
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Result: {benchResults.normal.result.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {isRunning ? "Computing..." : "Not run yet"}
                </p>
              )}
            </div>

            {/* Memoized */}
            <div className={`rounded-lg border p-4 ${benchResults.memoized ? "border-success/30 bg-success/5" : "border-border"}`}>
              <p className="text-xs font-medium text-success mb-2">
                With Memoization
              </p>
              {benchResults.memoized ? (
                <>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {benchResults.memoized.time.toFixed(4)}ms
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Result: {benchResults.memoized.result.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {isRunning ? "Waiting..." : "Not run yet"}
                </p>
              )}
            </div>
          </div>

          {benchResults.normal && benchResults.memoized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-accent-light border border-accent/30 p-3 text-center"
            >
              <p className="text-sm text-accent font-medium">
                Memoized version is{" "}
                <span className="font-bold">
                  {(benchResults.normal.time / benchResults.memoized.time).toFixed(0)}x
                </span>{" "}
                faster!
              </p>
            </motion.div>
          )}
        </div>
      </CodeDemo>

      <CodeDemo
        title="React.memo - Skip Unnecessary Re-renders"
        description="Parent re-renders update both children, but React.memo skips if props didn't change."
        code={memoCode}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Parent Component (count: {parentCount})
            </p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setParentCount((c) => c + 1)}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
              >
                Re-render Parent (count++)
              </button>
              <button
                onClick={() => setChildLabel(childLabel === "Hello" ? "World" : "Hello")}
                className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Change child label
              </button>
            </div>

            <div className="space-y-2">
              <UnmemoizedChild label={childLabel} />
              <MemoizedChild label={childLabel} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Click &quot;Re-render Parent&quot; — the unmemoized child re-renders every time, but the memoized one only re-renders when its &quot;label&quot; prop changes.
          </p>
        </div>
      </CodeDemo>
    </div>
  );
}
