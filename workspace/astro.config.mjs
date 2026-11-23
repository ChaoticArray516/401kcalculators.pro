import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://401kcalculators.pro',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
