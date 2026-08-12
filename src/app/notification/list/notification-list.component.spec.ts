import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  let routerSpy: {
    navigate: Mock;
    url: string;
  };
  let navigationServiceSpy: Pick<
    NavigationService,
    'reload' | 'navigate' | 'language'
  > & {
    reload: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };
  let notificationStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: Mock;
    loadPage: Mock;
    clearResponse: Mock;
    read: Mock;
    delete: Mock;
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
      clean: vi.fn().mockName('clean'),
      loadPage: vi.fn().mockName('loadPage'),
      clearResponse: vi.fn().mockName('clearResponse'),
      read: vi.fn().mockName('read'),
      delete: vi.fn().mockName('delete'),
    };
    routerSpy = {
      navigate: vi.fn().mockName('Router.navigate'),
      url: '/test/url',
    };
    navigationServiceSpy = {
      reload: vi.fn().mockName('NavigationService.reload'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };

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
    notificationStoreSpy.loadPage.mockClear();
    component['page'].set(1);
    fixture.detectChanges();
    expect(notificationStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'date',
      direction: 'desc',
      size: 10,
    });
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

  it('should mark notification as deleted and dispatch deleteNotification', () => {
    vi.useFakeTimers();

    try {
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
      expect(updated[0].deleted).toBe(true);
      expect(notificationStoreSpy.delete).toHaveBeenCalledWith(updated[0]);
      expect(component.badge).toBe(0);

      vi.advanceTimersByTime(260);

      expect(component.notifications()).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should not throw if remove is called on empty list', () => {
    component.notifications.set([]);
    expect(() => component.remove(0)).not.toThrow();
  });

  it('should ignore remove when the index does not exist', () => {
    vi.useFakeTimers();

    try {
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
      vi.advanceTimersByTime(260);

      expect(notificationStoreSpy.delete).not.toHaveBeenCalledWith(
        expect.anything() as any,
      );
      expect(component.notifications()).toEqual([notif]);
      expect(component.badge).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should keep the badge for read notifications and request the next page when showMore is enabled', () => {
    vi.useFakeTimers();
    try {
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

      vi.advanceTimersByTime(260);

      expect(component.notifications()).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});
