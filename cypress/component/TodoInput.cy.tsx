import { TodoInput } from "../../components/todo/TodoInput";

describe("TodoInput", () => {
  it("renders the input with the correct placeholder", () => {
    cy.mount(<TodoInput onAdd={cy.stub()} />);
    cy.get("input").should("have.attr", "placeholder", "What needs to be done?");
  });

  it("Add button is disabled when input is empty", () => {
    cy.mount(<TodoInput onAdd={cy.stub()} />);
    cy.get("button").should("be.disabled");
  });

  it("Add button becomes enabled after typing", () => {
    cy.mount(<TodoInput onAdd={cy.stub()} />);
    cy.get("input").type("Buy milk");
    cy.get("button").should("not.be.disabled");
  });

  it("calls onAdd with the typed text on submit", () => {
    const onAdd = cy.stub().as("onAdd");
    cy.mount(<TodoInput onAdd={onAdd} />);
    cy.get("input").type("Buy milk");
    cy.get("button").click();
    cy.get("@onAdd").should("have.been.calledWith", "Buy milk");
  });

  it("clears the input after a successful submit", () => {
    cy.mount(<TodoInput onAdd={cy.stub()} />);
    cy.get("input").type("Buy milk");
    cy.get("button").click();
    cy.get("input").should("have.value", "");
  });

  it("screenshot — default (empty) state", () => {
    cy.mount(<TodoInput onAdd={cy.stub()} />);
    cy.screenshot("TodoInput-default");
  });

  it("screenshot — filled state", () => {
    cy.mount(<TodoInput onAdd={cy.stub()} />);
    cy.get("input").type("Buy milk");
    cy.screenshot("TodoInput-filled");
  });
});
