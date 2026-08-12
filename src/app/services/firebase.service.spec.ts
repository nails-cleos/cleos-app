import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FirebaseService } from './firebase.service';
import { FirebaseSdkService } from './firebase.config';
interface FirebaseSdkMock {
  auth: {
    currentUser: any;
    authStateReady: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };
  messaging: unknown;
  database: unknown;
  analytics: unknown;
  appCheck: unknown;

  getToken: ReturnType<typeof vi.fn>;
  onMessage: ReturnType<typeof vi.fn>;
  logEvent: ReturnType<typeof vi.fn>;
  ref: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  onIdTokenChanged: ReturnType<typeof vi.fn>;
}

describe('FirebaseService', () => {
  let service: FirebaseService;
  let sdkSpy: FirebaseSdkMock;

  const mockUser = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',

    getIdToken: vi.fn().mockName('getIdToken').mockResolvedValue('token123'),

    getIdTokenResult: vi.fn().mockName('getIdTokenResult').mockResolvedValue({
      token: 'idToken123',
      authTime: '',
      issuedAtTime: '',
      expirationTime: '',
      signInProvider: null,
      signInSecondFactor: null,
      claims: {},
    }),
  };

  beforeEach(() => {
    sdkSpy = {
      auth: {
        currentUser: mockUser,
        authStateReady: vi.fn().mockResolvedValue(undefined),
        signOut: vi.fn().mockResolvedValue(undefined),
      },

      messaging: {},
      database: {},
      analytics: {},
      appCheck: {},

      getToken: vi.fn(),
      onMessage: vi.fn(),
      logEvent: vi.fn(),
      ref: vi.fn(),
      update: vi.fn(),

      onIdTokenChanged: vi.fn(),
    };

    sdkSpy.onIdTokenChanged.mockImplementation(
      (_auth: unknown, callback: (user: any) => void) => {
        callback(mockUser);

        return () => {};
      },
    );

    TestBed.configureTestingModule({
      providers: [
        FirebaseService,
        {
          provide: FirebaseSdkService,
          useValue: sdkSpy,
        },
      ],
    });

    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true for isAuthenticated when user exists', () => {
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false for isAuthenticated when user does not exist', () => {
    (service as any)._user.set(null);

    expect(service.isAuthenticated()).toBe(false);
  });

  it('should get idTokenResult', async () => {
    const result = await service.idTokenResult;

    expect(result?.token).toBe('idToken123');
    expect(mockUser.getIdTokenResult).toHaveBeenCalled();
  });

  it('should get appCheckToken', async () => {
    sdkSpy.getToken.mockResolvedValue('appCheckToken123');

    const token = await service.appCheckToken;

    expect(token).toBe('appCheckToken123');
    expect(sdkSpy.getToken).toHaveBeenCalledWith(sdkSpy.appCheck);
  });

  it('should update FCM token in database', async () => {
    const refMock = {};

    sdkSpy.ref.mockReturnValue(refMock);
    sdkSpy.update.mockResolvedValue(undefined);

    await service.updateToken('uid123', 'token123');

    expect(sdkSpy.ref).toHaveBeenCalledWith(sdkSpy.database, 'fcmTokens/');

    expect(sdkSpy.update).toHaveBeenCalledWith(refMock, {
      uid123: 'token123',
    });
  });

  it('should return messaging token', async () => {
    sdkSpy.getToken.mockResolvedValue('messagingToken123');

    const token = await service.getMessagingToken({} as any);

    expect(token).toBe('messagingToken123');

    expect(sdkSpy.getToken).toHaveBeenCalledWith(sdkSpy.messaging, {});
  });

  it('should emit messages from onMessageReceived', () => {
    sdkSpy.onMessage.mockImplementation((_messaging, callback) => {
      callback({ data: 'msg' });

      return () => {};
    });

    service.onMessageReceived().subscribe((message) => {
      expect(message.data).toBe('msg');
    });
  });

  it('should log analytics events', () => {
    service.logEvent('test_event', { param: 1 });

    expect(sdkSpy.logEvent).toHaveBeenCalledWith(
      sdkSpy.analytics,
      'test_event',
      { param: 1 },
    );
  });

  it('should sign out', async () => {
    await service.signOut();

    expect(sdkSpy.auth.signOut).toHaveBeenCalled();
  });

  it('should get ID token', async () => {
    const token = await service.getIdToken();

    expect(token).toBe('token123');
    expect(mockUser.getIdToken).toHaveBeenCalled();
  });

  it('should return null ID token if no user', async () => {
    (service as any)._user.set(null);

    const token = await service.getIdToken();

    expect(token).toBeNull();
  });

  it('should return null idTokenResult if no user', async () => {
    (service as any)._user.set(null);

    const result = await service.idTokenResult;

    expect(result).toBeNull();
  });

  it('should reject updateProfile if no user', async () => {
    (service as any)._user.set(null);

    await expect(
      service.updateProfile({
        displayName: 'New Name',
      }),
    ).rejects.toThrowError('No current user');
  });

  it('should reject sendVerificationEmail if no user', async () => {
    (service as any)._user.set(null);

    await expect(service.sendVerificationEmail()).rejects.toThrowError(
      'No current user',
    );
  });

  it('should update the user signal from the id token listener', () => {
    const callback = sdkSpy.onIdTokenChanged.mock.lastCall?.[1];

    expect(callback).toBeDefined();

    callback!(null);

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
