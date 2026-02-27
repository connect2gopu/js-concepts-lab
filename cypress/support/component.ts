// Runs before every component test file.
// Import commands first (registers cy.mount), then global CSS so
// Tailwind v4 + CSS variable theme applies to every mounted component.
import "./commands";
// Styles are injected via Tailwind CDN in component-index.html — importing
// globals.css through webpack crashes because next-style-loader calls
// parentNode on a null element inside the Cypress iframe.

// Slow mode: add a delay after every Cypress command so tests are easier to follow visually.
// Change slowMo to 0 to disable.
const slowMo = 1000; // ms between commands
if (slowMo > 0) {
  let waiting = false;
  Cypress.on("command:end", (cmd) => {
    const name = cmd.get("name") as string;
    const args = cmd.get("args") as unknown[];
    // When our specific slow-mo wait finishes, clear the flag and stop
    if (name === "wait" && args[0] === slowMo) {
      waiting = false;
      return;
    }
    // Skip any other wait commands and skip if already waiting
    if (waiting || name === "wait") return;
    waiting = true;
    cy.wait(slowMo, { log: false });
  });
}
