/**
 * generate-quiz-data.ts
 *
 * One-time script: reads a locally saved README.md from
 *   https://github.com/greatfrontend/top-javascript-interview-questions
 * and calls an AI API to generate static MCQ data for the quiz.
 *
 * Supports two providers — whichever key is set is used automatically:
 *   GEMINI_API_KEY      → Google Gemini (gemini-2.0-flash)
 *   ANTHROPIC_API_KEY   → Anthropic Claude (claude-sonnet-4-20250514)
 *
 * Usage:
 *   GEMINI_API_KEY=AIza...      npx tsx scripts/generate-quiz-data.ts --readme README.md
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/generate-quiz-data.ts --readme README.md
 *
 * Options:
 *   --readme <path>   Path to the downloaded README.md  (required)
 *   --output <path>   Output file (default: lib/quiz-questions.json)
 *   --resume          Skip questions already saved in the checkpoint
 *
 * Rate limits (free tier):
 *   Gemini:    15 req/min  → script uses delay=15 000 ms between batches of 3
 *   Anthropic: high limit  → script uses delay=800 ms between batches of 3
 *
 * Output:
 *   lib/quiz-questions.json — commit this; no API key needed at runtime.
 */

import fs from "node:fs";
import path from "node:path";

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = "gemini" | "anthropic";

interface ParsedQuestion {
  slug: string;
  question: string;
  difficulty: string;
}

export interface QuizQuestion {
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctIndices: number[];
  explanation: string;
  difficulty: string;
}

interface CheckpointEntry extends QuizQuestion {
  slug: string;
}

// ─── Provider config ──────────────────────────────────────────────────────────

const PROVIDERS: Record<
  Provider,
  { model: string; concurrency: number; delayMs: number }
> = {
  gemini: {
    model: "gemini-2.0-flash",
    concurrency: 1,     // free tier bursts on >1 simultaneous request
    delayMs: 5_000,     // 1 req / 5s = 12 RPM, safely under the 15 RPM cap
  },
  anthropic: {
    model: "claude-sonnet-4-20250514",
    concurrency: 3,
    delayMs: 800,
  },
};

const MAX_RETRIES = 2;

// ─── Shared prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a JavaScript interview question generator.
Return ONLY a raw JSON object — no markdown, no code fences, no extra text.
Schema:
{
  "topic": "string",
  "question": "string",
  "options": ["string","string","string","string"],
  "correctIndices": [number],
  "explanation": "string"
}
Rules:
- topic: pick exactly one from this fixed list (use the exact string):
  "Variables & Scoping" | "Functions & Closures" | "Prototypes & Objects" |
  "Async & Promises" | "DOM & Events" | "Modules" | "Data Types" |
  "ES6+ Features" | "Performance" | "this Keyword" | "Miscellaneous"
- options[]: exactly 4 plausible choices. Place correct answer(s) at a RANDOM position.
- correctIndices: array of 1 or 2 zero-based indices. Use 2 only when the question genuinely has two distinct correct answers.
- Do NOT include letter prefixes (A., B.) in option strings.
- explanation: 2-3 sentences — why the correct answer(s) are right and why the others are wrong.`;

const userMessage = (q: ParsedQuestion) =>
  `Difficulty: ${q.difficulty}\nQuestion: ${q.question}\n\nGenerate one multiple-choice quiz question.`;

// ─── README parser ────────────────────────────────────────────────────────────

function parseReadme(content: string): ParsedQuestion[] {
  const seen = new Set<string>();
  const questions: ParsedQuestion[] = [];

  // Matches table rows like:
  //   | 1 | [Explain hoisting in JavaScript](#slug) | Basic |
  const rowRe =
    /^\|\s*\d+\s*\|\s*\[([^\]]+)\]\(#([a-z0-9-]+)\)\s*\|\s*(Basic|Intermediate|Advanced)\s*\|/gim;

  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(content)) !== null) {
    const slug = m[2];
    if (seen.has(slug)) continue; // same Q appears in both Top and All tables
    seen.add(slug);
    questions.push({
      slug,
      question: m[1].replace(/`([^`]+)`/g, "$1").trim(), // strip backtick markdown
      difficulty: m[3].toLowerCase(),
    });
  }
  return questions;
}

// ─── API callers ──────────────────────────────────────────────────────────────

function parseAndValidate(raw: string, difficulty: string): QuizQuestion {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "");

  const parsed = JSON.parse(cleaned) as QuizQuestion;

  if (
    typeof parsed.topic !== "string" ||
    typeof parsed.question !== "string" ||
    !Array.isArray(parsed.options) ||
    parsed.options.length !== 4 ||
    !Array.isArray(parsed.correctIndices) ||
    parsed.correctIndices.length === 0 ||
    typeof parsed.explanation !== "string"
  ) {
    throw new Error(`Malformed response:\n${raw.slice(0, 400)}`);
  }

  return { ...parsed, difficulty };
}

async function callGemini(
  q: ParsedQuestion,
  apiKey: string,
  model: string
): Promise<QuizQuestion> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMessage(q) }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };

  const raw = data.candidates[0]?.content.parts[0]?.text ?? "";
  return parseAndValidate(raw, q.difficulty);
}

async function callAnthropic(
  q: ParsedQuestion,
  apiKey: string,
  model: string
): Promise<QuizQuestion> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage(q) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content: Array<{ text: string }> };
  const raw = data.content[0]?.text ?? "";
  return parseAndValidate(raw, q.difficulty);
}

async function callApi(
  q: ParsedQuestion,
  provider: Provider,
  apiKey: string
): Promise<QuizQuestion> {
  const { model } = PROVIDERS[provider];
  return provider === "gemini"
    ? callGemini(q, apiKey, model)
    : callAnthropic(q, apiKey, model);
}

async function generateWithRetry(
  q: ParsedQuestion,
  provider: Provider,
  apiKey: string
): Promise<QuizQuestion> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callApi(q, provider, apiKey);
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        // 429 rate-limit: back off for 60s before retrying
        const is429 = String(err).includes("429");
        const waitMs = is429 ? 60_000 : 1_000 * (attempt + 1);
        if (is429) process.stdout.write(`  [rate-limited, waiting 60s…]`);
        await sleep(waitMs);
      }
    }
  }
  throw lastErr;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function clearLine() {
  if (process.stdout.isTTY) process.stdout.write("\r\x1b[K");
}

function getArg(args: string[], flag: string): string | null {
  const i = args.indexOf(flag);
  return i !== -1 ? (args[i + 1] ?? null) : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const readmeArg = getArg(args, "--readme");
  if (!readmeArg) {
    console.error(
      [
        "",
        "Usage:",
        "  GEMINI_API_KEY=AIza...       npx tsx scripts/generate-quiz-data.ts --readme README.md",
        "  ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/generate-quiz-data.ts --readme README.md",
        "",
        "Options:",
        "  --readme <path>   Path to the downloaded README.md (required)",
        "  --output <path>   Output JSON (default: lib/quiz-questions.json)",
        "  --resume          Skip questions already saved in the checkpoint",
        "",
        "Set GEMINI_API_KEY or ANTHROPIC_API_KEY — whichever is present is used.",
        "If both are set, GEMINI_API_KEY takes priority.",
        "",
      ].join("\n")
    );
    process.exit(1);
  }

  // ── Detect provider ───────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const provider: Provider = geminiKey ? "gemini" : "anthropic";
  const apiKey = geminiKey ?? anthropicKey;

  if (!apiKey) {
    console.error(
      "Error: set GEMINI_API_KEY or ANTHROPIC_API_KEY before running."
    );
    process.exit(1);
  }

  const { model, concurrency, delayMs } = PROVIDERS[provider];
  console.log(`\nProvider : ${provider} (${model})`);
  console.log(`Batch    : ${concurrency} parallel, ${delayMs}ms between batches`);

  // ── Resolve paths ─────────────────────────────────────────────────────────
  const readmePath = path.resolve(readmeArg);
  const outputPath = path.resolve(
    getArg(args, "--output") ??
      path.join(process.cwd(), "lib/quiz-questions.json")
  );
  const checkpointPath = outputPath.replace(/\.json$/, ".checkpoint.json");
  const shouldResume = args.includes("--resume");

  if (!fs.existsSync(readmePath)) {
    console.error(`README not found: ${readmePath}`);
    process.exit(1);
  }

  // ── Parse README ──────────────────────────────────────────────────────────
  const readme = fs.readFileSync(readmePath, "utf-8");
  const all = parseReadme(readme);
  console.log(`Parsed   : ${all.length} unique questions\n`);

  // ── Load checkpoint ───────────────────────────────────────────────────────
  const done = new Map<string, QuizQuestion>();

  if (shouldResume && fs.existsSync(checkpointPath)) {
    const saved = JSON.parse(
      fs.readFileSync(checkpointPath, "utf-8")
    ) as CheckpointEntry[];
    for (const { slug, ...q } of saved) done.set(slug, q);
    console.log(`Resuming from checkpoint: ${done.size} already done.\n`);
  }

  const todo = all.filter((q) => !done.has(q.slug));
  const total = all.length;

  if (todo.length === 0) {
    console.log("Nothing to do — all questions already generated.");
  } else {
    const estSec = Math.ceil((todo.length / concurrency) * (delayMs / 1_000));
    console.log(
      `Generating ${todo.length} questions… (est. ~${estSec}s)\n`
    );
  }

  let doneCount = done.size;
  let failCount = 0;

  // ── Generate in batches ───────────────────────────────────────────────────
  for (let i = 0; i < todo.length; i += concurrency) {
    const batch = todo.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map((q) => generateWithRetry(q, provider, apiKey))
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const q = batch[j];
      clearLine();

      if (r.status === "fulfilled") {
        done.set(q.slug, r.value);
        doneCount++;
        process.stdout.write(
          `[${doneCount}/${total}] ✓  ${q.question.slice(0, 68)}`
        );
      } else {
        failCount++;
        const msg = String(r.reason).replace(/\n/g, " ").slice(0, 80);
        console.log(
          `[${doneCount}/${total}] ✗  FAILED: ${q.question.slice(0, 45)} — ${msg}`
        );
      }
    }

    // Checkpoint after every batch
    const checkpoint: CheckpointEntry[] = [...done.entries()].map(
      ([slug, q]) => ({ slug, ...q })
    );
    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

    if (i + concurrency < todo.length) await sleep(delayMs);
  }

  // ── Write output ──────────────────────────────────────────────────────────
  console.log(`\n\nFinished: ${doneCount} generated, ${failCount} failed.\n`);

  // Preserve original README ordering
  const output: QuizQuestion[] = all
    .filter((q) => done.has(q.slug))
    .map((q) => done.get(q.slug)!);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Saved → ${outputPath}  (${output.length} questions)`);

  if (failCount > 0) {
    console.log(`\n${failCount} failed. Re-run with --resume to retry.`);
  } else if (fs.existsSync(checkpointPath)) {
    fs.unlinkSync(checkpointPath);
  }
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
