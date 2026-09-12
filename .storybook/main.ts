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
  // Storybook has its own application build. Keep the library Vite config out of it.
  viteFinal: async (config) => ({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      process.env.VITEST
        ? stylex.rollup({ useCSSLayers: true, runtimeInjection: true })
        : stylex.vite({ useCSSLayers: true }),
    ],
  }),
};

export default config;
