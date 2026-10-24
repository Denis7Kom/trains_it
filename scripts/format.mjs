import { readFile, writeFile } from 'node:fs/promises';
import { formatPage, pages, root, settings } from './site-tools.mjs';

const check = process.argv.includes('--check');
const options = await settings();
for (const page of pages) {
  const path = new URL(page, root);
  const source = await readFile(path, 'utf8');
  const formatted = await formatPage(source, options);
  if (formatted === source) continue;
  if (check) {
    console.error(`${page}: inline CSS or JavaScript needs formatting`);
    process.exitCode = 1;
  } else {
    await writeFile(path, formatted);
    console.log(`Formatted ${page}`);
  }
}
