"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeDemo } from "@/components/code-demo";

const factoryCode = `// Factory Pattern: create objects without specifying exact class
// Uses the API route at /api/concepts (POST)

interface Shape {
  type: string;
  props: Record<string, number>;
  area: number;
  perimeter: number;
  color: string;
}

// Factory function
function createShape(type: string, props: Record<string, number>): Shape {
  switch (type) {
    case "circle":
      const r = props.radius || 5;
      return {
        type: "circle",
        props: { radius: r },
        area: Math.PI * r * r,
        perimeter: 2 * Math.PI * r,
        color: "#6366f1",
      };
    case "rectangle":
      const w = props.width || 4;
      const h = props.height || 3;
      return {
        type: "rectangle",
        props: { width: w, height: h },
        area: w * h,
        perimeter: 2 * (w + h),
        color: "#22c55e",
      };
    case "triangle":
      const b = props.base || 6;
      const ht = props.height || 4;
      return {
        type: "triangle",
        props: { base: b, height: ht },
        area: (b * ht) / 2,
        perimeter: b + 2 * Math.sqrt((b/2)**2 + ht**2),
        color: "#f59e0b",
      };
    default:
      throw new Error(\`Unknown shape: \${type}\`);
  }
}

// The client doesn't need to know the creation details
const shape = createShape("circle", { radius: 10 });`;

interface ShapeResult {
  type: string;
  props: Record<string, number>;
  area: number;
  perimeter: number;
  color: string;
}

export function FactoryDemo() {
  const [shapeType, setShapeType] = useState("circle");
  const [props, setProps] = useState<Record<string, number>>({ radius: 5 });
  const [shapes, setShapes] = useState<ShapeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>("");

  const propsForType: Record<string, { key: string; label: string; default: number }[]> = {
    circle: [{ key: "radius", label: "Radius", default: 5 }],
    rectangle: [
      { key: "width", label: "Width", default: 4 },
      { key: "height", label: "Height", default: 3 },
    ],
    triangle: [
      { key: "base", label: "Base", default: 6 },
      { key: "height", label: "Height", default: 4 },
    ],
  };

  const handleTypeChange = (type: string) => {
    setShapeType(type);
    const defaults: Record<string, number> = {};
    propsForType[type].forEach((p) => {
      defaults[p.key] = p.default;
    });
    setProps(defaults);
  };

  const createShape = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: shapeType, props }),
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (data.success) {
        setShapes((prev) => [data.shape, ...prev]);
      }
    } catch {
      setApiResponse("Error: Failed to call factory API");
    }
    setLoading(false);
  }, [shapeType, props]);

  const shapeColors: Record<string, string> = {
    circle: "border-indigo-500/30 bg-indigo-500/5",
    rectangle: "border-emerald-500/30 bg-emerald-500/5",
    triangle: "border-amber-500/30 bg-amber-500/5",
  };

  return (
    <div className="space-y-6">
      <CodeDemo
        title="Shape Factory (via API Route)"
        description="Creates shapes through a Next.js API route handler. The client just specifies 'type' and 'props'."
        code={factoryCode}
      >
        <div className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {["circle", "rectangle", "triangle"].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  shapeType === type
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Props inputs */}
          <div className="flex flex-wrap gap-3">
            {propsForType[shapeType]?.map((p) => (
              <div key={p.key} className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">
                  {p.label}:
                </label>
                <input
                  type="number"
                  value={props[p.key] || p.default}
                  onChange={(e) =>
                    setProps((prev) => ({
                      ...prev,
                      [p.key]: Number(e.target.value),
                    }))
                  }
                  min={1}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            ))}
          </div>

          <button
            onClick={createShape}
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : `createShape("${shapeType}", ...)`}
          </button>

          {/* API Response */}
          {apiResponse && (
            <div className="rounded-lg bg-code-bg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                API Response (POST /api/concepts):
              </p>
              <pre className="font-mono text-xs text-foreground overflow-x-auto">
                {apiResponse}
              </pre>
            </div>
          )}

          {/* Created shapes */}
          {shapes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Created Shapes ({shapes.length}):
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <AnimatePresence>
                  {shapes.map((shape, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-lg border p-3 ${shapeColors[shape.type] || "border-border"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: shape.color }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {shape.type}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground space-y-0.5">
                        <p>
                          props: {JSON.stringify(shape.props)}
                        </p>
                        <p>
                          area:{" "}
                          <span className="text-foreground">
                            {shape.area.toFixed(2)}
                          </span>
                        </p>
                        <p>
                          perimeter:{" "}
                          <span className="text-foreground">
                            {shape.perimeter.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </CodeDemo>
    </div>
  );
}
