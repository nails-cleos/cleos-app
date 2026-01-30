import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Auth } from '@angular/fire/auth';
import { AuthUserService } from '../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MainContentService } from '../services/main-content.service';
import { redirect } from '../store/auth.actions';
import { TokenService } from '../services/token.service';
import { NavigationService } from '../services/navigation.service';
import { MainState } from '../store/reducers/main.reducers';
import { GoogleMapStubComponent } from '../shared/google-map/google-map-stub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  let lang$: BehaviorSubject<any>;
  let navigateSpy: jasmine.Spy;

  let storeSpy: jasmine.SpyObj<Store<MainState>>;
  let authSpy: jasmine.SpyObj<Auth>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let mainContentServiceSpy: jasmine.SpyObj<MainContentService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  let translateService: TranslateService;

  beforeEach(async () => {
    lang$ = new BehaviorSubject<any>('en');

    const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get', 'lang']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['cookieConsent', 'updateMode']);
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['attachLang']);
    mainContentServiceSpy = jasmine.createSpyObj('MainContentService', [], {
      value: { showPreload: false, navigationHeader: 'close', showArrow: false },
    });
    authSpy = jasmine.createSpyObj('Auth', ['onIdTokenChanged'], {
      currentUser: null,
    });
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['token'], {
      setToken: '',
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return lang$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    paramMapSpy.get.and.returnValue('en');
    navigationServiceSpy.attachLang.and.returnValue('en');
    authSpy.onIdTokenChanged.and.callFake((callback: any) => {
      callback(null);
      return () => {
      };
    });

    await TestBed.configureTestingModule({
      imports: [MainComponent, GoogleMapStubComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Auth, useValue: authSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

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

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en']);
  }));

  it('should initialize language on construction', () => {
    expect(authUserServiceSpy.cookieConsent).toHaveBeenCalledWith(translateService);
    expect(navigationServiceSpy.attachLang).toHaveBeenCalledWith('en');
    expect(component.language).toBe('en');
  });

  it('should toggle theme in changeTheme', () => {
    const initialMode = component.isDarkMode();
    storeSpy.dispatch.calls.reset();

    component.changeTheme();

    expect(component.isDarkMode()).toBe(!initialMode);
  });

  it('should dispatch Redirect action in redirect()', () => {
    component.redirect();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(redirect());
  });

  it('should call treatment and navigate to biab/treatment', () => {
    component.treatment();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'home', 'biab', 'treatment']);
  });
});
