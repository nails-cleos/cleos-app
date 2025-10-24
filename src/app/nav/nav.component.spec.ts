import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TokenService } from '../services/token.service';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { MessagingService } from '../services/messaging.service';
import { AuthUserService, IAuthUser } from '../services/auth-user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { logOut, redirect } from '../store/auth.actions';
import { CookieService } from 'ngx-cookie-service';
import { updateMyUser } from '../store/user.actions';
import { IUser, User } from '../interfaces/user';
import { NavigationService } from '../services/navigation.service';
import { INotification } from '../interfaces/notification';
import { AppState, selectAuthState, selectNotificationState } from '../store/app.states';
import { getNotificationsPage, readNotification } from '../store/notification.actions';
import { PAGE_SIZE } from '../interfaces/pagination';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  let state$: Subject<any>;
  let authUser$: Subject<any>;
  let notification$: Subject<any>;
  let message$: Subject<any>;

  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;

  const date = new Date();
  const mockNotification: INotification = {
    id: '1',
    message: 'This is a test notification',
    read: true,
    navigation: '/en-GB/reservation/r-1',
    date: date.getTime() / 1000,
    notDate: date,
    deleted: false,
  };

  const mockUser: IUser = new User();
  mockUser.authorities = [{ authority: 'admin' }];
  mockUser.theme = 'light-theme';
  mockUser.displayName = 'Admin User';
  mockUser.imageUrl = 'http://example.com/image.jpg';

  const mockAuthUser: IAuthUser = {
    isDarkMode: false,
    isAdmin: true,
    isManager: false,
    isRoomAdmin: false,
    isProfessional: false,
    hasAdminRole: true,
    isCustomer: false,
    isAuthenticated: true,
    showCash: false,
    locale: 'en-GB',
    referralMax: 5,
  };

  beforeEach(async () => {
    state$ = new Subject();
    authUser$ = new Subject();
    notification$ = new Subject();
    message$ = new Subject();

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['subscribe', 'attachLang']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['cookieConsent', 'reloadUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/en-GB/home',
    });
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['user'], {
      token: 'mock-token',
    });
    messagingServiceSpy = jasmine.createSpyObj('MessagingService', ['requestPermission', 'receiveMessage'], {
      message$: message$.asObservable(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    paramMapSpy.get.and.returnValue(null);
    navigationServiceSpy.subscribe.and.returnValue({} as any);
    navigationServiceSpy.attachLang.and.returnValue('en-GB');
    authUserServiceSpy.reloadUser.and.returnValue(mockAuthUser);
    storeSpy.select.and.callFake((selector: any) => {
      switch (selector) {
        case selectAuthState:
          return authUser$.asObservable();
        case selectNotificationState:
          return notification$.asObservable();
        default:
          return state$.asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [NavComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: MessagingService, useValue: messagingServiceSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(NavComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    notification$.complete();
    authUser$.complete();
    message$.complete();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should execute logout', () => {
    void component.logout;

    expect(storeSpy.dispatch).toHaveBeenCalledWith(logOut());
  });

  it('should update user when change theme is called', () => {
    cookieServiceSpy.get.and.returnValue('light-theme');

    const user: IUser = new User();
    user.theme = 'dark-theme';
    const message = 'COMMON.PROFILE.UPDATED.DARK_MODE_TRUE';

    void component.changeTheme;

    expect(component.isDarkMode).toBeTrue();
    expect(component['cssClass']).toBe('dark-theme');
    expect(storeSpy.dispatch).toHaveBeenCalledWith(updateMyUser({ user, message, redirectUrl: '/en-GB/home' }));
  });

  it('should go to home when goHome is called', () => {
    void component.goToHome;

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'home']);
  });

  it('should navigate to the notification navigation when it is read', () => {
    component.notification(mockNotification);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/en-GB/reservation/r-1']);
  });

  it('should mark notification as read and navigate', () => {
    const unreadNotification = { ...mockNotification, id: 'unread-1', read: false };
    component.notifications = [unreadNotification, mockNotification];
    component.countNotifications = 2;

    component.notification(unreadNotification);

    expect(component.countNotifications).toBe(1);
    expect(component.notifications).toContain({ ...unreadNotification, read: true });
    expect(storeSpy.dispatch).toHaveBeenCalledWith(readNotification({ id: unreadNotification.id }));
  });

  it('should handle auth state changes and receive notifications', () => {
    component.ngOnInit();

    expect(component.countNotifications).toBe(0);
    const mockToken = 'mock-token';
    const mockNotification = {
      id: 'notification-1',
      message: 'New reservation',
      date: Date.now() / 1000,
      navigation: '/en-GB/reservation/r-1',
      read: false,
    } as INotification;

    authUser$.next({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      token: mockToken,
    });

    message$.next({
      data: {
        id: mockNotification.id,
        date: mockNotification.date,
        navigation: mockNotification.navigation,
      },
      notification: {
        title: mockNotification.message,
      },
    });

    expect(component.isAdmin).toBeTrue();
    expect(component.showInformation).toBeTrue();
    expect(component.isDarkMode).toBeFalse();
    expect(component.isProfessional).toBeFalse();
    expect(component.isManager).toBeFalse();
    expect(component.isAdmin).toBeTrue();
    expect(component.currentUser).toBe(mockUser);
    expect(component.incomplete).toBeTrue();
    expect(component.initials).toBe('AU');
    expect(component.image).toBe(mockUser.imageUrl);

    expect(messagingServiceSpy.requestPermission).toHaveBeenCalledWith(mockUser);
    expect(messagingServiceSpy.receiveMessage).toHaveBeenCalled();

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(getNotificationsPage({ page: 0, sort: 'date', direction: 'desc', size: PAGE_SIZE }));

    expect(component.notifications).toContain(mockNotification);
    expect(component.countNotifications).toBe(2);
  });

  it('should dispatch redirect', () => {
    Object.defineProperty(routerSpy, 'url', { value: '/en-GB' });

    authUser$.next({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      redirect: false,
    });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(redirect());
  });

  it('should navigate to home when not authenticated', () => {
    Object.defineProperty(routerSpy, 'url', { value: '/en-GB' });

    authUser$.next({
      isAuthenticated: false,
      isLoading: false,
      redirect: false,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'en-GB', 'home']);
  });

  it('should navigate to home when redirect', () => {
    Object.defineProperty(routerSpy, 'url', { value: '/en-GB' });

    authUser$.next({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      redirect: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'en-GB', 'home']);
  });

  it('should handle notifications', () => {
    notification$.next({
      data: {
        page: {
          content: [
            mockNotification,
            { ...mockNotification, id: '2', read: false },
            { ...mockNotification, id: '3', read: false },
          ],
          number: 0,
          totalElements: 3,
        },
        workDay: {
          content: [
            { ...mockNotification, id: '5', message: 'Workday notification', read: false },
          ],
        },
        unread: 3,
      },
    });

    expect(component.countNotifications).toBe(3);
    expect(component.notifications).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
      jasmine.objectContaining({ id: '3', read: false }),
    ]);
  });

  it('should handle delete notifications', () => {
    notification$.next({
      data: {
        page: {
          content: [
            mockNotification,
            { ...mockNotification, id: '2', read: false },
            { ...mockNotification, id: '3', read: false },
          ],
          number: 0,
          totalElements: 3,
        },
        workDay: {
          content: [
            { ...mockNotification, id: '5', message: 'Workday notification', read: false },
          ],
        },
        unread: 2,
      },
    });

    expect(component.countNotifications).toBe(2);
    expect(component.notifications).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
      jasmine.objectContaining({ id: '3', read: false }),
    ]);

    notification$.next({
      dataDeleted: { ...mockNotification, id: '3', deleted: true, read: false },
    });

    expect(component.countNotifications).toBe(1);
    expect(component.notifications).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
    ]);
  });
});
