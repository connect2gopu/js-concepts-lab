"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const curryingCode = `// Currying: transforming a function with multiple arguments
// into a sequence of functions each taking a single argument

// Basic curry example
function multiply(a: number, b: number): number {
  return a * b;
}

// Curried version
function curriedMultiply(a: number) {
  return function(b: number): number {
    return a * b;
  };
}

const double = curriedMultiply(2);   // partially applied
const triple = curriedMultiply(3);   // partially applied
double(5);  // 10
triple(5);  // 15

// Generic curry utility
function curry<A, B, C>(fn: (a: A, b: B) => C) {
  return (a: A) => (b: B) => fn(a, b);
}

// Practical example: configurable formatter
function formatCurrency(symbol: string, decimals: number, amount: number) {
  return \`\${symbol}\${amount.toFixed(decimals)}\`;
}

const curriedFormat = curry3(formatCurrency);
const formatUSD = curriedFormat("$")(2);
const formatEUR = curriedFormat("€")(2);
const formatJPY = curriedFormat("¥")(0);

formatUSD(42.5);   // "$42.50"
formatEUR(42.5);   // "€42.50"
formatJPY(42.5);   // "¥43"

// Partial application (similar but different)
function partial<A, B, C>(fn: (a: A, b: B) => C, a: A) {
  return (b: B) => fn(a, b);
}

const add10 = partial((a: number, b: number) => a + b, 10);
add10(5); // 15`;

interface CurryStep {
  arg: string;
  argValue: string;
  returns: string;
  applied: boolean;
}

export function CurryingDemo() {
  // Multiply curry demo
  const [multiplyA, setMultiplyA] = useState<number | null>(null);
  const [multiplyB, setMultiplyB] = useState<number | null>(null);

  // Format currency demo
  const [symbol, setSymbol] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  const symbols = ["$", "€", "¥", "£"];
  const decimalOptions = [0, 1, 2, 3];
  const amounts = [42.567, 1234.5, 99.99, 0.5];

  const getCurrySteps = (): CurryStep[] => {
    const steps: CurryStep[] = [
      {
        arg: "symbol",
        argValue: symbol ? `"${symbol}"` : "?",
        returns: symbol
          ? `(decimals) => (amount) => \`${symbol}\${amount.toFixed(decimals)}\``
          : "(symbol) => (decimals) => (amount) => string",
        applied: symbol !== null,
      },
      {
        arg: "decimals",
        argValue: decimals !== null ? String(decimals) : "?",
        returns:
          symbol && decimals !== null
            ? `(amount) => \`${symbol}\${amount.toFixed(${decimals})}\``
            : "(decimals) => (amount) => string",
        applied: decimals !== null,
      },
      {
        arg: "amount",
        argValue: amount !== null ? String(amount) : "?",
        returns:
          symbol && decimals !== null && amount !== null
            ? `"${symbol}${amount.toFixed(decimals)}"`
            : "(amount) => string",
        applied: amount !== null,
      },
    ];
    return steps;
  };

  const resetCurrency = () => {
    setSymbol(null);
    setDecimals(null);
    setAmount(null);
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Curried Multiply"
        description="Apply one argument at a time. Each step returns a new function until all arguments are provided."
        code={curryingCode}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Step 1: curriedMultiply(a) — choose first argument
              </p>
              <div className="flex gap-2">
                {[2, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setMultiplyA(n);
                      setMultiplyB(null);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-mono font-medium transition-colors ${
                      multiplyA === n
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {multiplyA !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    Step 2: result is a function! Apply second argument (b):
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 5, 7, 12].map((n) => (
                      <button
                        key={n}
                        onClick={() => setMultiplyB(n)}
                        className={`rounded-lg px-4 py-2 text-sm font-mono font-medium transition-colors ${
                          multiplyB === n
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-lg bg-code-bg p-3 space-y-1">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">curriedMultiply</span>
              {multiplyA !== null ? (
                <>
                  <span className="text-accent">({multiplyA})</span>
                  {multiplyB !== null ? (
                    <>
                      <span className="text-warning">({multiplyB})</span>
                      <span className="text-muted-foreground"> = </span>
                      <span className="text-success font-bold">
                        {multiplyA * multiplyB}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {" → "}
                      <span className="text-accent italic">
                        (b) =&gt; {multiplyA} * b
                      </span>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground italic">
                  {" — waiting for first argument..."}
                </span>
              )}
            </p>
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Practical Currying: Currency Formatter"
        description="Apply arguments one at a time to build specialized formatters. Each step narrows the function."
        code={curryingCode}
      >
        <div className="space-y-4">
          {/* Step 1: Symbol */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Step 1: Choose currency symbol
            </p>
            <div className="flex gap-2">
              {symbols.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSymbol(s);
                    setDecimals(null);
                    setAmount(null);
                  }}
                  className={`rounded-lg px-4 py-2 text-lg font-medium transition-colors ${
                    symbol === s
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Decimals */}
          <AnimatePresence>
            {symbol && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  Step 2: Choose decimal places
                </p>
                <div className="flex gap-2">
                  {decimalOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDecimals(d);
                        setAmount(null);
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-mono font-medium transition-colors ${
                        decimals === d
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Amount */}
          <AnimatePresence>
            {decimals !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  Step 3: Choose amount
                </p>
                <div className="flex gap-2">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      className={`rounded-lg px-4 py-2 text-sm font-mono font-medium transition-colors ${
                        amount === a
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visual pipeline */}
          <div className="rounded-lg bg-code-bg p-3 space-y-2">
            {getCurrySteps().map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-md p-2 ${
                  step.applied
                    ? "bg-accent/10"
                    : i === getCurrySteps().findIndex((s) => !s.applied)
                    ? "bg-warning/10 border border-warning/20"
                    : ""
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    step.applied
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-mono text-xs">
                  <span className="text-muted-foreground">({step.arg}: </span>
                  <span className={step.applied ? "text-accent" : "text-muted-foreground"}>
                    {step.argValue}
                  </span>
                  <span className="text-muted-foreground">)</span>
                </span>
                {step.applied && (
                  <span className="text-success text-xs">&#10003;</span>
                )}
              </div>
            ))}
          </div>

          {/* Result */}
          {symbol && decimals !== null && amount !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-success/30 bg-success/10 p-4 text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">Final result</p>
              <p className="text-2xl font-bold font-mono text-success">
                {symbol}{amount.toFixed(decimals)}
              </p>
            </motion.div>
          )}

          {(symbol || decimals !== null || amount !== null) && (
            <button
              onClick={resetCurrency}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </CodeDemo>
    </div>
  );
}
