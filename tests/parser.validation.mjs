import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parserPath = path.resolve(__dirname, '../parser.js');

const parserSource = await readFile(parserPath, 'utf8');
const parserModuleUrl = `data:text/javascript,${encodeURIComponent(parserSource)}`;
const { parsePermission, normalizeRole } = await import(parserModuleUrl);

const fixtures = [
  {
    input: 'Standalone Line\nC R',
    expectedName: 'Standalone Line',
    expectedCrud: 'CR'
  },
  {
    input: 'Inline Compact - CR',
    expectedName: 'Inline Compact',
    expectedCrud: 'CR'
  },
  {
    input: 'Delimited Inline (C,R)',
    expectedName: 'Delimited Inline',
    expectedCrud: 'CR'
  },
  {
    input: 'Verb Words - Create Read',
    expectedName: 'Verb Words',
    expectedCrud: 'CR'
  },
  {
    input: 'Account\\R',
    expectedName: 'Account',
    expectedCrud: 'R'
  },
  {
    input: 'Client\\CRU',
    expectedName: 'Client',
    expectedCrud: 'CRU'
  },
  {
    input: 'Invoice\\CRUD',
    expectedName: 'Invoice',
    expectedCrud: 'CRUD'
  },
  {
    input: 'Permission Name',
    expectedName: 'Permission Name',
    expectedCrud: ''
  }
];

for (const fixture of fixtures) {
  const parsed = parsePermission(fixture.input);
  assert.equal(parsed.name, fixture.expectedName, `Unexpected name for: ${fixture.input}`);
  assert.equal(parsed.canonicalName, fixture.expectedName.toLowerCase(), `Unexpected canonical name for: ${fixture.input}`);
  assert.equal(parsed.crud, fixture.expectedCrud, `Unexpected CRUD for: ${fixture.input}`);

  const role = normalizeRole({ Name: 'Validation Role', Permissions: [fixture.input] });
  const normalizedSet = role.NormalizedPermissions[parsed.canonicalName];

  assert.ok(normalizedSet instanceof Set, `Expected Set for canonical key: ${parsed.canonicalName}`);
  assert.equal(normalizedSet.size, fixture.expectedCrud.length, `Unexpected set size for: ${fixture.input}`);

  for (const token of fixture.expectedCrud) {
    assert.ok(
      normalizedSet.has(token),
      `Expected NormalizedPermissions[${parsed.canonicalName}] to include ${token}`
    );
  }
}

const dedupRole = normalizeRole({
  Name: 'Dedup Validation Role',
  Permissions: ['Account\\R', 'Account\\CRU']
});

assert.ok(dedupRole.NormalizedPermissions.account instanceof Set, 'Expected dedup set for account');
assert.deepEqual(
  [...dedupRole.NormalizedPermissions.account].sort(),
  ['C', 'R', 'U'],
  'Expected Account\\R and Account\\CRU to normalize to the same canonical key'
);
assert.equal(dedupRole.PermissionLabels.account, 'Account', 'Expected canonical label for deduped Account key');

console.log('parser validation passed');
