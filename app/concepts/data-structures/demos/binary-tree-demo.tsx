"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const treeCode = `// Binary Search Tree
class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;
  
  constructor(value: T) { this.value = value; }
}

class BST<T> {
  root: TreeNode<T> | null = null;

  insert(value: T): void {
    this.root = this._insert(this.root, value);
  }

  private _insert(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (!node) return new TreeNode(value);
    if (value < node.value) node.left = this._insert(node.left, value);
    else node.right = this._insert(node.right, value);
    return node;
  }

  // In-order: Left → Root → Right (sorted order)
  *inOrder(node = this.root): Generator<T> {
    if (!node) return;
    yield* this.inOrder(node.left);
    yield node.value;
    yield* this.inOrder(node.right);
  }

  // Pre-order: Root → Left → Right
  *preOrder(node = this.root): Generator<T> {
    if (!node) return;
    yield node.value;
    yield* this.preOrder(node.left);
    yield* this.preOrder(node.right);
  }

  // Post-order: Left → Right → Root
  *postOrder(node = this.root): Generator<T> {
    if (!node) return;
    yield* this.postOrder(node.left);
    yield* this.postOrder(node.right);
    yield node.value;
  }
}`;

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function insertNode(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) {
    return { ...root, left: insertNode(root.left, value) };
  } else if (value > root.value) {
    return { ...root, right: insertNode(root.right, value) };
  }
  return root;
}

function inOrder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...inOrder(node.left), node.value, ...inOrder(node.right)];
}

function preOrder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [node.value, ...preOrder(node.left), ...preOrder(node.right)];
}

function postOrder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...postOrder(node.left), ...postOrder(node.right), node.value];
}

type TraversalType = "inOrder" | "preOrder" | "postOrder";

// Render the tree visually
function TreeVisualization({
  node,
  highlighted,
  depth = 0,
  position = "root",
}: {
  node: TreeNode | null;
  highlighted: Set<number>;
  depth?: number;
  position?: string;
}) {
  if (!node) return null;

  const isHighlighted = highlighted.has(node.value);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: depth * 0.1 }}
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-sm font-bold ${
          isHighlighted
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-card text-foreground"
        }`}
      >
        {node.value}
      </motion.div>
      {(node.left || node.right) && (
        <div className="flex gap-2 mt-1">
          <div className="flex flex-col items-center min-w-[40px]">
            {node.left && (
              <>
                <div className="w-px h-3 bg-border" />
                <TreeVisualization
                  node={node.left}
                  highlighted={highlighted}
                  depth={depth + 1}
                  position="left"
                />
              </>
            )}
          </div>
          <div className="flex flex-col items-center min-w-[40px]">
            {node.right && (
              <>
                <div className="w-px h-3 bg-border" />
                <TreeVisualization
                  node={node.right}
                  highlighted={highlighted}
                  depth={depth + 1}
                  position="right"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BinaryTreeDemo() {
  const [tree, setTree] = useState<TreeNode | null>(() => {
    let root: TreeNode | null = null;
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => {
      root = insertNode(root, v);
    });
    return root;
  });
  const [inputValue, setInputValue] = useState(45);
  const [traversalType, setTraversalType] = useState<TraversalType>("inOrder");
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleInsert = () => {
    setTree((prev) => insertNode(prev, inputValue));
    setInputValue(Math.floor(Math.random() * 100));
  };

  const runTraversal = useCallback(async () => {
    if (!tree) return;
    setIsAnimating(true);
    setHighlighted(new Set());
    setTraversalResult([]);

    const traversalFn =
      traversalType === "inOrder"
        ? inOrder
        : traversalType === "preOrder"
        ? preOrder
        : postOrder;

    const result = traversalFn(tree);
    const visited = new Set<number>();

    for (let i = 0; i < result.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      visited.add(result[i]);
      setHighlighted(new Set(visited));
      setTraversalResult((prev) => [...prev, result[i]]);
    }

    setIsAnimating(false);
  }, [tree, traversalType]);

  const resetTree = () => {
    let root: TreeNode | null = null;
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => {
      root = insertNode(root, v);
    });
    setTree(root);
    setHighlighted(new Set());
    setTraversalResult([]);
  };

  return (
    <CodeDemo
      title="Binary Search Tree"
      description="Insert nodes, then run traversals and watch them animate through the tree."
      code={treeCode}
    >
      <div className="space-y-4">
        {/* Insert controls */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            min={1}
            max={99}
            className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button
            onClick={handleInsert}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
          >
            Insert
          </button>
          <button
            onClick={resetTree}
            className="rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        {/* Tree visualization */}
        <div className="rounded-lg bg-code-bg p-6 flex justify-center min-h-[200px] overflow-x-auto">
          {tree ? (
            <TreeVisualization node={tree} highlighted={highlighted} />
          ) : (
            <p className="text-sm text-muted-foreground italic self-center">
              Tree is empty. Insert a node to start.
            </p>
          )}
        </div>

        {/* Traversal controls */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["inOrder", "preOrder", "postOrder"] as TraversalType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTraversalType(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  traversalType === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "inOrder" ? "In-Order" : t === "preOrder" ? "Pre-Order" : "Post-Order"}
              </button>
            ))}
          </div>
          <button
            onClick={runTraversal}
            disabled={isAnimating || !tree}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {isAnimating ? "Traversing..." : "Run Traversal"}
          </button>
        </div>

        {/* Traversal result */}
        {traversalResult.length > 0 && (
          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs text-muted-foreground mb-2">
              {traversalType === "inOrder"
                ? "In-Order (Left → Root → Right)"
                : traversalType === "preOrder"
                ? "Pre-Order (Root → Left → Right)"
                : "Post-Order (Left → Right → Root)"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {traversalResult.map((val, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-md bg-accent/10 px-2 py-1 font-mono text-sm text-accent"
                >
                  {val}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CodeDemo>
  );
}
