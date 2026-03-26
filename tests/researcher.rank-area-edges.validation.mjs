import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.resolve(__dirname, '../parser.js');
const dataLoaderPath = path.resolve(__dirname, '../dataLoader.js');
const uiSidebarPath = path.resolve(__dirname, '../uiSidebar.js');
const fixturePath = path.resolve(__dirname, '../data/fixtures/researcher.rank-area-edges.json');

const { normalizeRole } = await import(pathToFileURL(parserPath).href);
const { groupByArea } = await import(pathToFileURL(dataLoaderPath).href);
const { renderSidebar } = await import(pathToFileURL(uiSidebarPath).href);

try {
  const fixtureSource = await readFile(fixturePath, 'utf8');
  const fixtureJson = JSON.parse(fixtureSource);
  const roles = fixtureJson?.Roles;
} catch (error) {
  console.error(`Failed to load fixture: ${error.message}`);
  process.exit(1);
}

assert.ok(Array.isArray(roles), 'Expected rank/area edge fixture to expose a Roles array');
assert.equal(roles.length, 6, 'Expected exactly six edge-case roles in fixture');

const normalizedRoles = roles.map((role) => normalizeRole(role));

const byName = Object.fromEntries(normalizedRoles.map((role) => [role.Name, role]));

// Duplicate ranks should remain stable inputs for grouping/rendering.
assert.equal(byName.ResearcherDuplicateRankA.Rank, 100);
assert.equal(byName.ResearcherDuplicateRankB.Rank, 100);

// Negative numeric rank should remain numeric (edge input, still finite).
assert.equal(byName.ResearcherNegativeRank.Rank, -50);

// Invalid/missing rank values should normalize to fallback rank 0.
assert.equal(byName.ResearcherNonNumericRank.Rank, 0);
assert.equal(byName.ResearcherMissingArea.Rank, 0);

// Invalid/missing area values should normalize to Unassigned.
assert.equal(byName.ResearcherNonNumericRank.Area, 'Unassigned');
assert.equal(byName.ResearcherMissingArea.Area, 'Unassigned');

// Multi-area string should remain stable as a single grouping key.
assert.equal(byName.ResearcherMultipleAreas.Area, 'Engineering, Compliance');

const groups = groupByArea(normalizedRoles);

assert.ok(Array.isArray(groups.Unassigned), 'Expected Unassigned group to exist for missing/blank areas');
assert.equal(groups.Unassigned.length, 2, 'Expected two roles to map to Unassigned area');
assert.ok(Array.isArray(groups.Engineering), 'Expected Engineering group to exist');
assert.equal(groups.Engineering.length, 2, 'Expected duplicate rank Engineering roles in same group');
assert.ok(Array.isArray(groups['Engineering, Compliance']), 'Expected multi-area group key to be preserved');
assert.equal(groups['Engineering, Compliance'].length, 1);

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.style = { display: '' };
    this.className = '';
    this.textContent = '';
    this.onclick = null;
    this._innerHTML = '';
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

const documentStub = {
  createElement(tagName) {
    return new Element(tagName);
  }
};

const localStorageStub = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {}
};

globalThis.document = documentStub;
globalThis.localStorage = localStorageStub;

const container = new Element('div');
assert.doesNotThrow(() => {
  renderSidebar(groups, () => {}, container);
}, 'renderSidebar should not crash when handed grouped normalized roles');

assert.ok(container.children.length >= 1, 'Expected sidebar renderer to output area sections');

console.log('researcher rank/area edge validation passed');
