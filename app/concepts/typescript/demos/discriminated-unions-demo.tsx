"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const discriminatedUnionsCode = `// Discriminated Union - each variant has a "kind" discriminant
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// Exhaustive pattern matching with switch
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// Exhaustive check helper (never type)
function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

// Result type pattern (like Rust's Result<T, E>)
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

// Loading state pattern
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };`;

type ShapeKind = "circle" | "rectangle" | "triangle";

interface ShapeValues {
  circle: { radius: number };
  rectangle: { width: number; height: number };
  triangle: { base: number; height: number };
}

type AsyncStatus = "idle" | "loading" | "success" | "error";

export function DiscriminatedUnionsDemo() {
  const [shapeKind, setShapeKind] = useState<ShapeKind>("circle");
  const [shapeValues, setShapeValues] = useState<ShapeValues>({
    circle: { radius: 5 },
    rectangle: { width: 8, height: 4 },
    triangle: { base: 6, height: 3 },
  });
  const [divA, setDivA] = useState(10);
  const [divB, setDivB] = useState(3);
  const [asyncStatus, setAsyncStatus] = useState<AsyncStatus>("idle");

  function calcArea(): string {
    const v = shapeValues[shapeKind];
    switch (shapeKind) {
      case "circle":
        return (Math.PI * (v as ShapeValues["circle"]).radius ** 2).toFixed(2);
      case "rectangle": {
        const r = v as ShapeValues["rectangle"];
        return (r.width * r.height).toFixed(2);
      }
      case "triangle": {
        const t = v as ShapeValues["triangle"];
        return ((t.base * t.height) / 2).toFixed(2);
      }
    }
  }

  function divideResult(): { ok: boolean; value?: number; error?: string } {
    if (divB === 0) return { ok: false, error: "Division by zero!" };
    return { ok: true, value: divA / divB };
  }

  const handleSimulateAsync = () => {
    setAsyncStatus("loading");
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setAsyncStatus(success ? "success" : "error");
    }, 1500);
  };

  const result = divideResult();

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Shape Area Calculator"
        description="Each shape variant has a 'kind' discriminant - TypeScript narrows the type in each switch case."
        code={discriminatedUnionsCode}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["circle", "rectangle", "triangle"] as ShapeKind[]).map((s) => (
              <button
                key={s}
                onClick={() => setShapeKind(s)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  shapeKind === s
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={shapeKind}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {shapeKind === "circle" && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground w-16">Radius:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={shapeValues.circle.radius}
                    onChange={(e) =>
                      setShapeValues((prev) => ({
                        ...prev,
                        circle: { radius: Number(e.target.value) },
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="font-mono text-sm w-8 text-right">{shapeValues.circle.radius}</span>
                </div>
              )}
              {shapeKind === "rectangle" && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground w-16">Width:</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={shapeValues.rectangle.width}
                      onChange={(e) =>
                        setShapeValues((prev) => ({
                          ...prev,
                          rectangle: { ...prev.rectangle, width: Number(e.target.value) },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="font-mono text-sm w-8 text-right">{shapeValues.rectangle.width}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground w-16">Height:</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={shapeValues.rectangle.height}
                      onChange={(e) =>
                        setShapeValues((prev) => ({
                          ...prev,
                          rectangle: { ...prev.rectangle, height: Number(e.target.value) },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="font-mono text-sm w-8 text-right">{shapeValues.rectangle.height}</span>
                  </div>
                </>
              )}
              {shapeKind === "triangle" && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground w-16">Base:</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={shapeValues.triangle.base}
                      onChange={(e) =>
                        setShapeValues((prev) => ({
                          ...prev,
                          triangle: { ...prev.triangle, base: Number(e.target.value) },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="font-mono text-sm w-8 text-right">{shapeValues.triangle.base}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground w-16">Height:</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={shapeValues.triangle.height}
                      onChange={(e) =>
                        setShapeValues((prev) => ({
                          ...prev,
                          triangle: { ...prev.triangle, height: Number(e.target.value) },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="font-mono text-sm w-8 text-right">{shapeValues.triangle.height}</span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="rounded-lg bg-code-bg p-3">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">shape.kind === </span>
              <span className="text-accent">&quot;{shapeKind}&quot;</span>
            </p>
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">area(shape) = </span>
              <span className="text-success">{calcArea()}</span>
            </p>
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Result Type Pattern"
        description={"A Result<T, E> discriminated union \u2014 like Rust's Result. The \"ok\" field is the discriminant."}
        code={discriminatedUnionsCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">divide(</label>
            <input
              type="number"
              value={divA}
              onChange={(e) => setDivA(Number(e.target.value))}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <span className="text-sm text-muted-foreground">,</span>
            <input
              type="number"
              value={divB}
              onChange={(e) => setDivB(Number(e.target.value))}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <span className="text-sm text-muted-foreground">)</span>
          </div>
          <div
            className={`rounded-lg p-3 ${
              result.ok
                ? "bg-success/10 border border-success/30"
                : "bg-error/10 border border-error/30"
            }`}
          >
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">result.ok = </span>
              <span className={result.ok ? "text-success" : "text-error"}>
                {result.ok.toString()}
              </span>
            </p>
            {result.ok ? (
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">result.value = </span>
                <span className="text-success">
                  {result.value!.toFixed(4)}
                </span>
              </p>
            ) : (
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">result.error = </span>
                <span className="text-error">
                  &quot;{result.error}&quot;
                </span>
              </p>
            )}
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Async State Pattern"
        description="Model loading states with discriminated unions — each status variant carries different data."
        code={discriminatedUnionsCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateAsync}
              disabled={asyncStatus === "loading"}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {asyncStatus === "loading" ? "Fetching..." : "Simulate Fetch"}
            </button>
            {asyncStatus !== "idle" && asyncStatus !== "loading" && (
              <button
                onClick={() => setAsyncStatus("idle")}
                className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>

          <div className="rounded-lg bg-code-bg p-3 space-y-2">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">state.status = </span>
              <span
                className={
                  asyncStatus === "success"
                    ? "text-success"
                    : asyncStatus === "error"
                    ? "text-error"
                    : asyncStatus === "loading"
                    ? "text-warning"
                    : "text-muted-foreground"
                }
              >
                &quot;{asyncStatus}&quot;
              </span>
            </p>
            {asyncStatus === "loading" && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-warning" />
                <span className="text-sm text-warning">Loading data...</span>
              </div>
            )}
            {asyncStatus === "success" && (
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">state.data = </span>
                <span className="text-success">
                  {JSON.stringify({ users: ["Alice", "Bob"], count: 2 })}
                </span>
              </p>
            )}
            {asyncStatus === "error" && (
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">state.error = </span>
                <span className="text-error">
                  &quot;Network request failed&quot;
                </span>
              </p>
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
