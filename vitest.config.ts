import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  optimizeDeps: { include: ['@stylexjs/stylex/lib/stylex-inject'] },
  plugins: [storybookTest({ configDir: '.storybook' })],
  test: {
    name: 'storybook',
    reporters: ['default', ['junit', { outputFile: '.artifacts/storybook/junit.xml' }]],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ contextOptions: { reducedMotion: 'reduce', locale: 'ko-KR', timezoneId: 'Asia/Tokyo' } }),
      instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
    },
  },
});
