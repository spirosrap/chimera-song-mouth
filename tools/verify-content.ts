import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'MEDIA-MANIFEST.json');
type Entry = { path: string; bytes: number; sha256: string };
type Manifest = { schema: number; files: Entry[] };

async function filesIn(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected media symlink: ${path}`);
    if (entry.isDirectory()) out.push(...await filesIn(path));
    else if (entry.isFile()) out.push(path);
  }
  return out.sort();
}

const files: Entry[] = [];
for (const path of await filesIn(join(root, 'public'))) {
  const data = await readFile(path);
  files.push({ path: relative(root, path).replaceAll('\\', '/'), bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex') });
}
if (process.argv.includes('--write')) {
  await writeFile(manifestPath, JSON.stringify({ schema: 1, files }, null, 2) + '\n');
  console.log(`Recorded ${files.length} public files in MEDIA-MANIFEST.json.`);
} else {
  const expected = JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest;
  if (expected.schema !== 1 || !Array.isArray(expected.files)) throw new Error('Invalid media manifest.');
  const current = new Map(files.map(file => [file.path, file]));
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const file of expected.files) {
    if (seen.has(file.path)) problems.push(`Duplicate manifest path: ${file.path}`);
    seen.add(file.path);
    const actual = current.get(file.path);
    if (!actual) problems.push(`Missing: ${file.path}`);
    else if (actual.bytes !== file.bytes || actual.sha256 !== file.sha256) problems.push(`Changed: ${file.path}`);
    current.delete(file.path);
  }
  for (const path of current.keys()) problems.push(`Unlisted: ${path}`);
  if (problems.length) throw new Error(`Content verification failed:\n${problems.join('\n')}`);
  const wasm = await readFile(join(root, 'src/wasm/chimera.wasm'));
  if (!WebAssembly.validate(wasm)) throw new Error('The precompiled CHIMERA engine is missing or invalid.');
  const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
  console.log(`Verified ${files.length} public files (${(bytes / 1048576).toFixed(2)} MiB) and the WebAssembly engine.`);
}
