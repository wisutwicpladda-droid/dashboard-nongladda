import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync("deploy/nginx.conf", "utf8");

test("app responses inherit the production security headers", () => {
  assert.match(config, /add_header Content-Security-Policy/);
  assert.match(config, /add_header X-Content-Type-Options "nosniff" always;/);

  const locationBodies = [...config.matchAll(/location[^\{]+\{([^\{\}]*)\}/g)].map(
    (match) => match[1],
  );

  assert.ok(locationBodies.length >= 3);
  for (const body of locationBodies) {
    assert.doesNotMatch(
      body,
      /add_header/,
      "location-level add_header directives override all server-level security headers",
    );
  }
});

test("cache policy is selected centrally for assets and HTML", () => {
  assert.match(config, /map \$uri \$cache_control/);
  assert.match(config, /~\^\/assets\/ "public, max-age=31536000, immutable";/);
  assert.match(config, /default "no-store";/);
  assert.match(config, /add_header Cache-Control \$cache_control always;/);
});
