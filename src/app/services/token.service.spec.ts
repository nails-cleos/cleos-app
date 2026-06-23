import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';

import { TokenService } from './token.service';
import { FirebaseService } from './firebase.service';
import { IUserAll } from '../user/user';
import { AuthStore } from '../store/auth.store';

describe('TokenService', () => {
  let service: TokenService;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;
  let userSignal: WritableSignal<any>;
  let authStoreSpy: {
    driveToken: ReturnType<typeof signal>;
  };

  const firebaseUser = {
    getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('initial-token'),
  };

  beforeEach(() => {
    authStoreSpy = {
      driveToken: signal(undefined),
    };
    userSignal = signal(firebaseUser);

    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['getIdToken'], {
      user: userSignal.asReadonly(),
      idTokenResult: Promise.resolve({ expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() }),
    });
    firebaseServiceSpy.getIdToken.and.resolveTo('refreshed-token');

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

  it('should store the firebase id token when the firebase user changes', fakeAsync(() => {
    TestBed.tick();
    flushMicrotasks();

    expect(firebaseUser.getIdToken).toHaveBeenCalled();
    expect(service.token()).toBe('initial-token');
  }));

  it('should clear the token and user when firebase user becomes null', fakeAsync(() => {
    service.setUser = { id: 'user-1' } as IUserAll;
    TestBed.tick();
    flushMicrotasks();

    userSignal.set(null);
    TestBed.tick();
    tick();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  }));

  it('should refresh the token when it is near expiration', fakeAsync(() => {
    TestBed.tick();
    flushMicrotasks();
    firebaseServiceSpy.getIdToken.calls.reset();

    Object.defineProperty(firebaseServiceSpy, 'idTokenResult', {
      value: Promise.resolve({ expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString() }),
      configurable: true,
    });

    (service as any).tokenSignal.set('initial-token');
    TestBed.tick();
    flushMicrotasks();
    tick();
    flushMicrotasks();

    expect(firebaseServiceSpy.getIdToken).toHaveBeenCalledWith(true);
    expect(service.token()).toBe('refreshed-token');
  }));

  it('should not refresh the token when expiration is still far away', fakeAsync(() => {
    TestBed.tick();
    flushMicrotasks();
    firebaseServiceSpy.getIdToken.calls.reset();

    Object.defineProperty(firebaseServiceSpy, 'idTokenResult', {
      value: Promise.resolve({ expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() }),
      configurable: true,
    });

    (service as any).tokenSignal.set('initial-token');
    TestBed.tick();
    flushMicrotasks();
    tick();
    flushMicrotasks();

    expect(firebaseServiceSpy.getIdToken).not.toHaveBeenCalledWith(true);
    expect(service.token()).toBe('initial-token');
  }));

  it('should clear token and user when clear is called', () => {
    service.setUser = { id: 'user-1' } as IUserAll;

    service.clear();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  });
});
