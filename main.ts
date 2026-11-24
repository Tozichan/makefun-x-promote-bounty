// Entry program for the make.fun bounty
// "Promote make.fun's make-your-own-bounty post on X".
//
// The entry itself is the X post: a quote of make.fun's post
// (https://x.com/makefunai/status/2124915864336236646) with a photo
// of its own attached. This program only hands the post's address
// to the grader: it reads POST.json from the repository root and
// writes the exact same bytes to /output/POST.json.
//
// Node 22, standard library only. No network, no clock, no files
// outside the repository, so two runs write the same bytes.
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "POST.json");
const targetPath = join(outputDir, "POST.json");

mkdirSync(outputDir, { recursive: true });

let post: Buffer;
try {
  post = readFileSync(sourcePath);
} catch (err) {
  console.error(`POST.json could not be read from ${botDir}: ${(err as Error).message}`);
  process.exit(1);
}

// Refuse a placeholder or malformed address before the grader
// sees it: the entry only counts once POST.json names a real post.
let parsed: unknown;
try {
  parsed = JSON.parse(post.toString("utf-8"));
} catch {
  console.error("POST.json is not valid JSON");
  process.exit(1);
}
const url = (parsed as { url?: unknown }).url;
if (
  typeof url !== "string" ||
  (!url.startsWith("https://x.com/") && !url.startsWith("https://twitter.com/")) ||
  url.includes("<handle>") ||
  url.includes("<id>")
) {
  console.error("POST.json does not name a real X post address");
  process.exit(1);
}

writeFileSync(targetPath, post);
