import { TestBed } from '@angular/core/testing';

import { FirebaseSdkService } from './firebase.config';

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
    expect(service.onIdTokenChanged).toEqual(jasmine.any(Function));
    expect(service.getToken).toEqual(jasmine.any(Function));
    expect(service.onMessage).toEqual(jasmine.any(Function));
    expect(service.logEvent).toEqual(jasmine.any(Function));
    expect(service.ref).toEqual(jasmine.any(Function));
    expect(service.update).toEqual(jasmine.any(Function));
  });
});
