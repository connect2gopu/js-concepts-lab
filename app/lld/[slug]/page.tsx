"use client";

import { notFound } from "next/navigation";
import { use, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Play, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import { lldItems } from "@/lib/lld-data";

const mdComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-foreground">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-muted-foreground">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  ),
};
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-code-bg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading editor...</span>
        </div>
      </div>
    ),
  }
);

const VISUAL_REGISTRY: Record<string, React.ComponentType> = {
  "24-calendar": dynamic(
    () =>
      import("@/components/lld/visuals/calendar-visual").then(
        (m) => m.CalendarVisual
      ),
    { ssr: false }
  ),
};

const DEFAULT_CODE = `// Implement your solution here
// You can use console.log() to test logic — output appears in the console panel

`;

type Tab = "statement" | "editor" | "visual";

export default function LLDDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const item = lldItems.find((i) => i.slug === slug);

  if (!item) notFound();

  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("statement");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const VisualComponent = VISUAL_REGISTRY[slug];

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    const logs: string[] = [];
    const orig = console.log;

    console.log = (...args: unknown[]) => {
      const line = args
        .map((a) =>
          typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
        )
        .join(" ");
      logs.push(line);
      setOutput([...logs]);
    };

    try {
      const fn = new Function(code);
      const result = fn();
      if (result instanceof Promise) {
        result
          .catch((err: Error) => logs.push(`Error: ${err.message}`))
          .finally(() => {
            setTimeout(() => {
              console.log = orig;
              setOutput([...logs]);
              setIsRunning(false);
            }, 500);
          });
      } else {
        setTimeout(() => {
          console.log = orig;
          setOutput([...logs]);
          setIsRunning(false);
        }, 300);
      }
    } catch (err) {
      logs.push(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setOutput([...logs]);
      console.log = orig;
      setIsRunning(false);
    }
  }, [code]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "statement", label: "Statement" },
    { id: "editor", label: "Editor" },
    { id: "visual", label: "Visual" },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <Link
          href="/lld"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          LLD
        </Link>
        <span className="text-muted-foreground">/</span>
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            #{item.id}
          </span>
          <h1 className="text-sm font-semibold text-foreground">{item.title}</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border bg-card px-4 sm:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="lld-tab-indicator"
                className="absolute bottom-0 left-0 h-0.5 w-full bg-accent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "statement" && (
          <motion.div
            key="statement"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto px-4 py-6 sm:px-8"
          >
            <div className="mx-auto max-w-3xl prose prose-sm dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
              <ReactMarkdown components={mdComponents}>{item.problem}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        {activeTab === "editor" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-full gap-0"
          >
            {/* Monaco editor */}
            <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
              <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  solution.js
                </span>
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                >
                  {isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={(v) => setCode(v ?? "")}
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
            </div>

            {/* Console output */}
            <div className="flex w-[280px] shrink-0 flex-col">
              <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Console
                </span>
                <button
                  onClick={() => setOutput([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-code-bg p-3 font-mono">
                {output.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">
                    Click &quot;Run&quot; to see output...
                  </p>
                ) : (
                  output.map((line, i) => (
                    <div
                      key={i}
                      className={`py-0.5 text-xs ${
                        line.startsWith("Error:") ? "text-error" : "text-foreground"
                      }`}
                    >
                      <span className="mr-2 select-none text-muted-foreground">
                        {">"}
                      </span>
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "visual" && (
          <motion.div
            key="visual"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {VisualComponent ? (
              <VisualComponent />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p className="text-sm">Visual not yet implemented for this LLD.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
