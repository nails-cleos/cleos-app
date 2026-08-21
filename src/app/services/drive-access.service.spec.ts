import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DriveAccessService } from './drive-access.service';
import { signal } from '@angular/core';
import { AuthStore } from '../store/auth.store';
describe('DriveAccessService', () => {
  let service: DriveAccessService;

  let authStoreSpy: {
    driveToken: ReturnType<typeof signal>;
    getDriveToken: Mock;
  };

  beforeEach(() => {
    authStoreSpy = {
      driveToken: signal(undefined),
      getDriveToken: vi.fn().mockName('getDriveToken'),
    };

    TestBed.configureTestingModule({
      providers: [
        DriveAccessService,
        { provide: AuthStore, useValue: authStoreSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    service = TestBed.inject(DriveAccessService);
  });

  it('should not dispatch when credential has no access token', async () => {
    service['requestDriveAccess']();
    await Promise.resolve();

    expect(authStoreSpy.getDriveToken).toHaveBeenCalled();
  });

  it('should NOT request access if token already exists', () => {
    authStoreSpy.driveToken.set('existing-token');
    (service as any).driveTokenSignal = signal('existing-token');

    const spy = vi
      .spyOn<any, any>(service, 'requestDriveAccess')
      .mockReturnValue(undefined);

    service.requestAccessIfNeeded();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should NOT request access when shouldRequest is false', () => {
    const spy = vi
      .spyOn<any, any>(service, 'requestDriveAccess')
      .mockReturnValue(undefined);

    service.requestAccessIfNeeded(false);

    expect(spy).not.toHaveBeenCalled();
  });
});
