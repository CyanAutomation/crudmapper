import assert from "node:assert/strict";
import { parsePermission, normalizeRole } from "../parser.js";
import { renderSidebar } from "../uiSidebar.js";
import { renderRole } from "../uiRoleView.js";
import { describe, it } from "vitest";

describe("parser", () => {
  const fixtures = [
    {
      input: "Standalone Line\nC R",
      expectedName: "Standalone Line",
      expectedCrud: "CR",
    },
    {
      input: "Inline Compact - CR",
      expectedName: "Inline Compact",
      expectedCrud: "CR",
    },
    {
      input: "Delimited Inline (C,R)",
      expectedName: "Delimited Inline",
      expectedCrud: "CR",
    },
    {
      input: "Verb Words - Create Read",
      expectedName: "Verb Words",
      expectedCrud: "CR",
    },
    {
      input: "Account\\R",
      expectedName: "Account",
      expectedCrud: "R",
    },
    {
      input: "Client\\CRU",
      expectedName: "Client",
      expectedCrud: "CRU",
    },
    {
      input: "Invoice\\CRUD",
      expectedName: "Invoice",
      expectedCrud: "CRUD",
    },
    {
      input: "Permission Name",
      expectedName: "Permission Name",
      expectedCrud: "",
    },
  ];

  for (const fixture of fixtures) {
    it(`should parse '${fixture.input}' correctly`, () => {
      const parsed = parsePermission(fixture.input);
      assert.equal(parsed.name, fixture.expectedName, `Unexpected name for: ${fixture.input}`);
      assert.equal(
        parsed.canonicalName,
        fixture.expectedName.toLowerCase(),
        `Unexpected canonical name for: ${fixture.input}`
      );
      assert.equal(parsed.crud, fixture.expectedCrud, `Unexpected CRUD for: ${fixture.input}`);

      const role = normalizeRole({ Name: "Validation Role", Permissions: [fixture.input] });
      const normalizedSet = (role.NormalizedPermissions as Record<string, Set<string>>)[
        parsed.canonicalName
      ];

      assert.ok(
        normalizedSet instanceof Set,
        `Expected Set for canonical key: ${parsed.canonicalName}`
      );
      assert.equal(
        normalizedSet.size,
        fixture.expectedCrud.length,
        `Unexpected set size for: ${fixture.input}`
      );

      for (const token of fixture.expectedCrud) {
        assert.ok(
          normalizedSet.has(token),
          `Expected NormalizedPermissions[${parsed.canonicalName}] to include ${token}`
        );
      }
    });
  }

  it("should deduplicate permissions by canonical name", () => {
    const dedupRole = normalizeRole({
      Name: "Dedup Validation Role",
      Permissions: ["Account\\R", "Account\\CRU"],
    });

    assert.ok(
      (dedupRole.NormalizedPermissions as Record<string, Set<string>>).account instanceof Set,
      "Expected dedup set for account"
    );
    assert.deepEqual(
      [...(dedupRole.NormalizedPermissions as Record<string, Set<string>>).account].sort(),
      ["C", "R", "U"],
      "Expected Account\\R and Account\\CRU to normalize to the same canonical key"
    );
    assert.equal(
      (dedupRole.PermissionLabels as Record<string, string>).account,
      "Account",
      "Expected canonical label for deduped Account key"
    );
  });

  it("should handle null permissions gracefully", () => {
    const nullPermissionsRole = normalizeRole({
      Name: "Null Permissions",
      Permissions: null,
      Actions: null,
      Navigation: null,
    });
    assert.deepEqual(
      nullPermissionsRole.Permissions,
      [],
      "Permissions should fallback to [] when null"
    );
    assert.deepEqual(nullPermissionsRole.Actions, [], "Actions should fallback to [] when null");
    assert.deepEqual(
      nullPermissionsRole.Navigation,
      [],
      "Navigation should fallback to [] when null"
    );
    assert.deepEqual(
      Object.keys(nullPermissionsRole.NormalizedPermissions ?? {}),
      [],
      "Expected no normalized permissions for null Permissions"
    );
  });

  it("should skip non-string permission entries", () => {
    const mixedPermissionsRole = normalizeRole({
      Name: "Mixed Permission Types",
      Permissions: ["Invoice\\R", 42, null, { raw: "Account\\CRUD" }, "Account\\CRUD"],
    });
    assert.deepEqual(
      Object.keys(mixedPermissionsRole.NormalizedPermissions ?? {}).sort(),
      ["account", "invoice"],
      "Expected non-string permission entries to be skipped during normalization"
    );
    assert.deepEqual(
      [
        ...(mixedPermissionsRole.NormalizedPermissions as Record<string, Set<string>>).account,
      ].sort(),
      ["C", "D", "R", "U"],
      "Expected account CRUD letters to come only from valid string entries"
    );
  });

  it("should provide fallbacks for missing area and rank", () => {
    const missingAreaRankRole = normalizeRole({
      Name: "Missing Area Rank",
      FriendlyName: "",
      Permissions: ["Client\\R"],
    });
    assert.equal(
      missingAreaRankRole.Area,
      "Unassigned",
      "Missing Area should fallback to Unassigned"
    );
    assert.equal(missingAreaRankRole.Rank, 0, "Missing Rank should fallback to 0");
    assert.equal(
      missingAreaRankRole.FriendlyName,
      "Missing Area Rank",
      "FriendlyName should fallback to Name when empty"
    );
  });

  // Test that UI functions don't throw on malformed data
  it("should handle malformed data in UI rendering", () => {
    const malformedForUi = normalizeRole({
      Name: "UI Validation Role",
      Permissions: [null, "Invoice\\R"],
      Area: undefined,
      Rank: undefined,
    });

    assert.doesNotThrow(() => {
      const sidebarContainer = document.createElement("div");
      renderSidebar(
        { [malformedForUi.Area as string]: [malformedForUi as any] },
        () => {},
        sidebarContainer
      );
    }, "renderSidebar should tolerate normalized malformed roles");

    assert.doesNotThrow(() => {
      const roleContainer = document.createElement("div");
      renderRole(malformedForUi, roleContainer);
    }, "renderRole should tolerate normalized malformed roles");
  });
});
