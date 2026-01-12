import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { AuthState } from '../store/reducers/auth.reducers';

describe('TokenService', () => {
  let service: TokenService;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const authSpy = jasmine.createSpyObj('Auth', ['select']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    routerSpy.getCurrentNavigation.and.returnValue(null);
    authSpy.select.and.returnValue(of({ user: { authorities: [{ authority: 'ROLE_USER' }] } }));
    storeSpy.pipe.and.returnValue(of(null));

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

  it('should not recreate token cache if already initialized', () => {
    (service as any).myTokenCache = of(null);

    service.token = 'abc';
    service.token = 'def';

    expect(service.token).toBe('def');
  });

  it('should ignore null firebase user', () => {
    (service as any).myTokenCache = of(null);

    expect(() => {
      service.token = 'token';
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

    service.token = 'token';

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
