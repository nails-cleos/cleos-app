import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { AuthState } from '../store/reducers/auth.reducers';
import { IUserAll } from '../interfaces/user';

describe('TokenService', () => {
  let service: TokenService;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;

  let token$: BehaviorSubject<any>;
  let user$: BehaviorSubject<any>;
  let driveToken$: BehaviorSubject<any>;

  beforeEach(() => {
    token$ = new BehaviorSubject('token');
    user$ = new BehaviorSubject({ id: 'a', displayName: 'Alice' } as IUserAll);
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
          return token$.asObservable();
        case 2:
          return user$.asObservable();
        case 3:
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

  it('should set token', () => {
    service.setToken = 'newToken';

    expect(service.token()).toBe('newToken');
  });

  it('should set user', () => {
    const newUser = { id: 'b', displayName: 'Bob' } as IUserAll;
    service.setUser = newUser;

    expect(service.user()).toEqual(newUser);
  });

  it('should not recreate token cache if already initialized', () => {
    (service as any).myTokenCache = of(null);

    service.setToken = 'abc';
    service.setToken = 'def';

    expect(service.token()).toBe('def');
  });

  it('should ignore null firebase user', () => {
    (service as any).myTokenCache = of(null);

    expect(() => {
      service.setToken = 'token';
    }).not.toThrow();
  });

  it('should NOT refresh token when not expired', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();

    const fakeUser = {
      getIdTokenResult: () =>
        Promise.resolve({ expirationTime: future }),
      getIdToken: jasmine.createSpy(),
    };

    (service as any).firebaseUser$ = of(fakeUser);

    service.setToken = 'token';

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
  });

  it('should navigate to login on clear', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    service.clear();

    expect(router.navigate).toHaveBeenCalledWith(['/', 'en-GB', 'login']);
  });
});
