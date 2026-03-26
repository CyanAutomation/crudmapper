import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRole } from "../parser.js";
import { describe, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("researcher permission format variants", () => {
  it("should normalize permission format variants to canonical key", () => {
    const variantsFixturePath = path.resolve(
      __dirname,
      "../data/fixtures/researcher.permission-format-variants.json"
    );
    const variantsFixtureSource = readFileSync(variantsFixturePath, "utf8");
    const variantsFixtureRole = JSON.parse(variantsFixtureSource);
    const variantsNormalizedRole = normalizeRole(variantsFixtureRole);

    assert.deepEqual(
      Object.keys(variantsNormalizedRole.NormalizedPermissions ?? {}),
      ["account"],
      "Expected all account permission variants to normalize to canonical key account"
    );

    const variantsActualCrud = [
      ...(variantsNormalizedRole.NormalizedPermissions as Record<string, Set<string>>).account,
    ]
      .sort()
      .join("");
    const expectedCrud = "CDRU".split("").sort().join("");

    assert.equal(
      variantsActualCrud,
      expectedCrud,
      "Expected deduped CRUD letters in NormalizedPermissions.account to equal CDRU"
    );
  });

  it("should skip invalid permission types", () => {
    const invalidTypesFixturePath = path.resolve(
      __dirname,
      "../data/fixtures/researcher.invalid-permission-types.json"
    );
    const invalidTypesFixtureSource = readFileSync(invalidTypesFixturePath, "utf8");
    const invalidTypesFixtureRole = JSON.parse(invalidTypesFixtureSource);
    const invalidTypesNormalizedRole = normalizeRole(invalidTypesFixtureRole);

    assert.deepEqual(
      Object.keys(invalidTypesNormalizedRole.NormalizedPermissions ?? {}).sort(),
      ["account", "invoice"],
      "Expected only valid string permissions to survive normalization and invalid entries to be ignored"
    );

    assert.equal(
      [
        ...(invalidTypesNormalizedRole.NormalizedPermissions as Record<string, Set<string>>).account,
      ]
        .sort()
        .join(""),
      "R",
      "Expected account CRUD content to include only valid string-derived letters"
    );

    assert.equal(
      [
        ...(invalidTypesNormalizedRole.NormalizedPermissions as Record<string, Set<string>>).invoice,
      ]
        .sort()
        .join(""),
      "C",
      "Expected invoice CRUD content to include only valid string-derived letters"
    );
  });
});
