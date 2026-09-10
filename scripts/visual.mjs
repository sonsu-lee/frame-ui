import { spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const update = args[0] === '--update';
if (update) args.shift();
const targets = ['error-transition', 'portal-transition', 'long-text'];
if (args.length > 1 || (args[0] && !targets.includes(args[0])) || (update && !args[0])) {
  throw new Error(`Choose exactly one baseline target: ${targets.join(', ')}. Normal runs may omit the target.`);
}
if (update && process.env.CI) throw new Error('Baseline updates are forbidden in CI.');
const image = 'frame-ui-visual:playwright-1.63.0-arm64';
const digest = 'mcr.microsoft.com/playwright:v1.63.0-noble@sha256:a0f4498920a5dbac63196d9140ed738ef00470f27e2e74029abd8850b7bd5717';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const commit = git('rev-parse', 'HEAD');
const dirty = git('status', '--porcelain').length > 0;
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const screenshots = `${root}tests/visual/__screenshots__`;
const artifacts = `${root}.artifacts/visual`;
mkdirSync(screenshots, { recursive: true });
mkdirSync(artifacts, { recursive: true });
run('docker', ['build', '--platform', 'linux/arm64', '-f', 'Dockerfile.visual', '-t', image, '.']);
run('docker', ['run', '--rm', '--platform', 'linux/arm64', '--init', '--ipc=host',
  '--mount', `type=bind,source=${screenshots},target=/workspace/tests/visual/__screenshots__${update ? '' : ',readonly'}`,
  '--mount', `type=bind,source=${artifacts},target=/workspace/.artifacts/visual`,
  '-e', `FRAME_UI_COMMIT=${commit}`, '-e', `FRAME_UI_DIRTY=${dirty}`, '-e', `FRAME_UI_IMAGE=${digest}`,
  // CI inside the image makes tooling deterministic; only local selected updates clear it.
  ...(update ? ['-e', 'CI=', '-e', 'FRAME_UI_UPDATE=1'] : []),
  image, 'sh', '-c', 'VITE_FRAME_UI_A11Y_OWNER=playwright pnpm build:storybook && pnpm exec playwright test "$@"', 'visual',
  ...(args[0] ? ['--grep', ` ${args[0]}$`] : []),
]);
