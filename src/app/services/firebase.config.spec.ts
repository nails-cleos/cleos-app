import { TestBed } from '@angular/core/testing';

import { FirebaseSdkService } from './firebase.config';
import { beforeEach, describe, expect, it } from 'vitest';

describe('FirebaseSdkService', () => {
  let service: FirebaseSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirebaseSdkService],
    });

    service = TestBed.inject(FirebaseSdkService);
  });

  it('should expose the firebase SDK helpers used by the app', () => {
    expect(service.auth).toBeDefined();
    expect(service.appCheck).toBeDefined();
    expect(service.onIdTokenChanged).toEqual(expect.any(Function));
    expect(service.getToken).toEqual(expect.any(Function));
    expect(service.onMessage).toEqual(expect.any(Function));
    expect(service.logEvent).toEqual(expect.any(Function));
    expect(service.ref).toEqual(expect.any(Function));
    expect(service.update).toEqual(expect.any(Function));
  });
});
