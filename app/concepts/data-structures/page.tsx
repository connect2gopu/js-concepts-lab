"use client";

import { GitBranch } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { SortingVisualizerDemo } from "./demos/sorting-visualizer-demo";
import { BinaryTreeDemo } from "./demos/binary-tree-demo";
import { LinkedListDemo } from "./demos/linked-list-demo";

export default function DataStructuresPage() {
  const tabs = [
    {
      id: "sorting",
      label: "Sorting",
      content: <SortingVisualizerDemo />,
    },
    {
      id: "binary-tree",
      label: "Binary Tree",
      content: <BinaryTreeDemo />,
    },
    {
      id: "linked-list",
      label: "Linked List",
      content: <LinkedListDemo />,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
          <GitBranch className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Data Structures
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Animated visualizations of sorting algorithms, binary trees, and
            linked lists with step-through controls.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
