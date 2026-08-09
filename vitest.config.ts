import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/test-setup.ts'],
    fileParallelism: true,
    reporters: ['dot'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'lcov', 'text', 'json-summary'],
      reportsDirectory: './coverage/cleos',
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
      exclude: ['**/src/app/**/*-stub.component.ts'],
    },
  },
});
