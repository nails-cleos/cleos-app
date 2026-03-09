import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TokenService } from '../services/token.service';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MessagingService } from '../services/messaging.service';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { logOut, redirect } from '../store/auth.actions';
import { CookieService } from 'ngx-cookie-service';
import { updateMyUser } from '../store/user.actions';
import { IUser, IUserAll, User } from '../interfaces/user';
import { NavigationService } from '../services/navigation.service';
import { INotification } from '../interfaces/notification';
import { getNotificationsPage, readNotification } from '../store/notification.actions';
import { PAGE_SIZE } from '../interfaces/pagination';
import { signal } from '@angular/core';
import { getNowTimeZone } from '../util/dates';
import { IResponseSuccess } from '../interfaces/common';
import { ToastService } from '../services/toast.service';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  let response$: BehaviorSubject<any>;
  let isLoading$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  let message$: BehaviorSubject<any>;
  let isAuthenticated$: BehaviorSubject<any>;
  let user$: BehaviorSubject<any>;
  let menus$: BehaviorSubject<any>;
  let redirect$: BehaviorSubject<any>;
  let dataDeleted$: BehaviorSubject<any>;
  let notification$: BehaviorSubject<any>;
  let action$: BehaviorSubject<any>;

  let navigateSpy: jasmine.Spy;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let storeSpy: jasmine.SpyObj<Store>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const authUserSignal = signal<IAuthUser>(
    {
      ...initialAuthUser,
      isAdmin: true,
      hasAdminRole: true,
      isAuthenticated: true,
      locale: 'en-GB',
      referralMax: 5,
    });

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
    response$ = new BehaviorSubject(undefined);
    isLoading$ = new BehaviorSubject(true);
    error$ = new BehaviorSubject(undefined);
    message$ = new BehaviorSubject(undefined);
    notification$ = new BehaviorSubject(undefined);
    isAuthenticated$ = new BehaviorSubject(undefined);
    user$ = new BehaviorSubject(undefined);
    menus$ = new BehaviorSubject(undefined);
    redirect$ = new BehaviorSubject(undefined);
    dataDeleted$ = new BehaviorSubject(undefined);
    action$ = new BehaviorSubject(undefined);

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['subscribe', 'attachLang']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
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
    navigationServiceSpy.subscribe.and.returnValue({} as any);
    navigationServiceSpy.attachLang.and.returnValue('en-GB');

    let selectCallIndex = 0;
    storeSpy.select.and.callFake(() => {
      selectCallIndex++;
      switch (selectCallIndex) {
        case 1:
          return isLoading$.asObservable();
        case 2:
          return response$.asObservable();
        case 3:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return isAuthenticated$.asObservable();
        case 2:
          return user$.asObservable();
        case 3:
          return menus$.asObservable();
        case 4:
          return redirect$.asObservable();
        case 5:
          return dataDeleted$.asObservable();
        case 6:
          return notification$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
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
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/en-GB');
    navigateSpy = spyOn(router, 'navigate');

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(logOut());
  });

  it('should update user when change theme is called', () => {
    cookieServiceSpy.get.and.returnValue('light-theme');

    const user: IUser = new User();
    user.theme = 'dark-theme';
    const message = 'COMMON.PROFILE.UPDATED.DARK_MODE_TRUE';

    component.changeTheme();

    expect(component.isDarkMode()).toBeTrue();
    expect(component['cssClass']).toBe('dark-theme');
    expect(storeSpy.dispatch).toHaveBeenCalledWith(updateMyUser({ user, message, redirectUrl: '/en-GB' }));
  });

  it('should go to home when goHome is called', () => {
    component.goToHome();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'home']);
  });

  it('should navigate to the notification navigation when it is read', () => {
    component.notification(mockNotification);

    expect(navigateSpy).toHaveBeenCalledWith(['/en-GB/reservation/r-1']);
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
    expect(storeSpy.dispatch).toHaveBeenCalledWith(readNotification({ id: unreadNotification.id }));
  });

  it('should handle auth state changes', () => {
    expect(component.countNotifications()).toBe(0);

    isAuthenticated$.next(true);
    isLoading$.next(false);
    user$.next(mockUser);

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

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(getNotificationsPage({ page: 0, sort: 'date', direction: 'desc', size: PAGE_SIZE }));

    expect(messagingServiceSpy.requestPermission).toHaveBeenCalledWith(mockUser);
    expect(messagingServiceSpy.receiveMessage).toHaveBeenCalled();
  });

  it('should receive notifications', () => {
    notification$.next({
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
      navigation: '/en-GB/reservation/r-2',
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
    isAuthenticated$.next(true);
    isLoading$.next(false);
    user$.next(mockUser);
    redirect$.next(false);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(redirect());
  });

  it('should navigate to home when not authenticated', () => {
    isAuthenticated$.next(false);
    isLoading$.next(false);
    redirect$.next(false);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en-GB', 'home']);
  });

  it('should navigate to home when redirect', () => {
    isAuthenticated$.next(true);
    isLoading$.next(false);
    user$.next(mockUser);
    redirect$.next(true);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en-GB', 'home']);
  });

  it('should handle notifications', () => {
    notification$.next({
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
    notification$.next({
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

    dataDeleted$.next(deleted);
    fixture.detectChanges();

    expect(component.countNotifications()).toBe(1);
    expect(component.notifications()).toEqual([
      jasmine.objectContaining({ id: '1', read: true }),
      jasmine.objectContaining({ id: '2', read: false }),
    ]);
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

    expect(navigateSpy).toHaveBeenCalledWith([`/en-GB/${response.redirect}`]);

    expect(toastServiceSpy.show).toHaveBeenCalledWith(response.message, response.toastType, 5000,
      { actionType: 'link', action: `/en-GB/${response.path}` });
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
