"use client";

import type { Metadata } from "next";
import { useTodos } from "@/components/todo/useTodos";
import { TodoInput } from "@/components/todo/TodoInput";
import { TodoList } from "@/components/todo/TodoList";

export default function TodoPage() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Todo</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        A simple CRUD app — built to learn unit, integration, and E2E testing.
      </p>

      <div className="mb-6">
        <TodoInput onAdd={addTodo} />
      </div>

      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />

      {todos.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground text-right">
          {todos.filter((t) => t.completed).length} / {todos.length} completed
        </p>
      )}
    </div>
  );
}
