# Testing Learning Plan: Unit → Integration → E2E

## Context

- **Project**: `js-concepts-lab` — Next.js 16 + React 19 + TypeScript + Zustand + Tailwind CSS 4
- **Worktree**: `claude/funny-sammet`
- **Feature to build**: Todo CRUD app at `/todo` route
- **Testing tools**: Jest + jsdom, React Testing Library (RTL), Cypress (component visual), Playwright (E2E)
- **State management for Todo**: Local `useState` (not Zustand)
- **Learning approach**: One layer at a time, in order (beginner-friendly)
- **Goal**: Learning first, quality second

## Current Project State

No tests exist yet. No testing dependencies installed. The `/todo` route does not exist yet.

Existing project structure:
```
app/
  concepts/         ← async-patterns, design-patterns, functional, performance, data-structures, typescript
  playground/
  page.tsx
components/
  ui/
  code-demo.tsx
  concept-card.tsx
  sidebar.tsx
  theme-provider.tsx
lib/
  concepts-data.ts
  store.ts          ← Zustand stores (usePipelineStore, useCounterStore)
  utils.ts
```

## What We're Building (Phase 0 — no tests yet)

### File structure to create
```
app/todo/
  page.tsx

components/todo/
  TodoInput.tsx     ← text input + add button
  TodoItem.tsx      ← single todo row (checkbox, label, delete)
  TodoList.tsx      ← renders list of TodoItems
  useTodos.ts       ← custom hook: useState + CRUD logic
```

### Todo type
```ts
type Todo = { id: string; text: string; completed: boolean }
```

### Operations in `useTodos`
- `addTodo(text: string)`
- `toggleTodo(id: string)`
- `deleteTodo(id: string)`
- `editTodo(id: string, newText: string)`

---

## Phase 1 — Unit Tests (Jest + jsdom)

**Concept**: Test pure logic in isolation. No browser, no rendering.

### Install
```bash
npm install -D jest ts-jest @types/jest jest-environment-jsdom
```

### Config files to create
- `jest.config.ts`
- `jest.setup.ts`

### What to test: `__tests__/unit/useTodos.test.ts`
- `addTodo` — adds item with correct shape
- `toggleTodo` — flips `completed`
- `deleteTodo` — removes correct item
- `editTodo` — updates text, keeps ID
- Edge cases: empty string, non-existent ID, duplicate text

### Key concepts
- `describe` / `it` / `expect`
- Matchers: `toBe`, `toEqual`, `toHaveLength`, `toContain`, `toThrow`
- Arrange → Act → Assert pattern

---

## Phase 2 — Integration Tests (Jest + React Testing Library)

**Concept**: Render components in fake DOM (jsdom), interact like a user. Fast, no real browser.

### Install
```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### What to test

| File | Component | Tests |
|------|-----------|-------|
| `__tests__/integration/TodoInput.test.tsx` | `TodoInput` | Typing, clicking Add, blocking empty input |
| `__tests__/integration/TodoItem.test.tsx` | `TodoItem` | Checkbox toggle, delete button, text render |
| `__tests__/integration/TodoList.test.tsx` | `TodoList` | Renders N items, empty state message |
| `__tests__/integration/TodoPage.test.tsx` | Full page | Add → appears, toggle → strikethrough, delete → gone |

### Key concepts
- `render`, `screen`, `fireEvent` vs `userEvent`
- Queries: `getByRole`, `getByText`, `queryByText`, `findByText`
- `jest-dom` matchers: `toBeInTheDocument`, `toBeChecked`, `toHaveClass`
- Query like a user, not like a developer (no IDs, no implementation details)
- Mocking hooks, `act()`, async updates

---

## Phase 3 — Component Visual Testing (Cypress)

**Concept**: Mount a single component in a real browser (no full page/routing). Test visual appearance, interactions, and styles in isolation — the best of RTL + real rendering.

> **Why Cypress here, not RTL?**
> RTL uses jsdom (fake DOM — no real CSS, no layout). Cypress Component Testing runs in a real Chromium browser, so you see actual computed styles, real Tailwind classes, real hover states. Perfect for visual/UI validation per component.

### Install
```bash
npm install -D cypress
npx cypress open   # choose "Component Testing" → Next.js
```

### Config file to create
- `cypress.config.ts`

### What to test: `cypress/component/`

| File | Component | Tests |
|------|-----------|-------|
| `TodoInput.cy.tsx` | `TodoInput` | Renders correctly, disabled state style, input focus style |
| `TodoItem.cy.tsx` | `TodoItem` | Unchecked vs checked visual diff, strikethrough style, delete button hover |
| `TodoList.cy.tsx` | `TodoList` | Empty state UI, scrollable list with many items |

### Key concepts
- `cy.mount()` — mounts a single component (no full app)
- `cy.get()`, `cy.contains()`, `cy.should('have.css', ...)`
- Screenshot / visual diffing with `cy.screenshot()`
- Real Tailwind styles are applied (unlike jsdom)
- `cy.realHover()` for hover state testing (with `cypress-real-events`)
- Difference between Cypress Component Testing vs Cypress E2E

---

## Phase 4 — E2E Tests (Playwright)

**Concept**: Real browser, real Next.js server, real clicks across the full app. Slowest but highest confidence.

### Install
```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Config file to create
- `playwright.config.ts`

### What to test: `e2e/todo.spec.ts`

**Happy path**
- Visit `/todo` → empty state visible
- Type "Buy groceries" → click Add → item appears
- Click checkbox → item gets strikethrough
- Click delete → item disappears

**Edge cases**
- Submit empty input → no new item added
- Add 50 todos → all render
- Rapid clicking Add multiple times

**Visual / UI**
- `toHaveScreenshot()` baseline comparison (full page)
- Completed item has correct styling
- Empty state placeholder is visible

**Accessibility**
- Tab order is logical through the page
- Checkbox has an accessible label
- Delete button has `aria-label`
- `@axe-core/playwright` for automated a11y audit

### Key concepts
- `page.goto`, `page.fill`, `page.click`, `page.locator`
- Playwright auto-waiting (no manual `sleep`)
- `expect(locator).toBeVisible()`, `toHaveText()`, `toBeChecked()`
- `toHaveScreenshot()` for visual regression
- `test.describe`, `test.beforeEach`
- Running against `next dev` (dev mode) vs `next build && next start` (prod mode)

---

## Final File Structure (end state)
```
app/todo/
  page.tsx
components/todo/
  TodoInput.tsx
  TodoItem.tsx
  TodoList.tsx
  useTodos.ts
__tests__/
  unit/
    useTodos.test.ts          ← Jest (pure logic)
  integration/
    TodoInput.test.tsx        ← Jest + RTL (fake DOM)
    TodoItem.test.tsx
    TodoList.test.tsx
    TodoPage.test.tsx
cypress/
  component/
    TodoInput.cy.tsx          ← Cypress Component (real browser, isolated)
    TodoItem.cy.tsx
    TodoList.cy.tsx
e2e/
  todo.spec.ts                ← Playwright (full app, real browser)
jest.config.ts
jest.setup.ts
cypress.config.ts
playwright.config.ts
```

---

## Tool Responsibilities (who does what)

| Tool | Layer | Real Browser? | What it's best for |
|------|-------|---------------|-------------------|
| Jest + jsdom | Unit | ✗ | Pure logic, hooks, utility functions |
| Jest + RTL | Integration | ✗ | Component behavior, user interaction flow |
| Cypress Component | Visual/Component | ✓ | Real styles, Tailwind, hover states, visual isolation |
| Playwright | E2E | ✓ | Full user journeys, routing, a11y, visual regression |

---

## Testing Trophy Mental Model (updated)
```
           /‾‾‾‾‾‾‾‾‾‾‾\
          /  E2E (few)   \        ← Playwright · full app · high confidence
         /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
        / Component Visual \      ← Cypress · real browser · isolated UI
       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
      /  Integration (most)  \    ← RTL · fake DOM · component behavior
     /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
    /    Unit (many/fast)      \  ← Jest · instant · pure logic
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
  /  Static (TypeScript/ESLint)  \ ← already in the project
```

---

## Resume Checklist

- [ ] Phase 0: Build Todo feature (`useTodos`, `TodoInput`, `TodoItem`, `TodoList`, `/todo` page)
- [ ] Phase 1: Set up Jest, write unit tests for `useTodos` pure logic
- [ ] Phase 2: Set up RTL, write integration tests component by component
- [ ] Phase 3: Set up Cypress, write component visual tests (real styles, hover, screenshots)
- [ ] Phase 4: Set up Playwright, write E2E tests (happy path, edge cases, visual regression, a11y)
