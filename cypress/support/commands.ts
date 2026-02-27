import React from "react";
import ReactDOM from "react-dom/client";

// cypress/react's built-in mount doesn't handle React 19's root lifecycle
// correctly — Cypress clears the DOM before React finishes cleanup, causing
// "Cannot read properties of null (reading 'parentNode')".
//
// Solution: manage the React root ourselves so we unmount *before* Cypress
// resets the DOM, giving React 19 a clean teardown each time.

let _root: ReactDOM.Root | null = null;

Cypress.Commands.add("mount", (component: React.ReactNode) => {
  const container = document.querySelector("[data-cy-root]") as HTMLElement;
  if (!_root) {
    _root = ReactDOM.createRoot(container);
  }
  _root.render(component);
  return cy.wrap(container);
});

// Unmount after every test so React 19 cleans up before Cypress resets the DOM.
afterEach(() => {
  if (_root) {
    _root.unmount();
    _root = null;
  }
});

declare global {
  namespace Cypress {
    interface Chainable {
      mount(component: React.ReactNode): Chainable<HTMLElement>;
    }
  }
}
