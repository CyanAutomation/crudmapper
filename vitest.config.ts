import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
