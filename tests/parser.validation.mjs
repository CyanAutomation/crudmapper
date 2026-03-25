import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

const nullPermissionsRole = normalizeRole({
  Name: 'Null Permissions',
  Permissions: null,
  Actions: null,
  Navigation: null
});
assert.deepEqual(nullPermissionsRole.Permissions, [], 'Permissions should fallback to [] when null');
assert.deepEqual(nullPermissionsRole.Actions, [], 'Actions should fallback to [] when null');
assert.deepEqual(nullPermissionsRole.Navigation, [], 'Navigation should fallback to [] when null');
assert.deepEqual(
  Object.keys(nullPermissionsRole.NormalizedPermissions),
  [],
  'Expected no normalized permissions for null Permissions'
);

const mixedPermissionsRole = normalizeRole({
  Name: 'Mixed Permission Types',
  Permissions: ['Invoice\\R', 42, null, { raw: 'Account\\CRUD' }, 'Account\\CRUD']
});
assert.deepEqual(
  Object.keys(mixedPermissionsRole.NormalizedPermissions).sort(),
  ['account', 'invoice'],
  'Expected non-string permission entries to be skipped during normalization'
);
assert.deepEqual(
  [...mixedPermissionsRole.NormalizedPermissions.account].sort(),
  ['C', 'D', 'R', 'U'],
  'Expected account CRUD letters to come only from valid string entries'
);

const missingAreaRankRole = normalizeRole({
  Name: 'Missing Area Rank',
  FriendlyName: '',
  Permissions: ['Client\\R']
});
assert.equal(missingAreaRankRole.Area, 'Unassigned', 'Missing Area should fallback to Unassigned');
assert.equal(missingAreaRankRole.Rank, 0, 'Missing Rank should fallback to 0');
assert.equal(missingAreaRankRole.FriendlyName, 'Missing Area Rank', 'FriendlyName should fallback to Name when empty');

class FakeClassList {
  constructor(host) {
    this.host = host;
  }

  add(name) {
    const names = new Set((this.host.className || '').split(/\s+/).filter(Boolean));
    names.add(name);
    this.host.className = [...names].join(' ');
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.className = '';
    this.onclick = null;
    this._textContent = '';
    this.classList = new FakeClassList(this);
    this._namedNodes = {};
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  remove() {
    if (!this.parentNode) return;
    const idx = this.parentNode.children.indexOf(this);
    if (idx >= 0) {
      this.parentNode.children.splice(idx, 1);
    }
    this.parentNode = null;
  }

  set textContent(value) {
    this._textContent = value == null ? '' : String(value);
  }

  get textContent() {
    return this._textContent;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    this._namedNodes = {};

    if (typeof html === 'string' && html.includes('id="permSearch"')) {
      const input = new FakeElement('input');
      input.id = 'permSearch';
      this._namedNodes['#permSearch'] = input;
      this.appendChild(input);
    }
  }

  get innerHTML() {
    return this._innerHTML ?? '';
  }

  querySelector(selector) {
    if (selector in this._namedNodes) {
      return this._namedNodes[selector];
    }

    for (const child of this.children) {
      const found = child.querySelector(selector);
      if (found) return found;
    }

    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    const classSelector = selector.startsWith('.') ? selector.slice(1) : null;

    const visit = (node) => {
      if (classSelector) {
        const classNames = (node.className || '').split(/\s+/).filter(Boolean);
        if (classNames.includes(classSelector)) {
          results.push(node);
        }
      }

      for (const child of node.children) {
        visit(child);
      }
    };

    for (const child of this.children) {
      visit(child);
    }

    return results;
  }

  addEventListener() {}
}

const fakeDocument = {
  createElement(tagName) {
    return new FakeElement(tagName);
  }
};

globalThis.document = fakeDocument;
globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {}
};

const uiSidebarModule = await import(pathToFileURL(path.resolve(__dirname, '../uiSidebar.js')).href);
const uiRoleViewModule = await import(pathToFileURL(path.resolve(__dirname, '../uiRoleView.js')).href);

const malformedForUi = normalizeRole({
  Name: 'UI Validation Role',
  Permissions: [null, 'Invoice\\R'],
  Area: undefined,
  Rank: undefined
});

assert.doesNotThrow(() => {
  const sidebarContainer = new FakeElement('div');
  uiSidebarModule.renderSidebar({ [malformedForUi.Area]: [malformedForUi] }, () => {}, sidebarContainer);
}, 'renderSidebar should tolerate normalized malformed roles');

assert.doesNotThrow(() => {
  const roleContainer = new FakeElement('div');
  uiRoleViewModule.renderRole(malformedForUi, roleContainer);
}, 'renderRole should tolerate normalized malformed roles');

console.log('parser validation passed');
