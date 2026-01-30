import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TokenService } from './token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { AuthState } from '../store/reducers/auth.reducers';
import { IUserAll } from '../interfaces/user';
import { signal } from '@angular/core';

describe('TokenService', () => {
  let service: TokenService;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;

  let driveToken$: BehaviorSubject<any>;

  beforeEach(() => {
    driveToken$ = new BehaviorSubject('driveToken');

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authSpy = jasmine.createSpyObj('Auth', ['select']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    authSpy.select.and.returnValue(of({ user: { authorities: [{ authority: 'ROLE_USER' }] } }));
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return driveToken$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TokenService,
        { provide: Router, useValue: routerSpy },
        { provide: Auth, useValue: authSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set drive token', () => {
    expect(service.driveToken()).toBe('driveToken');
  });

  it('should set user', () => {
    const newUser = { id: 'b', displayName: 'Bob' } as IUserAll;
    service.setUser = newUser;

    expect(service.user()).toEqual(newUser);
  });

  it('should NOT refresh token when not expired', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();

    const fakeUser = {
      getIdTokenResult: () =>
        Promise.resolve({ expirationTime: future }),
      getIdToken: jasmine.createSpy(),
    };

    (service as any).firebaseUser$ = of(fakeUser);

    await Promise.resolve();

    expect(fakeUser.getIdToken).not.toHaveBeenCalled();
  });

  it('should clear on token stream error', () => {
    spyOn(service, 'clear');

    (service as any).myTokenCache = of(null);
    (service as any).myTokenSubscription = {
      unsubscribe: jasmine.createSpy(),
    };

    service.clear();

    expect(service.clear).toHaveBeenCalled();
    expect(service['tokenSignal']()).toBeNull();
    expect(service['userSignal']()).toBeNull();
  });

  it('should not refresh token if expiration is in the future', fakeAsync(() => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const fakeUser = {
      getIdToken: jasmine.createSpy(),
      getIdTokenResult: jasmine.createSpy().and.resolveTo({
        expirationTime: future,
      }),
    };

    (service as any).firebaseUser = signal(fakeUser);
    service['tokenSignal'].set('token');

    tick(0);

    expect(fakeUser.getIdToken).not.toHaveBeenCalled();
  }));

  it('should clear token and user when firebase user is null', fakeAsync(() => {
    (service as any).firebaseUser = signal(null);

    tick();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  }));

  it('should clear token when clean is called', () => {
    service.clear();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  });
});
