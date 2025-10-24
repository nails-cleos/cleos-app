import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { EMPTY, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Auth } from '@angular/fire/auth';
import { AuthUserService } from '../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { MainContentService } from './main-content.service';
import { redirect } from '../store/auth.actions';
import { updateMyUser } from '../store/main.actions';
import { TokenService } from '../services/token.service';
import { NavigationService } from '../services/navigation.service';
import { AppState } from '../store/app.states';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  let state$: Subject<any>;
  let mainContent$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let authSpy: jasmine.SpyObj<Auth>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let mainContentServiceSpy: jasmine.SpyObj<MainContentService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  let translateService: TranslateService;

  beforeEach(async () => {
    state$ = new Subject<any>();
    mainContent$ = new Subject<any>();

    const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get', 'lang']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['cookieConsent', 'updateMode']);
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['attachLang']);
    mainContentServiceSpy = jasmine.createSpyObj('MainContentService', [], {
      data$: mainContent$.asObservable(),
    });
    authSpy = jasmine.createSpyObj('Auth', ['onIdTokenChanged'], {
      currentUser: null,
    });
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getToken'], {
      token: '',
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/en/home',
      events: EMPTY,
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    paramMapSpy.get.and.returnValue('en');
    navigationServiceSpy.attachLang.and.returnValue('en');
    authSpy.onIdTokenChanged.and.callFake((callback: any) => {
      callback(null);
      return () => {
      };
    });

    await TestBed.configureTestingModule({
      imports: [MainComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Auth, useValue: authSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        provideNoopAnimations(),
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    state$.complete();
    mainContent$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isAuthenticated in ngOnInit', fakeAsync(() => {
    component.ngOnInit();

    expect(component.isAuthenticated).toBeFalse();
    expect(authUserServiceSpy.cookieConsent).toHaveBeenCalledWith(translateService);
    expect(navigationServiceSpy.attachLang).toHaveBeenCalledWith('en');
  }));

  it('should toggle theme in changeTheme when not authenticated', () => {
    component.isAuthenticated = false;
    const initialMode = component.isDarkMode;
    storeSpy.dispatch.calls.reset();

    component.changeTheme();

    expect(component.isDarkMode).toBe(!initialMode);
    expect(authUserServiceSpy.updateMode).toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalled(); // no dispatch when not authenticated
  });

  it('should dispatch Redirect action in redirect()', () => {
    component.redirect();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(redirect());
  });

  it('should update mainContent data$ subscription', fakeAsync(() => {
    component.ngOnInit();

    mainContent$.next({ showPreload: true, navigationHeader: 'open', showArrow: true });
    expect(component.showLoader).toBeTrue();
    expect(component.navigationState.value).toBe('open');
    expect(component.showArrow).toBeTrue();
  }));

  it('should dispatch UpdateMyUser action when changeTheme is called and user is authenticated', () => {
    component.isAuthenticated = true;
    const initialMode = component.isDarkMode;

    component.changeTheme();

    const expectedAction = updateMyUser({
      user: jasmine.any(Object) as any,
      redirectUrl: '/en/home',
      message: jasmine.any(String) as any,
    });

    expect(component.isDarkMode).toBe(!initialMode);
    expect(authUserServiceSpy.updateMode).toHaveBeenCalled();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should not dispatch UpdateMyUser action when changeTheme is called and user is not authenticated', () => {
    component.isAuthenticated = false;
    storeSpy.dispatch.calls.reset();

    component.changeTheme();

    const expectedAction = updateMyUser({
      user: jasmine.any(Object) as any,
      redirectUrl: '/en/home',
      message: jasmine.any(String) as any,
    });

    expect(authUserServiceSpy.updateMode).toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(expectedAction);
  });

  it('should call navigationService.attachLang on ngOnInit', () => {
    component.ngOnInit();

    expect(navigationServiceSpy.attachLang).toHaveBeenCalledWith('en');
    expect(component.language).toBe('en');
  });

  it('should navigate and scroll to element in scrollToElement', fakeAsync(() => {
    const element = 'test-element';
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    component.scrollToElement(element);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', component.language]);
  }));

  it('should call treatment and navigate to biab/treatment', () => {
    component.treatment();

    expect(routerSpy.navigate).toHaveBeenCalledWith([translateService.currentLang, 'biab', 'treatment']);
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
