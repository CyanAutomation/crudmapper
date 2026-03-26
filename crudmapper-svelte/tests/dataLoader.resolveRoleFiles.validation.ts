import assert from "node:assert/strict";
import { resolveRoleFiles } from "../src/lib/dataLoader.js";
import { describe, it, beforeEach, afterEach } from "vitest";

describe("dataLoader.resolveRoleFiles", () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    (globalThis as any).window = {
      location: {
        href: "https://example.com/app/index.html",
      },
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (globalThis as any).window = originalWindow;
  });

  it("should resolve relative manifest path entries against absolute manifest URL", async () => {
    globalThis.fetch = async () =>
      ({
        ok: true,
        status: 200,
        url: "",
        async json() {
          return { files: ["./researcher.json"] };
        },
      }) as Response;

    const resolved = await resolveRoleFiles("./data/roles.manifest.json");
    assert.deepEqual(
      resolved,
      ["https://example.com/app/data/researcher.json"],
      "Expected relative manifest path entries to resolve against an absolute manifest URL"
    );
  });

  it("should validate manifest entries are strings", async () => {
    globalThis.fetch = async () =>
      ({
        ok: true,
        status: 200,
        url: "https://cdn.example.com/config/roles.manifest.json",
        async json() {
          return { files: [42] };
        },
      }) as unknown as Response;

    await assert.rejects(
      resolveRoleFiles("./data/roles.manifest.json"),
      (err: unknown) =>
        err instanceof Error &&
        err.message.includes("expected files[0] to be a string, got number"),
      "Expected non-string manifest entries to keep schema validation behavior"
    );
  });
});
