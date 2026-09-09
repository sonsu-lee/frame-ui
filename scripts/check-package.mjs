import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(root, '.cache'), { recursive: true });
const scratch = await mkdtemp(path.join(root, '.cache/package-'));
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const text = (file) => readFile(file, 'utf8');

try {
  // Stop Node/TypeScript package self-reference at the consumer boundary.
  await writeFile(path.join(scratch, 'package.json'), JSON.stringify({ name: 'frame-ui-package-check', private: true, type: 'module' }));
  // Inspect an actual archive, not source paths or the npm files configuration.
  const [archive] = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', scratch]));
  const contents = archive.files.map((file) => file.path);
  for (const required of ['dist/index.js', 'dist/index.d.ts', 'dist/styles.css']) {
    assert(contents.includes(required), `Packed artifact is missing ${required}`);
  }
  for (const file of contents) {
    assert(/^(dist\/|package\.json$|README\.md$|LICENSE(?:\..*)?$)/.test(file), `Development file leaked into package: ${file}`);
    assert(!/\.(?:test|stories)\.|(?:^|\/)(?:tests|fixtures)\//.test(file), `Test or story leaked into dist: ${file}`);
  }

  const installed = path.join(scratch, 'node_modules/frame-ui');
  await mkdir(installed, { recursive: true });
  run('tar', ['-xzf', path.join(scratch, archive.filename), '-C', installed, '--strip-components=1']);
  const manifest = JSON.parse(await text(path.join(installed, 'package.json')));
  assert.equal(manifest.type, 'module');
  assert.deepEqual(manifest.exports['.'], { types: './dist/index.d.ts', import: './dist/index.js' });
  assert.equal(manifest.exports['./styles.css'], './dist/styles.css');
  assert(manifest.sideEffects.includes('**/*.css'), 'CSS must remain side-effectful');
  for (const peer of ['react', 'react-dom', '@stylexjs/stylex']) {
    assert(manifest.peerDependencies[peer], `${peer} must be a peer dependency`);
    assert(!manifest.dependencies?.[peer], `${peer} must not be an owned runtime dependency`);
  }
  const entry = await text(path.join(installed, 'dist/index.js'));
  assert.match(entry, /^['"]use client['"];?/, 'Bundling must preserve the client boundary');
  assert((await text(path.join(installed, 'dist/styles.css'))).trim(), 'CSS artifact must not be empty');
  const resolved = run(process.execPath, ['--input-type=module', '-e', "console.log(import.meta.resolve('frame-ui')); await import('frame-ui');"], scratch).trim();
  assert.equal(resolved, pathToFileURL(path.join(installed, 'dist/index.js')).href, 'Import must resolve the unpacked artifact');

  await writeFile(path.join(scratch, 'consumer.mts'), "import type * as FrameUI from 'frame-ui';\nexport type PublicAPI = typeof FrameUI;\n");
  const typeFiles = run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--noUncheckedSideEffectImports', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--listFiles', 'consumer.mts'], scratch);
  assert(typeFiles.includes(path.join(installed, 'dist/index.d.ts')), 'TypeScript must resolve the unpacked declaration');
  console.log(`Packed ESM, types, CSS and exports verified (${contents.length} files).`);

  // Exercise JSX, hooks, static CSS and dynamic variables without publishing a demo API.
  const probeDir = path.join(scratch, 'probe');
  await build({
    configFile: path.join(root, 'vite.config.ts'),
    build: {
      outDir: probeDir,
      lib: {
        entry: path.join(root, 'tests/fixtures/stylex-entry.tsx'),
        formats: ['es'],
        fileName: 'index',
        cssFileName: 'styles',
      },
    },
  });
  const jsFiles = (await readdir(probeDir)).filter((file) => file.endsWith('.js'));
  const compiled = (await Promise.all(jsFiles.map((file) => text(path.join(probeDir, file))))).join('\n');
  const css = await text(path.join(probeDir, 'styles.css'));
  assert.match(await text(path.join(probeDir, 'index.js')), /^['"]use client['"];?/);
  for (const peer of ['react', 'react/jsx-runtime', '@stylexjs/stylex']) {
    assert(compiled.includes(`from "${peer}"`) || compiled.includes(`from '${peer}'`), `Expected external import: ${peer}`);
  }
  assert(!/\.create\(/.test(compiled), 'StyleX create() must be compiled away');
  assert(!compiled.includes('inject'), 'Production fixture must not inject styles at runtime');
  const { BuildProbe } = await import(pathToFileURL(path.join(probeDir, 'index.js')).href);
  const html = renderToStaticMarkup(createElement(BuildProbe));
  assert.match(html, /<button\b[^>]*>0<\/button>/);
  assert.match(css, /padding:\s*7px/);
  const classes = html.match(/class="([^"]+)"/)?.[1].split(' ');
  assert(classes?.length, 'Rendered fixture must have StyleX classes');
  for (const className of classes) {
    assert(css.includes(`.${className}`), `Missing extracted rule for ${className}`);
  }
  const variable = html.match(/(--[\w-]+):37px/)?.[1];
  assert(variable, 'Dynamic width must become an inline CSS variable');
  assert(css.includes(`var(${variable})`), 'Extracted CSS must consume the dynamic variable');
  console.log('React/StyleX fixture: client directive, external peers, SSR markup and extracted CSS verified.');
} finally {
  await rm(scratch, { recursive: true, force: true });
}
