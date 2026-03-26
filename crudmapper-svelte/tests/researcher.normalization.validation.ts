import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRole } from "../src/lib/parser.js";
import { describe, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("researcher normalization", () => {
  it("should parse researcher.json with expected role counts and fields", () => {
    const researcherPath = path.resolve(__dirname, "../data/researcher.json");
    const researcherSource = readFileSync(researcherPath, "utf8");
    const researcherJson = JSON.parse(researcherSource);
    const roles = researcherJson?.Roles;

    // 1) Role count and key fields parsed from Roles.
    assert.ok(Array.isArray(roles), "Expected researcher.json to expose a Roles array");
    assert.equal(roles.length, 4, "Expected exactly 4 researcher roles");

    const expectedRoleFieldsByName: Record<string, { rank: number; area: string }> = {
      ResearcherReadOnly: { rank: 100, area: "Engineering" },
      ResearcherUser: { rank: 200, area: "Engineering" },
      ResearcherSupervisor: { rank: 300, area: "Engineering" },
      ResearcherManager: { rank: 400, area: "Engineering" },
    };

    for (const role of roles) {
      const expected = expectedRoleFieldsByName[role.Name];
      assert.ok(expected, `Unexpected role Name found in researcher.json: ${role.Name}`);
      assert.equal(role.Area, expected.area, `Unexpected Area for role ${role.Name}`);
      assert.equal(role.Rank, expected.rank, `Unexpected Rank for role ${role.Name}`);
      assert.ok(
        Array.isArray(role.Permissions),
        `Expected Permissions array for role ${role.Name}`
      );
      assert.equal(role.Permissions.length, 4, `Expected 4 permissions for role ${role.Name}`);
    }
  });

  it("should normalize permissions to canonical keys", () => {
    const researcherPath = path.resolve(__dirname, "../data/researcher.json");
    const researcherSource = readFileSync(researcherPath, "utf8");
    const researcherJson = JSON.parse(researcherSource);
    const roles = researcherJson?.Roles;

    const normalizedRoles = (roles as unknown[])
      .map((role: unknown) => normalizeRole(role))
      .sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.Rank as number) - (b.Rank as number)
      );

    const canonicalEntities = ["account", "client", "invoice", "payment"];

    // 2) Permission canonical keys include base entities, not backslash-suffixed strings.
    for (const role of normalizedRoles) {
      const canonicalKeys = Object.keys(role.NormalizedPermissions ?? {}).sort();
      assert.deepEqual(
        canonicalKeys,
        canonicalEntities,
        `Expected canonical permission keys for ${role.Name} to be only base entities`
      );

      for (const key of canonicalKeys) {
        assert.ok(
          !key.includes("\\"),
          `Canonical key ${key} for ${role.Name} should not include backslashes`
        );
      }
    }
  });

  it("should match expected CRUD progression by rank", () => {
    const researcherPath = path.resolve(__dirname, "../data/researcher.json");
    const researcherSource = readFileSync(researcherPath, "utf8");
    const researcherJson = JSON.parse(researcherSource);
    const roles = researcherJson?.Roles;

    const normalizedRoles = (roles as unknown[])
      .map((role: unknown) => normalizeRole(role))
      .sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.Rank as number) - (b.Rank as number)
      );

    const canonicalEntities = ["account", "client", "invoice", "payment"];

    const expectedCrudByRank: Record<number, Record<string, string>> = {
      100: { account: "R", client: "R", invoice: "R", payment: "R" },
      200: { account: "CRU", client: "CRU", invoice: "RU", payment: "R" },
      300: { account: "CRUD", client: "CRUD", invoice: "CRU", payment: "CRU" },
      400: { account: "CRUD", client: "CRUD", invoice: "CRUD", payment: "CRUD" },
    };

    // 3) CRUD sets for each role/rank match expected progression.
    for (const role of normalizedRoles) {
      const expectedByEntity = expectedCrudByRank[role.Rank as number];
      assert.ok(expectedByEntity, `Missing expected CRUD mapping for rank ${role.Rank}`);

      for (const entity of canonicalEntities) {
        const expectedCrud = expectedByEntity[entity];
        const actualCrud = [...(role.NormalizedPermissions as Record<string, Set<string>>)[entity]]
          .sort()
          .join("");
        const sortedExpectedCrud = expectedCrud.split("").sort().join("");
        assert.equal(
          actualCrud,
          sortedExpectedCrud,
          `Unexpected CRUD set for ${role.Name} (${role.Rank}) on ${entity}`
        );
      }
    }

    assert.equal(
      [...(normalizedRoles[0].NormalizedPermissions as Record<string, Set<string>>).account]
        .sort()
        .join(""),
      "R"
    );
    assert.equal(
      [...(normalizedRoles[1].NormalizedPermissions as Record<string, Set<string>>).account]
        .sort()
        .join(""),
      "CRU"
    );
    assert.equal(
      [...(normalizedRoles[2].NormalizedPermissions as Record<string, Set<string>>).account]
        .sort()
        .join(""),
      "CDRU"
    );
    assert.equal(
      [...(normalizedRoles[3].NormalizedPermissions as Record<string, Set<string>>).account]
        .sort()
        .join(""),
      "CDRU"
    );
  });

  it("should deduplicate format variations", () => {
    // 4) No duplicate canonical permission objects created due to format variation.
    const dedupRole = normalizeRole({
      Name: "ResearcherFormatVariation",
      Permissions: ["Account\\R", "Account - CRU", "Account (CRUD)", "account\\R"],
    });

    assert.deepEqual(
      Object.keys(dedupRole.NormalizedPermissions ?? {}),
      ["account"],
      "Expected all Account format variations to normalize to a single canonical key"
    );
    assert.equal(
      [...(dedupRole.NormalizedPermissions as Record<string, Set<string>>).account].sort().join(""),
      "CDRU",
      "Expected a single deduplicated Account permission set with CRUD letters"
    );
  });
});
