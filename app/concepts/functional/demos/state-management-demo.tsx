"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";
import { useCounterStore } from "@/lib/store";

const stateCode = `// Zustand - Minimal state management
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
}));

// Usage in components - no Provider needed!
function Counter() {
  const { count, increment, decrement } = useCounterStore();
  return <div>{count} <button onClick={increment}>+</button></div>;
}

// React Context API comparison
const CounterContext = createContext({ count: 0, increment: () => {} });

function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const value = {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1),
  };
  return <CounterContext.Provider value={value}>{children}</CounterContext.Provider>;
}

// Key differences:
// Zustand: No Provider wrapper needed, simpler API, auto-optimization
// Context: Built-in, no deps, but re-renders all consumers on any change`;

// Context demo setup
const CounterContext = createContext<{
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}>({
  count: 0,
  increment: () => {},
  decrement: () => {},
  reset: () => {},
});

function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <CounterContext.Provider
      value={{
        count,
        increment: () => setCount((c) => c + 1),
        decrement: () => setCount((c) => c - 1),
        reset: () => setCount(0),
      }}
    >
      {children}
    </CounterContext.Provider>
  );
}

function ContextCounter() {
  const { count, increment, decrement, reset } = useContext(CounterContext);
  const [renderCount, setRenderCount] = useState(0);

  // Track renders
  useState(() => {
    setRenderCount((c) => c + 1);
  });

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">React Context Counter</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          renders: {renderCount}
        </span>
      </div>
      <p className="text-3xl font-bold font-mono text-foreground mb-3">
        {count}
      </p>
      <div className="flex gap-2">
        <button onClick={decrement} className="rounded-md bg-muted px-3 py-1 text-sm hover:bg-border">
          -
        </button>
        <button onClick={increment} className="rounded-md bg-accent px-3 py-1 text-sm text-accent-foreground">
          +
        </button>
        <button onClick={reset} className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
          reset
        </button>
      </div>
    </div>
  );
}

function ZustandCounter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="rounded-lg border border-accent/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-accent">Zustand Counter</p>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
          no provider needed
        </span>
      </div>
      <p className="text-3xl font-bold font-mono text-foreground mb-3">
        {count}
      </p>
      <div className="flex gap-2">
        <button onClick={decrement} className="rounded-md bg-muted px-3 py-1 text-sm hover:bg-border">
          -
        </button>
        <button onClick={increment} className="rounded-md bg-accent px-3 py-1 text-sm text-accent-foreground">
          +
        </button>
        <button onClick={reset} className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
          reset
        </button>
      </div>
    </div>
  );
}

// Another component that reads the same Zustand store
function ZustandDisplay() {
  const count = useCounterStore((state) => state.count);

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
      <p className="text-xs text-muted-foreground mb-1">
        Separate component reading same Zustand store:
      </p>
      <p className="font-mono text-lg font-bold text-accent">{count}</p>
      <p className="text-[10px] text-muted-foreground mt-1">
        Selector: useCounterStore(state =&gt; state.count) — only re-renders when count changes
      </p>
    </div>
  );
}

export function StateManagementDemo() {
  return (
    <div className="space-y-6">
      <CodeDemo
        title="Zustand vs React Context"
        description="Side-by-side comparison. Zustand needs no Provider wrapper and offers selector-based optimization."
        code={stateCode}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Context side */}
            <div>
              <CounterProvider>
                <ContextCounter />
              </CounterProvider>
            </div>

            {/* Zustand side */}
            <div>
              <ZustandCounter />
            </div>
          </div>

          {/* Zustand shared state demo */}
          <ZustandDisplay />

          {/* Comparison table */}
          <div className="rounded-lg bg-code-bg p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              Key Differences
            </p>
            <div className="space-y-2 text-xs">
              {[
                { feature: "Provider required", context: "Yes", zustand: "No" },
                { feature: "Selector support", context: "No (re-renders all)", zustand: "Yes (fine-grained)" },
                { feature: "Bundle size", context: "0kb (built-in)", zustand: "~1kb" },
                { feature: "Devtools", context: "React DevTools", zustand: "Redux DevTools" },
                { feature: "Middleware", context: "Manual", zustand: "Built-in (persist, immer...)" },
                { feature: "Async actions", context: "useEffect", zustand: "Direct in store" },
              ].map((row) => (
                <div key={row.feature} className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">{row.feature}</span>
                  <span className="text-foreground">{row.context}</span>
                  <span className="text-accent">{row.zustand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
