import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'wr2ba6',

  e2e: {
    baseUrl: 'http://localhost:4300',
    defaultCommandTimeout: 8000,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    allowCypressEnv: false,
  },

  reporter: 'mocha-multi-reporters',
  reporterOptions: {
    configFile: 'multi-reporter-config.json',
  },
});
