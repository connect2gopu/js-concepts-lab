"use client";

import { useState } from "react";
import { CodeDemo } from "@/components/code-demo";

const typeGuardsCode = `// typeof guard
function processValue(value: string | number | boolean) {
  if (typeof value === "string") {
    return value.toUpperCase();      // TypeScript knows: string
  } else if (typeof value === "number") {
    return value.toFixed(2);          // TypeScript knows: number
  } else {
    return value ? "yes" : "no";      // TypeScript knows: boolean
  }
}

// instanceof guard
class Dog { bark() { return "Woof!"; } }
class Cat { meow() { return "Meow!"; } }

function makeSound(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    return animal.bark();    // TypeScript knows: Dog
  } else {
    return animal.meow();    // TypeScript knows: Cat
  }
}

// Custom type guard (type predicate)
interface Fish { swim: () => string; }
interface Bird { fly: () => string; }

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird): string {
  if (isFish(pet)) {
    return pet.swim();   // TypeScript knows: Fish
  }
  return pet.fly();       // TypeScript knows: Bird
}

// "in" operator guard
interface Admin { role: "admin"; permissions: string[]; }
interface Guest { role: "guest"; visitCount: number; }

function getInfo(user: Admin | Guest): string {
  if ("permissions" in user) {
    return \`Admin with \${user.permissions.length} permissions\`;
  }
  return \`Guest, visited \${user.visitCount} times\`;
}`;

type InputType = "string" | "number" | "boolean";
type AnimalType = "dog" | "cat";
type PetType = "fish" | "bird";

export function TypeGuardsDemo() {
  const [inputValue, setInputValue] = useState("hello world");
  const [inputType, setInputType] = useState<InputType>("string");
  const [animalType, setAnimalType] = useState<AnimalType>("dog");
  const [petType, setPetType] = useState<PetType>("fish");

  function processValue(value: string, type: InputType): string {
    if (type === "string") {
      return `"${value}".toUpperCase() → "${value.toUpperCase()}"`;
    } else if (type === "number") {
      const num = parseFloat(value) || 0;
      return `(${num}).toFixed(2) → "${num.toFixed(2)}"`;
    } else {
      const bool = value.toLowerCase() === "true" || value === "1";
      return `${bool} ? "yes" : "no" → "${bool ? "yes" : "no"}"`;
    }
  }

  return (
    <div className="space-y-6">
      <CodeDemo
        title="typeof Type Guard"
        description="Narrow types using typeof checks - TypeScript understands the type in each branch."
        code={typeGuardsCode}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["string", "number", "boolean"] as InputType[]).map((t) => (
              <button
                key={t}
                onClick={() => setInputType(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  inputType === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                typeof === &quot;{t}&quot;
              </button>
            ))}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a value..."
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs text-muted-foreground mb-1">
              TypeScript narrows to: <span className="text-accent">{inputType}</span>
            </p>
            <p className="font-mono text-sm text-success">
              {processValue(inputValue, inputType)}
            </p>
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title="instanceof Type Guard"
        description="Use instanceof to narrow class types and access class-specific methods."
        code={typeGuardsCode}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["dog", "cat"] as AnimalType[]).map((a) => (
              <button
                key={a}
                onClick={() => setAnimalType(a)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  animalType === a
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {a === "dog" ? "Dog" : "Cat"}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-code-bg p-3 space-y-2">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">
                animal instanceof{" "}
              </span>
              <span className="text-accent">
                {animalType === "dog" ? "Dog" : "Cat"}
              </span>
              <span className="text-muted-foreground"> → true</span>
            </p>
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">
                animal.{animalType === "dog" ? "bark" : "meow"}() ={" "}
              </span>
              <span className="text-success">
                &quot;{animalType === "dog" ? "Woof!" : "Meow!"}&quot;
              </span>
            </p>
          </div>
        </div>
      </CodeDemo>

      <CodeDemo
        title='Custom Type Guard (Type Predicate) & "in" Operator'
        description="Write your own type guards with 'pet is Fish' syntax, or use the 'in' operator."
        code={typeGuardsCode}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["fish", "bird"] as PetType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPetType(p)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  petType === p
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "fish" ? "Fish" : "Bird"}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-code-bg p-3 space-y-2">
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">isFish(pet) → </span>
              <span className={petType === "fish" ? "text-success" : "text-error"}>
                {petType === "fish" ? "true" : "false"}
              </span>
            </p>
            <p className="font-mono text-sm">
              <span className="text-muted-foreground">
                pet.{petType === "fish" ? "swim" : "fly"}() ={" "}
              </span>
              <span className="text-success">
                &quot;
                {petType === "fish"
                  ? "Splash! Swimming away..."
                  : "Flap! Flying high..."}
                &quot;
              </span>
            </p>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-1">
                &quot;in&quot; operator guard:
              </p>
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">
                  &quot;permissions&quot; in user →{" "}
                </span>
                <span className="text-accent">
                  Admin with 5 permissions
                </span>
              </p>
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">
                  else →{" "}
                </span>
                <span className="text-accent">
                  Guest, visited 12 times
                </span>
              </p>
            </div>
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
