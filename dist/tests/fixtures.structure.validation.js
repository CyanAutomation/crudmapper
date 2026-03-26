import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRole } from "../parser.js";
import { extractRoles } from "../dataLoader.js";
import { describe, it } from "vitest";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
describe("fixtures structure", () => {
    it("should handle missing roles array", () => {
        const filename = "roles.missing-roles-array.json";
        const filePath = path.join(__dirname, "../data/fixtures", filename);
        const source = readFileSync(filePath, "utf8");
        const json = JSON.parse(source);
        const extracted = extractRoles(json, filename);
        assert.ok("error" in extracted, `Expected ${filename} to produce a schema_mismatch error`);
        if ("error" in extracted) {
            assert.equal(extracted.error.type, "schema_mismatch", `Expected ${filename} schema mismatch type`);
        }
    });
    it("should handle null roles array", () => {
        const filename = "roles.null-roles.json";
        const filePath = path.join(__dirname, "../data/fixtures", filename);
        const source = readFileSync(filePath, "utf8");
        const json = JSON.parse(source);
        const extracted = extractRoles(json, filename);
        assert.ok("error" in extracted, `Expected ${filename} to produce a schema_mismatch error`);
        if ("error" in extracted) {
            assert.equal(extracted.error.type, "schema_mismatch", `Expected ${filename} schema mismatch type`);
        }
    });
    it("should handle partial role entries", () => {
        const filename = "roles.partial-role.json";
        const filePath = path.join(__dirname, "../data/fixtures", filename);
        const source = readFileSync(filePath, "utf8");
        const json = JSON.parse(source);
        const partialExtracted = extractRoles(json, filename);
        assert.ok("roles" in partialExtracted, "Expected partial-role fixture to expose roles");
        if ("roles" in partialExtracted) {
            assert.ok(Array.isArray(partialExtracted.roles), "Expected partial-role fixture to expose roles");
            assert.equal(partialExtracted.roles.length, 2, "Expected two roles in partial-role fixture");
            const roles = partialExtracted.roles;
            const [completeRole, partialRole] = roles.map((role) => normalizeRole(role));
            assert.equal(completeRole.Area, "Engineering", "Complete role should preserve Area");
            assert.equal(completeRole.Rank, 10, "Complete role should preserve Rank");
            assert.equal(completeRole.FriendlyName, "Complete Role", "Complete role should preserve FriendlyName");
            assert.deepEqual(completeRole.Permissions, ["Account\\R"], "Complete role should preserve Permissions");
            assert.deepEqual(completeRole.Actions, ["OpenDashboard"], "Complete role should preserve Actions");
            assert.deepEqual(completeRole.Navigation, ["Home"], "Complete role should preserve Navigation");
            assert.equal(partialRole.Area, "Unassigned", "Missing Area should fallback to Unassigned");
            assert.equal(partialRole.Rank, 0, "Missing Rank should fallback to 0");
            assert.equal(partialRole.FriendlyName, "PartialRole", "Missing FriendlyName should fallback to Name");
            assert.deepEqual(partialRole.Permissions, [], "Missing Permissions should fallback to []");
            assert.deepEqual(partialRole.Actions, [], "Missing Actions should fallback to []");
            assert.deepEqual(partialRole.Navigation, [], "Missing Navigation should fallback to []");
        }
    });
    it("should handle null collections", () => {
        const filename = "roles.null-collections.json";
        const filePath = path.join(__dirname, "../data/fixtures", filename);
        const source = readFileSync(filePath, "utf8");
        const json = JSON.parse(source);
        const nullCollectionsExtracted = extractRoles(json, filename);
        assert.ok("roles" in nullCollectionsExtracted, "Expected null-collections fixture to expose roles");
        if ("roles" in nullCollectionsExtracted) {
            assert.ok(Array.isArray(nullCollectionsExtracted.roles), "Expected null-collections fixture to expose roles");
            assert.equal(nullCollectionsExtracted.roles.length, 1, "Expected one role in null-collections fixture");
            const roles = nullCollectionsExtracted.roles;
            const [nullCollectionsRole] = roles.map((role) => normalizeRole(role));
            assert.equal(nullCollectionsRole.Area, "Unassigned", "Null Area should fallback to Unassigned");
            assert.equal(nullCollectionsRole.Rank, 0, "Null Rank should fallback to 0");
            assert.equal(nullCollectionsRole.FriendlyName, "NullCollectionsRole", "Empty FriendlyName should fallback to Name");
            assert.deepEqual(nullCollectionsRole.Permissions, [], "Null Permissions should fallback to []");
            assert.deepEqual(nullCollectionsRole.Actions, [], "Null Actions should fallback to []");
            assert.deepEqual(nullCollectionsRole.Navigation, [], "Null Navigation should fallback to []");
        }
    });
    it("should handle researcher with metadata", () => {
        const filename = "researcher.with-metadata.json";
        const filePath = path.join(__dirname, "../data/fixtures", filename);
        const source = readFileSync(filePath, "utf8");
        const json = JSON.parse(source);
        const withMetadataExtracted = extractRoles(json, filename);
        assert.ok("roles" in withMetadataExtracted, "Expected researcher-with-metadata fixture to expose roles");
        if ("roles" in withMetadataExtracted) {
            assert.ok(Array.isArray(withMetadataExtracted.roles), "Expected researcher-with-metadata fixture to expose roles");
            assert.equal(withMetadataExtracted.roles.length, 3, "Expected three roles in researcher-with-metadata fixture");
            const roles = withMetadataExtracted.roles;
            const [metadataReadOnlyRole, metadataUserRole, metadataShadowRole] = roles.map((role) => normalizeRole(role));
            assert.equal(metadataReadOnlyRole.Area, "Engineering", "Happy-path role Area should be preserved");
            assert.equal(metadataReadOnlyRole.Rank, 100, "Happy-path role Rank should be preserved");
            assert.equal(metadataReadOnlyRole.FriendlyName, "Researcher (Read Only)", "Happy-path FriendlyName should be preserved");
            assert.ok(metadataReadOnlyRole.NormalizedPermissions?.account, "NormalizedPermissions.account should exist");
            assert.equal([
                ...metadataReadOnlyRole.NormalizedPermissions.account,
            ]
                .sort()
                .join(""), "R", "Happy-path role normalization should stay backward compatible");
            assert.equal(metadataUserRole.Area, "Engineering", "Unknown keys should not change Area");
            assert.equal(metadataUserRole.Rank, 200, "Unknown keys should not change Rank");
            assert.equal(metadataUserRole.FriendlyName, "Researcher (User)", "Unknown keys should not change FriendlyName display label");
            assert.ok(metadataUserRole.NormalizedPermissions?.account, "NormalizedPermissions.account should exist");
            assert.equal([
                ...metadataUserRole.NormalizedPermissions.account,
            ]
                .sort()
                .join(""), "CRU", "Unknown keys should not change NormalizedPermissions for account");
            assert.ok(metadataUserRole.NormalizedPermissions?.invoice, "NormalizedPermissions.invoice should exist");
            assert.equal([
                ...metadataUserRole.NormalizedPermissions.invoice,
            ]
                .sort()
                .join(""), "RU", "Unknown keys should not change NormalizedPermissions for invoice");
            assert.equal(metadataShadowRole.Area, "Ops", "Area should use declared value even with unknown keys");
            assert.equal(metadataShadowRole.Rank, 555, "Rank should use declared value even with unknown keys");
            assert.equal(metadataShadowRole.FriendlyName, "ResearcherShadow", "Display label behavior should continue to fallback to Name when FriendlyName is missing");
            assert.ok(metadataShadowRole.NormalizedPermissions?.audit, "NormalizedPermissions.audit should exist");
            assert.equal([
                ...metadataShadowRole.NormalizedPermissions.audit,
            ]
                .sort()
                .join(""), "R", "NormalizedPermissions should be derived only from Permissions entries");
        }
    });
});
//# sourceMappingURL=fixtures.structure.validation.js.map