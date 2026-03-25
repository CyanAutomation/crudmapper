import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const categoryMapPath = path.resolve(__dirname, '../categoryMap.js');

const categoryMapSource = await readFile(categoryMapPath, 'utf8');
const categoryMapModuleUrl = `data:text/javascript,${encodeURIComponent(categoryMapSource)}`;
const { getCategoryForPermission, tokenizePermissionName } = await import(categoryMapModuleUrl);

const fixtures = [
  { name: 'InvoiceApprove', expected: 'Finance', note: 'current prefix case' },
  { name: 'CustomerAccountManage', expected: 'CRM', note: 'compound case transition tokens' },
  { name: 'finance/payment', expected: 'Finance', note: 'namespaced slash token' },
  { name: 'crm\\client-sync', expected: 'CRM', note: 'namespaced backslash and punctuation tokens' },
  { name: 'unknown-capability', expected: 'Other', note: 'fallback category' }
];

for (const fixture of fixtures) {
  assert.equal(
    getCategoryForPermission(fixture.name),
    fixture.expected,
    `Unexpected category for ${fixture.note}: ${fixture.name}`
  );
}

assert.deepEqual(
  tokenizePermissionName('CustomerAccount'),
  ['customer', 'account'],
  'Expected case transition tokenization to split CustomerAccount'
);

assert.deepEqual(
  tokenizePermissionName('finance/payment'),
  ['finance', 'payment'],
  'Expected slash tokenization to split finance/payment'
);

console.log('category map validation passed');
