import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parserPath = path.resolve(__dirname, '../parser.js');
const fixturePath = path.resolve(
  __dirname,
  '../data/fixtures/researcher.permission-format-variants.json'
);

const parserSource = await readFile(parserPath, 'utf8');
const parserModuleUrl = `data:text/javascript,${encodeURIComponent(parserSource)}`;
const { normalizeRole } = await import(parserModuleUrl);

const fixtureSource = await readFile(fixturePath, 'utf8');
const fixtureRole = JSON.parse(fixtureSource);
const normalizedRole = normalizeRole(fixtureRole);

assert.deepEqual(
  Object.keys(normalizedRole.NormalizedPermissions),
  ['account'],
  'Expected all account permission variants to normalize to canonical key account'
);

const actualCrud = [...normalizedRole.NormalizedPermissions.account].sort().join('');
const expectedCrud = 'CDRU'.split('').sort().join('');

assert.equal(
  actualCrud,
  expectedCrud,
  'Expected deduped CRUD letters in NormalizedPermissions.account to equal CDRU'
);

console.log('researcher permission format variants validation passed');
