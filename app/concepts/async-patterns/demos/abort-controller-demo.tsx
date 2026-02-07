"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const abortCode = `// AbortController - Cancel async operations
const controller = new AbortController();
const { signal } = controller;

// Pass signal to fetch
async function fetchWithCancel(url: string) {
  const controller = new AbortController();
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    return await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log("Request was cancelled");
    } else {
      throw error;
    }
  }
  
  // Cancel after 5 seconds (timeout)
  setTimeout(() => controller.abort(), 5000);
}

// Cancel on user action
const controller = new AbortController();
cancelButton.addEventListener("click", () => {
  controller.abort();
});

// Multiple operations sharing one signal
async function fetchAll(signal: AbortSignal) {
  const [users, posts] = await Promise.all([
    fetch("/api/users", { signal }),
    fetch("/api/posts", { signal }),
  ]);
  // If signal is aborted, both fetches are cancelled
}

// AbortSignal.timeout() - built-in timeout
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000),
});`;

type FetchStatus = "idle" | "fetching" | "completed" | "cancelled" | "timeout";

interface FetchOperation {
  id: number;
  label: string;
  status: FetchStatus;
  duration: number;
  elapsed: number;
}

export function AbortControllerDemo() {
  const [operations, setOperations] = useState<FetchOperation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const startFetch = useCallback(() => {
    // Clean up previous
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);

    const ops: FetchOperation[] = [
      { id: 1, label: "GET /api/users", status: "fetching", duration: 3000, elapsed: 0 },
      { id: 2, label: "GET /api/posts", status: "fetching", duration: 5000, elapsed: 0 },
      { id: 3, label: "GET /api/comments", status: "fetching", duration: 7000, elapsed: 0 },
    ];

    setOperations([...ops]);

    // Simulate each operation
    ops.forEach((op) => {
      const startTime = Date.now();

      const interval = setInterval(() => {
        if (controller.signal.aborted) {
          clearInterval(interval);
          return;
        }
        op.elapsed = Date.now() - startTime;
        setOperations([...ops]);
      }, 100);

      intervalsRef.current.push(interval);

      // Complete after duration
      const timeout = setTimeout(() => {
        if (!controller.signal.aborted) {
          clearInterval(interval);
          op.status = "completed";
          op.elapsed = op.duration;
          setOperations([...ops]);

          // Check if all done
          if (ops.every((o) => o.status !== "fetching")) {
            setIsRunning(false);
          }
        }
      }, op.duration);

      // Listen for abort
      controller.signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        clearInterval(interval);
        if (op.status === "fetching") {
          op.status = "cancelled";
          setOperations([...ops]);
        }
      });
    });

    controller.signal.addEventListener("abort", () => {
      setIsRunning(false);
    });
  }, []);

  const cancelFetch = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setOperations([]);
    setIsRunning(false);
  }, []);

  // Timeout demo
  const [timeoutStatus, setTimeoutStatus] = useState<FetchStatus>("idle");
  const [timeoutElapsed, setTimeoutElapsed] = useState(0);
  const timeoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runTimeout = useCallback(() => {
    setTimeoutStatus("fetching");
    setTimeoutElapsed(0);
    const start = Date.now();

    timeoutIntervalRef.current = setInterval(() => {
      setTimeoutElapsed(Date.now() - start);
    }, 100);

    // Simulate a slow request that gets timed out after 3 seconds
    const timeoutId = setTimeout(() => {
      if (timeoutIntervalRef.current) clearInterval(timeoutIntervalRef.current);
      setTimeoutStatus("timeout");
      setTimeoutElapsed(3000);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  const statusConfig = {
    idle: { color: "text-muted-foreground", bg: "bg-muted", label: "Idle" },
    fetching: { color: "text-warning", bg: "bg-warning/10", label: "Fetching" },
    completed: { color: "text-success", bg: "bg-success/10", label: "Completed" },
    cancelled: { color: "text-error", bg: "bg-error/10", label: "Cancelled" },
    timeout: { color: "text-error", bg: "bg-error/10", label: "Timed Out" },
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="AbortController - Cancel Multiple Requests"
        description="Start multiple fetch operations, then cancel them all with a single AbortController."
        code={abortCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={startFetch}
              disabled={isRunning}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Start Fetch"}
            </button>
            <button
              onClick={cancelFetch}
              disabled={!isRunning}
              className="rounded-lg bg-error/90 px-4 py-2 text-sm font-medium text-white hover:bg-error disabled:opacity-50"
            >
              controller.abort()
            </button>
            <button
              onClick={reset}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {operations.map((op) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3 ${
                  op.status === "fetching"
                    ? "border-warning/30"
                    : op.status === "completed"
                    ? "border-success/30"
                    : op.status === "cancelled"
                    ? "border-error/30"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-foreground">{op.label}</span>
                  <span className={`text-xs font-medium ${statusConfig[op.status].color}`}>
                    {statusConfig[op.status].label}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      op.status === "cancelled"
                        ? "bg-error"
                        : op.status === "completed"
                        ? "bg-success"
                        : "bg-warning"
                    }`}
                    style={{
                      width: `${Math.min((op.elapsed / op.duration) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {op.elapsed >= 1000
                    ? `${(op.elapsed / 1000).toFixed(1)}s`
                    : `${op.elapsed}ms`}{" "}
                  / {(op.duration / 1000).toFixed(1)}s
                </p>
              </motion.div>
            ))}
            {operations.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                Click &quot;Start Fetch&quot; to begin, then try cancelling mid-flight
              </p>
            )}
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="AbortSignal.timeout() - Automatic Timeout"
        description="Automatically cancel a request if it takes too long with built-in timeout."
        code={abortCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={runTimeout}
              disabled={timeoutStatus === "fetching"}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              fetch with 3s timeout
            </button>
            <button
              onClick={() => {
                if (timeoutIntervalRef.current) clearInterval(timeoutIntervalRef.current);
                setTimeoutStatus("idle");
                setTimeoutElapsed(0);
              }}
              className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className={`rounded-lg border p-4 ${
            timeoutStatus === "timeout" ? "border-error/30 bg-error/5" :
            timeoutStatus === "fetching" ? "border-warning/30 bg-warning/5" :
            "border-border"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm">
                GET /api/slow-endpoint
              </span>
              <span className={`text-xs font-medium ${statusConfig[timeoutStatus].color}`}>
                {statusConfig[timeoutStatus].label}
              </span>
            </div>
            {timeoutStatus !== "idle" && (
              <>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      timeoutStatus === "timeout" ? "bg-error" : "bg-warning"
                    }`}
                    style={{ width: `${Math.min((timeoutElapsed / 3000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeoutStatus === "timeout"
                    ? 'AbortError: The operation was aborted (signal timed out after 3000ms)'
                    : `Elapsed: ${(timeoutElapsed / 1000).toFixed(1)}s / 3.0s timeout`
                  }
                </p>
              </>
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
