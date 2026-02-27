import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",    // uses Next.js webpack — handles @/ alias + PostCSS/Tailwind v4
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
    slowTestThreshold: 500,  // ms — marks tests as slow in the UI
  },
});
