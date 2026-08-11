import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';

import { TokenService } from './token.service';
import { FirebaseService } from './firebase.service';
import { IUserAll } from '../user/user';
import { AuthStore } from '../store/auth.store';
import { IdTokenResult } from 'firebase/auth';
describe('TokenService', () => {
  let service: TokenService;

  let firebaseServiceSpy: Pick<
    FirebaseService,
    'getIdToken' | 'idTokenResult' | 'user'
  > & {
    getIdToken: ReturnType<typeof vi.fn>;
  };

  let userSignal: WritableSignal<any>;
  let authStoreSpy: {
    driveToken: ReturnType<typeof signal>;
  };

  const firebaseUser = {
    getIdToken: vi
      .fn()
      .mockName('getIdToken')
      .mockResolvedValue('initial-token'),
  };

  beforeEach(() => {
    authStoreSpy = {
      driveToken: signal(undefined),
    };
    userSignal = signal(firebaseUser);

    firebaseServiceSpy = {
      getIdToken: vi.fn().mockName('FirebaseService.getIdToken'),
      user: userSignal.asReadonly(),
      idTokenResult: Promise.resolve({
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      } as IdTokenResult),
    };
    firebaseServiceSpy.getIdToken.mockResolvedValue('refreshed-token');

    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    });

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.driveToken()).toBeUndefined();
  });

  it('should expose the drive token from the store', () => {
    authStoreSpy.driveToken.set('driveToken');

    expect(service.driveToken()).toBe('driveToken');
  });

  it('should store the firebase id token when the firebase user changes', async () => {
    TestBed.tick();
    await Promise.resolve();

    expect(firebaseUser.getIdToken).toHaveBeenCalled();
    expect(service.token()).toBe('initial-token');
  });

  it('should clear the token and user when firebase user becomes null', async () => {
    service.setUser = { id: 'user-1' } as IUserAll;
    TestBed.tick();
    await Promise.resolve();

    userSignal.set(null);
    TestBed.tick();
    await Promise.resolve();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('should refresh the token when it is near expiration', async () => {
    vi.useFakeTimers();

    try {
      Object.defineProperty(firebaseServiceSpy, 'idTokenResult', {
        value: Promise.resolve({
          expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        } as IdTokenResult),
        configurable: true,
      });

      firebaseServiceSpy.getIdToken.mockResolvedValue('refreshed-token');

      // This causes the second effect to start the refresh timer.
      (service as any).tokenSignal.set('initial-token');

      TestBed.tick();

      // timer(0, ...) has now been created, but hasn't fired.
      await vi.advanceTimersByTimeAsync(0);

      expect(firebaseServiceSpy.getIdToken).toHaveBeenCalledWith(true);
      expect(service.token()).toBe('refreshed-token');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should not refresh the token when expiration is still far away', async () => {
    TestBed.tick();
    await Promise.resolve();
    firebaseServiceSpy.getIdToken.mockClear();

    Object.defineProperty(firebaseServiceSpy, 'idTokenResult', {
      value: Promise.resolve({
        expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
      configurable: true,
    });

    (service as any).tokenSignal.set('initial-token');
    await Promise.resolve();

    expect(firebaseServiceSpy.getIdToken).not.toHaveBeenCalledWith(true);
    expect(service.token()).toBe('initial-token');
  });

  it('should clear token and user when clear is called', () => {
    service.setUser = { id: 'user-1' } as IUserAll;

    service.clear();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  });
});
