import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  optimizeDeps: { include: ['@stylexjs/stylex/lib/stylex-inject'] },
  test: {
    reporters: [
      'default',
      ['junit', { outputFile: '.artifacts/storybook/junit.xml' }],
    ],
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          setupFiles: ['./.storybook/vitest.setup.ts'],
          attachmentsDir: '.artifacts/storybook/attachments',
          browser: {
            enabled: true,
            headless: true,
            screenshotFailures: true,
            screenshotDirectory: '.artifacts/storybook/screenshots',
            provider: playwright({
              contextOptions: {
                reducedMotion: 'reduce',
                locale: 'ko-KR',
                timezoneId: 'Asia/Tokyo',
              },
            }),
            instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
          },
        },
      },
    ],
  },
});
