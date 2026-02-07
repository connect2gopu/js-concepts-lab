import { NextResponse, type NextRequest } from "next/server";

// Shape Factory - demonstrates Factory pattern via API route
interface ShapeData {
  type: string;
  props: Record<string, number>;
  area: number;
  perimeter: number;
  color: string;
}

function createShape(type: string, props: Record<string, number>): ShapeData {
  const colors: Record<string, string> = {
    circle: "#6366f1",
    rectangle: "#22c55e",
    triangle: "#f59e0b",
  };

  switch (type) {
    case "circle": {
      const r = props.radius || 5;
      return {
        type: "circle",
        props: { radius: r },
        area: Math.PI * r * r,
        perimeter: 2 * Math.PI * r,
        color: colors.circle,
      };
    }
    case "rectangle": {
      const w = props.width || 4;
      const h = props.height || 3;
      return {
        type: "rectangle",
        props: { width: w, height: h },
        area: w * h,
        perimeter: 2 * (w + h),
        color: colors.rectangle,
      };
    }
    case "triangle": {
      const b = props.base || 6;
      const ht = props.height || 4;
      const side = Math.sqrt((b / 2) ** 2 + ht ** 2);
      return {
        type: "triangle",
        props: { base: b, height: ht },
        area: (b * ht) / 2,
        perimeter: b + 2 * side,
        color: colors.triangle,
      };
    }
    default:
      throw new Error(`Unknown shape type: ${type}`);
  }
}

// GET: List available shapes and their defaults
export async function GET() {
  return NextResponse.json({
    message: "Shape Factory API - POST to create shapes",
    availableTypes: ["circle", "rectangle", "triangle"],
    examples: {
      circle: { radius: 5 },
      rectangle: { width: 4, height: 3 },
      triangle: { base: 6, height: 4 },
    },
  });
}

// POST: Create a shape using the Factory pattern
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, props } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Missing 'type' field" },
        { status: 400 }
      );
    }

    const shape = createShape(type, props || {});
    return NextResponse.json({
      success: true,
      shape,
      factoryMethod: `createShape("${type}", ${JSON.stringify(props || {})})`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
