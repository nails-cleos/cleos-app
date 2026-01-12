import { TestBed } from '@angular/core/testing';
import { DriveAccessService } from './drive-access.service';
import * as auth from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

describe('DriveAccessService', () => {
  let service: DriveAccessService;
  let storeSpy: jasmine.SpyObj<Store>;
  let authSpy: jasmine.SpyObj<Auth>;

  let driveToken$: BehaviorSubject<any>;

  beforeEach(() => {
    driveToken$ = new BehaviorSubject<any>(undefined);
    storeSpy = jasmine.createSpyObj<Store>('Store', ['pipe', 'dispatch']);
    authSpy = jasmine.createSpyObj('Auth', ['onIdTokenChanged'], {
      currentUser: null,
    });

    storeSpy.pipe.and.returnValue(of(driveToken$.asObservable()));

    TestBed.configureTestingModule({
      providers: [
        DriveAccessService,
        { provide: Store, useValue: storeSpy },
        { provide: Auth, useValue: authSpy },
      ],
    });

    service = TestBed.inject(DriveAccessService);

    spyOn(service as any, 'callSignInWithPopup');
  });

  afterEach(() => {
    storeSpy.dispatch.calls.reset();
  });

  it('should not dispatch when credential has no access token', async () => {
    spyOn(auth.GoogleAuthProvider, 'credentialFromResult').and.returnValue(null);

    service.requestDriveAccess();
    await Promise.resolve();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should NOT request access if token already exists', () => {
    driveToken$.next('existing-token');
    (service as any).driveTokenSignal = signal('existing-token');

    const spy = spyOn(service, 'requestDriveAccess');

    service.requestAccessIfNeeded();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should NOT request access when shouldRequest is false', () => {
    const spy = spyOn(service, 'requestDriveAccess');

    service.requestAccessIfNeeded(false);

    expect(spy).not.toHaveBeenCalled();
  });
});
