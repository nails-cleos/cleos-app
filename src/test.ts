/// <reference types="jasmine" />
// This file is required by karma.conf.ts and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(), {
    teardown: { destroyAfterEach: true },
  },
);

// Test Logging
// jasmine.getEnv().addReporter({
//   specDone: (result) => {
//     const status = result.status.toUpperCase();
//     console.log(`[${status}] ${result.fullName}`);
//   },
//   suiteDone: (suite) => {
//     if (suite.failedExpectations.length > 0) {
//       console.warn('Suite failed:', suite.fullName, suite.failedExpectations);
//     }
//   },
// });
