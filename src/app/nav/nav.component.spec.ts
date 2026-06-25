import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TokenService } from '../services/token.service';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MessagingService } from '../services/messaging.service';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { IUser, IUserAll, User } from '../user/user';
import { NavigationService } from '../services/navigation.service';
import { INotification } from '../notification/notification';
import { PAGE_SIZE } from '../interfaces/pagination';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE, getNowTimeZone } from '../util/dates';
import { IResponseSuccess } from '../interfaces/common';
import { ToastService } from '../services/toast.service';
import { UserStore } from '../store/user.store';
import { NotificationStore } from '../store/notification.store';
import { AuthStore } from '../store/auth.store';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let navigationServiceSpy: {
    navigate: jasmine.Spy;
    language: string;
    attachLang: string;
    language$: ReturnType<typeof signal>;
  };

  let response$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let message$: BehaviorSubject<any>;
  let action$: BehaviorSubject<any>;
  let notificationStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    dataRead: ReturnType<typeof signal>;
    dataDeleted: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadPage: jasmine.Spy;
    clearResponse: jasmine.Spy;
    readNotification: jasmine.Spy;
    deleteNotification: jasmine.Spy;
  };

  let authStoreSpy: {
    isAuthenticated: ReturnType<typeof signal>;
    redirect: ReturnType<typeof signal>;
    menus: ReturnType<typeof signal>;
    user: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    authRedirect: jasmine.Spy;
    logOut: jasmine.Spy;
  };

  let navigateSpy: jasmine.Spy;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let storeSpy: jasmine.SpyObj<Store>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let userStoreSpy: jasmine.SpyObj<InstanceType<typeof UserStore>>;

  const authUserSignal = signal<IAuthUser>(
    {
      ...initialAuthUser,
      isAdmin: true,
      hasAdminRole: true,
      isAuthenticated: true,
      locale: DEFAULT_LOCALE,
      referralMax: 5,
    });

  const date = new Date();
  const mockNotification: INotification = {
    id: '1',
    message: 'This is a test notification',
    read: true,
    navigation: `/${ DEFAULT_LOCALE }/reservation/r-1`,
    date: date.getTime() / 1000,
    notDate: date,
    deleted: false,
  };

  const mockUser: IUserAll = {
    email: 'mockuser@email.com',
    id: 'mock-user',
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
    authorities: [{ authority: 'admin' }],
    theme: 'light-theme',
    displayName: 'Admin User',
    imageUrl: 'http://example.com/image.jpg',
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      language: DEFAULT_LOCALE,
      attachLang: DEFAULT_LOCALE,
      language$: signal(DEFAULT_LOCALE),
      navigate: jasmine.createSpy('navigate'),
    };
    response$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);
    message$ = new BehaviorSubject(undefined);
    action$ = new BehaviorSubject(undefined);

    notificationStoreSpy = {
      isLoading: signal(false),
      data: signal<any>(undefined),
      dataRead: signal<any>(undefined),
      dataDeleted: signal<any>(undefined),
      response: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadPage: jasmine.createSpy('loadPage'),
      clearResponse: jasmine.createSpy('clearResponse'),
      readNotification: jasmine.createSpy('readNotification'),
      deleteNotification: jasmine.createSpy('deleteNotification'),
    };
    authStoreSpy = {
      isAuthenticated: signal(false),
      redirect: signal(false),
      menus: signal(undefined),
      user: signal(undefined),
      error: signal(undefined),
      response: signal(undefined),
      authRedirect: jasmine.createSpy('authRedirect'),
      logOut: jasmine.createSpy('logOut'),
    };

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
    userStoreSpy = jasmine.createSpyObj<InstanceType<typeof UserStore>>('UserStore', ['updateMyUser']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['cookieConsent', 'reloadUser', 'updateMode'], {
      authUser: authUserSignal.asReadonly(),
    });
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['user'], {
      setToken: 'mock-token',
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

    let selectCallIndex = 0;
    storeSpy.select.and.callFake(() => {
      selectCallIndex++;
      switch (selectCallIndex) {
        case 1:
          return response$.asObservable();
        case 2:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [NavComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: MessagingService, useValue: messagingServiceSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: NotificationStore, useValue: notificationStoreSpy },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue(`/${ DEFAULT_LOCALE }`);
    navigateSpy = spyOn(router, 'navigate');

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(NavComponent);

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should execute logout', () => {
    component.logout();

    expect(authStoreSpy.logOut).toHaveBeenCalled();
  });

  it('should update user when change theme is called', () => {
    cookieServiceSpy.get.and.returnValue('light-theme');

    const user: IUser = new User();
    user.theme = 'dark-theme';
    const message = 'COMMON.PROFILE.UPDATED.DARK_MODE_TRUE';

    component.changeTheme();

    expect(component.isDarkMode()).toBeTrue();
    expect(component['cssClass']).toBe('dark-theme');
    expect(userStoreSpy.updateMyUser).toHaveBeenCalledWith(user, `/${ DEFAULT_LOCALE }`, message);
  });

  it('should go to home when goHome is called', () => {
    component.goToHome();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should toggle and close menus', () => {
    component.toggleMenu('settings');
    expect(component.activeMenu()).toBe('settings');

    component.toggleMenu('settings');
    expect(component.activeMenu()).toBeNull();

    component.toggleMenu('notifications');
    component.closeActiveMenu();
    expect(component.activeMenu()).toBeNull();
  });

  it('should close the active menu on outside click and escape', () => {
    component.activeMenu.set('settings');
    component.onDocumentClick({ target: document.createElement('div') } as unknown as MouseEvent);
    expect(component.activeMenu()).toBeNull();

    component.activeMenu.set('settings');
    component.onEscape();
    expect(component.activeMenu()).toBeNull();
  });

  it('should keep the active menu on inside click', () => {
    component.activeMenu.set('settings');
    component.onDocumentClick({ target: fixture.nativeElement } as unknown as MouseEvent);

    expect(component.activeMenu()).toBe('settings');
  });

  it('should navigate to the notification navigation when it is read', () => {
    component.notification(mockNotification);

    expect(navigateSpy).toHaveBeenCalledWith([`/${ DEFAULT_LOCALE }/reservation/r-1`]);
  });

  it('should mark notification as read and navigate', () => {
    const unreadNotification = { ...mockNotification, id: 'unread-1', read: false };
    component.notifications.set([unreadNotification, mockNotification]);
    component.countNotifications.set(2);
    fixture.detectChanges();

    component.notification(unreadNotification);
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
    expect(component.notifications()).toContain({ ...unreadNotification, read: true });
    expect(notificationStoreSpy.readNotification).toHaveBeenCalledWith(unreadNotification.id);
  });

  it('should handle auth state changes', () => {
    expect(component.countNotifications()).toBe(0);

    authStoreSpy.isAuthenticated.set(true);
    authStoreSpy.user.set(mockUser);

    fixture.detectChanges();

    expect(component.isAdmin()).toBeTrue();
    expect(component.showInformation()).toBeTrue();
    expect(component.isDarkMode()).toBeFalse();
    expect(component.isProfessional()).toBeFalse();
    expect(component.isManager()).toBeFalse();
    expect(component.isAdmin()).toBeTrue();
    expect(component.currentUserSignal()).toBe(mockUser);
    expect(component.incomplete).toBeTrue();
    expect(component.initials).toBe('AU');
    expect(component.image).toBe(mockUser.imageUrl);

    expect(notificationStoreSpy.loadPage)
      .toHaveBeenCalledWith({ page: 0, sort: 'date', direction: 'desc', size: PAGE_SIZE });

    expect(messagingServiceSpy.requestPermission).toHaveBeenCalledWith(mockUser);
  });

  it('should receive notifications', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [
          mockNotification,
          { ...mockNotification, id: '2', read: false },
          { ...mockNotification, id: '3', read: false },
        ],
        number: 0,
        totalElements: 3,
      },
      workDay: [
        { ...mockNotification, id: '5', message: 'Workday notification', read: false },
      ],
      unread: 3,
    });

    fixture.detectChanges();

    expect(component.notifications()).toContain(mockNotification);
    expect(component.countNotifications()).toBe(3);

    const mockMessage = {
      id: '4',
      message: 'This is a message notification',
      navigation: `/${ DEFAULT_LOCALE }/reservation/r-2`,
      date: getNowTimeZone().getTime() / 1000,
    } as INotification;

    message$.next({
      data: {
        id: mockMessage.id,
        date: mockMessage.date,
        navigation: mockMessage.navigation,
      },
      notification: {
        title: mockMessage.message,
      },
    });

    fixture.detectChanges();

    expect(component.notifications().some(not => not.id === mockMessage.id)).toBeTrue();
    expect(component.countNotifications()).toBe(4);
  });

  it('should dispatch redirect', () => {
    authStoreSpy.isAuthenticated.set(true);
    authStoreSpy.user.set(mockUser);
    authStoreSpy.redirect.set(false);
    fixture.detectChanges();

    expect(authStoreSpy.authRedirect).toHaveBeenCalled();
  });

  it('should navigate to home when not authenticated', () => {
    authStoreSpy.isAuthenticated.set(false);
    authStoreSpy.redirect.set(false);
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should navigate to home when redirect', () => {
    authStoreSpy.isAuthenticated.set(true);
    authStoreSpy.user.set(mockUser);
    authStoreSpy.redirect.set(true);
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['home']);
  });

  it('should handle notifications', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [
          mockNotification,
          { ...mockNotification, id: '2', read: false },
          { ...mockNotification, id: '3', read: false },
        ],
        number: 0,
        totalElements: 3,
      },
      workDay: [
        { ...mockNotification, id: '5', message: 'Workday notification', read: false },
      ],
      unread: 3,
    });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(3);
    expect(component.notifications()).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
      jasmine.objectContaining({ id: '3', read: false }),
    ]);
  });

  it('should handle delete notifications', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [
          mockNotification,
          { ...mockNotification, id: '2', read: false },
          { ...mockNotification, id: '3', read: false },
        ],
        number: 0,
        totalElements: 3,
      },
      workDay: [
        { ...mockNotification, id: '5', message: 'Workday notification', read: false },
      ],
      unread: 2,
    });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(2);
    expect(component.notifications()).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
      jasmine.objectContaining({ id: '3', read: false }),
    ]);

    const deleted = { ...mockNotification, id: '3', deleted: true, read: false };

    notificationStoreSpy.dataDeleted.set(deleted);
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
    expect(component.notifications()).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
    ]);
  });

  it('should decrease the badge when an unread notification is read outside the dropdown preload', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [
          mockNotification,
          { ...mockNotification, id: '2', read: false },
        ],
        number: 0,
        totalElements: 2,
      },
      workDay: [],
      unread: 2,
    });
    fixture.detectChanges();

    notificationStoreSpy.dataRead.set({ ...mockNotification, id: 'external-read', read: true });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
  });

  it('should mark a preloaded unread notification as read when the store read success arrives', () => {
    const unreadNotification = { ...mockNotification, id: '2', read: false };
    notificationStoreSpy.data.set({
      page: {
        content: [mockNotification, unreadNotification],
        number: 0,
        totalElements: 2,
      },
      workDay: [],
      unread: 1,
    });
    fixture.detectChanges();

    component.countNotifications.set(1);
    notificationStoreSpy.dataRead.set({ ...unreadNotification, read: true });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(0);
    expect(component.notifications()).toContain(jasmine.objectContaining({ id: '2', read: true }));
  });

  it('should not decrease the badge when the store read success arrives for an already read preloaded notification',
    () => {
      notificationStoreSpy.data.set({
        page: {
          content: [mockNotification],
          number: 0,
          totalElements: 1,
        },
        workDay: [],
        unread: 1,
      });
      fixture.detectChanges();

      component.countNotifications.set(1);
      notificationStoreSpy.dataRead.set({ ...mockNotification, read: true });
      fixture.detectChanges();

      expect(component.countNotifications()).toBe(1);
    });

  it('should decrease the badge when an unread notification is deleted outside the dropdown preload', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [
          mockNotification,
          { ...mockNotification, id: '2', read: false },
        ],
        number: 0,
        totalElements: 2,
      },
      workDay: [],
      unread: 2,
    });
    fixture.detectChanges();

    notificationStoreSpy.dataDeleted.set({ ...mockNotification, id: 'external-delete', deleted: true, read: false });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
  });

  it('should remove a preloaded read notification without decreasing the badge', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [mockNotification],
        number: 0,
        totalElements: 1,
      },
      workDay: [],
      unread: 1,
    });
    fixture.detectChanges();

    component.countNotifications.set(1);
    notificationStoreSpy.dataDeleted.set({ ...mockNotification, deleted: true, read: true });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
    expect(component.notifications()).toEqual([]);
  });

  it('should ignore deleted notifications that are not marked as deleted', () => {
    notificationStoreSpy.data.set({
      page: {
        content: [{ ...mockNotification, id: '2', read: false }],
        number: 0,
        totalElements: 1,
      },
      workDay: [],
      unread: 1,
    });
    fixture.detectChanges();

    notificationStoreSpy.dataDeleted.set({ ...mockNotification, id: '2', deleted: false, read: false });
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
    expect(component.notifications()).toEqual([jasmine.objectContaining({ id: '2', read: false })]);
  });

  it('should create response and navigate', () => {
    const response: IResponseSuccess = {
      message: 'Operation successful',
      path: 'path/to/resource',
      reload: false,
      toastType: 'warning',
      redirect: 'path/to/redirect',
    };
    response$.next(response);
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([response.redirect]);

    expect(toastServiceSpy.show).toHaveBeenCalledWith(response.message, response.toastType, 5000,
      { actionType: 'link', action: `/${ DEFAULT_LOCALE }/${ response.path }` });
  });

  it('should create response with blob', () => {
    const fakeBlob = new Blob(['test'], { type: 'application/pdf' });
    const response: IResponseSuccess = {
      path: undefined,
      reload: false,
      toastType: 'warning',
      redirect: 'path',
      blob: fakeBlob,
      fileName: 'test.pdf',
    };

    const fakeUrl = 'blob:http://localhost/fake-url';

    spyOn(URL, 'createObjectURL').and.returnValue(fakeUrl);
    spyOn(URL, 'revokeObjectURL');

    const clickSpy = jasmine.createSpy('click');
    const anchorMock = {
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement;

    spyOn(document, 'createElement').and.returnValue(anchorMock);

    response$.next(response);
    fixture.detectChanges();

    expect(URL.createObjectURL).toHaveBeenCalledWith(response.blob);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(anchorMock.href).toBe(fakeUrl);
    expect(anchorMock.download).toBe(response.fileName);
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(fakeUrl);
  });
});
