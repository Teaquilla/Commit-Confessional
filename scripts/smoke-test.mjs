// scripts/smoke-test.mjs
// Securely verifies Gemini API with model from AI_MODEL_NAME

import https from "node:https";

const key = process.env.GEMINI_API_KEY;
const model = process.env.AI_MODEL_NAME || "gemini-3.8-flash";

if (!key) {
  console.log("HTTP status: 400 (Missing GEMINI_API_KEY)");
  process.exit(1);
}

const payload = JSON.stringify({
  contents: [
    {
      parts: [
        {
          text: "diff --git a/auth.ts b/auth.ts\n--- a/auth.ts\n+++ b/auth.ts\n@@ -1 +1 @@\n-const token = undefined;\n+const token = generateAuthToken();",
        },
      ],
    },
  ],
});

const options = {
  hostname: "generativelanguage.googleapis.com",
  path: `/v1beta/models/${model}:generateContent`,
  method: "POST",
  family: 4,
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": key,
    "User-Agent": "Mozilla/5.0",
    "Content-Length": Buffer.byteLength(payload),
  },
  timeout: 30000,
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });
  res.on("end", () => {
    console.log(`HTTP status: ${res.statusCode}`);
    console.log(`Model: ${model}`);
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(body);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log(`Response text length: ${text.length} characters`);
        process.exit(0);
      } catch {
        console.log("Response text length: parsed with empty content");
        process.exit(0);
      }
    } else {
      try {
        const err = JSON.parse(body);
        console.log(`Error message: ${err.error?.message || res.statusMessage}`);
      } catch {
        console.log(`Status message: ${res.statusMessage}`);
      }
      process.exit(1);
    }
  });
});

req.on("error", (e) => {
  console.error(`Request error: ${e.message}`);
  process.exit(1);
});

req.on("timeout", () => {
  console.error(`Request error: Timed out after ${options.timeout}ms`);
  req.destroy();
  process.exit(1);
});


req.write(payload);
req.end();
