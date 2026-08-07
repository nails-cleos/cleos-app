import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';
import { Router } from '@angular/router';
import { NavigationService } from '@app/services/navigation.service';
import { INotification, INotificationDTO } from '../notification';
import { DEFAULT_LOCALE, getNowTimeZone } from '@app/util/dates';
import { signal } from '@angular/core';
import { Pagination } from '@app/interfaces/pagination';
import { NotificationStore } from '@app/store/notification.store';
import { provideTranslateService } from '@ngx-translate/core';

describe('NotificationListComponent', () => {
  let component: NotificationListComponent;
  let fixture: ComponentFixture<NotificationListComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let notificationStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadPage: jasmine.Spy;
    clearResponse: jasmine.Spy;
    read: jasmine.Spy;
    delete: jasmine.Spy;
  };

  const mockNoteDate = getNowTimeZone();
  const mockTimestamp = mockNoteDate.getTime() / 1000;
  const mockNotification: INotification = {
    id: '1',
    read: true,
    navigation: '/test',
    date: mockTimestamp,
    deleted: false,
    message: 'not 1',
    notDate: mockNoteDate,
  };
  const mockPagination: Pagination<INotification> = {
    number: 0,
    totalPages: 1,
    content: [mockNotification],
    totalElements: 2,
  };
  const mockNotifications: INotificationDTO = {
    unread: 1,
    workDay: [],
    page: mockPagination,
  };

  beforeEach(() => {
    notificationStoreSpy = {
      isLoading: signal(false),
      data: signal<any>(mockNotifications),
      response: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadPage: jasmine.createSpy('loadPage'),
      clearResponse: jasmine.createSpy('clearResponse'),
      read: jasmine.createSpy('read'),
      delete: jasmine.createSpy('delete'),
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/test/url' });
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['reload', 'navigate'],
      { language: DEFAULT_LOCALE },
    );

    TestBed.configureTestingModule({
      imports: [NotificationListComponent],
      providers: [
        provideTranslateService(),
        { provide: NotificationStore, useValue: notificationStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getNotificationsPage on page effect', () => {
    notificationStoreSpy.loadPage.calls.reset();
    component['page'].set(1);
    fixture.detectChanges();
    expect(notificationStoreSpy.loadPage).toHaveBeenCalledWith({ page: 1, sort: 'date', direction: 'desc', size: 10 });
  });

  it('should navigate if notification is read', () => {
    const notif: INotification = {
      id: '1',
      read: true,
      navigation: '/test',
      date: mockTimestamp,
      deleted: false,
      message: 'not 1',
      notDate: mockNoteDate,
    };
    component.notification(notif);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/test']);
    expect(notificationStoreSpy.read).not.toHaveBeenCalledWith(notif.id);
  });

  it('should dispatch read notification if notification is unread', () => {
    const notif: INotification = {
      id: '1',
      read: false,
      navigation: '/test',
      date: mockTimestamp,
      deleted: false,
      message: 'not 1',
      notDate: mockNoteDate,
    };
    component.notification(notif);
    expect(navigationServiceSpy.reload).toHaveBeenCalled();
    expect(notificationStoreSpy.read).toHaveBeenCalledWith(notif.id);
  });

  it('should mark notification as deleted and dispatch deleteNotification', fakeAsync(() => {
    const notif: INotification = {
      id: '1',
      read: false,
      navigation: '/test',
      date: mockTimestamp,
      deleted: false,
      message: 'not 1',
      notDate: mockNoteDate,
    };
    component.notifications.set([notif]);
    component.badge = 1;

    component.remove(0);

    const updated = component.notifications();
    expect(updated[0].deleted).toBeTrue();
    expect(notificationStoreSpy.delete).toHaveBeenCalledWith(updated[0]);
    expect(component.badge).toBe(0);

    tick(260);

    expect(component.notifications()).toEqual([]);
  }));

  it('should not throw if remove is called on empty list', () => {
    component.notifications.set([]);
    expect(() => component.remove(0)).not.toThrow();
  });

  it('should ignore remove when the index does not exist', fakeAsync(() => {
    const notif: INotification = {
      id: '1',
      read: false,
      navigation: '/test',
      date: mockTimestamp,
      deleted: false,
      message: 'not 1',
      notDate: mockNoteDate,
    };
    component.notifications.set([notif]);
    component.badge = 1;

    component.remove(5);
    tick(260);

    expect(notificationStoreSpy.delete).not.toHaveBeenCalledWith(jasmine.anything() as any);
    expect(component.notifications()).toEqual([notif]);
    expect(component.badge).toBe(1);
  }));

  it('should keep the badge for read notifications and request the next page when showMore is enabled',
    fakeAsync(() => {
      const notif: INotification = {
        id: '1',
        read: true,
        navigation: '/test',
        date: mockTimestamp,
        deleted: false,
        message: 'not 1',
        notDate: mockNoteDate,
      };
      component.notifications.set([notif]);
      component.badge = 3;
      component.showMore = true;
      component['page'].set(2);

      component.remove(0);

      expect(component.badge).toBe(3);
      expect(component['page']()).toBe(1);

      tick(260);

      expect(component.notifications()).toEqual([]);
    }));

});
