import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FirebaseSdkService } from './firebase.config';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();

  const auth = {
    currentUser: null,
    authStateReady: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };

  return {
    ...actual,

    getAuth: vi.fn(() => auth),

    setPersistence: vi.fn().mockResolvedValue(undefined),

    onIdTokenChanged: vi.fn(),

    connectAuthEmulator: vi.fn(),
  };
});

describe('FirebaseSdkService', () => {
  let service: FirebaseSdkService;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [FirebaseSdkService],
    });

    service = TestBed.inject(FirebaseSdkService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the Firebase SDK services', () => {
    expect(service.auth).toBeDefined();
    expect(service.database).toBeDefined();
    expect(service.messaging).toBeDefined();
    expect(service.appCheck).toBeDefined();
  });

  it('should expose the FirebaseSdkService API', () => {
    expect(service.authStateReady).toEqual(expect.any(Function));
    expect(service.appCheckToken).toEqual(expect.any(Function));
    expect(service.getAuthToken).toEqual(expect.any(Function));
    expect(service.getMessage).toEqual(expect.any(Function));
    expect(service.getIdTokenChanged).toEqual(expect.any(Function));
    expect(service.updateToken).toEqual(expect.any(Function));
    expect(service.logNewEvent).toEqual(expect.any(Function));
    expect(service.signInWithGoogle).toEqual(expect.any(Function));
    expect(service.signInWithGooglePopup).toEqual(expect.any(Function));
    expect(service.signUp).toEqual(expect.any(Function));
    expect(service.signIn).toEqual(expect.any(Function));
    expect(service.updateUserProfile).toEqual(expect.any(Function));
    expect(service.sendVerificationEmail).toEqual(expect.any(Function));
    expect(service.fetchSignInMethods).toEqual(expect.any(Function));
    expect(service.sendPasswordReset).toEqual(expect.any(Function));
    expect(service.signOut).toEqual(expect.any(Function));
  });

  it('should expose analytics as undefined when analytics is not supported', () => {
    expect(service['analytics']).toBeUndefined();
  });

  it('should reject updateProfile if no user', async () => {
    await expect(
      service.updateUserProfile(
        {
          displayName: 'New Name',
        },
        null,
      ),
    ).rejects.toThrowError('No current user');
  });

  it('should reject sendVerificationEmail if no user', async () => {
    await expect(service.sendVerificationEmail(null)).rejects.toThrowError(
      'No current user',
    );
  });
});
