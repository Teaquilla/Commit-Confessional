// scripts/check-env.mjs
// Inspects environment variables without revealing secret values

const key = process.env.GEMINI_API_KEY;
const model = process.env.AI_MODEL_NAME;

if (key && key.trim().length > 0) {
  console.log(`GEMINI_API_KEY: set (panjang ${key.trim().length})`);
} else {
  console.log("GEMINI_API_KEY: missing");
}

if (model && model.trim().length > 0) {
  console.log(`AI_MODEL_NAME: ${model.trim()}`);
} else {
  console.log("AI_MODEL_NAME: missing");
}
