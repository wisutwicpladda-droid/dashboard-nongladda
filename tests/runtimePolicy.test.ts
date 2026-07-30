import assert from "node:assert/strict";
import test from "node:test";

import { resolveRuntimeMode } from "../src/lib/runtimePolicy.ts";

test("production never enables demo data", () => {
  assert.equal(
    resolveRuntimeMode({
      isDev: false,
      demoRequested: true,
      supabaseConfigured: false,
    }),
    "configuration_error",
  );
});

test("local development enables demo data only when explicitly requested", () => {
  assert.equal(
    resolveRuntimeMode({
      isDev: true,
      demoRequested: true,
      supabaseConfigured: false,
    }),
    "demo",
  );
});

test("configured Supabase always selects live mode", () => {
  assert.equal(
    resolveRuntimeMode({
      isDev: false,
      demoRequested: false,
      supabaseConfigured: true,
    }),
    "live",
  );
});
