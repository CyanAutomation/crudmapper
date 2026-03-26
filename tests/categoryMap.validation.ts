import assert from "node:assert/strict";
import { getCategoryForPermission, tokenizePermissionName } from "../src/lib/categoryMap.js";
import { describe, it } from "vitest";

describe("categoryMap", () => {
  const fixtures = [
    { name: "InvoiceApprove", expected: "Finance", note: "current prefix case" },
    {
      name: "CustomerAccountManage",
      expected: "CRM",
      note: "compound case transition tokens",
    },
    { name: "finance/payment", expected: "Finance", note: "namespaced slash token" },
    {
      name: "crm\\client-sync",
      expected: "CRM",
      note: "namespaced backslash and punctuation tokens",
    },
    { name: "unknown-capability", expected: "Other", note: "fallback category" },
  ];

  for (const fixture of fixtures) {
    it(`should categorize ${fixture.name} as ${fixture.expected}`, () => {
      assert.equal(
        getCategoryForPermission(fixture.name),
        fixture.expected,
        `Unexpected category for ${fixture.note}: ${fixture.name}`
      );
    });
  }

  it("should tokenize camelCase correctly", () => {
    assert.deepEqual(
      tokenizePermissionName("CustomerAccount"),
      ["customer", "account"],
      "Expected case transition tokenization to split CustomerAccount"
    );
  });

  it("should tokenize slash-separated names", () => {
    assert.deepEqual(
      tokenizePermissionName("finance/payment"),
      ["finance", "payment"],
      "Expected slash tokenization to split finance/payment"
    );
  });
});
