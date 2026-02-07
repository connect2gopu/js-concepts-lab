"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { CodeDemo } from "@/components/code-demo";

const linkedListCode = `// Singly Linked List
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  
  constructor(value: T) {
    this.value = value;
  }
}

class LinkedList<T> {
  head: ListNode<T> | null = null;
  private _size = 0;

  get size() { return this._size; }

  // Add to end - O(n)
  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this._size++;
  }

  // Add to start - O(1)
  prepend(value: T): void {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
    this._size++;
  }

  // Insert at index - O(n)
  insertAt(index: number, value: T): void {
    if (index === 0) return this.prepend(value);
    const prev = this.getAt(index - 1);
    if (!prev) throw new Error("Index out of bounds");
    const node = new ListNode(value);
    node.next = prev.next;
    prev.next = node;
    this._size++;
  }

  // Delete by value - O(n)
  delete(value: T): boolean {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this._size--;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this._size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Search - O(n)
  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  // Convert to array
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}`;

interface LLNode {
  id: string;
  value: number;
}

export function LinkedListDemo() {
  const [nodes, setNodes] = useState<LLNode[]>([
    { id: "n1", value: 10 },
    { id: "n2", value: 20 },
    { id: "n3", value: 30 },
    { id: "n4", value: 40 },
  ]);
  const [newValue, setNewValue] = useState(50);
  const [searchValue, setSearchValue] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<string>("");

  const append = () => {
    const id = `n${Date.now()}`;
    setNodes((prev) => [...prev, { id, value: newValue }]);
    setLastAction(`append(${newValue}) — O(n) — traverse to end, add node`);
    setNewValue(newValue + 10);
  };

  const prepend = () => {
    const id = `n${Date.now()}`;
    setNodes((prev) => [{ id, value: newValue }, ...prev]);
    setLastAction(`prepend(${newValue}) — O(1) — set new head`);
    setNewValue(newValue + 10);
  };

  const deleteFirst = () => {
    if (nodes.length === 0) return;
    const removed = nodes[0].value;
    setNodes((prev) => prev.slice(1));
    setLastAction(`deleteFirst() — O(1) — removed ${removed}, updated head pointer`);
  };

  const deleteLast = () => {
    if (nodes.length === 0) return;
    const removed = nodes[nodes.length - 1].value;
    setNodes((prev) => prev.slice(0, -1));
    setLastAction(`deleteLast() — O(n) — removed ${removed}, traversed to second-to-last`);
  };

  const deleteAt = (index: number) => {
    const removed = nodes[index].value;
    setNodes((prev) => prev.filter((_, i) => i !== index));
    setLastAction(`deleteAt(${index}) — O(n) — removed node with value ${removed}`);
    setFoundIndex(null);
    setSearchValue(null);
  };

  const search = () => {
    if (searchValue === null) return;
    const idx = nodes.findIndex((n) => n.value === searchValue);
    setFoundIndex(idx);
    if (idx >= 0) {
      setLastAction(`find(${searchValue}) — found at index ${idx} after ${idx + 1} comparisons`);
    } else {
      setLastAction(`find(${searchValue}) — not found (searched all ${nodes.length} nodes)`);
    }
  };

  const reverse = () => {
    setNodes((prev) => [...prev].reverse());
    setLastAction(`reverse() — O(n) — reversed all pointers`);
  };

  return (
    <CodeDemo
      title="Singly Linked List"
      description="Visualize insert, delete, search, and reverse operations on a linked list."
      code={linkedListCode}
    >
      <div className="space-y-4">
        {/* Linked list visualization */}
        <div className="rounded-lg bg-code-bg p-4 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max">
            <div className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-mono text-accent mr-2">
              HEAD
            </div>
            <AnimatePresence>
              {nodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.5, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center"
                >
                  <div
                    className={`group relative flex items-center rounded-lg border-2 ${
                      foundIndex === i
                        ? "border-success bg-success/10"
                        : "border-border bg-card"
                    }`}
                  >
                    {/* Value cell */}
                    <div className="px-3 py-2 font-mono text-sm font-bold text-foreground">
                      {node.value}
                    </div>
                    {/* Next pointer cell */}
                    <div className="border-l border-border px-2 py-2 text-[10px] text-muted-foreground">
                      next
                    </div>
                    {/* Delete button on hover */}
                    <button
                      onClick={() => deleteAt(i)}
                      className="absolute -top-2 -right-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-[10px]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {/* Arrow to next */}
                  {i < nodes.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {nodes.length > 0 && (
              <div className="flex items-center ml-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-mono text-xs text-error">null</span>
              </div>
            )}
            {nodes.length === 0 && (
              <span className="font-mono text-xs text-error ml-1">null (empty)</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Size: <span className="text-foreground font-mono">{nodes.length}</span></span>
          <span>Head: <span className="text-foreground font-mono">{nodes[0]?.value ?? "null"}</span></span>
          <span>Tail: <span className="text-foreground font-mono">{nodes[nodes.length - 1]?.value ?? "null"}</span></span>
        </div>

        {/* Operations */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Insert */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Insert
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <button
                onClick={append}
                className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
              >
                Append
              </button>
              <button
                onClick={prepend}
                className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Prepend
              </button>
            </div>
          </div>

          {/* Delete */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Delete
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={deleteFirst}
                disabled={nodes.length === 0}
                className="rounded-md bg-error/20 px-3 py-1 text-xs text-error hover:bg-error/30 disabled:opacity-50"
              >
                Delete First
              </button>
              <button
                onClick={deleteLast}
                disabled={nodes.length === 0}
                className="rounded-md bg-error/20 px-3 py-1 text-xs text-error hover:bg-error/30 disabled:opacity-50"
              >
                Delete Last
              </button>
              <button
                onClick={reverse}
                disabled={nodes.length < 2}
                className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Reverse
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Search
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={searchValue ?? ""}
              onChange={(e) => {
                setSearchValue(e.target.value ? Number(e.target.value) : null);
                setFoundIndex(null);
              }}
              placeholder="value"
              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
            <button
              onClick={search}
              disabled={searchValue === null}
              className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground disabled:opacity-50"
            >
              Find
            </button>
            {foundIndex !== null && (
              <span className={`text-xs font-medium ${foundIndex >= 0 ? "text-success" : "text-error"}`}>
                {foundIndex >= 0 ? `Found at index ${foundIndex}` : "Not found"}
              </span>
            )}
          </div>
        </div>

        {/* Last action log */}
        {lastAction && (
          <motion.div
            key={lastAction}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-accent-light border border-accent/20 p-2"
          >
            <p className="font-mono text-xs text-accent">{lastAction}</p>
          </motion.div>
        )}
      </div>
    </CodeDemo>
  );
}
