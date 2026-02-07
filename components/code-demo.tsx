"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeDemoProps {
  title: string;
  description?: string;
  code: string;
  children: React.ReactNode;
  className?: string;
}

export function CodeDemo({
  title,
  description,
  code,
  children,
  className,
}: CodeDemoProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"demo" | "code">("demo");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setActiveTab("demo")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                activeTab === "demo"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Demo
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                activeTab === "code"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Code
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-[200px]">
        {activeTab === "demo" ? (
          <motion.div
            key="demo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 z-10 rounded-md bg-muted p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <pre className="overflow-x-auto bg-code-bg p-4">
              <code className="text-sm text-foreground">{code}</code>
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
