import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { BehaviorSubject } from 'rxjs';
import { INotification } from '../../interfaces/notification';
import { deleteNotification, getNotificationsPage, readNotification } from '../../store/actions/notification.actions';
import { getNowTimeZone } from '../../util/dates';

describe('NotificationListComponent', () => {
  let component: NotificationListComponent;
  let fixture: ComponentFixture<NotificationListComponent>;

  let notifications$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navigationSpy: jasmine.SpyObj<NavigationService>;

  const mockNoteDate = getNowTimeZone();
  const mockTimestamp = mockNoteDate.getTime() / 1000;

  beforeEach(() => {
    notifications$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/test/url' });
    navigationSpy = jasmine.createSpyObj('NavigationService', ['reload']);

    storeSpy.pipe.and.returnValue(notifications$.asObservable());

    TestBed.configureTestingModule({
      imports: [NotificationListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(NotificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getNotificationsPage on page effect', () => {
    component['page'].set(1);
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getNotificationsPage({ page: 1, sort: 'date', direction: 'desc', size: 10 }),
    );
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
    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(readNotification({ id: notif.id }));
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
    expect(storeSpy.dispatch).toHaveBeenCalledWith(readNotification({ id: notif.id }));
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
    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteNotification({ notification: updated[0] }));
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

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(deleteNotification({ notification: jasmine.anything() as any }));
    expect(component.notifications()).toEqual([notif]);
    expect(component.badge).toBe(1);
  }));

  it('should keep the badge for read notifications and request the next page when showMore is enabled', fakeAsync(() => {
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
