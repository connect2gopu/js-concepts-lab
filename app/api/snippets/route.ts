import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SNIPPETS_DIR = path.join(process.cwd(), "snippets");
const FILENAME_RE = /^[a-zA-Z0-9_-]+\.(js|ts)$/;

async function ensureDir() {
  await fs.mkdir(SNIPPETS_DIR, { recursive: true });
}

export async function GET() {
  await ensureDir();
  const entries = await fs.readdir(SNIPPETS_DIR);
  const snippets = entries.filter((f) => FILENAME_RE.test(f)).sort();
  return NextResponse.json({ snippets });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filename, code } = body as { filename?: string; code?: string };

  if (!filename || !FILENAME_RE.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  if (typeof code !== "string") {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  await ensureDir();
  await fs.writeFile(path.join(SNIPPETS_DIR, filename), code, "utf-8");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { filename } = body as { filename?: string };

  if (!filename || !FILENAME_RE.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  await ensureDir();
  try {
    await fs.unlink(path.join(SNIPPETS_DIR, filename));
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
