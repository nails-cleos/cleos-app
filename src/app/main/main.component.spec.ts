import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Auth } from '@angular/fire/auth';
import { AuthUserService } from '../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { MainContentService } from './main-content.service';
import * as fromActionsLogin from '../store/auth.actions';
import * as fromActionsMain from '../store/main.actions';
import { TokenService } from '../services/token.service';
import { NavigationService } from '../services/navigation.service';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let store: Store<any>;
  let translate: TranslateService;
  let router: Router;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAuth = {
    currentUser: jasmine.createSpy('currentUser').and.returnValue(null),
    onIdTokenChanged: jasmine.createSpy('onIdTokenChanged').and.returnValue(of(null)),
  };

  const mockAuthUserService = {
    cookieConsent: jasmine.createSpy('cookieConsent'),
    updateMode: jasmine.createSpy('updateMode'),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('en'),
      },
    },
  };

  const mockMainContentService = {
    data$: new BehaviorSubject({ showPreload: false, navigationHeader: 'close', showArrow: false }),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    url: '/en/home',
    events: EMPTY,
  };

  const mockTokenService = {
    token: '',
  };

  const mockNavigationService = {
    attachLang: jasmine.createSpy('attachLang').and.returnValue('en'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: Auth, useValue: mockAuth },
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MainContentService, useValue: mockMainContentService },
        { provide: Router, useValue: mockRouter },
        { provide: TokenService, useValue: mockTokenService },
        { provide: NavigationService, useValue: mockNavigationService },
        TranslateService,
        provideNoopAnimations(),
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    mockStore.dispatch.calls.reset();
    mockAuthUserService.updateMode.calls.reset();
    mockNavigationService.attachLang.calls.reset();
    mockRouter.navigate.calls.reset();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    translate = TestBed.inject(TranslateService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isAuthenticated in ngOnInit', fakeAsync(() => {
    expect(component.isAuthenticated).toBeFalse();
    expect(mockAuthUserService.cookieConsent).toHaveBeenCalledWith(translate);
    expect(mockNavigationService.attachLang).toHaveBeenCalledWith('en');
  }));

  it('should toggle theme in changeTheme when not authenticated', () => {
    component.isAuthenticated = false;
    const initialMode = component.isDarkMode;
    mockStore.dispatch.calls.reset();

    component.changeTheme();

    expect(component.isDarkMode).toBe(!initialMode);
    expect(mockAuthUserService.updateMode).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled(); // no dispatch when not authenticated
  });

  it('should dispatch Redirect action in redirect()', () => {
    component.redirect();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsLogin.Redirect));
  });

  it('should update mainContent data$ subscription', fakeAsync(() => {
    mockMainContentService.data$.next({ showPreload: true, navigationHeader: 'open', showArrow: true });
    expect(component.showLoader).toBeTrue();
    expect(component.navigationState.value).toBe('open');
    expect(component.showArrow).toBeTrue();
  }));

  it('should dispatch UpdateMyUser action when changeTheme is called and user is authenticated', () => {
    component.isAuthenticated = true;
    const initialMode = component.isDarkMode;

    component.changeTheme();

    expect(component.isDarkMode).toBe(!initialMode);
    expect(mockAuthUserService.updateMode).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsMain.UpdateMyUser));
  });

  it('should not dispatch UpdateMyUser action when changeTheme is called and user is not authenticated', () => {
    component.isAuthenticated = false;
    mockStore.dispatch.calls.reset();

    component.changeTheme();

    expect(mockAuthUserService.updateMode).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.any(fromActionsMain.UpdateMyUser));
  });

  it('should call navigationService.attachLang on ngOnInit', () => {
    expect(mockNavigationService.attachLang).toHaveBeenCalledWith('en');
    expect(component.language).toBe('en');
  });

  it('should navigate and scroll to element in scrollToElement', fakeAsync(() => {
    const element = 'test-element';

    component.scrollToElement(element);

    expect(router.navigate).toHaveBeenCalledWith(['/', component.language]);
  }));

  it('should call treatment and navigate to biab/treatment', () => {
    component.treatment();

    expect(router.navigate).toHaveBeenCalledWith([translate.currentLang, 'biab', 'treatment']);
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
