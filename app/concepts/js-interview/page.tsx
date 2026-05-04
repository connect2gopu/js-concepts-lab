"use client";

import { HelpCircle } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { QuizDemo } from "./demos/quiz-demo";

export default function JsInterviewPage() {
  const tabs = [
    {
      id: "quiz",
      label: "Quiz",
      content: <QuizDemo />,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            JS Interview Questions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated multiple-choice questions on JavaScript fundamentals.
            Each &ldquo;Try again&rdquo; regenerates fresh options via Claude.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
