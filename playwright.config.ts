import { defineConfig } from '@playwright/test';

if (process.platform !== 'linux' || process.arch !== 'arm64' || process.env.FRAME_UI_VISUAL !== '1') {
  throw new Error('Use pnpm test:visual: baselines require the canonical Linux ARM64 container.');
}
if (process.env.CI && process.env.FRAME_UI_UPDATE === '1') {
  throw new Error('Baseline updates are forbidden in CI.');
}
export default defineConfig({
  testDir: './tests/visual',
  outputDir: '.artifacts/visual/results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.FRAME_UI_UPDATE === '1' ? 'all' : 'none',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { toHaveScreenshot: { maxDiffPixels: 0, threshold: 0.2, animations: 'disabled', caret: 'hide' } },
  reporter: [['list'], ['html', { outputFolder: '.artifacts/visual/report', open: 'never' }], ['json', { outputFile: '.artifacts/visual/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:6006', browserName: 'chromium', headless: true,
    deviceScaleFactor: 1, colorScheme: 'light', locale: 'ko-KR', timezoneId: 'Asia/Tokyo',
    reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'narrow', use: { viewport: { width: 360, height: 800 } } },
  ],
  webServer: {
    command: 'pnpm exec vite preview --config .storybook/vite.config.ts --outDir storybook-static --host 127.0.0.1 --port 6006 --strictPort',
    url: 'http://127.0.0.1:6006/iframe.html', reuseExistingServer: false, timeout: 30_000,
  },
});
