"use client";

import { Code2 } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { CodeDemo } from "@/components/code-demo";
import { GenericsDemo } from "./demos/generics-demo";
import { UtilityTypesDemo } from "./demos/utility-types-demo";
import { TypeGuardsDemo } from "./demos/type-guards-demo";
import { DiscriminatedUnionsDemo } from "./demos/discriminated-unions-demo";

export default function TypeScriptPage() {
  const tabs = [
    {
      id: "generics",
      label: "Generics",
      content: <GenericsDemo />,
    },
    {
      id: "utility-types",
      label: "Utility Types",
      content: <UtilityTypesDemo />,
    },
    {
      id: "type-guards",
      label: "Type Guards",
      content: <TypeGuardsDemo />,
    },
    {
      id: "discriminated-unions",
      label: "Discriminated Unions",
      content: <DiscriminatedUnionsDemo />,
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <Code2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            TypeScript Lab
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore advanced TypeScript concepts with interactive examples:
            generics, utility types, type guards, and discriminated unions.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
