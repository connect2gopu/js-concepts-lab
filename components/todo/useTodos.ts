import { useState } from "react";

export type Priority = "low" | "medium" | "high";
export type Todo = { id: string; text: string; completed: boolean; priority: Priority };

// --- Pure reducer functions (testable without React) ---

export function addTodoReducer(todos: Todo[], text: string, id: string): Todo[] {
  const trimmed = text.trim();
  if (!trimmed) return todos;
  return [...todos, { id, text: trimmed, completed: false, priority: "medium" as Priority }];
}

export function toggleTodoReducer(todos: Todo[], id: string): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
}

export function deleteTodoReducer(todos: Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id);
}

export function editTodoReducer(todos: Todo[], id: string, newText: string): Todo[] {
  const trimmed = newText.trim();
  if (!trimmed) return todos;
  return todos.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
}

// --- Hook (composes the pure functions with useState) ---

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function addTodo(text: string) {
    setTodos((prev) => addTodoReducer(prev, text, crypto.randomUUID()));
  }

  function toggleTodo(id: string) {
    setTodos((prev) => toggleTodoReducer(prev, id));
  }

  function deleteTodo(id: string) {
    setTodos((prev) => deleteTodoReducer(prev, id));
  }

  function editTodo(id: string, newText: string) {
    setTodos((prev) => editTodoReducer(prev, id, newText));
  }

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo };
}
