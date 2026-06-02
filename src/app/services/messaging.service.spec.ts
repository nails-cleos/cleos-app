import { signal, WritableSignal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { MessagingService } from './messaging.service';
import { Store } from '@ngrx/store';
import { subscribeNotification } from '../store/actions/notification.actions';
import { NotificationState } from '../store/reducers/notification.reducers';
import { FirebaseService } from './firebase.service';
import { EnvService } from './env.service';

describe('MessagingService', () => {
  let service: MessagingService;
  let storeSpy: jasmine.SpyObj<Store<NotificationState>>;
  let firebaseSpy: jasmine.SpyObj<FirebaseService>;
  let envSpy: jasmine.SpyObj<EnvService>;
  let isAuthenticatedSignal: WritableSignal<boolean>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockToken = 'mock-fcm-token';

  beforeEach(() => {
    isAuthenticatedSignal = signal(true);

    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    firebaseSpy = jasmine.createSpyObj('FirebaseService', [
      'updateToken',
      'getMessagingToken',
      'onMessageReceived',
    ], {
      isAuthenticated: isAuthenticatedSignal.asReadonly(),
      appCheckToken: Promise.resolve('app-check-token'),
    });

    envSpy = jasmine.createSpyObj('EnvService', [], {
      firebaseMessaging: '/firebase-messaging-sw.js',
      firebase: { vapidKey: 'VAPID_KEY' },
    });

    // Mock onMessageReceived observable
    firebaseSpy.onMessageReceived.and.returnValue(of({ msg: 'hello' }));
    firebaseSpy.updateToken.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        MessagingService,
        { provide: Store, useValue: storeSpy },
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: EnvService, useValue: envSpy },
      ],
    });

    service = TestBed.inject(MessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize message$ from firebase', (done) => {
    service.message$.subscribe(msg => {
      expect(msg).toEqual({ msg: 'hello' });
      done();
    });
  });

  describe('updateToken', () => {
    it('should dispatch action and call firebase.updateToken when authenticated', async () => {
      await service.updateToken(mockUser, mockToken);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(subscribeNotification({ token: mockToken }));
      expect(firebaseSpy.updateToken).toHaveBeenCalledWith(mockUser.id, mockToken);
    });

    it('should not dispatch or update token if not authenticated', async () => {
      isAuthenticatedSignal.set(false);

      await service.updateToken(mockUser, mockToken);

      expect(storeSpy.dispatch).not.toHaveBeenCalled();
      expect(firebaseSpy.updateToken).not.toHaveBeenCalled();
    });
  });

  describe('requestPermission', () => {
    it('should call firebase.getMessagingToken and updateToken if permission granted', fakeAsync(() => {
      const fakeSWReg = { scope: '__' } as any;
      const fakeToken = 'new-token';

      // spy the global Notification.requestPermission
      spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('granted'));
      spyOn(navigator.serviceWorker, 'register').and.returnValue(Promise.resolve(fakeSWReg));
      firebaseSpy.getMessagingToken.and.returnValue(Promise.resolve(fakeToken));

      service.updateToken = jasmine.createSpy().and.callFake(() => {}); // spy updateToken to avoid store dispatch racing

      service.requestPermission(mockUser);

      // flush all promises
      tick();

      expect(firebaseSpy.getMessagingToken).toHaveBeenCalledWith({
        serviceWorkerRegistration: fakeSWReg,
        vapidKey: envSpy.firebase.vapidKey,
      });
      expect(service.updateToken).toHaveBeenCalledWith(mockUser, fakeToken);
    }));

    it('should not call updateToken if permission denied', async () => {
      spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('denied'));

      await service.requestPermission(mockUser);

      expect(firebaseSpy.getMessagingToken).not.toHaveBeenCalled();
      expect(storeSpy.dispatch).not.toHaveBeenCalled();
    });

    it('should stop before requesting permission when app check token is missing', async () => {
      Object.defineProperty(firebaseSpy, 'appCheckToken', {
        value: Promise.resolve(null),
        configurable: true,
      });
      const permissionSpy = spyOn(Notification, 'requestPermission');

      await service.requestPermission(mockUser);

      expect(permissionSpy).not.toHaveBeenCalled();
      expect(firebaseSpy.getMessagingToken).not.toHaveBeenCalled();
    });
  });
});
