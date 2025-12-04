// Local test harness for generate-tip Edge Function personalization & simulation mode.
// Usage:
//   SIMULATE_OPENAI=1 deno run --allow-env --allow-net test_local.ts
// This avoids real network/model calls and prints a simulated response.
// Provide optional SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY env vars if you want persistence; otherwise it returns simulated without DB insert.

// Minimal Deno declaration for editor linting (Edge runtime / Deno provides actual implementation)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

import { generateTipHandler } from "./index.ts";

function buildFakeJwt(sub: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub }));
  return `${header}.${payload}.signature`;
}

async function main() {
  // Ensure simulation mode
  if (!Deno.env.get("SIMULATE_OPENAI")) {
    Deno.env.set("SIMULATE_OPENAI", "1");
  }

  console.log("=== Test 1: Tip without child_id (generic prompt) ===");
  const fakeToken1 = buildFakeJwt("test-user-id");
  const reqBody1 = {
    context: "Anak tidur agak larut semalam dan bangun lebih sering.",
  };
  const req1 = new Request("http://localhost/generate-tip", {
    method: "POST",
    headers: {
      authorization: `Bearer ${fakeToken1}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(reqBody1),
  });
  const resp1 = await generateTipHandler(req1);
  console.log("Status:", resp1.status);
  const json1 = await resp1.json();
  console.log("Tip text:", json1.tip_text || "(no tip)");
  console.log("Personalization:", JSON.stringify(json1.prompt?.personalization || {}));
  console.log("Full prompt:", json1.prompt?.base?.slice(0, 200));
  console.log();

  console.log("=== Test 2: Tip with child_id (will fetch empty if not in DB) ===");
  const fakeToken2 = buildFakeJwt("test-user-id");
  const reqBody2 = {
    context: "Anak sering rewel saat makan.",
    child_id: "fake-child-id", // will produce empty personalization if not found
  };
  const req2 = new Request("http://localhost/generate-tip", {
    method: "POST",
    headers: {
      authorization: `Bearer ${fakeToken2}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(reqBody2),
  });
  const resp2 = await generateTipHandler(req2);
  console.log("Status:", resp2.status);
  const json2 = await resp2.json();
  console.log("Tip text:", json2.tip_text || "(no tip)");
  console.log("Personalization:", JSON.stringify(json2.prompt?.personalization || {}));
  console.log();

  console.log("=== Test 3: Normal parenting question ===");
  const fakeToken3 = buildFakeJwt("test-user-id");
  const reqBody3 = {
    context: "Bagaimana cara melatih anak makan sayur?",
  };
  const req3 = new Request("http://localhost/generate-tip", {
    method: "POST",
    headers: {
      authorization: `Bearer ${fakeToken3}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(reqBody3),
  });
  const resp3 = await generateTipHandler(req3);
  console.log("Status:", resp3.status);
  const json3 = await resp3.json();
  console.log("Tip text:", json3.tip_text || "(no tip)");
  console.log();

  console.log("✅ All tests completed successfully!");
}

main().catch((e) => {
  console.error("❌ Test harness failed", e);
  Deno.exit(1);
});
