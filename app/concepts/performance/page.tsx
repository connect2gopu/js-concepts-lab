"use client";

import { Gauge } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { MemoizationDemo } from "./demos/memoization-demo";
import { DebounceThrottleDemo } from "./demos/debounce-throttle-demo";
import { VirtualizationDemo } from "./demos/virtualization-demo";

export default function PerformancePage() {
  const tabs = [
    {
      id: "memoization",
      label: "Memoization",
      content: <MemoizationDemo />,
    },
    {
      id: "debounce-throttle",
      label: "Debounce/Throttle",
      content: <DebounceThrottleDemo />,
    },
    {
      id: "virtualization",
      label: "Virtualization",
      content: <VirtualizationDemo />,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
          <Gauge className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Performance Lab
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare memoized vs unmemoized functions, visualize debounce/throttle,
            and render 10K items with virtualization.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
