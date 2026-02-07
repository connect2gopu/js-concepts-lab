"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const singletonCode = `// Singleton Pattern: ensure a class has only one instance
// and provide a global point of access to it

class AppConfig {
  private static instance: AppConfig;
  
  private settings: Map<string, string> = new Map();
  private _instanceId: string;
  
  private constructor() {
    // Private constructor prevents direct construction
    this._instanceId = Math.random().toString(36).substring(7);
    console.log(\`AppConfig instance created: \${this._instanceId}\`);
  }
  
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }
  
  get(key: string): string | undefined {
    return this.settings.get(key);
  }
  
  set(key: string, value: string): void {
    this.settings.set(key, value);
  }
  
  get instanceId() {
    return this._instanceId;
  }
}

// Both references point to the SAME instance
const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();
console.log(config1 === config2); // true

config1.set("theme", "dark");
config2.get("theme"); // "dark" — same instance!

// Module-level singleton (simpler pattern in JS/TS)
// Any module-level variable is effectively a singleton
// because modules are cached after first import
let connectionCount = 0;

export const db = {
  connect() { connectionCount++; },
  getConnectionCount() { return connectionCount; },
};`;

// Simulate a singleton
class SingletonConfig {
  private static instance: SingletonConfig | null = null;
  private settings = new Map<string, string>();
  public readonly instanceId: string;
  public readonly createdAt: number;

  private constructor() {
    this.instanceId = Math.random().toString(36).substring(2, 8);
    this.createdAt = Date.now();
  }

  static getInstance(): SingletonConfig {
    if (!SingletonConfig.instance) {
      SingletonConfig.instance = new SingletonConfig();
    }
    return SingletonConfig.instance;
  }

  static resetInstance(): void {
    SingletonConfig.instance = null;
  }

  get(key: string): string | undefined {
    return this.settings.get(key);
  }

  set(key: string, value: string): void {
    this.settings.set(key, value);
  }

  getAll(): Record<string, string> {
    return Object.fromEntries(this.settings);
  }
}

export function SingletonDemo() {
  const [logs, setLogs] = useState<{ id: number; text: string; type: "info" | "success" | "warning" }[]>([]);
  const logIdRef = useRef(0);
  const [references, setReferences] = useState<{ name: string; instanceId: string }[]>([]);
  const [settingKey, setSettingKey] = useState("theme");
  const [settingValue, setSettingValue] = useState("dark");

  const addLog = (text: string, type: "info" | "success" | "warning" = "info") => {
    logIdRef.current++;
    setLogs((prev) => [{ id: logIdRef.current, text, type }, ...prev].slice(0, 15));
  };

  const getInstance = (refName: string) => {
    const instance = SingletonConfig.getInstance();
    setReferences((prev) => {
      const existing = prev.find((r) => r.name === refName);
      if (existing) return prev;
      return [...prev, { name: refName, instanceId: instance.instanceId }];
    });
    addLog(
      `${refName} = AppConfig.getInstance() → id: ${instance.instanceId}`,
      "info"
    );

    // Show that all refs are the same
    if (references.length > 0) {
      addLog(
        `${refName} === ${references[0].name} → ${
          instance.instanceId === references[0].instanceId
        }`,
        instance.instanceId === references[0].instanceId ? "success" : "warning"
      );
    }
  };

  const setSetting = () => {
    const instance = SingletonConfig.getInstance();
    instance.set(settingKey, settingValue);
    addLog(
      `config.set("${settingKey}", "${settingValue}")`,
      "info"
    );
  };

  const getSetting = (refName: string) => {
    const instance = SingletonConfig.getInstance();
    const value = instance.get(settingKey);
    addLog(
      `${refName}.get("${settingKey}") → ${value ? `"${value}"` : "undefined"}`,
      value ? "success" : "warning"
    );
  };

  const resetSingleton = () => {
    SingletonConfig.resetInstance();
    setReferences([]);
    addLog("Singleton instance destroyed — next getInstance() creates a new one", "warning");
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Singleton Config Manager"
        description="All references point to the same instance. Setting a value via one reference is visible from all others."
        code={singletonCode}
      >
        <div className="space-y-4">
          {/* Get instance buttons */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Create references to the singleton:
            </p>
            <div className="flex flex-wrap gap-2">
              {["config1", "config2", "config3"].map((name) => (
                <button
                  key={name}
                  onClick={() => getInstance(name)}
                  disabled={references.some((r) => r.name === name)}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-mono font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                >
                  {name} = getInstance()
                </button>
              ))}
              <button
                onClick={resetSingleton}
                className="rounded-lg bg-error/20 px-3 py-1.5 text-sm font-medium text-error hover:bg-error/30"
              >
                Reset Instance
              </button>
            </div>
          </div>

          {/* Active references */}
          {references.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {references.map((ref) => (
                <div
                  key={ref.name}
                  className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5"
                >
                  <p className="font-mono text-xs">
                    <span className="text-accent">{ref.name}</span>
                    <span className="text-muted-foreground">.instanceId = </span>
                    <span className="text-success">{ref.instanceId}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Set/Get settings */}
          {references.length > 0 && (
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-xs text-muted-foreground font-semibold">
                Modify settings through any reference:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={settingKey}
                  onChange={(e) => setSettingKey(e.target.value)}
                  placeholder="key"
                  className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
                <span className="text-xs text-muted-foreground">=</span>
                <input
                  type="text"
                  value={settingValue}
                  onChange={(e) => setSettingValue(e.target.value)}
                  placeholder="value"
                  className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
                <button
                  onClick={setSetting}
                  className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  Set
                </button>
                {references.map((ref) => (
                  <button
                    key={ref.name}
                    onClick={() => getSetting(ref.name)}
                    className="rounded-md bg-muted px-3 py-1 text-xs font-mono text-muted-foreground hover:text-foreground"
                  >
                    {ref.name}.get()
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="rounded-lg bg-code-bg p-3 max-h-40 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Console</p>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Create instances to see logs
              </p>
            ) : (
              <div className="space-y-0.5">
                {logs.map((log) => (
                  <motion.p
                    key={log.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`font-mono text-[11px] ${
                      log.type === "success"
                        ? "text-success"
                        : log.type === "warning"
                        ? "text-warning"
                        : "text-foreground"
                    }`}
                  >
                    {log.text}
                  </motion.p>
                ))}
              </div>
            )}
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
