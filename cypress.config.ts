import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4300',
    defaultCommandTimeout: 8000
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts'
  },

  reporter: "mocha-multi-reporters",
  reporterOptions: {
    configFile: "multi-reporter-config.json",
  }
})
