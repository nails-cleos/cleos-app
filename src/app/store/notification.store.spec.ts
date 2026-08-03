import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { NotificationStore } from './notification.store';
import { NotificationService } from '../services/notification.service';

describe('NotificationStore', () => {
  let store: InstanceType<typeof NotificationStore>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    notificationServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'getNotificationsPage',
      'readNotification',
      'deleteNotification',
      'subscribeNotification',
    ]);

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        NotificationStore,
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    store = TestBed.inject(NotificationStore);
  });

  it('should load notifications page', () => {
    const page = { content: [] } as any;
    notificationServiceSpy.getNotificationsPage.and.returnValue(of(page));

    store.loadPage({
      page: 0,
      sort: 'date',
      direction: 'desc',
      size: 10,
    });

    expect(notificationServiceSpy.getNotificationsPage).toHaveBeenCalledWith(
      0,
      'date',
      'desc',
      10,
    );

    expect(store.data()).toEqual(page);
    expect(store.isLoading()).toBeFalse();
  });

  it('should read notification and navigate when navigation exists', () => {
    const notification = {
      id: 'n1',
      navigation: '/dashboard',
    } as any;

    notificationServiceSpy.readNotification.and.returnValue(of(notification));

    store.read('n1');

    expect(notificationServiceSpy.readNotification).toHaveBeenCalledWith('n1');

    expect(store.dataRead()).toEqual(notification);
    expect(store.isLoading()).toBeFalse();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should NOT navigate when navigation is missing', () => {
    const notification = {
      id: 'n1',
      navigation: null,
    } as any;

    notificationServiceSpy.readNotification.and.returnValue(of(notification));

    store.read('n1');

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(store.dataRead()).toEqual(notification);
  });

  it('should delete notification and store deleted data', () => {
    const notification = { id: 'n1' } as any;

    notificationServiceSpy.deleteNotification.and.returnValue(of(void 0));

    store.delete(notification);

    expect(notificationServiceSpy.deleteNotification).toHaveBeenCalledWith('n1');

    expect(store.dataDeleted()).toEqual(notification);
    expect(store.isLoading()).toBeFalse();
  });

  it('should subscribe to notifications', () => {
    notificationServiceSpy.subscribeNotification.and.returnValue(of(void 0));

    store.subscribeNotification('token-123');

    expect(notificationServiceSpy.subscribeNotification).toHaveBeenCalledWith(
      'token-123',
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors into error state', () => {
    notificationServiceSpy.readNotification.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 500,
          error: { message: 'NOTIFICATION.ERROR' },
        }),
      ),
    );

    store.read('n1');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should reset store on clean()', () => {
    notificationServiceSpy.getNotificationsPage.and.returnValue(
      of({ content: [] } as any),
    );

    store.loadPage({
      page: 0,
      sort: 'date',
      direction: 'asc',
      size: 10,
    });

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.dataRead()).toBeUndefined();
    expect(store.dataDeleted()).toBeUndefined();
  });

  it('should clear response and error', () => {
    notificationServiceSpy.getNotificationsPage.and.returnValue(
      of({ content: [] } as any),
    );

    store.loadPage({
      page: 0,
      sort: 'date',
      direction: 'asc',
      size: 10,
    });

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
