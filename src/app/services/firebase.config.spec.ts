import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FirebaseSdkService } from './firebase.config';

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
    expect(service['auth']).toBeDefined();
    expect(service['database']).toBeDefined();
    expect(service['appCheck']).toBeDefined();
  });

  it('should expose the FirebaseSdkService API', () => {
    expect(service.authStateReady).toEqual(expect.any(Function));
    expect(service.appCheckToken).toEqual(expect.any(Function));
    expect(service.getAuthToken).toEqual(expect.any(Function));
    expect(service.getMessage).toEqual(expect.any(Function));
    expect(service.getIdTokenChanged).toEqual(expect.any(Function));
    expect(service.onRedirectResult).toEqual(expect.any(Function));
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

  it('should expose analytics as undefined when analytics is not supported', async () => {
    await Promise.resolve();

    expect(service['analytics']).toBeUndefined();
  });

  it('should expose messaging as undefined when messaging is not supported', async () => {
    await Promise.resolve();

    expect(service['messaging']).toBeUndefined();
  });

  it('should expose redirect result API', async () => {
    const result = await service.onRedirectResult();

    expect(result).toBeNull();
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
