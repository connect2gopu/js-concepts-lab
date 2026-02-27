import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoInput } from "@/components/todo/TodoInput";

// userEvent.setup() creates a user-event instance that simulates
// realistic browser events (pointer, keyboard, focus) rather than
// synthetic events. Always call this at the top of each test (or in beforeEach).
function setup(onAdd = jest.fn()) {
  const user = userEvent.setup();
  render(<TodoInput onAdd={onAdd} />);
  return {
    user,
    onAdd,
    input: screen.getByRole("textbox", { name: /new todo text/i }),
    button: screen.getByRole("button", { name: /add/i }),
  };
}

describe("TodoInput", () => {
  it("renders the text input with the correct placeholder", () => {
    setup();
    expect(screen.getByPlaceholderText("What needs to be done?")).toBeInTheDocument();
  });

  it("Add button is disabled when input is empty", () => {
    const { button } = setup();
    expect(button).toBeDisabled();
  });

  it("Add button becomes enabled after typing", async () => {
    const { user, input, button } = setup();
    await user.type(input, "Buy milk");
    expect(button).not.toBeDisabled();
  });

  it("calls onAdd with the typed text when Add is clicked", async () => {
    const { user, input, button, onAdd } = setup();
    await user.type(input, "Buy milk");
    await user.click(button);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("Buy milk");
  });

  it("clears the input after a successful submit", async () => {
    const { user, input, button } = setup();
    await user.type(input, "Buy milk");
    await user.click(button);
    expect(input).toHaveValue("");
  });

  it("does NOT call onAdd when input is only whitespace", async () => {
    const { user, input, onAdd } = setup();
    // Type spaces — button stays disabled so we press Enter directly
    await user.type(input, "   ");
    await user.keyboard("{Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });
});
