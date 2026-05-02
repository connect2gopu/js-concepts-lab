import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SNIPPETS_DIR = path.join(process.cwd(), "snippets");
const FILENAME_RE = /^[a-zA-Z0-9_-]+\.(js|ts)$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!FILENAME_RE.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const code = await fs.readFile(path.join(SNIPPETS_DIR, filename), "utf-8");
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
