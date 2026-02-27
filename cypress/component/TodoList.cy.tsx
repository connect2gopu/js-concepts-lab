import { TodoList } from "../../components/todo/TodoList";
import type { Todo } from "../../components/todo/useTodos";

const TODOS: Todo[] = [
  { id: "1", text: "Buy milk", completed: false },
  { id: "2", text: "Walk dog", completed: true },
  { id: "3", text: "Read book", completed: false },
];

const noop = () => {};

describe("TodoList", () => {
  it("shows the empty state message when todos array is empty", () => {
    cy.mount(<TodoList todos={[]} onToggle={noop} onDelete={noop} />);
    cy.contains("No todos yet. Add one above!");
  });

  it("renders one list item per todo", () => {
    cy.mount(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    cy.get("li").should("have.length", TODOS.length);
  });

  it("renders the text of each todo", () => {
    cy.mount(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    TODOS.forEach((todo) => cy.contains(todo.text));
  });

  it("does NOT show the empty state when todos exist", () => {
    cy.mount(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    cy.contains("No todos yet. Add one above!").should("not.exist");
  });

  it("screenshot — empty state", () => {
    cy.mount(<TodoList todos={[]} onToggle={noop} onDelete={noop} />);
    cy.screenshot("TodoList-empty");
  });

  it("screenshot — list with items", () => {
    cy.mount(<TodoList todos={TODOS} onToggle={noop} onDelete={noop} />);
    cy.screenshot("TodoList-with-items");
  });
});
