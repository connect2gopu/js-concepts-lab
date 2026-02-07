"use client";

import { Shapes } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { ObserverDemo } from "./demos/observer-demo";
import { FactoryDemo } from "./demos/factory-demo";
import { StrategyDemo } from "./demos/strategy-demo";
import { SingletonDemo } from "./demos/singleton-demo";

export default function DesignPatternsPage() {
  const tabs = [
    {
      id: "observer",
      label: "Observer",
      content: <ObserverDemo />,
    },
    {
      id: "factory",
      label: "Factory",
      content: <FactoryDemo />,
    },
    {
      id: "strategy",
      label: "Strategy",
      content: <StrategyDemo />,
    },
    {
      id: "singleton",
      label: "Singleton",
      content: <SingletonDemo />,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Shapes className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Design Patterns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive demos of Observer, Factory, Strategy, and Singleton
            patterns with real-time state visualization.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
