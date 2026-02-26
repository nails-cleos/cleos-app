module.exports = (config: any) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage'),
      require('karma-spec-reporter'),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/cleos'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' },
        { type: 'text-summary' },
        { type: 'json-summary' },
      ],
      check: {
        global: {
          statements: 80,
          branches: 60,
          functions: 70,
          lines: 80,
        },
      },
      exclude: [
        '**/src/app/**/*.actions.ts',
        '**/src/app/**/*.reducers.ts',
        '**/src/app/**/*.effects.ts',
        '**/src/app/**/*.selectors.ts',
      ],
    },
    reporters: ['progress', 'spec', 'kjhtml', 'junit'],
    specReporter: {
      maxLogLines: 5,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: true,
      suppressSkipped: true,
      showSpecTiming: true,
    },
    junitReporter: {
      outputDir: 'test-results',
      outputFile: 'junit-report.xml',
      useBrowserName: false,
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
