import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "@/components/todo/TodoItem";
import type { Todo } from "@/components/todo/useTodos";

const TODO_ACTIVE: Todo = { id: "1", text: "Buy milk", completed: false };
const TODO_DONE: Todo = { id: "2", text: "Walk dog", completed: true };

function setup(todo: Todo, onToggle = jest.fn(), onDelete = jest.fn()) {
  const user = userEvent.setup();
  render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);
  return { user, onToggle, onDelete };
}

describe("TodoItem", () => {
  it("renders the todo text", () => {
    setup(TODO_ACTIVE);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("checkbox is unchecked when completed is false", () => {
    setup(TODO_ACTIVE);
    // RTL finds the checkbox by its aria-label (set in TodoItem)
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("checkbox is checked when completed is true", () => {
    setup(TODO_DONE);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("clicking checkbox calls onToggle with the todo id", async () => {
    const { user, onToggle } = setup(TODO_ACTIVE);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(TODO_ACTIVE.id);
  });

  it("clicking Delete calls onDelete with the todo id", async () => {
    const { user, onDelete } = setup(TODO_ACTIVE);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(TODO_ACTIVE.id);
  });

  it("todo text has line-through class when completed", () => {
    setup(TODO_DONE);
    expect(screen.getByText(TODO_DONE.text)).toHaveClass("line-through");
  });

  it("todo text does NOT have line-through class when not completed", () => {
    setup(TODO_ACTIVE);
    expect(screen.getByText(TODO_ACTIVE.text)).not.toHaveClass("line-through");
  });
});
