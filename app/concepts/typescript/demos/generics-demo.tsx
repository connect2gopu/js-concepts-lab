"use client";

import { useState } from "react";
import { CodeDemo } from "@/components/code-demo";

// Generic identity function demo
function identity<T>(arg: T): T {
  return arg;
}

// Generic container
class GenericBox<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return [...this.items];
  }

  getFirst(): T | undefined {
    return this.items[0];
  }

  map<U>(fn: (item: T) => U): U[] {
    return this.items.map(fn);
  }
}

// Generic constraint
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// Generic key constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const genericsCode = `// Generic Identity Function
function identity<T>(arg: T): T {
  return arg;
}

// Usage - TypeScript infers the type
const num = identity(42);        // type: number
const str = identity("hello");   // type: string

// Generic Container Class
class GenericBox<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  getAll(): T[] { return [...this.items]; }
  getFirst(): T | undefined { return this.items[0]; }
  
  // Method with its own generic parameter
  map<U>(fn: (item: T) => U): U[] {
    return this.items.map(fn);
  }
}

// Generic Constraints
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length; // Safe: T must have .length
}

// keyof Constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`;

export function GenericsDemo() {
  const [inputValue, setInputValue] = useState("hello");
  const [boxItems, setBoxItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  // Identity demo
  const identityResult = identity(inputValue);
  const identityNumResult = identity(42);

  // Constraint demo
  const lengthResults = [
    { input: '"hello"', result: getLength("hello") },
    { input: "[1, 2, 3]", result: getLength([1, 2, 3]) },
    { input: '{ length: 10 }', result: getLength({ length: 10 }) },
  ];

  // keyof demo
  const sampleObj = { name: "Alice", age: 30, role: "Developer" };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setBoxItems((prev) => [...prev, newItem.trim()]);
      setNewItem("");
    }
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Identity Function"
        description="The simplest generic - returns exactly what you pass in, preserving the type."
        code={genericsCode}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              identity(
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <label className="text-sm text-muted-foreground">)</label>
          </div>
          <div className="rounded-lg bg-code-bg p-3">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">Result: </span>
              <span className="text-success">
                &quot;{identityResult}&quot;
              </span>
            </p>
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">Type: </span>
              <span className="text-accent">string</span>
            </p>
          </div>
          <div className="rounded-lg bg-code-bg p-3">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">identity(42) = </span>
              <span className="text-warning">{identityNumResult}</span>
            </p>
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">Type: </span>
              <span className="text-accent">number</span>
            </p>
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Generic Box Container"
        description="A type-safe container that works with any type. Add items and see the type preserved."
        code={genericsCode}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              placeholder="Add an item to the box..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={handleAddItem}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Add
            </button>
          </div>
          <div className="rounded-lg bg-code-bg p-3">
            <p className="font-mono text-xs text-muted-foreground mb-2">
              GenericBox&lt;string&gt;
            </p>
            {boxItems.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground italic">
                Box is empty
              </p>
            ) : (
              <div className="space-y-1">
                <p className="font-mono text-sm">
                  <span className="text-muted-foreground">items: </span>
                  <span className="text-success">
                    [{boxItems.map((i) => `"${i}"`).join(", ")}]
                  </span>
                </p>
                <p className="font-mono text-sm">
                  <span className="text-muted-foreground">getFirst(): </span>
                  <span className="text-success">
                    &quot;{boxItems[0]}&quot;
                  </span>
                </p>
                <p className="font-mono text-sm">
                  <span className="text-muted-foreground">
                    map(s =&gt; s.toUpperCase()):{" "}
                  </span>
                  <span className="text-warning">
                    [{boxItems.map((i) => `"${i.toUpperCase()}"`).join(", ")}]
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="Generic Constraints"
        description="Constrain type parameters to ensure they have required properties."
        code={genericsCode}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              getLength&lt;T extends {"{"} length: number {"}"}&gt;(arg: T)
            </p>
            <div className="rounded-lg bg-code-bg p-3 space-y-1">
              {lengthResults.map((r) => (
                <p key={r.input} className="font-mono text-sm">
                  <span className="text-muted-foreground">
                    getLength({r.input}) ={" "}
                  </span>
                  <span className="text-warning">{r.result}</span>
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              getProperty&lt;T, K extends keyof T&gt;(obj, key)
            </p>
            <div className="rounded-lg bg-code-bg p-3 space-y-1">
              {(Object.keys(sampleObj) as (keyof typeof sampleObj)[]).map(
                (key) => (
                  <p key={key} className="font-mono text-sm">
                    <span className="text-muted-foreground">
                      getProperty(person, &quot;{key}&quot;) ={" "}
                    </span>
                    <span className="text-success">
                      {typeof sampleObj[key] === "string"
                        ? `"${getProperty(sampleObj, key)}"`
                        : getProperty(sampleObj, key)}
                    </span>
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
