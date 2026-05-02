"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  Trash2,
  Copy,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  FileCode,
  X,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-code-bg rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading Monaco Editor...</span>
        </div>
      </div>
    ),
  }
);

const DEFAULT_CODE = `// JS/TS Concept Lab — Playground
// Write JavaScript and click "Run" to see output below

// Try some concepts from the labs:

// 1. Closures
function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const counter = createCounter(10);
console.log("Counter:", counter.increment()); // 11
console.log("Counter:", counter.increment()); // 12

// 2. Generators
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
const first10 = [];
for (let i = 0; i < 10; i++) {
  first10.push(fib.next().value);
}
console.log("Fibonacci:", first10);

// 3. Promise example
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchData() {
  console.log("Fetching...");
  await delay(100);
  console.log("Done! Data:", { users: 42, active: true });
}

fetchData();

// 4. Array methods pipeline
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n ** 2)
  .reduce((sum, n) => sum + n, 0);

console.log("Pipeline result:", result);
`;

const NEW_SNIPPET_TEMPLATE = `// Write your JavaScript / TypeScript here and click Run to execute it.
// console.log() output appears in the Console panel on the right.
// Use Save to store this as a .js or .ts file in the snippets/ folder.

`;

const EXAMPLE_SNIPPETS = [
  {
    label: "Closures",
    code: `// Closure: function that captures its lexical scope
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

console.log("add5(3):", add5(3));   // 8
console.log("add10(3):", add10(3)); // 13
console.log("add5(7):", add5(7));   // 12
`,
  },
  {
    label: "Promises",
    code: `// Promise patterns
const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log("Starting...");

  // Sequential
  await delay(50);
  console.log("Step 1 done");
  await delay(50);
  console.log("Step 2 done");

  // Parallel with Promise.all
  const results = await Promise.all([
    delay(30).then(() => "A"),
    delay(20).then(() => "B"),
    delay(10).then(() => "C"),
  ]);
  console.log("Parallel results:", results);

  // Promise.race
  const winner = await Promise.race([
    delay(50).then(() => "slow"),
    delay(10).then(() => "fast"),
  ]);
  console.log("Race winner:", winner);
}

run();
`,
  },
  {
    label: "Design Patterns",
    code: `// Observer Pattern
class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.#listeners.get(event)?.delete(fn);
  }

  emit(event, data) {
    this.#listeners.get(event)?.forEach(fn => fn(data));
  }
}

const bus = new EventEmitter();

bus.on("message", (msg) => console.log("Handler 1:", msg));
const unsub = bus.on("message", (msg) => console.log("Handler 2:", msg));

bus.emit("message", "Hello!");
unsub(); // remove handler 2
bus.emit("message", "Only handler 1 sees this");
`,
  },
  {
    label: "Functional",
    code: `// Pipe & Compose
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);

const double = x => x * 2;
const addTen = x => x + 10;
const square = x => x ** 2;

const transform = pipe(double, addTen, square);
console.log("pipe(double, addTen, square)(3):", transform(3));
// 3 → 6 → 16 → 256

// Currying
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

const add = curry((a, b, c) => a + b + c);
console.log("add(1)(2)(3):", add(1)(2)(3));
console.log("add(1, 2)(3):", add(1, 2)(3));
console.log("add(1)(2, 3):", add(1)(2, 3));
`,
  },
];

interface SaveModal {
  open: boolean;
  name: string;
  ext: "js" | "ts";
}

export default function PlaygroundPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  // Snippet management state
  const [snippets, setSnippets] = useState<string[]>([]);
  const [activeSnippet, setActiveSnippet] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [saveModal, setSaveModal] = useState<SaveModal>({
    open: false,
    name: "",
    ext: "js",
  });
  const [isSaving, setIsSaving] = useState(false);
  const saveNameRef = useRef<HTMLInputElement>(null);

  const fetchSnippets = useCallback(async () => {
    try {
      const res = await fetch("/api/snippets");
      const data = await res.json();
      setSnippets(data.snippets ?? []);
    } catch {
      // silently ignore on load
    }
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Focus name input when modal opens
  useEffect(() => {
    if (saveModal.open) {
      setTimeout(() => saveNameRef.current?.focus(), 50);
    }
  }, [saveModal.open]);

  const newSnippet = useCallback(() => {
    setCode(NEW_SNIPPET_TEMPLATE);
    setActiveSnippet(null);
    setOutput([]);
  }, []);

  const loadSnippet = useCallback(async (filename: string) => {
    try {
      const res = await fetch(`/api/snippets/${encodeURIComponent(filename)}`);
      if (!res.ok) return;
      const data = await res.json();
      setCode(data.code);
      setActiveSnippet(filename);
      setOutput([]);
    } catch {
      // ignore
    }
  }, []);

  const saveSnippet = useCallback(async () => {
    const { name, ext } = saveModal;
    const trimmed = name.trim();
    if (!trimmed) return;
    const filename = `${trimmed}.${ext}`;
    setIsSaving(true);
    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, code }),
      });
      if (res.ok) {
        await fetchSnippets();
        setActiveSnippet(filename);
        setSaveModal({ open: false, name: "", ext: "js" });
      }
    } finally {
      setIsSaving(false);
    }
  }, [saveModal, code, fetchSnippets]);

  const deleteSnippet = useCallback(
    async (filename: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await fetch("/api/snippets", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });
        await fetchSnippets();
        if (activeSnippet === filename) {
          setActiveSnippet(null);
        }
      } catch {
        // ignore
      }
    },
    [fetchSnippets, activeSnippet]
  );

  const exportSnippet = useCallback(() => {
    const filename = activeSnippet ?? "snippet.js";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, activeSnippet]);

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);

    const logs: string[] = [];
    const originalConsoleLog = console.log;

    console.log = (...args: unknown[]) => {
      const formatted = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ");
      logs.push(formatted);
      setOutput([...logs]);
    };

    try {
      const fn = new Function(code);
      const result = fn();

      if (result instanceof Promise) {
        result
          .then(() => {
            setTimeout(() => {
              console.log = originalConsoleLog;
              setOutput([...logs]);
              setIsRunning(false);
            }, 500);
          })
          .catch((err: Error) => {
            logs.push(`Error: ${err.message}`);
            setOutput([...logs]);
            console.log = originalConsoleLog;
            setIsRunning(false);
          });
      } else {
        setTimeout(() => {
          console.log = originalConsoleLog;
          setOutput([...logs]);
          setIsRunning(false);
        }, 300);
      }
    } catch (err) {
      logs.push(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setOutput([...logs]);
      console.log = originalConsoleLog;
      setIsRunning(false);
    }
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSaveModal = () => {
    const baseName = activeSnippet
      ? activeSnippet.replace(/\.(js|ts)$/, "")
      : "";
    const ext = (activeSnippet?.endsWith(".ts") ? "ts" : "js") as "js" | "ts";
    setSaveModal({ open: true, name: baseName, ext });
  };

  const editorLanguage =
    activeSnippet?.endsWith(".ts") ? "typescript" : "javascript";

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Playground</h1>
            {activeSnippet && (
              <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <FileCode className="h-3 w-3" />
                {activeSnippet}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Write and run JavaScript code. Snippets are saved as real files in{" "}
            <code className="text-xs">snippets/</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportSnippet}
            title="Download as file"
            className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy code"
            className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={openSaveModal}
            title="Save snippet"
            className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </button>
        </div>
      </div>

      {/* Example snippets */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Examples:
        </span>
        {EXAMPLE_SNIPPETS.map((snippet) => (
          <button
            key={snippet.label}
            onClick={() => {
              setCode(snippet.code);
              setActiveSnippet(null);
            }}
            className="whitespace-nowrap rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {snippet.label}
          </button>
        ))}
      </div>

      {/* Main area: Sidebar + Editor + Console */}
      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-border">
        {/* Snippet Sidebar */}
        <div
          className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${
            isSidebarOpen ? "w-44 min-w-[176px]" : "w-8 min-w-[32px]"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-border px-2 py-2">
            {isSidebarOpen && (
              <span className="text-xs font-medium text-muted-foreground truncate">
                Snippets
              </span>
            )}
            <button
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="ml-auto text-muted-foreground hover:text-foreground"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {isSidebarOpen && (
            <>
              {/* Snippet list */}
              <div className="flex-1 overflow-y-auto py-1">
                {snippets.length === 0 ? (
                  <p className="px-3 py-4 text-[10px] text-muted-foreground italic leading-relaxed">
                    No snippets yet. Click Save to store your code.
                  </p>
                ) : (
                  snippets.map((filename) => (
                    <button
                      key={filename}
                      onClick={() => loadSnippet(filename)}
                      className={`group flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors ${
                        activeSnippet === filename
                          ? "bg-accent/20 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="truncate flex-1">{filename}</span>
                      <span
                        role="button"
                        onClick={(e) => deleteSnippet(filename, e)}
                        className="ml-1 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-error transition-opacity"
                        title={`Delete ${filename}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* New + Save buttons at bottom */}
              <div className="border-t border-border p-2 flex flex-col gap-1.5">
                <button
                  onClick={newSnippet}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileCode className="h-3 w-3" />
                  New
                </button>
                <button
                  onClick={openSaveModal}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Save className="h-3 w-3" />
                  Save current
                </button>
              </div>
            </>
          )}
        </div>

        {/* Editor + Output split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                {activeSnippet ?? "editor.js"}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                dynamic import
              </span>
            </div>
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              language={editorLanguage}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-geist-mono), monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Output */}
          <div className="w-[300px] shrink-0 border-l border-border flex flex-col">
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                Console Output
              </span>
              <button
                onClick={() => setOutput([])}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-code-bg p-3 font-mono text-sm">
              {output.length === 0 ? (
                <p className="text-muted-foreground italic text-xs">
                  Click &quot;Run&quot; to see output here...
                </p>
              ) : (
                output.map((line, i) => (
                  <div
                    key={i}
                    className={`py-0.5 text-xs ${
                      line.startsWith("Error:")
                        ? "text-error"
                        : "text-foreground"
                    }`}
                  >
                    <span className="text-muted-foreground mr-2 select-none">
                      {">"}
                    </span>
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {saveModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-80 rounded-xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Save Snippet
              </h2>
              <button
                onClick={() => setSaveModal({ open: false, name: "", ext: "js" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-muted-foreground">
                Name
              </label>
              <div className="flex items-center gap-0 overflow-hidden rounded-md border border-border">
                <input
                  ref={saveNameRef}
                  type="text"
                  value={saveModal.name}
                  onChange={(e) =>
                    setSaveModal((m) => ({ ...m, name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveSnippet();
                    if (e.key === "Escape") setSaveModal({ open: false, name: "", ext: "js" });
                  }}
                  placeholder="my-snippet"
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="flex border-l border-border">
                  {(["js", "ts"] as const).map((ext) => (
                    <button
                      key={ext}
                      onClick={() => setSaveModal((m) => ({ ...m, ext }))}
                      className={`px-2.5 py-2 text-xs font-mono transition-colors ${
                        saveModal.ext === ext
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      .{ext}
                    </button>
                  ))}
                </div>
              </div>
              {saveModal.name && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Will save as{" "}
                  <span className="font-mono text-foreground">
                    snippets/{saveModal.name}.{saveModal.ext}
                  </span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSaveModal({ open: false, name: "", ext: "js" })}
                className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={saveSnippet}
                disabled={!saveModal.name.trim() || isSaving}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
