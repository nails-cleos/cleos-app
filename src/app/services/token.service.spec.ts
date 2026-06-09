import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { Store } from '@ngrx/store';

import { TokenService } from './token.service';
import { AuthState } from '../store/reducers/auth.reducers';
import { FirebaseService } from './firebase.service';
import { IUserAll } from '../user/user';

describe('TokenService', () => {
  let service: TokenService;
  let storeSpy: jasmine.SpyObj<Store<AuthState>>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;
  let driveToken$: BehaviorSubject<string | undefined>;
  let userSignal: WritableSignal<any>;

  const firebaseUser = {
    getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('initial-token'),
  };

  beforeEach(() => {
    driveToken$ = new BehaviorSubject<string | undefined>('driveToken');
    userSignal = signal(firebaseUser);

    storeSpy = jasmine.createSpyObj<Store<AuthState>>('Store', ['pipe']);
    storeSpy.pipe.and.returnValue(driveToken$.asObservable());

    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['getIdToken'], {
      user: userSignal.asReadonly(),
      idTokenResult: Promise.resolve({ expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() }),
    });
    firebaseServiceSpy.getIdToken.and.resolveTo('refreshed-token');

    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: Store, useValue: storeSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    });

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the drive token from the store', () => {
    expect(service.driveToken()).toBe('driveToken');
  });

  it('should store the firebase id token when the firebase user changes', fakeAsync(() => {
    TestBed.flushEffects();
    flushMicrotasks();

    expect(firebaseUser.getIdToken).toHaveBeenCalled();
    expect(service.token()).toBe('initial-token');
  }));

  it('should clear the token and user when firebase user becomes null', fakeAsync(() => {
    service.setUser = { id: 'user-1' } as IUserAll;
    TestBed.flushEffects();
    flushMicrotasks();

    userSignal.set(null);
    TestBed.flushEffects();
    tick();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  }));

  it('should refresh the token when it is near expiration', fakeAsync(() => {
    TestBed.flushEffects();
    flushMicrotasks();
    firebaseServiceSpy.getIdToken.calls.reset();

    Object.defineProperty(firebaseServiceSpy, 'idTokenResult', {
      value: Promise.resolve({ expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString() }),
      configurable: true,
    });

    (service as any).tokenSignal.set('initial-token');
    TestBed.flushEffects();
    flushMicrotasks();
    tick();
    flushMicrotasks();

    expect(firebaseServiceSpy.getIdToken).toHaveBeenCalledWith(true);
    expect(service.token()).toBe('refreshed-token');
  }));

  it('should not refresh the token when expiration is still far away', fakeAsync(() => {
    TestBed.flushEffects();
    flushMicrotasks();
    firebaseServiceSpy.getIdToken.calls.reset();

    Object.defineProperty(firebaseServiceSpy, 'idTokenResult', {
      value: Promise.resolve({ expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() }),
      configurable: true,
    });

    (service as any).tokenSignal.set('initial-token');
    TestBed.flushEffects();
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
