"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { CodeDemo } from "@/components/code-demo";

const virtualizationCode = `// Virtualization: only render visible items
// Instead of 10,000 DOM nodes, render ~20 visible ones

// Simple virtual list implementation
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  // Only these items are in the DOM
  const visibleItems = items.slice(startIndex, endIndex);
  
  return (
    <div
      style={{ height: containerHeight, overflow: "auto" }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* Total height spacer */}
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {/* Rendered items positioned absolutely */}
        {visibleItems.map((item, i) => (
          <div
            key={startIndex + i}
            style={{
              position: "absolute",
              top: (startIndex + i) * itemHeight,
              height: itemHeight,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// Usage: render 10,000 items efficiently
<VirtualList
  items={Array.from({ length: 10000 }, (_, i) => \`Item #\${i}\`)}
  itemHeight={40}
  containerHeight={400}
/>`;

interface VirtualItem {
  id: number;
  name: string;
  value: number;
  category: string;
}

function generateItems(count: number): VirtualItem[] {
  const categories = ["Electronics", "Books", "Clothing", "Food", "Sports"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item #${i.toLocaleString()}`,
    value: Math.floor(Math.random() * 10000) / 100,
    category: categories[i % categories.length],
  }));
}

export function VirtualizationDemo() {
  const [itemCount, setItemCount] = useState(10000);
  const items = useMemo(() => generateItems(itemCount), [itemCount]);

  const ITEM_HEIGHT = 44;
  const CONTAINER_HEIGHT = 400;
  const OVERSCAN = 5;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + OVERSCAN
  );
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * ITEM_HEIGHT;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Non-virtualized comparison (just renders count)
  const [showNaive, setShowNaive] = useState(false);
  const [naiveRenderTime, setNaiveRenderTime] = useState<number | null>(null);
  const [virtualRenderTime, setVirtualRenderTime] = useState<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    // React will re-render the virtualized list
    requestAnimationFrame(() => {
      setVirtualRenderTime(performance.now() - start);
    });
  }, [scrollTop]);

  const benchmarkNaive = () => {
    const start = performance.now();
    setShowNaive(true);
    requestAnimationFrame(() => {
      setNaiveRenderTime(performance.now() - start);
      setTimeout(() => setShowNaive(false), 100);
    });
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Virtual List - 10K Items"
        description={`Rendering ${itemCount.toLocaleString()} items but only ~${endIndex - startIndex} DOM nodes exist at any time.`}
        code={virtualizationCode}
      >
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Items:</label>
            <select
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none"
            >
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
              <option value={50000}>50,000</option>
              <option value={100000}>100,000</option>
            </select>
            <button
              onClick={benchmarkNaive}
              className="rounded-md bg-warning/20 px-3 py-1 text-xs text-warning hover:bg-warning/30"
            >
              Benchmark naive render
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-code-bg p-2 text-center">
              <p className="text-lg font-bold font-mono text-accent">
                {(endIndex - startIndex).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">DOM nodes</p>
            </div>
            <div className="rounded-lg bg-code-bg p-2 text-center">
              <p className="text-lg font-bold font-mono text-success">
                {items.length.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">Total items</p>
            </div>
            <div className="rounded-lg bg-code-bg p-2 text-center">
              <p className="text-lg font-bold font-mono text-foreground">
                {(((endIndex - startIndex) / items.length) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">Rendered</p>
            </div>
          </div>

          {/* Render time comparison */}
          {naiveRenderTime !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-2 text-center">
                <p className="text-sm font-bold font-mono text-warning">
                  {naiveRenderTime.toFixed(1)}ms
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Naive render (all {itemCount.toLocaleString()} items)
                </p>
              </div>
              <div className="rounded-lg border border-success/30 bg-success/5 p-2 text-center">
                <p className="text-sm font-bold font-mono text-success">
                  {(virtualRenderTime ?? 0).toFixed(1)}ms
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Virtualized ({(endIndex - startIndex)} items)
                </p>
              </div>
            </div>
          )}

          {/* Virtual list */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="rounded-lg border border-border overflow-auto"
            style={{ height: CONTAINER_HEIGHT }}
          >
            <div style={{ height: totalHeight, position: "relative" }}>
              {visibleItems.map((item, i) => {
                const index = startIndex + i;
                return (
                  <div
                    key={item.id}
                    style={{
                      position: "absolute",
                      top: index * ITEM_HEIGHT,
                      left: 0,
                      right: 0,
                      height: ITEM_HEIGHT,
                    }}
                    className={`flex items-center gap-4 px-4 border-b border-border/50 ${
                      index % 2 === 0 ? "bg-card" : "bg-muted/30"
                    }`}
                  >
                    <span className="w-16 font-mono text-xs text-muted-foreground text-right">
                      #{item.id}
                    </span>
                    <span className="flex-1 text-sm text-foreground truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="w-16 text-right font-mono text-xs text-accent">
                      ${item.value.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Scroll the list above — only visible items (+ {OVERSCAN} overscan) are in the DOM.
            The scroll is smooth because we never render more than ~{Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + OVERSCAN * 2} items.
          </p>

          {/* Hidden naive render for benchmarking */}
          {showNaive && (
            <div className="sr-only" aria-hidden="true">
              {items.slice(0, 500).map((item) => (
                <div key={item.id}>{item.name}</div>
              ))}
            </div>
          )}
        </div>
      </CodeDemo>
    </div>
  );
}
