import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    fileParallelism: true,
    reporters:
      process.env.GITHUB_ACTIONS === 'true'
        ? ['dot', 'github-actions', 'junit']
        : ['default', 'html'],
    outputFile: {
      junit: 'test-results/junit-report.xml',
      html: 'test-results/html-report.html',
    },
    coverage: {
      provider: 'v8',
      reporter:
        process.env.GITHUB_ACTIONS === 'true'
          ? ['lcov', 'text', 'json-summary']
          : ['html', 'lcov', 'text', 'json-summary'],
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
