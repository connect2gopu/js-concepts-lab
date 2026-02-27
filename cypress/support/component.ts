// Runs before every component test file.
// Import commands first (registers cy.mount), then global CSS so
// Tailwind v4 + CSS variable theme applies to every mounted component.
import "./commands";
// globals.css is NOT imported here — Next.js's style-loader crashes in Cypress's
// iframe because target.parentNode is null at support-file load time.
// CSS variables are inlined in component-index.html instead.
