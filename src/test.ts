/// <reference types="jasmine" />
// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Mock global functions for Firebase Analytics and other services
(window as any).gtag = jasmine.createSpy('gtag');
(window as any).gtagFunction = jasmine.createSpy('gtagFunction');

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false },
  },
);
