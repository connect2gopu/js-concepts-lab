"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

type PromiseStatus = "idle" | "pending" | "fulfilled" | "rejected";

interface PromiseStep {
  id: number;
  label: string;
  status: PromiseStatus;
  value?: string;
  error?: string;
  duration: number;
}

const promiseCode = `// Promise Chain Visualization
function fetchUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`)
    .then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    });
}

// Chaining transforms
fetchUser(1)
  .then(user => user.name)            // Step 1: Extract name
  .then(name => name.toUpperCase())    // Step 2: Transform
  .then(upper => \`Hello, \${upper}!\`) // Step 3: Format
  .catch(err => \`Error: \${err}\`);    // Catch any error

// Promise.all - parallel execution
const [user, posts, comments] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchComments(1),
]);

// Promise.race - first to complete wins
const result = await Promise.race([
  fetchData(),
  timeout(5000),
]);

// async/await with error handling
async function loadData() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error("Failed:", error);
    throw error;
  }
}`;

export function PromiseVisualizerDemo() {
  const [steps, setSteps] = useState<PromiseStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldFail, setShouldFail] = useState(false);

  const runChain = useCallback(async () => {
    setIsRunning(true);
    const chainSteps: PromiseStep[] = [
      { id: 1, label: "fetch('/api/users/1')", status: "pending", duration: 1200 },
      { id: 2, label: ".then(res => res.json())", status: "idle", duration: 400 },
      { id: 3, label: ".then(user => user.name)", status: "idle", duration: 300 },
      { id: 4, label: ".then(name => name.toUpperCase())", status: "idle", duration: 200 },
      { id: 5, label: '.then(upper => `Hello, ${upper}!`)', status: "idle", duration: 200 },
    ];

    setSteps([...chainSteps]);

    for (let i = 0; i < chainSteps.length; i++) {
      // Set current step to pending
      chainSteps[i].status = "pending";
      setSteps([...chainSteps]);

      await new Promise((resolve) => setTimeout(resolve, chainSteps[i].duration));

      if (shouldFail && i === 1) {
        chainSteps[i].status = "rejected";
        chainSteps[i].error = "HTTP 404: Not Found";
        setSteps([...chainSteps]);

        // Add catch step
        await new Promise((resolve) => setTimeout(resolve, 500));
        const catchStep: PromiseStep = {
          id: 99,
          label: '.catch(err => `Error: ${err}`)',
          status: "fulfilled",
          value: '"Error: HTTP 404: Not Found"',
          duration: 0,
        };
        setSteps([...chainSteps, catchStep]);
        setIsRunning(false);
        return;
      }

      chainSteps[i].status = "fulfilled";
      const values = [
        "Response { status: 200 }",
        '{ id: 1, name: "Alice", role: "admin" }',
        '"Alice"',
        '"ALICE"',
        '"Hello, ALICE!"',
      ];
      chainSteps[i].value = values[i];
      setSteps([...chainSteps]);
    }

    setIsRunning(false);
  }, [shouldFail]);

  // Promise.all demo
  const [allSteps, setAllSteps] = useState<PromiseStep[]>([]);
  const [isAllRunning, setIsAllRunning] = useState(false);

  const runAll = useCallback(async () => {
    setIsAllRunning(true);
    const parallel: PromiseStep[] = [
      { id: 1, label: "fetchUser(1)", status: "pending", duration: 1000 },
      { id: 2, label: "fetchPosts(1)", status: "pending", duration: 1500 },
      { id: 3, label: "fetchComments(1)", status: "pending", duration: 800 },
    ];
    setAllSteps([...parallel]);

    const promises = parallel.map(
      (step) =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            step.status = "fulfilled";
            const vals = [
              '{ name: "Alice" }',
              "[Post1, Post2, Post3]",
              "[Comment1, Comment2]",
            ];
            step.value = vals[step.id - 1];
            setAllSteps([...parallel]);
            resolve();
          }, step.duration);
        })
    );

    await Promise.all(promises);
    setIsAllRunning(false);
  }, []);

  const statusColor = (status: PromiseStatus) => {
    switch (status) {
      case "idle":
        return "bg-muted text-muted-foreground border-border";
      case "pending":
        return "bg-warning/10 text-warning border-warning/30";
      case "fulfilled":
        return "bg-success/10 text-success border-success/30";
      case "rejected":
        return "bg-error/10 text-error border-error/30";
    }
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Promise Chain Visualizer"
        description="Watch each .then() step execute in sequence. Toggle the error flag to see .catch() in action."
        code={promiseCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={runChain}
              disabled={isRunning}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Run Chain"}
            </button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={shouldFail}
                onChange={(e) => setShouldFail(e.target.checked)}
                className="rounded"
                disabled={isRunning}
              />
              Simulate error at step 2
            </label>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${statusColor(step.status)}`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {step.status === "pending" && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    {step.status === "fulfilled" && <span className="text-sm">&#10003;</span>}
                    {step.status === "rejected" && <span className="text-sm">&#10007;</span>}
                    {step.status === "idle" && (
                      <div className="h-2 w-2 rounded-full bg-current opacity-30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs">{step.label}</p>
                    {step.value && (
                      <p className="mt-1 font-mono text-xs opacity-80">
                        → {step.value}
                      </p>
                    )}
                    {step.error && (
                      <p className="mt-1 font-mono text-xs opacity-80">
                        ✗ {step.error}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                Click &quot;Run Chain&quot; to visualize the promise chain
              </p>
            )}
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Promise.all - Parallel Execution"
        description="All promises run simultaneously. Promise.all resolves when ALL complete."
        code={promiseCode}
      >
        <div className="space-y-4">
          <button
            onClick={runAll}
            disabled={isAllRunning}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {isAllRunning ? "Fetching..." : "Run Promise.all"}
          </button>

          <div className="space-y-2">
            {allSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${statusColor(step.status)}`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {step.status === "pending" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {step.status === "fulfilled" && <span className="text-sm">&#10003;</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs">{step.label}</p>
                  {step.value && (
                    <p className="mt-1 font-mono text-xs opacity-80">
                      → {step.value}
                    </p>
                  )}
                </div>
                <span className="text-xs opacity-60">{step.duration}ms</span>
              </div>
            ))}
            {allSteps.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                Click &quot;Run Promise.all&quot; to see parallel execution
              </p>
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
