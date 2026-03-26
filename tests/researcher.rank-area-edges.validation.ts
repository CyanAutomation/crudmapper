import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRole } from "../parser.js";
import { groupByArea } from "../dataLoader.js";
import { renderSidebar } from "../uiSidebar.js";
import { describe, it, beforeEach } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("researcher rank/area edge cases", () => {
  let roles: unknown[];

  beforeEach(() => {
    const fixturePath = path.resolve(
      __dirname,
      "../data/fixtures/researcher.rank-area-edges.json"
    );
    const fixtureSource = readFileSync(fixturePath, "utf8");
    const fixtureJson = JSON.parse(fixtureSource);
    roles = fixtureJson?.Roles;
  });

  it("should parse roles with rank/area edge cases", () => {
    assert.ok(Array.isArray(roles), "Expected rank/area edge fixture to expose a Roles array");
    assert.equal(roles.length, 6, "Expected exactly six edge-case roles in fixture");
  });

  it("should normalize duplicate and negative ranks", () => {
    const normalizedRoles = (roles as unknown[]).map((role) => normalizeRole(role));
    const byName = Object.fromEntries(
      normalizedRoles.map((role) => [role.Name, role])
    );

    // Duplicate ranks should remain stable inputs for grouping/rendering.
    assert.equal(byName.ResearcherDuplicateRankA.Rank, 100);
    assert.equal(byName.ResearcherDuplicateRankB.Rank, 100);

    // Negative numeric rank should remain numeric (edge input, still finite).
    assert.equal(byName.ResearcherNegativeRank.Rank, -50);

    // Invalid/missing rank values should normalize to fallback rank 0.
    assert.equal(byName.ResearcherNonNumericRank.Rank, 0);
    assert.equal(byName.ResearcherMissingArea.Rank, 0);
  });

  it("should normalize areas and handle multi-area strings", () => {
    const normalizedRoles = (roles as unknown[]).map((role) => normalizeRole(role));
    const byName = Object.fromEntries(
      normalizedRoles.map((role) => [role.Name, role])
    );

    // Invalid/missing area values should normalize to Unassigned.
    assert.equal(byName.ResearcherNonNumericRank.Area, "Unassigned");
    assert.equal(byName.ResearcherMissingArea.Area, "Unassigned");

    // Multi-area string should remain stable as a single grouping key.
    assert.equal(byName.ResearcherMultipleAreas.Area, "Engineering, Compliance");
  });

  it("should group by area correctly", () => {
    const normalizedRoles = (roles as unknown[]).map((role) => normalizeRole(role));
    const groups = groupByArea(normalizedRoles);

    assert.ok(Array.isArray(groups.Unassigned), "Expected Unassigned group to exist for missing/blank areas");
    assert.equal(groups.Unassigned.length, 2, "Expected two roles to map to Unassigned area");
    assert.ok(Array.isArray(groups.Engineering), "Expected Engineering group to exist");
    assert.equal(groups.Engineering.length, 2, "Expected duplicate rank Engineering roles in same group");
    assert.ok(
      Array.isArray(groups["Engineering, Compliance"]),
      "Expected multi-area group key to be preserved"
    );
    assert.equal(groups["Engineering, Compliance"].length, 1);
  });

  it("should render sidebar with normalized roles", () => {
    const normalizedRoles = (roles as unknown[]).map((role) => normalizeRole(role));
    const groups = groupByArea(normalizedRoles);

    const container = document.createElement("div");
    assert.doesNotThrow(() => {
      renderSidebar(groups, () => {}, container);
    }, "renderSidebar should not crash when handed grouped normalized roles");

    assert.ok(container.children.length >= 1, "Expected sidebar renderer to output area sections");
  });
});
