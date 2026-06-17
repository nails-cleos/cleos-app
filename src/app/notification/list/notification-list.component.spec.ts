import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { INotification, INotificationDTO } from '../notification';
import { DEFAULT_LOCALE, getNowTimeZone } from '../../util/dates';
import { signal } from '@angular/core';
import { Pagination } from '../../interfaces/pagination';
import { NotificationStore } from '../../store/notification.store';

describe('NotificationListComponent', () => {
  let component: NotificationListComponent;
  let fixture: ComponentFixture<NotificationListComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let navigationSpy: jasmine.SpyObj<NavigationService>;
  let notificationStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadPage: jasmine.Spy;
    clearResponse: jasmine.Spy;
    readNotification: jasmine.Spy;
    deleteNotification: jasmine.Spy;
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
      readNotification: jasmine.createSpy('readNotification'),
      deleteNotification: jasmine.createSpy('deleteNotification'),
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/test/url' });
    navigationSpy = jasmine.createSpyObj('NavigationService', ['reload']);


    TestBed.configureTestingModule({
      imports: [NotificationListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NotificationStore, useValue: notificationStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

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
    expect(notificationStoreSpy.readNotification).not.toHaveBeenCalledWith(notif.id);
  });

  it('should dispatch readNotification if notification is unread', () => {
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
    expect(navigationSpy.reload).toHaveBeenCalled();
    expect(notificationStoreSpy.readNotification).toHaveBeenCalledWith(notif.id);
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
    expect(notificationStoreSpy.deleteNotification).toHaveBeenCalledWith(updated[0]);
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

    expect(notificationStoreSpy.deleteNotification).not.toHaveBeenCalledWith(jasmine.anything() as any);
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
