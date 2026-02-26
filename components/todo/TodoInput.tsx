"use client";

import { useState } from "react";

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        aria-label="New todo text"
        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity disabled:opacity-40 hover:opacity-90"
      >
        Add
      </button>
    </form>
  );
}
