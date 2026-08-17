import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserCredential } from 'firebase/auth';
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

  logNewEvent: ReturnType<typeof vi.fn>;
  authStateReady: ReturnType<typeof vi.fn>;
  appCheckToken: ReturnType<typeof vi.fn>;
  getAuthToken: ReturnType<typeof vi.fn>;
  getMessage: ReturnType<typeof vi.fn>;
  getIdTokenChanged: ReturnType<typeof vi.fn>;
  updateToken: ReturnType<typeof vi.fn>;

  signInWithGoogle: ReturnType<typeof vi.fn>;
  signInWithGooglePopup: ReturnType<typeof vi.fn>;

  signUp: ReturnType<typeof vi.fn>;
  signIn: ReturnType<typeof vi.fn>;
  updateUserProfile: ReturnType<typeof vi.fn>;
  sendVerificationEmail: ReturnType<typeof vi.fn>;
  fetchSignInMethods: ReturnType<typeof vi.fn>;
  sendPasswordReset: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
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
    vi.clearAllMocks();

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

      logNewEvent: vi.fn(),
      authStateReady: vi.fn().mockResolvedValue(undefined),
      appCheckToken: vi.fn().mockResolvedValue(null),
      getAuthToken: vi.fn(),
      getMessage: vi.fn(),
      getIdTokenChanged: vi.fn(),
      updateToken: vi.fn().mockResolvedValue(undefined),

      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signInWithGooglePopup: vi.fn(),

      signUp: vi.fn(),
      signIn: vi.fn(),
      updateUserProfile: vi.fn(),
      sendVerificationEmail: vi.fn(),
      fetchSignInMethods: vi.fn(),
      sendPasswordReset: vi.fn(),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    sdkSpy.getIdTokenChanged.mockImplementation(
      (callback: (user: any) => void) => {
        callback(mockUser);

        return () => {};
      },
    );

    sdkSpy.signInWithGooglePopup.mockResolvedValue({
      user: mockUser,
    } as unknown as UserCredential);

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
    sdkSpy.appCheckToken.mockResolvedValue('appCheckToken123');

    const token = await service.appCheckToken;

    expect(token).toBe('appCheckToken123');
    expect(sdkSpy.appCheckToken).toHaveBeenCalled();
  });

  it('should update FCM token in database', async () => {
    await service.updateToken('uid123', 'token123');

    expect(sdkSpy.updateToken).toHaveBeenCalledWith('uid123', 'token123');
  });

  it('should return messaging token', async () => {
    sdkSpy.getAuthToken.mockResolvedValue('messagingToken123');

    const options = {} as any;

    const token = await service.getMessagingToken(options);

    expect(token).toBe('messagingToken123');

    expect(sdkSpy.getAuthToken).toHaveBeenCalledWith(options);
  });

  it('should emit messages from onMessageReceived', () => {
    sdkSpy.getMessage.mockImplementation((callback) => {
      callback({ data: 'msg' });

      return () => {};
    });

    service.onMessageReceived().subscribe((message) => {
      expect(message.data).toBe('msg');
    });

    expect(sdkSpy.getMessage).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should log analytics events', () => {
    service.logEvent('test_event', { param: 1 });

    expect(sdkSpy.logNewEvent).toHaveBeenCalledWith('test_event', { param: 1 });
  });

  it('should sign out', async () => {
    await service.signOut();

    expect(sdkSpy.signOut).toHaveBeenCalled();
  });

  it('should get ID token', async () => {
    const token = await service.getIdToken();

    expect(token).toBe('token123');
    expect(mockUser.getIdToken).toHaveBeenCalled();
  });

  it('should pass forceRefresh when getting ID token', async () => {
    await service.getIdToken(true);

    expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
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

  it('should update the user signal from the id token listener', () => {
    const callback = sdkSpy.getIdTokenChanged.mock.lastCall?.[0];

    expect(callback).toBeDefined();

    callback!(null);

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should initialize the user from the id token listener', () => {
    expect(sdkSpy.getIdTokenChanged).toHaveBeenCalledWith(expect.any(Function));

    expect(service.user()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should sign in with Google using the SDK', async () => {
    await service.signInWithGoogle();

    expect(sdkSpy.signInWithGoogle).toHaveBeenCalled();
  });

  it('should pass Google scope to the SDK', async () => {
    await service.signInWithGoogle('profile');

    expect(sdkSpy.signInWithGoogle).toHaveBeenCalledWith('profile');
  });

  it('should sign in with Google popup using the SDK', async () => {
    const result = await service.signInWithGooglePopup();

    expect(result).toEqual({
      user: mockUser,
    });

    expect(sdkSpy.signInWithGooglePopup).toHaveBeenCalled();
  });

  it('should pass Google scope to the popup SDK method', async () => {
    await service.signInWithGooglePopup('profile');

    expect(sdkSpy.signInWithGooglePopup).toHaveBeenCalledWith('profile');
  });

  it('should delegate authStateReady', async () => {
    await service.authStateReady();

    expect(sdkSpy.authStateReady).toHaveBeenCalled();
  });

  it('should delegate signUp', async () => {
    sdkSpy.signUp.mockResolvedValue(mockUser);

    const result = await service.signUp('test@example.com', 'password');

    expect(result).toBe(mockUser);

    expect(sdkSpy.signUp).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should delegate signIn', async () => {
    const credential = {
      user: mockUser,
    } as unknown as UserCredential;

    sdkSpy.signIn.mockResolvedValue(credential);

    const result = await service.signIn('test@example.com', 'password');

    expect(result).toBe(credential);

    expect(sdkSpy.signIn).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should delegate fetchSignInMethods', async () => {
    sdkSpy.fetchSignInMethods.mockResolvedValue(['password']);

    const result = await service.fetchSignInMethods('test@example.com');

    expect(result).toEqual(['password']);

    expect(sdkSpy.fetchSignInMethods).toHaveBeenCalledWith('test@example.com');
  });

  it('should delegate sendPasswordResetEmail', async () => {
    sdkSpy.sendPasswordReset.mockResolvedValue(undefined);

    await service.sendPasswordResetEmail('test@example.com');

    expect(sdkSpy.sendPasswordReset).toHaveBeenCalledWith('test@example.com');
  });

  it('should delegate updateProfile', async () => {
    sdkSpy.updateUserProfile.mockResolvedValue(undefined);

    await service.updateProfile({
      displayName: 'New Name',
    });

    expect(sdkSpy.updateUserProfile).toHaveBeenCalledWith(
      {
        displayName: 'New Name',
        photoURL: undefined,
      },
      mockUser,
    );
  });

  it('should delegate sendVerificationEmail', async () => {
    sdkSpy.sendVerificationEmail.mockResolvedValue(undefined);

    await service.sendVerificationEmail();

    expect(sdkSpy.sendVerificationEmail).toHaveBeenCalledWith(mockUser);
  });
});
