import {
  addTodoReducer,
  toggleTodoReducer,
  deleteTodoReducer,
  editTodoReducer,
  type Todo,
} from "@/components/todo/useTodos";

// Shared fixture — a few todos to use as starting state across tests
const BASE: Todo[] = [
  { id: "1", text: "Buy milk",    completed: false },
  { id: "2", text: "Walk dog",    completed: true  },
  { id: "3", text: "Read book",   completed: false },
];

// Helper to clone the fixture so tests don't share mutable state
const base = () => BASE.map((t) => ({ ...t }));

// ─────────────────────────────────────────────────────────────
// addTodoReducer
// ─────────────────────────────────────────────────────────────
describe("addTodoReducer", () => {
  it("appends a new todo with the correct shape", () => {
    const original = base();
    const originalLength = original.length;
    const newTodo: Todo = {
      id: '99',
      text: 'new todo',
      completed: false
    };

    const result = addTodoReducer(original, newTodo.text, newTodo.id);

    const lastTodo = result[result.length-1];
    expect(result).toHaveLength(originalLength+1);
    expect(lastTodo).toEqual(newTodo)

  });

  it("trims leading/trailing whitespace from text", () => {
    let newTask: Todo = {
      text: '    buy food   ',
      id: '99',
      completed: false
    }

    let original = base();
    const result = addTodoReducer(original, newTask.text, newTask.id);
    let lastAddedTask = result[result.length-1];

    expect(lastAddedTask?.text).toBe(newTask.text.trim())
  });

  it("does NOT add a todo when text is an empty string", () => {
    let newTask: Todo = {
      text: '',
      id: '99',
      completed: false
    }

    let original = base();
    const result = addTodoReducer(original, newTask.text, newTask.id);
    
    expect(result).toHaveLength(original.length)
  });

  it("does NOT add a todo when text is only whitespace", () => {
    let newTask: Todo = {
      text: ' ',
      id: '99',
      completed: false
    }

    let original = base();
    const result = addTodoReducer(original, newTask.text, newTask.id);
    
    expect(result).toHaveLength(original.length)
  });

  it("does not mutate the original array", () => {
    let newTask: Todo = {
      text: 'new tasks',
      id: '99',
      completed: false
    }

    let original = base();
    let originalLength = original.length;
    const result = addTodoReducer(original, newTask.text, newTask.id);
    
    expect(original).toHaveLength(originalLength)
  });
});

// ─────────────────────────────────────────────────────────────
// toggleTodoReducer
// ─────────────────────────────────────────────────────────────
describe("toggleTodoReducer", () => {
  it("flips completed from false to true", () => {
    const result = toggleTodoReducer(base(), "1"); // id "1" starts as false
    expect(result.find((t) => t.id === "1")?.completed).toBe(true);
  });

  it("flips completed from true to false", () => {
    const result = toggleTodoReducer(base(), "2"); // id "2" starts as true
    expect(result.find((t) => t.id === "2")?.completed).toBe(false);
  });

  it("does not affect other todos", () => {
    const result = toggleTodoReducer(base(), "1");
    expect(result.find((t) => t.id === "2")?.completed).toBe(true);
    expect(result.find((t) => t.id === "3")?.completed).toBe(false);
  });

  it("returns the same list unchanged when id does not exist", () => {
    const result = toggleTodoReducer(base(), "999");
    expect(result).toEqual(base());
  });

  it("does not mutate the original array", () => {
    const original = base();
    toggleTodoReducer(original, "1");
    expect(original[0].completed).toBe(false); // original unchanged
  });
});

// ─────────────────────────────────────────────────────────────
// deleteTodoReducer
// ─────────────────────────────────────────────────────────────
describe("deleteTodoReducer", () => {
  it("removes the todo with the given id", () => {
    const original = base();
    const originalLength = original.length;
    const result = deleteTodoReducer(original, "2");
    expect(result).toHaveLength(originalLength - 1);
    expect(result.find((t) => t.id === "2")).toBeUndefined();
  });

  it("leaves the remaining todos untouched", () => {
    const result = deleteTodoReducer(base(), "2");
    expect(result.map((t) => t.id)).toEqual(["1", "3"]);
  });

  it("does nothing when id does not exist", () => {
    const original = base();
    const originalLength = original.length;
    const result = deleteTodoReducer(original, "999");
    expect(result).toHaveLength(originalLength);
  });

  it("returns an empty array when the only todo is deleted", () => {
    const single: Todo[] = [{ id: "1", text: "Solo", completed: false }];
    const result = deleteTodoReducer(single, "1");
    expect(result).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────
// editTodoReducer
// ─────────────────────────────────────────────────────────────
describe("editTodoReducer", () => {
  it("updates the text of the matching todo", () => {
    const result = editTodoReducer(base(), "1", "Buy oat milk");
    expect(result.find((t) => t.id === "1")?.text).toBe("Buy oat milk");
  });

  it("preserves the id and completed status", () => {
    const result = editTodoReducer(base(), "2", "Walk cat");
    const updated = result.find((t) => t.id === "2")!;
    expect(updated.id).toBe("2");
    expect(updated.completed).toBe(true);
  });

  it("trims whitespace from the new text", () => {
    const result = editTodoReducer(base(), "1", "  Spaced  ");
    expect(result.find((t) => t.id === "1")?.text).toBe("Spaced");
  });

  it("does NOT update when newText is empty", () => {
    const result = editTodoReducer(base(), "1", "");
    expect(result.find((t) => t.id === "1")?.text).toBe("Buy milk"); // unchanged
  });

  it("does NOT update when newText is only whitespace", () => {
    const result = editTodoReducer(base(), "1", "   ");
    expect(result.find((t) => t.id === "1")?.text).toBe("Buy milk"); // unchanged
  });

  it("does nothing when id does not exist", () => {
    const original = base();
    const result = editTodoReducer(original, "999", "Ghost edit");
    expect(result).toEqual(original);
  });

  it("does not affect other todos", () => {
    const result = editTodoReducer(base(), "1", "Buy oat milk");
    expect(result.find((t) => t.id === "2")?.text).toBe("Walk dog");
    expect(result.find((t) => t.id === "3")?.text).toBe("Read book");
  });
});
