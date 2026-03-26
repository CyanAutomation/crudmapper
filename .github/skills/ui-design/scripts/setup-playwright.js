#!/usr/bin/env node

/**
 * Setup Playwright environment for design validation
 *
 * This script validates and initializes the playwright environment:
 * - Checks if @playwright/test is installed
 * - Installs Playwright browsers if needed
 * - Validates dev server accessibility
 * - Provides setup guidance for agents
 */

import { spawn } from "child_process";
import { exec } from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PLAYWRIGHT_PACKAGE = "@playwright/test";
const DEFAULT_URL = "http://localhost:8000";
const FALLBACK_URLS = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"];

/**
 * Check if a package is installed
 */
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Run a shell command
 */
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 ${description}...`);
    const child = spawn("sh", ["-c", command], { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${description} complete`);
        resolve();
      } else {
        reject(new Error(`${description} failed with code ${code}`));
      }
    });
  });
}

/**
 * Check if a URL is accessible
 */
function checkURL(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const request = http.get(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || 80,
        path: "/",
        timeout: 3000,
      },
      (res) => {
        resolve(res.statusCode < 500);
      }
    );
    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Find accessible dev server URL
 */
async function findAccessibleURL() {
  console.log(`\n🌐 Checking server accessibility...`);

  for (const url of [DEFAULT_URL, ...FALLBACK_URLS]) {
    const accessible = await checkURL(url);
    if (accessible) {
      console.log(`✅ Server found at ${url}`);
      return url;
    }
  }

  return null;
}

/**
 * Main setup function
 */
async function setup() {
  console.log("\n🎨 Playwright UI Design Skill - Setup\n");
  console.log("Initializing environment for design validation...\n");

  try {
    // Step 1: Check playwright installation
    console.log("📋 Checking Playwright installation...");
    if (!isPackageInstalled(PLAYWRIGHT_PACKAGE)) {
      console.log("⚠️  @playwright/test not found. Please run: npm install");
      process.exit(1);
    }
    console.log(`✅ ${PLAYWRIGHT_PACKAGE} is installed`);

    // Step 2: Install browsers
    await runCommand("npx playwright install --with-deps", "Installing Playwright browsers");

    // Step 3: Check dev server
    const accessibleURL = await findAccessibleURL();
    if (!accessibleURL) {
      console.log(`\n⚠️  Dev server not found at expected locations:`);
      console.log(`   - ${DEFAULT_URL}`);
      console.log(`   - ${FALLBACK_URLS.join("\n   - ")}`);
      console.log(`\n💡 To start the dev server, run:`);
      console.log(`   npm run dev`);
      console.log(`\n   Then re-run the design compliance check.`);
      process.exit(1);
    }

    // Step 4: Success
    console.log("\n" + "=".repeat(60));
    console.log("✨ Setup Complete!\n");
    console.log("Your environment is ready for design validation.\n");
    console.log("Next steps:");
    console.log("1. Run design compliance check:");
    console.log("   node .github/skills/ui-design/scripts/design-compliance-check.js\n");
    console.log("2. Test responsive design:");
    console.log("   node .github/skills/ui-design/scripts/responsive-test.js\n");
    console.log("Dev server: " + accessibleURL);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setup();
