import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataLoaderPath = path.resolve(__dirname, "../dataLoader.js");
const { resolveRoleFiles } = await import(pathToFileURL(dataLoaderPath).href);

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

try {
  globalThis.window = {
    location: {
      href: "https://example.com/app/index.html",
    },
  };

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    url: "",
    async json() {
      return { files: ["./researcher.json"] };
    },
  });

  const resolved = await resolveRoleFiles("./data/roles.manifest.json");
  assert.deepEqual(
    resolved,
    ["https://example.com/app/data/researcher.json"],
    "Expected relative manifest path entries to resolve against an absolute manifest URL"
  );

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    url: "https://cdn.example.com/config/roles.manifest.json",
    async json() {
      return { files: [42] };
    },
  });

  await assert.rejects(
    resolveRoleFiles("./data/roles.manifest.json"),
    (err) =>
      err instanceof Error &&
      err.message.includes("expected files[0] to be a string, got number"),
    "Expected non-string manifest entries to keep schema validation behavior"
  );
} finally {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
}

console.log("dataLoader resolveRoleFiles validation passed");
