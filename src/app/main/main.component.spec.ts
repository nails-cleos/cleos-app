import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthUserService, initialAuthUser } from '../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MainContentService } from '../services/main-content.service';
import { TokenService } from '../services/token.service';
import { NavigationService } from '../services/navigation.service';
import { GoogleMapStubComponent } from '../shared/google-map/google-map-stub.component';
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

  let userStoreSpy: {
    updateMyUser: jasmine.Spy;
  };

  let authStoreSpy: {
    authRedirect: jasmine.Spy;
  };

  let navigateSpy: jasmine.Spy;

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let mainContentServiceSpy: jasmine.SpyObj<MainContentService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let firebaseServiceSpy: { isAuthenticated: ReturnType<typeof signal<boolean>> };

  let translateService: TranslateService;

  beforeEach(async () => {
    userStoreSpy = {
      updateMyUser: jasmine.createSpy('updateMyUser'),
    };
    authStoreSpy = {
      authRedirect: jasmine.createSpy('authRedirect'),
    };
    const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get', 'lang']);
    const authUserSignal = signal({ ...initialAuthUser });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['cookieConsent', 'updateMode'], {
      authUser: authUserSignal.asReadonly(),
    });
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['attachLang']);
    mainContentServiceSpy = jasmine.createSpyObj('MainContentService', [], {
      value: { showPreload: false, navigationHeader: 'close', showArrow: false },
    });
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['token'], {
      setToken: '',
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });
    firebaseServiceSpy = {
      isAuthenticated: signal(false),
    };

    paramMapSpy.get.and.returnValue(DEFAULT_LOCALE);
    navigationServiceSpy.attachLang.and.returnValue(DEFAULT_LOCALE);
    await TestBed.configureTestingModule({
      imports: [MainComponent, GoogleMapStubComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

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
    expect(component.isAuthenticated()).toBeFalse();
    expect(component.showLoader).toBeFalse();
    expect(component.navigationState()).toBe('close');
    expect(component.showArrow).toBeFalse();
  });

  it('should navigate and scroll to element in scrollToElement', fakeAsync(() => {
    const element = 'test-element';
    navigateSpy.and.returnValue(Promise.resolve(true));

    component.scrollToElement(element);

    expect(navigateSpy).toHaveBeenCalledWith(['/', DEFAULT_LOCALE]);
  }));

  it('should initialize language on construction', () => {
    expect(authUserServiceSpy.cookieConsent).toHaveBeenCalledWith(translateService);
    expect(navigationServiceSpy.attachLang).toHaveBeenCalledWith(DEFAULT_LOCALE);
    expect(component.language).toBe(DEFAULT_LOCALE);
  });

  it('should toggle theme in changeTheme', () => {
    const initialMode = component.isDarkMode();

    component.changeTheme();

    expect(component.isDarkMode()).toBe(!initialMode);
  });

  it('should persist theme only when toggled by an authenticated user', () => {
    firebaseServiceSpy.isAuthenticated.set(true);
    userStoreSpy.updateMyUser.calls.reset();

    component.changeTheme();

    const authenticatedUser: IUser = new User();
    authenticatedUser.theme = 'dark-theme';
    expect(userStoreSpy.updateMyUser).toHaveBeenCalledWith(authenticatedUser, jasmine.any(String), jasmine.any(String));
  });

  it('should dispatch Redirect action in redirect()', () => {
    component.redirect();
    expect(authStoreSpy.authRedirect).toHaveBeenCalled();
  });

  it('should call treatment and navigate to biab-treatment/treatment', () => {
    component.treatment();

    expect(navigateSpy).toHaveBeenCalledWith([DEFAULT_LOCALE, 'home', 'biab-treatment', 'treatment']);
  });
});
