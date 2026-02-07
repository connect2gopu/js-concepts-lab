"use client";

import { FunctionSquare } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { ClosuresDemo } from "./demos/closures-demo";
import { CurryingDemo } from "./demos/currying-demo";
import { PipeComposeDemo } from "./demos/pipe-compose-demo";
import { StateManagementDemo } from "./demos/state-management-demo";

export default function FunctionalPage() {
  const tabs = [
    {
      id: "closures",
      label: "Closures",
      content: <ClosuresDemo />,
    },
    {
      id: "currying",
      label: "Currying",
      content: <CurryingDemo />,
    },
    {
      id: "pipe-compose",
      label: "Pipe / Compose",
      content: <PipeComposeDemo />,
    },
    {
      id: "state",
      label: "State Management",
      content: <StateManagementDemo />,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <FunctionSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Functional Programming
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build pipelines with closures, currying, and composition. See data
            flow through each transformation step.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
