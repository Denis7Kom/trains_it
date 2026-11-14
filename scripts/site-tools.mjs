import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { format } from 'prettier/standalone';
import babel from 'prettier/plugins/babel';
import estree from 'prettier/plugins/estree';
import postcss from 'prettier/plugins/postcss';

export const pages = ['index.html', 'en/index.html', 'it/index.html'];
export const root = new URL('../', import.meta.url);
const plugins = [babel, estree, postcss];
const blocks = /<(style|script)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
const metadata = new Set([
  'start',
  'end',
  'loc',
  'range',
  'extra',
  'tokens',
  'errors',
  'comments',
  'leadingComments',
  'trailingComments',
  'innerComments',
]);

function normalizeAst(value) {
  if (Array.isArray(value)) return value.map(normalizeAst);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !metadata.has(key))
      .map(([key, item]) => [key, normalizeAst(item)]),
  );
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function language(tag, attributes) {
  if (tag.toLowerCase() === 'style') return 'css';
  // Preserve non-executable script data if it is introduced later.
  const type = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
  return !type || ['module', 'text/javascript', 'application/javascript'].includes(type)
    ? 'babel'
    : null;
}

export async function formatPage(source, options) {
  let output = '';
  let cursor = 0;
  for (const match of source.matchAll(blocks)) {
    const [whole, tag, attributes, body] = match;
    const parser = language(tag, attributes);
    if (!parser) continue;
    const opening = whole.slice(0, whole.indexOf('>') + 1);
    const closing = whole.slice(whole.lastIndexOf('</'));
    output += source.slice(cursor, match.index) + opening + '\n';
    output += await format(body, { ...options, parser, plugins });
    output += closing;
    cursor = match.index + whole.length;
  }
  return output + source.slice(cursor);
}

export async function fingerprint(source, options) {
  const scripts = [];
  const styles = [];
  let shell = '';
  let cursor = 0;
  for (const match of source.matchAll(blocks)) {
    const [whole, tag, attributes, body] = match;
    const parser = language(tag, attributes);
    if (!parser) continue;
    const opening = whole.slice(0, whole.indexOf('>') + 1);
    const closing = whole.slice(whole.lastIndexOf('</'));
    shell += source.slice(cursor, match.index) + opening + '__INLINE_CODE__' + closing;
    cursor = match.index + whole.length;
    if (parser === 'babel') {
      const ast = await babel.parsers.babel.parse(body, {});
      scripts.push(digest(JSON.stringify(normalizeAst(ast))));
    } else {
      styles.push(digest(await format(body, { ...options, parser, plugins })));
    }
  }
  shell += source.slice(cursor);
  return { markup: digest(shell), scripts, styles };
}

export async function settings() {
  return JSON.parse(await readFile(new URL('.prettierrc.json', root), 'utf8'));
}
