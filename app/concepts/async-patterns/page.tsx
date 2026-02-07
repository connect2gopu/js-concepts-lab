"use client";

import { Zap } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { PromiseVisualizerDemo } from "./demos/promise-visualizer-demo";
import { GeneratorDemo } from "./demos/generator-demo";
import { AbortControllerDemo } from "./demos/abort-controller-demo";

export default function AsyncPatternsPage() {
  const tabs = [
    {
      id: "promises",
      label: "Promise Chains",
      content: <PromiseVisualizerDemo />,
    },
    {
      id: "generators",
      label: "Generators",
      content: <GeneratorDemo />,
    },
    {
      id: "abort",
      label: "AbortController",
      content: <AbortControllerDemo />,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Async Patterns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize Promise chains, step through generators, and handle
            cancellation with AbortController.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
