/// <reference types="jasmine" />
// This file is required by karma.conf.ts and loads recursively all the .spec and framework files

// Mock global functions for Firebase Analytics and other services
(window as any).gtag = jasmine.createSpy('gtag');
(window as any).gtagFunction = jasmine.createSpy('gtagFunction');

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false },
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
