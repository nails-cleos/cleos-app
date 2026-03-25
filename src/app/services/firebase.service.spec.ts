import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FirebaseService } from './firebase.service';
import { FirebaseSdkService } from './firebase.config';

describe('FirebaseService', () => {
  let service: FirebaseService;

  const mockUser: any = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('token123'),
    getIdTokenResult: jasmine.createSpy('getIdTokenResult').and.resolveTo({ token: 'idToken123' }),
  };

  const mockSdk: any = {
    auth: {
      currentUser: mockUser,
      authStateReady: jasmine.createSpy().and.resolveTo(),
      signOut: jasmine.createSpy().and.resolveTo(),
    },
    messaging: {},
    database: {},
    analytics: {},
    appCheck: {},

    getToken: jasmine.createSpy(),
    onMessage: jasmine.createSpy(),
    logEvent: jasmine.createSpy(),
    ref: jasmine.createSpy(),
    update: jasmine.createSpy(),
    onIdTokenChanged: jasmine.createSpy(),
  };

  beforeEach(() => {
    mockSdk.onIdTokenChanged.and.callFake((_: any, callback: any) => {
      callback(mockUser);
      return () => {
      };
    });

    TestBed.configureTestingModule({
      providers: [
        FirebaseService,
        { provide: FirebaseSdkService, useValue: mockSdk },
      ],
    });

    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true for isAuthenticated when user exists', () => {
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false for isAuthenticated when user does not exist', () => {
    (service as any)._user.set(null);

    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should get idTokenResult', async () => {
    const result = await service.idTokenResult;

    expect(result?.token).toBe('idToken123');
    expect(mockUser.getIdTokenResult).toHaveBeenCalled();
  });

  it('should get appCheckToken', async () => {
    mockSdk.getToken.and.resolveTo('appCheckToken123');

    const token = await service.appCheckToken;

    expect(token).toBe('appCheckToken123');
    expect(mockSdk.getToken).toHaveBeenCalledWith(mockSdk.appCheck);
  });

  it('should update FCM token in database', async () => {
    const refMock = {};
    mockSdk.ref.and.returnValue(refMock);
    mockSdk.update.and.resolveTo();

    await service.updateToken('uid123', 'token123');

    expect(mockSdk.ref).toHaveBeenCalledWith(mockSdk.database, 'fcmTokens/');
    expect(mockSdk.update).toHaveBeenCalledWith(refMock, {
      uid123: 'token123',
    });
  });

  it('should return messaging token', async () => {
    mockSdk.getToken.and.resolveTo('messagingToken123');

    const token = await service.getMessagingToken({} as any);

    expect(token).toBe('messagingToken123');
    expect(mockSdk.getToken).toHaveBeenCalledWith(mockSdk.messaging, {} as any);
  });

  it('should emit messages from onMessageReceived', (done) => {
    mockSdk.onMessage.and.callFake((_: any, callback: any) => {
      callback({ data: 'msg' });
      return () => {
      }; // unsubscribe fn
    });

    service.onMessageReceived().subscribe((msg: any) => {
      expect(msg.data).toBe('msg');
      done();
    });
  });

  it('should log analytics events', () => {
    service.logEvent('test_event', { param: 1 });

    expect(mockSdk.logEvent).toHaveBeenCalledWith(
      mockSdk.analytics,
      'test_event',
      { param: 1 },
    );
  });

  it('should sign out', async () => {
    await service.signOut();

    expect(mockSdk.auth.signOut).toHaveBeenCalled();
  });

  it('should get ID token', fakeAsync(async () => {
    const token = await service.getIdToken();

    flush();
    tick();

    expect(token).toBe('token123');
    expect(mockUser.getIdToken).toHaveBeenCalled();
  }));

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

    await expectAsync(
      service.updateProfile({ displayName: 'New Name' }),
    ).toBeRejectedWithError('No current user');
  });

  it('should reject sendVerificationEmail if no user', async () => {
    (service as any)._user.set(null);

    await expectAsync(
      service.sendVerificationEmail(),
    ).toBeRejectedWithError('No current user');
  });

  it('should update the user signal from the id token listener', () => {
    const listener = mockSdk.onIdTokenChanged.calls.mostRecent().args[1];
    listener(null);

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
