"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowDown } from "lucide-react";
import { CodeDemo } from "@/components/code-demo";

const pipeComposeCode = `// Pipe: left-to-right function composition
// compose: right-to-left function composition

// Pipe implementation
function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((result, fn) => fn(result), arg);
}

// Compose implementation (same but right-to-left)
function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((result, fn) => fn(result), arg);
}

// Transform functions
const double = (n: number) => n * 2;
const addTen = (n: number) => n + 10;
const square = (n: number) => n ** 2;
const negate = (n: number) => -n;
const abs = (n: number) => Math.abs(n);

// Pipe: reads left-to-right (how data flows)
const transform = pipe(double, addTen, square);
transform(3);  // double(3) → 6 → addTen(6) → 16 → square(16) → 256

// Compose: reads right-to-left (mathematical notation)
const transform2 = compose(square, addTen, double);
transform2(3);  // same result: 256

// String pipeline
const processName = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/\\s+/g, "-"),
  (s: string) => s.replace(/[^a-z0-9-]/g, ""),
);
processName("  Hello World! ");  // "hello-world"`;

interface Transform {
  id: string;
  label: string;
  fn: (n: number) => number;
  description: string;
}

const availableTransforms: Transform[] = [
  { id: "double", label: "double", fn: (n) => n * 2, description: "n * 2" },
  { id: "addTen", label: "addTen", fn: (n) => n + 10, description: "n + 10" },
  { id: "square", label: "square", fn: (n) => n ** 2, description: "n ** 2" },
  { id: "negate", label: "negate", fn: (n) => -n, description: "-n" },
  { id: "abs", label: "abs", fn: (n) => Math.abs(n), description: "Math.abs(n)" },
  { id: "half", label: "half", fn: (n) => n / 2, description: "n / 2" },
  { id: "addOne", label: "addOne", fn: (n) => n + 1, description: "n + 1" },
  { id: "mod10", label: "mod10", fn: (n) => n % 10, description: "n % 10" },
];

export function PipeComposeDemo() {
  const [inputValue, setInputValue] = useState(5);
  const [pipeline, setPipeline] = useState<Transform[]>([
    availableTransforms[0], // double
    availableTransforms[1], // addTen
    availableTransforms[2], // square
  ]);

  // Compute intermediate values for the pipeline
  const intermediateValues = useMemo(() => {
    const values: number[] = [inputValue];
    let current = inputValue;
    for (const transform of pipeline) {
      current = transform.fn(current);
      values.push(current);
    }
    return values;
  }, [inputValue, pipeline]);

  const addTransform = (transform: Transform) => {
    setPipeline((prev) => [...prev, { ...transform, id: `${transform.id}-${Date.now()}` }]);
  };

  const removeTransform = (index: number) => {
    setPipeline((prev) => prev.filter((_, i) => i !== index));
  };

  // String pipeline demo
  const [stringInput, setStringInput] = useState("  Hello World! 123 ");
  const stringTransforms = [
    { label: "trim()", fn: (s: string) => s.trim() },
    { label: "toLowerCase()", fn: (s: string) => s.toLowerCase() },
    { label: "replace(/\\s+/g, '-')", fn: (s: string) => s.replace(/\s+/g, "-") },
    { label: "replace(/[^a-z0-9-]/g, '')", fn: (s: string) => s.replace(/[^a-z0-9-]/g, "") },
  ];

  const stringIntermediates = useMemo(() => {
    const values: string[] = [stringInput];
    let current = stringInput;
    for (const t of stringTransforms) {
      current = t.fn(current);
      values.push(current);
    }
    return values;
  }, [stringInput]);

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Pipeline Builder"
        description="Add transforms to build a pipe(). Data flows top-to-bottom through each function."
        code={pipeComposeCode}
      >
        <div className="space-y-4">
          {/* Input value */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Input value:
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Available transforms */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Add transforms:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableTransforms.map((t) => (
                <button
                  key={t.id}
                  onClick={() => addTransform(t)}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline visualization */}
          <div className="rounded-lg bg-code-bg p-4 space-y-0">
            {/* Input */}
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-accent px-3 py-1.5 font-mono text-sm font-bold text-accent-foreground">
                {intermediateValues[0]}
              </div>
              <span className="text-xs text-muted-foreground">input</span>
            </div>

            <AnimatePresence>
              {pipeline.map((transform, i) => (
                <motion.div
                  key={transform.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* Arrow */}
                  <div className="flex items-center gap-3 py-1.5 pl-4">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs text-accent">
                      {transform.label}({transform.description})
                    </span>
                    <button
                      onClick={() => removeTransform(i)}
                      className="ml-auto rounded p-0.5 text-muted-foreground hover:text-error"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {/* Value */}
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-accent/20 px-3 py-1.5 font-mono text-sm font-medium text-accent">
                      {intermediateValues[i + 1]}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      step {i + 1}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {pipeline.length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-success/20 px-3 py-1.5 font-mono text-sm font-bold text-success">
                    {intermediateValues[intermediateValues.length - 1]}
                  </div>
                  <span className="text-xs text-success font-medium">
                    final result
                  </span>
                </div>
              </div>
            )}

            {pipeline.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground italic">
                Add transforms above to build a pipeline
              </p>
            )}
          </div>

          {pipeline.length > 0 && (
            <button
              onClick={() => setPipeline([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear pipeline
            </button>
          )}
        </div>
      </CodeDemo>

      <CodeDemo
        title="String Processing Pipeline"
        description="A fixed pipe for sanitizing strings - common in URL slug generation."
        code={pipeComposeCode}
      >
        <div className="space-y-4">
          <input
            type="text"
            value={stringInput}
            onChange={(e) => setStringInput(e.target.value)}
            placeholder="Enter a string to process..."
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          <div className="rounded-lg bg-code-bg p-4 space-y-0">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm text-foreground">
                &quot;{stringIntermediates[0]}&quot;
              </div>
              <span className="text-xs text-muted-foreground">input</span>
            </div>

            {stringTransforms.map((t, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-1.5 pl-4">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-accent">
                    {t.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-md px-3 py-1.5 font-mono text-sm ${
                      i === stringTransforms.length - 1
                        ? "bg-success/20 text-success font-bold"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    &quot;{stringIntermediates[i + 1]}&quot;
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {i === stringTransforms.length - 1 ? "result" : `step ${i + 1}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
