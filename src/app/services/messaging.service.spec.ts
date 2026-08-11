import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MessagingService } from './messaging.service';
import { FirebaseService } from './firebase.service';
import { EnvService } from './env.service';
import { NotificationStore } from '../store/notification.store';

describe('MessagingService', () => {
  let service: MessagingService;

  let firebaseSpy: Pick<
    FirebaseService,
    | 'updateToken'
    | 'getMessagingToken'
    | 'onMessageReceived'
    | 'isAuthenticated'
    | 'appCheckToken'
  > & {
    updateToken: ReturnType<typeof vi.fn>;
    getMessagingToken: ReturnType<typeof vi.fn>;
    onMessageReceived: ReturnType<typeof vi.fn>;
  };
  let envSpy: Pick<EnvService, 'firebase' | 'firebaseMessaging'>;
  let isAuthenticatedSignal: WritableSignal<boolean>;
  let notificationStoreSpy: {
    subscribeNotification: Mock;
  };

  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockToken = 'mock-fcm-token';

  beforeEach(() => {
    notificationStoreSpy = {
      subscribeNotification: vi.fn().mockName('subscribeNotification'),
    };
    isAuthenticatedSignal = signal(true);

    firebaseSpy = {
      updateToken: vi.fn().mockName('FirebaseService.updateToken'),
      getMessagingToken: vi.fn().mockName('FirebaseService.getMessagingToken'),
      onMessageReceived: vi.fn().mockName('FirebaseService.onMessageReceived'),
      isAuthenticated: isAuthenticatedSignal.asReadonly(),
      appCheckToken: Promise.resolve('app-check-token'),
    };

    envSpy = {
      firebaseMessaging: '/firebase-messaging-sw.js',
      firebase: { vapidKey: 'VAPID_KEY' } as any,
    };

    // Mock onMessageReceived observable
    firebaseSpy.onMessageReceived.mockReturnValue(of({ msg: 'hello' }));
    firebaseSpy.updateToken.mockResolvedValue('');

    TestBed.configureTestingModule({
      providers: [
        MessagingService,
        { provide: NotificationStore, useValue: notificationStoreSpy },
        { provide: FirebaseService, useValue: firebaseSpy },
        { provide: EnvService, useValue: envSpy },
      ],
    });

    service = TestBed.inject(MessagingService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize message$ from firebase', async () => {
    service.message$.subscribe((msg) => {
      expect(msg).toEqual({ msg: 'hello' });
    });
  });

  describe('updateToken', () => {
    it('should dispatch action and call firebase.updateToken when authenticated', async () => {
      await service.updateToken(mockUser, mockToken);

      expect(notificationStoreSpy.subscribeNotification).toHaveBeenCalledWith(
        mockToken,
      );
      expect(firebaseSpy.updateToken).toHaveBeenCalledWith(
        mockUser.id,
        mockToken,
      );
    });

    it('should not dispatch or update token if not authenticated', async () => {
      isAuthenticatedSignal.set(false);

      await service.updateToken(mockUser, mockToken);

      expect(notificationStoreSpy.subscribeNotification).not.toHaveBeenCalled();
      expect(firebaseSpy.updateToken).not.toHaveBeenCalled();
    });
  });

  describe('requestPermission', () => {
    it('should call firebase.getMessagingToken and updateToken if permission granted', async () => {
      const fakeSWReg = { scope: '__' } as any;
      const fakeToken = 'new-token';

      const requestPermission = vi.fn().mockResolvedValue('granted');
      const register = vi.fn().mockResolvedValue(fakeSWReg);

      vi.stubGlobal('Notification', {
        requestPermission,
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: {
          register,
        },
      });

      firebaseSpy.getMessagingToken.mockResolvedValue(fakeToken);

      service.updateToken = vi.fn().mockResolvedValue(undefined);

      await service.requestPermission(mockUser);

      expect(requestPermission).toHaveBeenCalled();
      expect(register).toHaveBeenCalled();

      expect(firebaseSpy.getMessagingToken).toHaveBeenCalledWith({
        serviceWorkerRegistration: fakeSWReg,
        vapidKey: envSpy.firebase.vapidKey,
      });

      expect(service.updateToken).toHaveBeenCalledWith(mockUser, fakeToken);
    });
    it('should not call updateToken if permission denied', async () => {
      const requestPermission = vi.fn().mockResolvedValue('denied');

      vi.stubGlobal('Notification', {
        requestPermission,
      });

      await service.requestPermission(mockUser);

      expect(firebaseSpy.getMessagingToken).not.toHaveBeenCalled();
      expect(notificationStoreSpy.subscribeNotification).not.toHaveBeenCalled();
    });

    it('should stop before requesting permission when app check token is missing', async () => {
      Object.defineProperty(firebaseSpy, 'appCheckToken', {
        value: Promise.resolve(null),
        configurable: true,
      });

      const permissionSpy = vi.fn();

      vi.stubGlobal('Notification', {
        requestPermission: permissionSpy,
      });

      await service.requestPermission(mockUser);

      expect(permissionSpy).not.toHaveBeenCalled();
      expect(firebaseSpy.getMessagingToken).not.toHaveBeenCalled();
    });
  });
});
