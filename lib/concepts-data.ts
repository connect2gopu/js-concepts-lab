import {
  Code2,
  Zap,
  Shapes,
  FunctionSquare,
  Gauge,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

export interface ConceptInfo {
  title: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  color: string;
}

export const concepts: ConceptInfo[] = [
  {
    title: "TypeScript Lab",
    slug: "typescript",
    description:
      "Explore generics, utility types, conditional types, type guards, and discriminated unions with interactive examples.",
    icon: Code2,
    tags: ["Generics", "Utility Types", "Type Guards"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Async Patterns",
    slug: "async-patterns",
    description:
      "Visualize Promise chains, step through generators, handle cancellation with AbortController, and understand async/await.",
    icon: Zap,
    tags: ["Promises", "Generators", "AbortController"],
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Design Patterns",
    slug: "design-patterns",
    description:
      "Interactive demos of Observer, Factory, Strategy, and Singleton patterns with real-time state visualization.",
    icon: Shapes,
    tags: ["Observer", "Factory", "Strategy"],
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Functional Programming",
    slug: "functional",
    description:
      "Build pipelines with closures, currying, and composition. See data flow through each transformation step.",
    icon: FunctionSquare,
    tags: ["Closures", "Currying", "Pipe/Compose"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Performance Lab",
    slug: "performance",
    description:
      "Compare memoized vs unmemoized functions, visualize debounce/throttle, and render 10K items with virtualization.",
    icon: Gauge,
    tags: ["Memoization", "Debounce", "Virtualization"],
    color: "from-red-500 to-rose-500",
  },
  {
    title: "Data Structures",
    slug: "data-structures",
    description:
      "Animated visualizations of linked lists, binary trees, and sorting algorithms with step-through controls.",
    icon: GitBranch,
    tags: ["Sorting", "Trees", "Linked Lists"],
    color: "from-indigo-500 to-violet-500",
  },
];
