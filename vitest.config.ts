import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    environment: 'node',
    globals: false,
    testTimeout: 10000,
    setupFiles: ['./tests/setup.ts'],
  },
});
