"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  topic: string;
  question: string;
  options: string[];
  correctIndices: number[];
  explanation: string;
}

interface Answer {
  questionIndex: number;
  selectedIndices: number[];
  isCorrect: boolean;
}

type QuizPhase = "question" | "answered" | "results";

const LETTER = ["A", "B", "C", "D"];

// ─── Static question sets ────────────────────────────────────────────────────

const QUESTION_SETS: QuizQuestion[][] = [
  // ── Set 0 ──────────────────────────────────────────────────────────────────
  [
    {
      topic: "Closures",
      question: "What is a closure in JavaScript?",
      options: [
        "A function that retains access to variables in its outer scope even after the outer function has returned",
        "A mechanism to terminate a function execution early using a return statement",
        "An object wrapper that prevents its properties from being mutated",
        "A design pattern for grouping related class methods together",
      ],
      correctIndices: [0],
      explanation:
        "A closure is created when an inner function captures variables from its outer lexical scope. Even after the outer function returns, the inner function retains a live reference to those variables. The other options describe early returns, Object.freeze, and OOP organization — none of which relate to closures.",
    },
    {
      topic: "Event Loop",
      question:
        "Which of the following correctly describe the JavaScript event loop?",
      options: [
        "It enables non-blocking operations despite JavaScript being single-threaded",
        "It spawns multiple OS threads to process async callbacks concurrently",
        "The microtask queue (Promise callbacks) is fully drained before each new macrotask",
        "setTimeout callbacks are processed before Promise callbacks in the same cycle",
      ],
      correctIndices: [0, 2],
      explanation:
        "The event loop lets single-threaded JS handle I/O without blocking (A) by offloading work to browser/Node APIs. After each macrotask completes, the entire microtask queue drains before the next macrotask runs (C). B is false — JS never runs parallel OS threads. D is the opposite of reality: Promise callbacks (microtasks) always run before the next setTimeout (macrotask).",
    },
    {
      topic: "Prototypes",
      question:
        "Which statements about prototypal inheritance in JavaScript are true?",
      options: [
        "Every object has an internal [[Prototype]] link forming a chain that ends at null",
        "Object.create(null) creates an object with no prototype chain",
        "ES6 classes introduce a fundamentally different inheritance system than prototypes",
        "Property lookup walks the prototype chain until the property is found or null is reached",
      ],
      correctIndices: [0, 1, 3],
      explanation:
        "All objects have a [[Prototype]] (A), Object.create(null) produces a truly prototypeless object (B), and property lookups walk the chain until found or null (D). C is false — ES6 classes are pure syntactic sugar over the existing prototype mechanism and do not replace it.",
    },
    {
      topic: "var / let / const",
      question: "Which of the following are true about var in JavaScript?",
      options: [
        "var is function-scoped (or globally scoped if declared outside any function)",
        "var declarations are hoisted and automatically initialized to undefined",
        "var respects block boundaries like if and for blocks",
        "The same var name can be re-declared within the same scope without an error",
      ],
      correctIndices: [0, 1, 3],
      explanation:
        "var is function-scoped (A), hoisted to the top of its scope and set to undefined before code runs (B), and can be re-declared freely in the same scope (D). C is false — unlike let/const, var leaks out of blocks like if or for; only function boundaries contain it.",
    },
    {
      topic: "Promises",
      question:
        "Which Promise combinators short-circuit as soon as one input promise settles?",
      options: [
        "Promise.all — rejects as soon as any input promise rejects",
        "Promise.allSettled — always waits for every promise to settle",
        "Promise.race — settles with the outcome of whichever promise settles first",
        "Promise.any — rejects only when every input promise has rejected",
      ],
      correctIndices: [0, 2],
      explanation:
        "Promise.all short-circuits on the first rejection (A) and Promise.race short-circuits on the very first settlement, resolved or rejected (C). Promise.allSettled always waits for all promises (B). Promise.any waits until one resolves or all reject — it does not short-circuit on individual rejections (D).",
    },
  ],

  // ── Set 1 ──────────────────────────────────────────────────────────────────
  [
    {
      topic: "Closures",
      question: "Which are practical use cases for closures in JavaScript?",
      options: [
        "Creating private variables that cannot be accessed from outside the function",
        "Building function factories that return customized functions",
        "Replacing the prototype chain as a means of object inheritance",
        "Implementing memoization by caching results in an enclosing scope",
      ],
      correctIndices: [0, 1, 3],
      explanation:
        "Closures enable private state (A) since inner variables aren't accessible outside, function factories (B) where a closure captures configuration, and memoization (D) where a cache object lives in the closure. C is wrong — closures and prototype chains solve entirely different problems and neither replaces the other.",
    },
    {
      topic: "Event Loop",
      question:
        "Which of the following are processed as microtasks in JavaScript?",
      options: [
        "Promise .then() / .catch() / .finally() callbacks",
        "setTimeout and setInterval callbacks",
        "queueMicrotask() callbacks",
        "MutationObserver callbacks",
      ],
      correctIndices: [0, 2, 3],
      explanation:
        "Promise callbacks (A), queueMicrotask (C), and MutationObserver (D) are all microtasks — processed after each task, before any new macrotask. setTimeout and setInterval (B) schedule macrotasks, which run only once the microtask queue is fully empty.",
    },
    {
      topic: "Prototypes",
      question:
        "Which are valid ways to read an object's [[Prototype]] in JavaScript?",
      options: [
        "Object.getPrototypeOf(obj) — the standard ES5+ method",
        "obj.__proto__ — a legacy accessor supported in most environments",
        "obj.prototype — available on all objects",
        "Reflect.getPrototypeOf(obj) — the Reflect API equivalent",
      ],
      correctIndices: [0, 1, 3],
      explanation:
        "Object.getPrototypeOf (A), obj.__proto__ (B, legacy but widely supported), and Reflect.getPrototypeOf (D) all retrieve the internal [[Prototype]]. C is wrong — obj.prototype only exists on constructor functions and points to the object that becomes instances' [[Prototype]]. On a plain object it is undefined.",
    },
    {
      topic: "var / let / const",
      question: "Which of the following are true about let and const?",
      options: [
        "Both let and const are block-scoped",
        "Both are hoisted but remain in the Temporal Dead Zone until their declaration is reached",
        "const makes objects and arrays fully immutable including their contents",
        "let allows rebinding of the variable; const does not",
      ],
      correctIndices: [0, 1, 3],
      explanation:
        "Both are block-scoped (A) and hoisted but uninitialised — accessing them before their declaration throws a ReferenceError, the Temporal Dead Zone (B). const prevents reassignment of the binding (D). C is false: const only prevents rebinding; object/array contents can still be mutated. Use Object.freeze for shallow immutability.",
    },
    {
      topic: "Promises",
      question:
        "Which of the following are true about Promise.allSettled?",
      options: [
        "It waits for all promises to settle, whether they resolve or reject",
        "It rejects immediately when any input promise rejects",
        "Each result object has a status property of 'fulfilled' or 'rejected'",
        "Fulfilled results include a value property; rejected results include a reason property",
      ],
      correctIndices: [0, 2, 3],
      explanation:
        "Promise.allSettled always waits for every promise (A) and returns result objects with status: 'fulfilled' or 'rejected' (C), plus value for fulfilled or reason for rejected (D). B describes Promise.all — Promise.allSettled never rejects due to individual input rejections, making it ideal when you need all outcomes regardless of success.",
    },
  ],
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  phase,
  correctSoFar,
}: {
  current: number;
  total: number;
  phase: QuizPhase;
  correctSoFar: number;
}) {
  const filled = ((current + (phase === "answered" ? 1 : 0)) / total) * 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Question {current + 1} of {total}
        </span>
        <span className="text-xs text-muted-foreground">
          {correctSoFar} correct so far
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500"
          style={{ width: `${filled}%` }}
        />
      </div>
    </div>
  );
}

function ResultsScreen({
  questions,
  answers,
  score,
  onTryAgain,
}: {
  questions: QuizQuestion[];
  answers: Answer[];
  score: number;
  onTryAgain: () => void;
}) {
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const passing = pct >= 60;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Your Score
        </p>
        <p
          className={cn(
            "text-6xl font-bold mb-1",
            passing ? "text-success" : "text-error"
          )}
        >
          {score}/{total}
        </p>
        <p className="text-lg text-muted-foreground">{pct}%</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {pct === 100
            ? "Perfect score! Excellent JavaScript knowledge."
            : pct >= 80
            ? "Great work! You have a solid grasp of these concepts."
            : pct >= 60
            ? "Good effort — review the topics you missed."
            : "Keep studying! These are core JavaScript fundamentals."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">
            Per-topic breakdown
          </p>
        </div>
        <div className="divide-y divide-border">
          {questions.map((q, i) => {
            const answer = answers[i];
            const correct = answer?.isCorrect ?? false;
            return (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {q.topic}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {q.question}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    correct
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  )}
                >
                  {correct ? "Correct" : "Incorrect"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onTryAgain}
        className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Try again →
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QuizDemo() {
  const [setIndex, setSetIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUESTION_SETS[0]);
  const [phase, setPhase] = useState<QuizPhase>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const startQuiz = useCallback(() => {
    const next = (setIndex + 1) % QUESTION_SETS.length;
    setSetIndex(next);
    setQuestions(QUESTION_SETS[next]);
    setCurrentIndex(0);
    setSelectedOptions([]);
    setAnswers([]);
    setPhase("question");
  }, [setIndex]);

  const handleToggle = useCallback(
    (optionIndex: number) => {
      if (phase !== "question") return;
      setSelectedOptions((prev) =>
        prev.includes(optionIndex)
          ? prev.filter((i) => i !== optionIndex)
          : [...prev, optionIndex]
      );
    },
    [phase]
  );

  const handleSubmit = useCallback(() => {
    if (selectedOptions.length === 0) return;
    const correct = questions[currentIndex].correctIndices;
    const isCorrect =
      selectedOptions.length === correct.length &&
      selectedOptions.every((i) => correct.includes(i));
    setAnswers((prev) => [
      ...prev,
      { questionIndex: currentIndex, selectedIndices: selectedOptions, isCorrect },
    ]);
    setPhase("answered");
  }, [selectedOptions, questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOptions([]);
      setPhase("question");
    } else {
      setPhase("results");
    }
  }, [currentIndex, questions.length]);

  const getOptionClass = (optionIndex: number): string => {
    const base =
      "w-full flex items-center gap-3 rounded-lg border p-3.5 text-sm text-left transition-colors";

    if (phase !== "answered") {
      const isSelected = selectedOptions.includes(optionIndex);
      return cn(
        base,
        "cursor-pointer",
        isSelected
          ? "border-accent bg-accent-light text-accent font-medium"
          : "border-border bg-background text-foreground hover:border-accent/50 hover:bg-muted"
      );
    }

    const correct = questions[currentIndex].correctIndices;
    const isCorrect = correct.includes(optionIndex);
    const lastAnswer = answers.at(-1);
    const isSelected = lastAnswer?.selectedIndices.includes(optionIndex) ?? false;

    if (isCorrect && isSelected) {
      return cn(base, "cursor-default border-success/50 bg-success/10 text-success font-medium");
    }
    if (isCorrect && !isSelected) {
      // Missed — correct but not picked
      return cn(base, "cursor-default border-dashed border-success/60 bg-success/5 text-success font-medium");
    }
    if (!isCorrect && isSelected) {
      return cn(base, "cursor-default border-error/50 bg-error/10 text-error font-medium");
    }
    return cn(base, "cursor-default border-border bg-background text-muted-foreground opacity-40");
  };

  const getBadgeClass = (optionIndex: number): string => {
    const base =
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border";

    if (phase !== "answered") {
      const isSelected = selectedOptions.includes(optionIndex);
      return cn(
        base,
        isSelected
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-background text-muted-foreground"
      );
    }

    const correct = questions[currentIndex].correctIndices;
    const isCorrect = correct.includes(optionIndex);
    const lastAnswer = answers.at(-1);
    const isSelected = lastAnswer?.selectedIndices.includes(optionIndex) ?? false;

    if (isCorrect && isSelected)
      return cn(base, "border-success bg-success text-white");
    if (isCorrect && !isSelected)
      return cn(base, "border-success text-success bg-transparent");
    if (!isCorrect && isSelected)
      return cn(base, "border-error bg-error text-white");
    return cn(base, "border-border bg-background text-muted-foreground opacity-40");
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const currentQuestion = questions[currentIndex];
  const isMultiSelect = currentQuestion?.correctIndices.length > 1;
  const lastAnswer = answers.at(-1);

  return (
    <div className="mx-auto max-w-2xl">
      {(phase === "question" || phase === "answered") && currentQuestion && (
        <div>
          <ProgressBar
            current={currentIndex}
            total={questions.length}
            phase={phase}
            correctSoFar={score}
          />

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold">
                {currentQuestion.topic}
              </span>
              <span className="inline-block rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs font-medium">
                {isMultiSelect ? "Select all that apply" : "Select one"}
              </span>
            </div>

            <p className="text-base font-medium text-foreground mb-5 leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="space-y-2.5">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  className={getOptionClass(i)}
                  onClick={() => handleToggle(i)}
                  disabled={phase === "answered"}
                >
                  <span className={getBadgeClass(i)}>{LETTER[i]}</span>
                  <span className="flex-1">{option}</span>
                </button>
              ))}
            </div>

            {phase === "answered" && (
              <div
                className={cn(
                  "mt-5 rounded-lg border p-4",
                  lastAnswer?.isCorrect
                    ? "border-success/30 bg-success/5"
                    : "border-error/30 bg-error/5"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold mb-1.5",
                    lastAnswer?.isCorrect ? "text-success" : "text-error"
                  )}
                >
                  {lastAnswer?.isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {!lastAnswer?.isCorrect && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Correct answer
                    {currentQuestion.correctIndices.length > 1 ? "s" : ""}:{" "}
                    <span className="font-semibold text-foreground">
                      {currentQuestion.correctIndices
                        .map((i) => LETTER[i])
                        .join(", ")}
                    </span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {phase === "question" && (
            <button
              disabled={selectedOptions.length === 0}
              onClick={handleSubmit}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}

          {phase === "answered" && (
            <button
              onClick={handleNext}
              className="mt-4 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              {currentIndex < questions.length - 1
                ? "Next question →"
                : "See results →"}
            </button>
          )}
        </div>
      )}

      {phase === "results" && (
        <ResultsScreen
          questions={questions}
          answers={answers}
          score={score}
          onTryAgain={startQuiz}
        />
      )}
    </div>
  );
}
