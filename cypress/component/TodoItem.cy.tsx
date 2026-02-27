import { TodoItem } from "../../components/todo/TodoItem";
import type { Todo } from "../../components/todo/useTodos";

const TODO_ACTIVE: Todo = { id: "1", text: "Buy milk", completed: false };
const TODO_DONE: Todo = { id: "2", text: "Walk dog", completed: true };

describe("TodoItem", () => {
  it("renders the todo text", () => {
    cy.mount(
      <TodoItem todo={TODO_ACTIVE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.contains("Buy milk");
  });

  it("checkbox is unchecked for an active todo", () => {
    cy.mount(
      <TodoItem todo={TODO_ACTIVE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.get("input[type=checkbox]").should("not.be.checked");
  });

  it("checkbox is checked for a completed todo", () => {
    cy.mount(
      <TodoItem todo={TODO_DONE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.get("input[type=checkbox]").should("be.checked");
  });

  it("clicking the checkbox calls onToggle with the todo id", () => {
    const onToggle = cy.stub().as("onToggle");
    cy.mount(
      <TodoItem todo={TODO_ACTIVE} onToggle={onToggle} onDelete={cy.stub()} />
    );
    cy.get("input[type=checkbox]").click();
    cy.get("@onToggle").should("have.been.calledWith", TODO_ACTIVE.id);
  });

  it("clicking Delete calls onDelete with the todo id", () => {
    const onDelete = cy.stub().as("onDelete");
    cy.mount(
      <TodoItem todo={TODO_ACTIVE} onToggle={cy.stub()} onDelete={onDelete} />
    );
    cy.contains("button", "Delete").click();
    cy.get("@onDelete").should("have.been.calledWith", TODO_ACTIVE.id);
  });

  it("active todo text does NOT have line-through", () => {
    cy.mount(
      <TodoItem todo={TODO_ACTIVE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.contains(TODO_ACTIVE.text).should("not.have.class", "line-through");
  });

  it("completed todo text has line-through", () => {
    cy.mount(
      <TodoItem todo={TODO_DONE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.contains(TODO_DONE.text).should("have.class", "line-through");
  });

  it("screenshot — active state", () => {
    cy.mount(
      <TodoItem todo={TODO_ACTIVE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.screenshot("TodoItem-active");
  });

  it("screenshot — completed state", () => {
    cy.mount(
      <TodoItem todo={TODO_DONE} onToggle={cy.stub()} onDelete={cy.stub()} />
    );
    cy.screenshot("TodoItem-completed");
  });
});
