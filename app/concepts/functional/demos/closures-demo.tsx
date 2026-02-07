"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const closuresCode = `// Closure: a function that "closes over" its lexical scope
// The inner function retains access to variables from the outer function

// 1. Counter Factory - each call creates an independent counter
function createCounter(initialValue = 0) {
  let count = initialValue;  // This variable is "enclosed"
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => { count = initialValue; return count; },
  };
}

const counterA = createCounter(0);
const counterB = createCounter(100);
counterA.increment(); // 1
counterB.increment(); // 101
// Each counter has its own independent "count" variable

// 2. Private variables via closure
function createBankAccount(owner: string, balance = 0) {
  // balance is private - no direct access from outside
  return {
    deposit(amount: number) {
      if (amount <= 0) throw new Error("Invalid amount");
      balance += amount;
      return balance;
    },
    withdraw(amount: number) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance: () => balance,
    getOwner: () => owner,
  };
}

// 3. Memoization via closure
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}`;

interface CounterInstance {
  id: string;
  label: string;
  count: number;
  initialValue: number;
}

export function ClosuresDemo() {
  // Counter factory demo
  const [counters, setCounters] = useState<CounterInstance[]>([
    { id: "a", label: "Counter A", count: 0, initialValue: 0 },
    { id: "b", label: "Counter B", count: 100, initialValue: 100 },
  ]);

  const updateCounter = (id: string, delta: number) => {
    setCounters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, count: c.count + delta } : c))
    );
  };

  const resetCounter = (id: string) => {
    setCounters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, count: c.initialValue } : c
      )
    );
  };

  // Bank account demo
  const [balance, setBalance] = useState(1000);
  const [amount, setAmount] = useState(100);
  const [txLog, setTxLog] = useState<{ type: string; amount: number; balance: number }[]>([]);
  const [txError, setTxError] = useState<string | null>(null);

  const deposit = useCallback(() => {
    if (amount <= 0) {
      setTxError("Invalid amount");
      return;
    }
    setTxError(null);
    const newBalance = balance + amount;
    setBalance(newBalance);
    setTxLog((prev) => [...prev, { type: "deposit", amount, balance: newBalance }]);
  }, [balance, amount]);

  const withdraw = useCallback(() => {
    if (amount > balance) {
      setTxError("Insufficient funds!");
      return;
    }
    setTxError(null);
    const newBalance = balance - amount;
    setBalance(newBalance);
    setTxLog((prev) => [...prev, { type: "withdraw", amount, balance: newBalance }]);
  }, [balance, amount]);

  // Memoization demo
  const [memoInput, setMemoInput] = useState(35);
  const cacheRef = useRef(new Map<number, { result: number; cached: boolean }>());
  const [memoResults, setMemoResults] = useState<
    { input: number; result: number; time: number; cached: boolean }[]
  >([]);

  const runFib = useCallback(() => {
    function fib(n: number): number {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    }

    const cached = cacheRef.current.has(memoInput);
    const start = performance.now();
    let result: number;

    if (cached) {
      result = cacheRef.current.get(memoInput)!.result;
    } else {
      result = fib(memoInput);
      cacheRef.current.set(memoInput, { result, cached: false });
    }

    const time = performance.now() - start;
    setMemoResults((prev) => [
      { input: memoInput, result, time, cached },
      ...prev.slice(0, 9),
    ]);
  }, [memoInput]);

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Counter Factory (Closure)"
        description="Each createCounter() call creates its own enclosed 'count' variable. Counters are independent."
        code={closuresCode}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {counters.map((counter) => (
              <div
                key={counter.id}
                className="rounded-lg border border-border bg-code-bg p-4"
              >
                <p className="text-xs text-muted-foreground mb-2">
                  {counter.label} (initial: {counter.initialValue})
                </p>
                <p className="text-3xl font-bold text-accent mb-3 font-mono">
                  {counter.count}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCounter(counter.id, -1)}
                    className="rounded-md bg-muted px-3 py-1 text-sm font-medium hover:bg-border"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateCounter(counter.id, 1)}
                    className="rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
                  >
                    +
                  </button>
                  <button
                    onClick={() => resetCounter(counter.id)}
                    className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    reset
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Each counter has its own enclosed &quot;count&quot; variable — incrementing one doesn&apos;t affect the other.
          </p>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Private Variables via Closure (Bank Account)"
        description="The 'balance' variable is private — only accessible through deposit/withdraw methods."
        code={closuresCode}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-code-bg p-4">
            <p className="text-xs text-muted-foreground">
              Account Balance (private via closure)
            </p>
            <p className="text-3xl font-bold text-success font-mono">
              ${balance.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={deposit}
              className="rounded-lg bg-success/90 px-4 py-1.5 text-sm font-medium text-white hover:bg-success"
            >
              Deposit
            </button>
            <button
              onClick={withdraw}
              className="rounded-lg bg-error/90 px-4 py-1.5 text-sm font-medium text-white hover:bg-error"
            >
              Withdraw
            </button>
          </div>

          {txError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-error"
            >
              Error: {txError}
            </motion.p>
          )}

          {txLog.length > 0 && (
            <div className="rounded-lg bg-code-bg p-3 max-h-32 overflow-y-auto space-y-1">
              {txLog.map((tx, i) => (
                <p key={i} className="font-mono text-xs">
                  <span className={tx.type === "deposit" ? "text-success" : "text-error"}>
                    {tx.type}(${tx.amount})
                  </span>
                  <span className="text-muted-foreground">
                    {" → balance: "}
                  </span>
                  <span className="text-foreground">${tx.balance}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </CodeDemo>

      <CodeDemo
        title="Memoization via Closure"
        description="A closure-based cache stores previous results. Second call with same input is instant."
        code={closuresCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">fib(</label>
            <input
              type="number"
              value={memoInput}
              onChange={(e) => setMemoInput(Number(e.target.value))}
              min={1}
              max={42}
              className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <label className="text-sm text-muted-foreground">)</label>
            <button
              onClick={runFib}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Compute
            </button>
          </div>

          <div className="rounded-lg bg-code-bg p-3 space-y-1 max-h-48 overflow-y-auto">
            {memoResults.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Click &quot;Compute&quot; to calculate fibonacci. Try the same input twice!
              </p>
            ) : (
              memoResults.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <p className="font-mono text-sm">
                    <span className="text-muted-foreground">fib({r.input}) = </span>
                    <span className="text-accent">{r.result.toLocaleString()}</span>
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    r.cached
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {r.cached ? "CACHED" : `${r.time.toFixed(2)}ms`}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
