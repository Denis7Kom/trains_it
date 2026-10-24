import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fingerprint, pages, root, settings } from './site-tools.mjs';

const options = await settings();
const manifest = new URL('scripts/site-baseline.json', root);
const record = process.argv.includes('--record');
const expected = record ? {} : JSON.parse(await readFile(manifest, 'utf8'));
const actual = {};
for (const page of pages) {
  actual[page] = await fingerprint(await readFile(new URL(page, root), 'utf8'), options);
  if (!record) {
    assert.deepEqual(actual[page], expected[page], `${page}: markup, JS logic or CSS changed`);
    console.log(`${page}: markup, JavaScript AST and canonical CSS match baseline`);
  }
}
if (record) {
  await writeFile(manifest, JSON.stringify(actual, null, 2) + '\n');
  console.log('Baseline recorded. Review site changes before committing this manifest.');
}
