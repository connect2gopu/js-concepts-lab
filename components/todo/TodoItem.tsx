"use client";

import type { Todo } from "./useTodos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
        className="h-4 w-4 cursor-pointer accent-accent"
      />
      <span
        className={`flex-1 text-sm ${
          todo.completed
            ? "line-through text-muted-foreground"
            : "text-card-foreground"
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
        className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        Delete
      </button>
    </li>
  );
}
