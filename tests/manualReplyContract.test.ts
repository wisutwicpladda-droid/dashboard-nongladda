import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePath = new URL(
  "../supabase/functions/ladda-manual-reply/index.ts",
  import.meta.url,
);

test("manual reply extends the active admin lease after a successful send", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.match(source, /\.rpc\(\s*"ladda_extend_manual_lease"/s);
});

test("manual reply CORS is restricted to the configured dashboard origin", async () => {
  const source = await readFile(sourcePath, "utf8");
  assert.match(source, /DASHBOARD_ALLOWED_ORIGIN/);
  assert.doesNotMatch(source, /"Access-Control-Allow-Origin": "\*"/);
});
