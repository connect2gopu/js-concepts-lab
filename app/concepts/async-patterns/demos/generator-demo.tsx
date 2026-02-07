"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const generatorCode = `// Generator Function - pauses execution at each yield
function* numberGenerator() {
  console.log("Start");
  yield 1;
  console.log("After first yield");
  yield 2;
  console.log("After second yield");
  yield 3;
  console.log("Done");
}

// Using the generator
const gen = numberGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Infinite sequence generator
function* fibonacci(): Generator<number> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take first N values from any generator
function* take<T>(n: number, gen: Generator<T>): Generator<T> {
  for (let i = 0; i < n; i++) {
    const { value, done } = gen.next();
    if (done) return;
    yield value;
  }
}

// Usage
const fib = fibonacci();
const first10 = [...take(10, fib)];
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Generator with two-way communication
function* calculator(): Generator<number, void, number> {
  let total = 0;
  while (true) {
    const input = yield total;  // yield current total, receive input
    total += input;
  }
}`;

interface StepResult {
  step: number;
  value: string | number | undefined;
  done: boolean;
  log: string;
}

// Create generators for the demo
function* simpleGenerator(): Generator<number, void, unknown> {
  yield 1;
  yield 2;
  yield 3;
}

function* fibonacciGen(): Generator<number, void, unknown> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

export function GeneratorDemo() {
  // Simple generator state
  const [simpleSteps, setSimpleSteps] = useState<StepResult[]>([]);
  const simpleGenRef = useRef<Generator<number, void, unknown> | null>(null);
  const simpleStepRef = useRef(0);

  // Fibonacci state
  const [fibValues, setFibValues] = useState<number[]>([]);
  const fibGenRef = useRef<Generator<number, void, unknown> | null>(null);

  // Calculator state
  const [calcTotal, setCalcTotal] = useState(0);
  const [calcInput, setCalcInput] = useState(5);
  const [calcHistory, setCalcHistory] = useState<{ input: number; total: number }[]>([]);

  const stepSimple = useCallback(() => {
    if (!simpleGenRef.current) {
      simpleGenRef.current = simpleGenerator();
      simpleStepRef.current = 0;
    }

    const result = simpleGenRef.current.next();
    simpleStepRef.current++;

    const logs = [
      'Generator created, execution paused at start',
      'yield 1 — paused after first yield',
      'yield 2 — paused after second yield',
      'yield 3 — paused after third yield',
      'Generator complete — done: true',
    ];

    setSimpleSteps((prev) => [
      ...prev,
      {
        step: simpleStepRef.current,
        value: result.value as number | undefined,
        done: result.done ?? true,
        log: logs[Math.min(simpleStepRef.current, logs.length - 1)],
      },
    ]);

    if (result.done) {
      simpleGenRef.current = null;
    }
  }, []);

  const resetSimple = useCallback(() => {
    simpleGenRef.current = null;
    simpleStepRef.current = 0;
    setSimpleSteps([]);
  }, []);

  const stepFib = useCallback(() => {
    if (!fibGenRef.current) {
      fibGenRef.current = fibonacciGen();
    }
    const result = fibGenRef.current.next();
    if (result.value !== undefined) {
      setFibValues((prev) => [...prev, result.value as number]);
    }
  }, []);

  const resetFib = useCallback(() => {
    fibGenRef.current = null;
    setFibValues([]);
  }, []);

  const addToCalc = useCallback(() => {
    const newTotal = calcTotal + calcInput;
    setCalcTotal(newTotal);
    setCalcHistory((prev) => [...prev, { input: calcInput, total: newTotal }]);
  }, [calcTotal, calcInput]);

  const resetCalc = useCallback(() => {
    setCalcTotal(0);
    setCalcHistory([]);
  }, []);

  const isDone = simpleSteps.length > 0 && simpleSteps[simpleSteps.length - 1].done;

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Generator Step-Through"
        description="Click 'Next' to call .next() on the generator and see execution pause at each yield."
        code={generatorCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={stepSimple}
              disabled={isDone}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {simpleSteps.length === 0 ? "Start Generator" : isDone ? "Done" : "gen.next()"}
            </button>
            <button
              onClick={resetSimple}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {simpleSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3 ${
                  step.done
                    ? "border-muted bg-muted/50"
                    : "border-success/30 bg-success/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-muted-foreground">
                    gen.next() — call #{step.step}
                  </p>
                  <span className={`text-xs font-medium ${step.done ? "text-muted-foreground" : "text-success"}`}>
                    {step.done ? "done" : "paused"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-sm">
                  {"{"} value: <span className="text-accent">{step.value === undefined ? "undefined" : step.value}</span>
                  , done: <span className={step.done ? "text-error" : "text-success"}>{step.done.toString()}</span> {"}"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {step.log}
                </p>
              </motion.div>
            ))}
            {simpleSteps.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                Click &quot;Start Generator&quot; to begin stepping through
              </p>
            )}
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Infinite Fibonacci Generator"
        description="Generators can produce infinite sequences lazily. Each .next() computes only the next value."
        code={generatorCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={stepFib}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Next Fibonacci
            </button>
            <button
              onClick={() => {
                if (!fibGenRef.current) fibGenRef.current = fibonacciGen();
                const newVals: number[] = [];
                for (let i = 0; i < 5; i++) {
                  const r = fibGenRef.current.next();
                  if (r.value !== undefined) newVals.push(r.value as number);
                }
                setFibValues((prev) => [...prev, ...newVals]);
              }}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Take 5
            </button>
            <button
              onClick={resetFib}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              fibonacci() → values generated so far ({fibValues.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {fibValues.map((v, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center rounded-md bg-accent/10 px-2.5 py-1 font-mono text-sm text-accent"
                >
                  {v.toLocaleString()}
                </motion.span>
              ))}
              {fibValues.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  No values yet
                </span>
              )}
            </div>
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Generator Two-Way Communication"
        description="Generators can receive values via .next(value). The yielded expression evaluates to the sent value."
        code={generatorCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Send value:
            </label>
            <input
              type="number"
              value={calcInput}
              onChange={(e) => setCalcInput(Number(e.target.value))}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={addToCalc}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              gen.next({calcInput})
            </button>
            <button
              onClick={resetCalc}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="rounded-lg bg-code-bg p-3 space-y-1">
            <p className="text-xs text-muted-foreground mb-2">
              Calculator generator — running total: <span className="text-accent font-bold">{calcTotal}</span>
            </p>
            {calcHistory.map((entry, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-mono text-sm"
              >
                <span className="text-muted-foreground">gen.next(</span>
                <span className="text-warning">{entry.input}</span>
                <span className="text-muted-foreground">) → yields </span>
                <span className="text-success">{entry.total}</span>
              </motion.p>
            ))}
            {calcHistory.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Send values to the calculator generator
              </p>
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
