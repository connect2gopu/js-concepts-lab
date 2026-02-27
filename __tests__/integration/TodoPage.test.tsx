import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoPage from "@/app/todo/page";

// TodoPage is a "use client" component — it composes useTodos + TodoInput + TodoList.
// RTL renders it into jsdom and lets us interact like a real user, verifying
// that all the pieces wire together correctly end-to-end (within the fake DOM).

function setup() {
  const user = userEvent.setup();
  render(<TodoPage />);
  return {
    user,
    input: () => screen.getByRole("textbox", { name: /new todo text/i }),
    addButton: () => screen.getByRole("button", { name: /add/i }),
  };
}

describe("TodoPage", () => {
  it("shows the empty state message on first render", () => {
    setup();
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
  });

  it("typing a todo and clicking Add makes it appear in the list", async () => {
    const { user, input, addButton } = setup();
    await user.type(input(), "Buy groceries");
    await user.click(addButton());
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("empty state is gone after the first todo is added", async () => {
    const { user, input, addButton } = setup();
    await user.type(input(), "Buy groceries");
    await user.click(addButton());
    expect(screen.queryByText("No todos yet. Add one above!")).not.toBeInTheDocument();
  });

  it("clicking the checkbox applies line-through to the todo text", async () => {
    const { user, input, addButton } = setup();
    await user.type(input(), "Buy groceries");
    await user.click(addButton());
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Buy groceries")).toHaveClass("line-through");
  });

  it("clicking Delete removes the todo from the list", async () => {
    const { user, input, addButton } = setup();
    await user.type(input(), "Buy groceries");
    await user.click(addButton());
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
  });

  it("empty state reappears after the last todo is deleted", async () => {
    const { user, input, addButton } = setup();
    await user.type(input(), "Buy groceries");
    await user.click(addButton());
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
  });

  it("submitting an empty input does not add a todo", async () => {
    const { user, input } = setup();
    // Press Enter without typing anything
    await user.click(input());
    await user.keyboard("{Enter}");
    expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
  });
});
