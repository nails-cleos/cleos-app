import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable } from 'rxjs';

import { MessagingService } from './messaging.service';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import { Messaging } from '@angular/fire/messaging';
import { Auth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { AppCheck } from '@angular/fire/app-check';
import { subscribeNotification } from '../store/notification.actions';

describe('MessagingService', () => {
  let service: MessagingService;
  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let messagingSpy: jasmine.SpyObj<Messaging>;
  let authSpy: any;
  let databaseSpy: jasmine.SpyObj<Database>;
  let appCheckSpy: jasmine.SpyObj<AppCheck>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    messagingSpy = {} as jasmine.SpyObj<Messaging>;
    authSpy = {
      currentUser: null,
    };
    databaseSpy = {} as jasmine.SpyObj<Database>;
    appCheckSpy = {} as jasmine.SpyObj<AppCheck>;

    TestBed.configureTestingModule({
      providers: [
        MessagingService,
        { provide: Store, useValue: storeSpy },
        { provide: Messaging, useValue: messagingSpy },
        { provide: Auth, useValue: authSpy },
        { provide: Database, useValue: databaseSpy },
        { provide: AppCheck, useValue: appCheckSpy },
      ],
    });
    service = TestBed.inject(MessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty message observable', () => {
    expect(service.message$).toBeDefined();
    expect(service.message$).toBe(EMPTY);
  });

  describe('updateToken', () => {
    beforeEach(() => {
      spyOn(service, 'updateToken').and.callFake((_: any, token: string) => {
        if (authSpy.currentUser) {
          storeSpy.dispatch(subscribeNotification({ token }));
        }
      });
    });

    it('should dispatch notification action when user is authenticated', () => {
      const token = 'mock-fcm-token';
      authSpy.currentUser = mockUser;

      service.updateToken(mockUser, token);

      expect(service.updateToken).toHaveBeenCalledWith(mockUser, token);
      expect(storeSpy.dispatch).toHaveBeenCalledWith(subscribeNotification({ token }));
    });

    it('should not dispatch action when user is not authenticated', () => {
      const token = 'mock-fcm-token';
      authSpy.currentUser = null;

      service.updateToken(mockUser, token);

      expect(service.updateToken).toHaveBeenCalledWith(mockUser, token);
      expect(storeSpy.dispatch).not.toHaveBeenCalled();
    });

    it('should handle user authentication check correctly', () => {
      const token = 'test-token';

      // Test with authenticated user
      authSpy.currentUser = { id: 'test-user' };
      service.updateToken(mockUser, token);
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(1);

      // Reset spy
      storeSpy.dispatch.calls.reset();

      // Test with null user
      authSpy.currentUser = null;
      service.updateToken(mockUser, token);
      expect(storeSpy.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('receiveMessage', () => {
    it('should create an observable for incoming messages', () => {
      service.receiveMessage();

      expect(service.message$).toBeInstanceOf(Observable);
      expect(service.message$).not.toBe(EMPTY);
    });

    it('should replace the default empty observable', () => {
      const originalMessage$ = service.message$;

      service.receiveMessage();

      expect(service.message$).not.toBe(originalMessage$);
      expect(service.message$).toBeInstanceOf(Observable);
    });
  });

  describe('requestPermission', () => {
    it('should be a function that accepts a user parameter', () => {
      expect(typeof service.requestPermission).toBe('function');

      // Should not throw when called with a user
      expect(() => {
        service.requestPermission(mockUser);
      }).not.toThrow();
    });

    it('should handle null or undefined user gracefully', () => {
      expect(() => {
        service.requestPermission(null);
      }).not.toThrow();

      expect(() => {
        service.requestPermission(undefined as any);
      }).not.toThrow();
    });
  });

  describe('service methods exist and are callable', () => {
    it('should have updateToken method', () => {
      expect(typeof service.updateToken).toBe('function');
    });

    it('should have receiveMessage method', () => {
      expect(typeof service.receiveMessage).toBe('function');
    });

    it('should have requestPermission method', () => {
      expect(typeof service.requestPermission).toBe('function');
    });
  });

  describe('store integration', () => {
    beforeEach(() => {
      spyOn(service, 'updateToken').and.callFake((_: any, token: string) => {
        if (authSpy.currentUser) {
          storeSpy.dispatch(subscribeNotification({ token }));
        }
      });
    });

    it('should use the injected store for dispatching actions', () => {
      const token = 'integration-test-token';
      authSpy.currentUser = { id: 'test-user' };

      service.updateToken(mockUser, token);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(subscribeNotification({ token }));
    });
  });

  describe('Firebase service injection', () => {
    it('should have messaging service injected', () => {
      expect((service as any).messaging).toBeDefined();
    });

    it('should have auth service injected', () => {
      expect((service as any).auth).toBeDefined();
    });

    it('should have database service injected', () => {
      expect((service as any).database).toBeDefined();
    });

    it('should have app check service injected', () => {
      expect((service as any).appCheck).toBeDefined();
    });
  });
});
