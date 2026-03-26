import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.resolve(__dirname, '../parser.js');
const variantsFixturePath = path.resolve(
  __dirname,
  '../data/fixtures/researcher.permission-format-variants.json'
);
const invalidTypesFixturePath = path.resolve(
  __dirname,
  '../data/fixtures/researcher.invalid-permission-types.json'
);

const parserSource = await readFile(parserPath, 'utf8');
const parserModuleUrl = `data:text/javascript,${encodeURIComponent(parserSource)}`;
const { normalizeRole } = await import(parserModuleUrl);

const variantsFixtureSource = await readFile(variantsFixturePath, 'utf8');
const variantsFixtureRole = JSON.parse(variantsFixtureSource);
const variantsNormalizedRole = normalizeRole(variantsFixtureRole);

assert.deepEqual(
  Object.keys(variantsNormalizedRole.NormalizedPermissions),
  ['account'],
  'Expected all account permission variants to normalize to canonical key account'
);

const variantsActualCrud = [...variantsNormalizedRole.NormalizedPermissions.account].sort().join('');
const expectedCrud = 'CDRU'.split('').sort().join('');

assert.equal(
  variantsActualCrud,
  expectedCrud,
  'Expected deduped CRUD letters in NormalizedPermissions.account to equal CDRU'
);

const invalidTypesFixtureSource = await readFile(invalidTypesFixturePath, 'utf8');
const invalidTypesFixtureRole = JSON.parse(invalidTypesFixtureSource);
const invalidTypesNormalizedRole = normalizeRole(invalidTypesFixtureRole);

assert.deepEqual(
  Object.keys(invalidTypesNormalizedRole.NormalizedPermissions).sort(),
  ['account', 'invoice'],
  'Expected only valid string permissions to survive normalization and invalid entries to be ignored'
);

assert.equal(
  [...invalidTypesNormalizedRole.NormalizedPermissions.account].sort().join(''),
  'R',
  'Expected account CRUD content to include only valid string-derived letters'
);

assert.equal(
  [...invalidTypesNormalizedRole.NormalizedPermissions.invoice].sort().join(''),
  'C',
  'Expected invoice CRUD content to include only valid string-derived letters'
);

console.log('researcher permission format variants validation passed');
