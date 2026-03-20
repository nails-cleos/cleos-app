import { TestBed } from '@angular/core/testing';
import { DriveAccessService } from './drive-access.service';
import { Store } from '@ngrx/store';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { GoogleAuthProvider } from 'firebase/auth';

describe('DriveAccessService', () => {
  let service: DriveAccessService;
  let storeSpy: jasmine.SpyObj<Store>;
  let driveToken$: BehaviorSubject<any>;

  beforeEach(() => {
    driveToken$ = new BehaviorSubject<any>(undefined);
    storeSpy = jasmine.createSpyObj<Store>('Store', ['pipe', 'dispatch']);

    storeSpy.pipe.and.returnValue(of(driveToken$.asObservable()));

    TestBed.configureTestingModule({
      providers: [
        DriveAccessService,
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(DriveAccessService);
  });

  afterEach(() => {
    storeSpy.dispatch.calls.reset();
  });

  it('should not dispatch when credential has no access token', async () => {
    spyOn(GoogleAuthProvider, 'credentialFromResult').and.returnValue(null);

    service['requestDriveAccess']();
    await Promise.resolve();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should NOT request access if token already exists', () => {
    driveToken$.next('existing-token');
    (service as any).driveTokenSignal = signal('existing-token');

    const spy = spyOn<any>(service, 'requestDriveAccess');

    service.requestAccessIfNeeded();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should NOT request access when shouldRequest is false', () => {
    const spy = spyOn<any>(service, 'requestDriveAccess');

    service.requestAccessIfNeeded(false);

    expect(spy).not.toHaveBeenCalled();
  });
});
