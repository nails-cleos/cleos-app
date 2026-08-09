import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  AuthUserService,
  initialAuthUser,
} from '../services/auth-user.service';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { MainContentService } from '../services/main-content.service';
import { TokenService } from '../services/token.service';
import { NavigationService } from '../services/navigation.service';
import { GoogleMapStubComponent } from '../util/stub/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { provideAppIcons } from '../util/app-icons.provider';
import { DEFAULT_LOCALE } from '../util/dates';
import { UserStore } from '../store/user.store';
import { AuthStore } from '../store/auth.store';
import { IUser, User } from '../user/user';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let navigationServiceSpy: {
    language: string;
    language$: ReturnType<typeof signal>;
    navigate: Mock;
  };

  let userStoreSpy: {
    updateMyUser: Mock;
  };
  let authStoreSpy: {
    authRedirect: Mock;
  };

  let authUserServiceSpy: Pick<
    AuthUserService,
    'authUser' | 'cookieConsent' | 'updateMode'
  > & {
    cookieConsent: ReturnType<typeof vi.fn>;
    updateMode: ReturnType<typeof vi.fn>;
  };
  let mainContentServiceSpy: {
    value: any;
  };
  let tokenServiceSpy: {
    token: Mock;
    setToken: '';
  };
  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };
  let firebaseServiceSpy: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
  };

  let translateService: TranslateService;

  beforeEach(async () => {
    navigationServiceSpy = {
      language: DEFAULT_LOCALE,
      language$: signal(DEFAULT_LOCALE),
      navigate: vi.fn().mockName('navigate'),
    };
    userStoreSpy = {
      updateMyUser: vi.fn().mockName('updateMyUser'),
    };
    authStoreSpy = {
      authRedirect: vi.fn().mockName('authRedirect'),
    };
    const paramMapSpy = {
      get: vi.fn().mockName('ParamMap.get'),
      lang: vi.fn().mockName('ParamMap.lang'),
    };
    const authUserSignal = signal({ ...initialAuthUser });
    authUserServiceSpy = {
      cookieConsent: vi.fn().mockName('AuthUserService.cookieConsent'),
      updateMode: vi.fn().mockName('AuthUserService.updateMode'),
      authUser: authUserSignal.asReadonly(),
    };
    mainContentServiceSpy = {
      value: {
        showPreload: false,
        navigationHeader: 'close',
        showArrow: false,
      },
    };
    tokenServiceSpy = {
      token: vi.fn().mockName('TokenService.token'),
      setToken: '',
    };
    activatedRouteSpy = {
      snapshot: {
        paramMap: paramMapSpy,
      },
    };
    firebaseServiceSpy = {
      isAuthenticated: signal(false),
    };

    paramMapSpy.get.mockReturnValue(DEFAULT_LOCALE);

    Element.prototype.scrollIntoView = vi.fn();

    await TestBed.configureTestingModule({
      imports: [MainComponent, GoogleMapStubComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.isAuthenticated()).toBe(false);
    expect(component.showLoader).toBe(false);
    expect(component.navigationState()).toBe('close');
    expect(component.showArrow).toBe(false);
  });

  it('should navigate and scroll to element in scrollToElement', async () => {
    const element = 'test-element';
    navigationServiceSpy.navigate.mockResolvedValue(true);

    component.scrollToElement(element);

    await Promise.resolve();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['home'],
      undefined,
      expect.any(Function),
    );
  });

  it('should initialize language on construction', () => {
    expect(authUserServiceSpy.cookieConsent).toHaveBeenCalledWith(
      translateService,
    );
  });

  it('should toggle theme in changeTheme', () => {
    const initialMode = component.isDarkMode();

    component.changeTheme();

    expect(component.isDarkMode()).toBe(!initialMode);
  });

  it('should persist theme only when toggled by an authenticated user', () => {
    firebaseServiceSpy.isAuthenticated.set(true);
    userStoreSpy.updateMyUser.mockClear();

    component.changeTheme();

    const authenticatedUser: IUser = new User();
    authenticatedUser.theme = 'dark-theme';
    expect(userStoreSpy.updateMyUser).toHaveBeenCalledWith(
      authenticatedUser,
      expect.any(String),
      expect.any(String),
    );
  });

  it('should dispatch Redirect action in redirect()', () => {
    component.redirect();
    expect(authStoreSpy.authRedirect).toHaveBeenCalled();
  });

  it('should call treatment and navigate to biab-treatment/treatment', () => {
    component.treatment();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'home',
      'biab-treatment',
      'treatment',
    ]);
  });
});
