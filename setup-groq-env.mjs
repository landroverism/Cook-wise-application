#!/usr/bin/env node
/**
 * Script to sync GROQ_API_KEY from .env.local to Convex environment variables
 * 
 * Usage: node setup-groq-env.mjs
 */

import fs from "fs";
import { config as loadEnvFile } from "dotenv";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
const envPath = join(__dirname, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found!");
  console.log("Please create .env.local and add your GROQ_API_KEY");
  process.exit(1);
}

const envConfig = {};
loadEnvFile({ path: envPath, processEnv: envConfig });

const groqApiKey = process.env.GROQ_API_KEY || envConfig.GROQ_API_KEY;

if (!groqApiKey || groqApiKey === "your_groq_api_key_here") {
  console.error("❌ GROQ_API_KEY not found in .env.local or is set to placeholder value!");
  console.log("Please add your GROQ_API_KEY to .env.local file:");
  console.log("GROQ_API_KEY=your_actual_api_key_here");
  process.exit(1);
}

console.log("🔑 Found GROQ_API_KEY in .env.local");
console.log("📤 Setting GROQ_API_KEY in Convex environment...");

// Set the environment variable in Convex
const result = spawnSync(
  "npx",
  ["convex", "env", "set", "GROQ_API_KEY", groqApiKey],
  {
    stdio: "inherit",
    cwd: __dirname,
  }
);

if (result.status === 0) {
  console.log("✅ Successfully set GROQ_API_KEY in Convex!");
  console.log("🚀 Your AI recipe generation should now work!");
} else {
  console.error("❌ Failed to set GROQ_API_KEY in Convex");
  console.log("Make sure you have Convex CLI installed and are logged in:");
  console.log("  npx convex login");
  process.exit(1);
}

