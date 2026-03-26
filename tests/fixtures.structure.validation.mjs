import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.resolve(__dirname, '../parser.js');
const dataLoaderPath = path.resolve(__dirname, '../dataLoader.js');
const fixturesDir = path.resolve(__dirname, '../data/fixtures');

const parserSource = await readFile(parserPath, 'utf8');
const parserModuleUrl = `data:text/javascript,${encodeURIComponent(parserSource)}`;
const { normalizeRole } = await import(parserModuleUrl);
const { extractRoles } = await import(pathToFileURL(dataLoaderPath).href);

const fixtureFiles = [
  'roles.missing-roles-array.json',
  'roles.null-roles.json',
  'roles.partial-role.json',
  'roles.null-collections.json'
];

const fixtures = await Promise.all(
  fixtureFiles.map(async (filename) => {
    const filePath = path.join(fixturesDir, filename);
    const source = await readFile(filePath, 'utf8');
    return {
      filename,
      json: JSON.parse(source)
    };
  })
);

const missingRolesFixture = fixtures.find(({ filename }) => filename === 'roles.missing-roles-array.json');
const nullRolesFixture = fixtures.find(({ filename }) => filename === 'roles.null-roles.json');
const partialRoleFixture = fixtures.find(({ filename }) => filename === 'roles.partial-role.json');
const nullCollectionsFixture = fixtures.find(({ filename }) => filename === 'roles.null-collections.json');

for (const { filename, json } of [missingRolesFixture, nullRolesFixture]) {
  const extracted = extractRoles(json, filename);
  assert.ok(extracted.error, `Expected ${filename} to produce a schema_mismatch error`);
  assert.equal(extracted.error.type, 'schema_mismatch', `Expected ${filename} schema mismatch type`);
}

const partialExtracted = extractRoles(partialRoleFixture.json, partialRoleFixture.filename);
assert.ok(Array.isArray(partialExtracted.roles), 'Expected partial-role fixture to expose roles');
assert.equal(partialExtracted.roles.length, 2, 'Expected two roles in partial-role fixture');

const [completeRole, partialRole] = partialExtracted.roles.map((role) => normalizeRole(role));

assert.equal(completeRole.Area, 'Engineering', 'Complete role should preserve Area');
assert.equal(completeRole.Rank, 10, 'Complete role should preserve Rank');
assert.equal(completeRole.FriendlyName, 'Complete Role', 'Complete role should preserve FriendlyName');
assert.deepEqual(completeRole.Permissions, ['Account\\R'], 'Complete role should preserve Permissions');
assert.deepEqual(completeRole.Actions, ['OpenDashboard'], 'Complete role should preserve Actions');
assert.deepEqual(completeRole.Navigation, ['Home'], 'Complete role should preserve Navigation');

assert.equal(partialRole.Area, 'Unassigned', 'Missing Area should fallback to Unassigned');
assert.equal(partialRole.Rank, 0, 'Missing Rank should fallback to 0');
assert.equal(partialRole.FriendlyName, 'PartialRole', 'Missing FriendlyName should fallback to Name');
assert.deepEqual(partialRole.Permissions, [], 'Missing Permissions should fallback to []');
assert.deepEqual(partialRole.Actions, [], 'Missing Actions should fallback to []');
assert.deepEqual(partialRole.Navigation, [], 'Missing Navigation should fallback to []');

const nullCollectionsExtracted = extractRoles(nullCollectionsFixture.json, nullCollectionsFixture.filename);
assert.ok(Array.isArray(nullCollectionsExtracted.roles), 'Expected null-collections fixture to expose roles');
assert.equal(nullCollectionsExtracted.roles.length, 1, 'Expected one role in null-collections fixture');

const [nullCollectionsRole] = nullCollectionsExtracted.roles.map((role) => normalizeRole(role));

assert.equal(nullCollectionsRole.Area, 'Unassigned', 'Null Area should fallback to Unassigned');
assert.equal(nullCollectionsRole.Rank, 0, 'Null Rank should fallback to 0');
assert.equal(
  nullCollectionsRole.FriendlyName,
  'NullCollectionsRole',
  'Empty FriendlyName should fallback to Name'
);
assert.deepEqual(nullCollectionsRole.Permissions, [], 'Null Permissions should fallback to []');
assert.deepEqual(nullCollectionsRole.Actions, [], 'Null Actions should fallback to []');
assert.deepEqual(nullCollectionsRole.Navigation, [], 'Null Navigation should fallback to []');

console.log('fixture structure validation passed');
