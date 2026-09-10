import type { StorybookConfig } from '@storybook/react-vite';
import stylex from '@stylexjs/unplugin';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  core: { disableTelemetry: true },
  // Vitest also consumes viteFinal. Keep StyleX here so each consumer applies it once.
  viteFinal: async (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), process.env.VITEST
      // Vitest has no HTTP-server lifecycle for StyleX 0.19's CSS polling timer.
      // The official Rollup transform injects test CSS without a dev-server timer.
      ? stylex.rollup({ useCSSLayers: true, runtimeInjection: true })
      : stylex.vite({ useCSSLayers: true })],
  }),
};
export default config;
