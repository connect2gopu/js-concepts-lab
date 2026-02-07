"use client";

import { useState } from "react";
import { CodeDemo } from "@/components/code-demo";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  isActive: boolean;
}

const utilityTypesCode = `interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  isActive: boolean;
}

// Partial<T> - All properties become optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; ... }

// Required<T> - All properties become required
type RequiredUser = Required<PartialUser>;

// Pick<T, K> - Select specific properties
type UserCredentials = Pick<User, "email" | "name">;
// { email: string; name: string }

// Omit<T, K> - Remove specific properties
type PublicUser = Omit<User, "email" | "isActive">;
// { id: number; name: string; role: ... }

// Record<K, V> - Create a mapped type
type RolePermissions = Record<User["role"], string[]>;

// Readonly<T> - All properties become readonly
type FrozenUser = Readonly<User>;

// ReturnType<T> - Extract return type of a function
function createUser(name: string, email: string): User {
  return { id: 1, name, email, role: "user", isActive: true };
}
type CreateUserReturn = ReturnType<typeof createUser>; // User`;

type UtilityType =
  | "Partial"
  | "Pick"
  | "Omit"
  | "Record"
  | "Readonly"
  | "Required";

const sampleUser: User = {
  id: 1,
  name: "Alice Johnson",
  email: "alice@example.com",
  role: "admin",
  isActive: true,
};

export function UtilityTypesDemo() {
  const [selectedType, setSelectedType] = useState<UtilityType>("Partial");

  const utilityTypes: {
    name: UtilityType;
    description: string;
    result: string;
    resultType: string;
  }[] = [
    {
      name: "Partial",
      description: "Makes all properties optional",
      result: JSON.stringify({ name: "Bob" }, null, 2),
      resultType:
        "{ id?: number; name?: string; email?: string; role?: ...; isActive?: boolean }",
    },
    {
      name: "Pick",
      description: 'Pick<User, "name" | "email"> - Select specific properties',
      result: JSON.stringify(
        { name: sampleUser.name, email: sampleUser.email },
        null,
        2
      ),
      resultType: "{ name: string; email: string }",
    },
    {
      name: "Omit",
      description:
        'Omit<User, "email" | "isActive"> - Remove specific properties',
      result: JSON.stringify(
        { id: sampleUser.id, name: sampleUser.name, role: sampleUser.role },
        null,
        2
      ),
      resultType: '{ id: number; name: string; role: "admin" | "user" | "moderator" }',
    },
    {
      name: "Record",
      description:
        'Record<User["role"], string[]> - Create a mapped type from role to permissions',
      result: JSON.stringify(
        {
          admin: ["read", "write", "delete"],
          user: ["read"],
          moderator: ["read", "write"],
        },
        null,
        2
      ),
      resultType:
        '{ admin: string[]; user: string[]; moderator: string[] }',
    },
    {
      name: "Readonly",
      description:
        "Readonly<User> - All properties become readonly (immutable)",
      result: `const frozen: Readonly<User> = { ... };\nfrozen.name = "Bob"; // Error! Cannot assign to 'name' because it is a read-only property.`,
      resultType:
        "{ readonly id: number; readonly name: string; readonly email: string; ... }",
    },
    {
      name: "Required",
      description:
        "Required<Partial<User>> - Makes all optional properties required again",
      result: JSON.stringify(sampleUser, null, 2),
      resultType:
        "{ id: number; name: string; email: string; role: ...; isActive: boolean }",
    },
  ];

  const activeType = utilityTypes.find((t) => t.name === selectedType)!;

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Utility Types Explorer"
        description="Click a utility type to see how it transforms the User interface."
        code={utilityTypesCode}
      >
        <div className="space-y-4">
          {/* Original type */}
          <div className="rounded-lg bg-code-bg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Original: User
            </p>
            <pre className="font-mono text-sm text-foreground">
              {JSON.stringify(sampleUser, null, 2)}
            </pre>
          </div>

          {/* Type selector buttons */}
          <div className="flex flex-wrap gap-2">
            {utilityTypes.map((ut) => (
              <button
                key={ut.name}
                onClick={() => setSelectedType(ut.name)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedType === ut.name
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {ut.name}&lt;T&gt;
              </button>
            ))}
          </div>

          {/* Result */}
          <div className="rounded-lg border border-accent/30 bg-accent-light/50 p-3 space-y-2">
            <p className="text-sm font-medium text-accent">
              {activeType.description}
            </p>
            <div className="rounded-md bg-code-bg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Type signature:
              </p>
              <p className="font-mono text-xs text-accent">
                {activeType.resultType}
              </p>
            </div>
            <div className="rounded-md bg-code-bg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Example value:
              </p>
              <pre className="font-mono text-sm text-foreground">
                {activeType.result}
              </pre>
            </div>
          </div>
        </div>
      </CodeDemo>
    </div>
  );
}
