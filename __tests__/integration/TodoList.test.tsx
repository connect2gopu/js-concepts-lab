import { render, screen } from "@testing-library/react";
import { TodoList } from "@/components/todo/TodoList";
import type { Todo } from "@/components/todo/useTodos";

const TODOS: Todo[] = [
  { id: "1", text: "Buy milk", completed: false },
  { id: "2", text: "Walk dog", completed: true },
  { id: "3", text: "Read book", completed: false },
];

const noop = jest.fn();

describe("TodoList", () => {
  it("shows the empty state message when todos array is empty", () => {
    render(<TodoList todos={[]} onToggle={noop} onDelete={noop} />);
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
  });

  it("does NOT show the empty state when todos exist", () => {
    render(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    // queryByText returns null (does not throw) when element is absent
    expect(screen.queryByText("No todos yet. Add one above!")).not.toBeInTheDocument();
  });

  it("renders one list item per todo", () => {
    render(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(TODOS.length);
  });

  it("renders the text of each todo", () => {
    render(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    for (const todo of TODOS) {
      expect(screen.getByText(todo.text)).toBeInTheDocument();
    }
  });
});
