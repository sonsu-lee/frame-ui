import { fileURLToPath } from 'node:url';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
      dev: false,
      runtimeInjection: false,
    }),
  ],
  build: {
    target: 'es2022',
    minify: false,
    lib: {
      entry: fileURLToPath(new URL('./build/entry.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    rolldownOptions: {
      external: /^(react|react-dom|@stylexjs\/stylex)(\/.*)?$/,
      output: {
        // The public component entry is a client boundary, even after bundling.
        banner: '"use client";',
      },
    },
  },
});
