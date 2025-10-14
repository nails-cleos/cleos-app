import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { Store } from '@ngrx/store';
import { of, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { deleteNotification, readNotification } from '../store/notification.actions';
import { INotification } from '../interfaces/notification';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let storeSpy: jasmine.SpyObj<Store<any>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navigationSpy: jasmine.SpyObj<NavigationService>;
  let stateSubject: Subject<any>;

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/home/test' });
    navigationSpy = jasmine.createSpyObj('NavigationService', ['reload']);

    stateSubject = new Subject<any>();
    storeSpy.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;

    storeSpy.select.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.dateFormat).toBe('en-GB');
  });

  it('should dispatch Clean and GetNotificationsPage on init', () => {
    spyOn<any>(component, 'clean').and.callThrough();
    spyOn<any>(component, 'subscribe').and.callThrough();
    spyOn<any>(component, 'getNotifications').and.callThrough();

    component.ngOnInit();

    expect(component['clean']).toHaveBeenCalled();
    expect(component['subscribe']).toHaveBeenCalled();
    expect(component['getNotifications']).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const sub = new Subscription();
    spyOn(sub, 'unsubscribe');
    (component as any).subscription = sub;

    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should navigate if notification is already read', () => {
    const notif: INotification = { id: '1', read: true, navigation: '/path', date: '', title: '' } as any;

    component.notification(notif);

    expect(routerSpy.navigate).toHaveBeenCalledWith([notif.navigation]);
    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(readNotification({ id: '1' }));
  });

  it('should reload and dispatch ReadNotification if not read', () => {
    const notif: INotification = { id: '2', read: false, navigation: '/path', date: '', title: '' } as any;

    component.notification(notif);

    expect(navigationSpy.reload).toHaveBeenCalledWith(['', 'home', 'test']);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(readNotification({ id: '2' }));
  });

  it('should remove notification and dispatch DeleteNotification', () => {
    component.notifications = [{ id: '3', read: false, navigation: '', date: '', title: '' } as any];
    component.badge = 1;

    component.remove(0);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteNotification({ notification: jasmine.objectContaining({ id: '3', deleted: true }) }));
    expect(component.badge).toBe(0);
  });

  it('should call GetNotificationsPage when notifications empty and showMore is true', () => {
    component.notifications = [{ id: '4', read: true, navigation: '', date: '', title: '' } as any];
    component.showMore = true;
    component.badge = 0;
    spyOn(component, 'getNotifications');

    component.remove(0);

    expect(component.getNotifications).toHaveBeenCalled();
  });

  it('should update notifications and badge when state has data', () => {
    component.ngOnInit();

    // simula que viene data con una notificación no leída
    stateSubject.next({
      data: {
        page: {
          content: [{ id: 'n1', date: '2025-10-01T00:00:00Z', read: false }],
          last: false,
        },
        unread: 5,
      },
    });

    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0].id).toBe('n1');
    expect(component.badge).toBe(5);
    expect(component.showMore).toBeTrue();
  });

  it('should set loadingNotifications when no id in content', () => {
    component.ngOnInit();

    stateSubject.next({
      data: {
        page: { content: [{}] },
      },
    });

    expect(component.loadingNotifications as any).toEqual([{}]);
  });

  it('should set loadingNotifications to undefined when content is empty', () => {
    component.ngOnInit();

    stateSubject.next({
      data: {
        page: { content: [] },
      },
    });

    expect(component.loadingNotifications).toBeUndefined();
  });
});
