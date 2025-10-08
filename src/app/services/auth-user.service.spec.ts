import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

import { AuthUserService } from './auth-user.service';
import { IUserAll } from '../interfaces/user';
import { Role } from '../interfaces/token';

describe('AuthUserService', () => {
  let service: AuthUserService;
  let cookieConsentService: jasmine.SpyObj<NgcCookieConsentService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockUser: IUserAll = {
    id: 'user-123',
    displayName: 'John Doe',
    email: 'john@example.com',
    locale: 'en-US',
    timeZone: 'UTC',
    authorities: [
      { authority: Role.professional },
    ],
    theme: 'light-theme',
    showCash: true,
    referralMax: 10,
  };

  const mockAdminUser: IUserAll = {
    id: 'admin-123',
    displayName: 'Admin User',
    email: 'admin@example.com',
    locale: 'en-GB',
    timeZone: 'Europe/London',
    authorities: [
      { authority: Role.admin },
    ],
    theme: 'dark-theme',
    showCash: false,
    referralMax: 3,
  };

  const mockCustomerUser: IUserAll = {
    id: 'customer-123',
    displayName: 'Customer User',
    email: 'customer@example.com',
    locale: 'de-DE',
    timeZone: 'Europe/Berlin',
    authorities: [
      { authority: Role.customer },
    ],
  };

  beforeEach(() => {
    const cookieSpy = jasmine.createSpyObj('NgcCookieConsentService', [
      'getConfig',
      'destroy',
      'init',
    ]);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    // Mock cookie consent service config
    cookieSpy.getConfig.and.returnValue({
      content: {
        header: '',
        message: '',
        dismiss: '',
        allow: '',
        deny: '',
        link: '',
        policy: '',
      },
    });

    TestBed.configureTestingModule({
      providers: [
        AuthUserService,
        { provide: NgcCookieConsentService, useValue: cookieSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    service = TestBed.inject(AuthUserService);
    cookieConsentService = TestBed.inject(NgcCookieConsentService) as jasmine.SpyObj<NgcCookieConsentService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default auth user', () => {
    const initialAuthUser = service.authUser.getValue();

    expect(initialAuthUser.isDarkMode).toBe(false);
    expect(initialAuthUser.isAdmin).toBe(false);
    expect(initialAuthUser.isManager).toBe(false);
    expect(initialAuthUser.isRoomAdmin).toBe(false);
    expect(initialAuthUser.isProfessional).toBe(false);
    expect(initialAuthUser.isCustomer).toBe(false);
    expect(initialAuthUser.hasAdminRole).toBe(false);
    expect(initialAuthUser.isAuthenticated).toBe(false);
    expect(initialAuthUser.showCash).toBe(false);
    expect(initialAuthUser.locale).toBe(navigator.language);
    expect(initialAuthUser.referralMax).toBe(5);
    expect(initialAuthUser.email).toBeUndefined();
    expect(initialAuthUser.displayName).toBeUndefined();
    expect(initialAuthUser.professionalId).toBeUndefined();
    expect(initialAuthUser.customerId).toBeUndefined();
    expect(initialAuthUser.userId).toBeUndefined();
    expect(initialAuthUser.theme).toBeUndefined();
  });

  describe('reloadUser', () => {
    it('should return initial auth user when no user provided', () => {
      const result = service.reloadUser();

      expect(result.isAuthenticated).toBe(false);
      expect(result.hasAdminRole).toBe(false);
      expect(result.userId).toBeUndefined();
    });

    it('should correctly set professional user properties', () => {
      const result = service.reloadUser(mockUser);

      expect(result.isAuthenticated).toBe(true);
      expect(result.isProfessional).toBe(true);
      expect(result.isCustomer).toBe(false);
      expect(result.isAdmin).toBe(false);
      expect(result.isManager).toBe(false);
      expect(result.isRoomAdmin).toBe(false);
      expect(result.hasAdminRole).toBe(true); // Professional has admin role
      expect(result.professionalId).toBe('user-123');
      expect(result.customerId).toBeUndefined();
      expect(result.userId).toBe('user-123');
      expect(result.email).toBe('john@example.com');
      expect(result.displayName).toBe('John Doe');
      expect(result.locale).toBe('en-US');
      expect(result.showCash).toBe(true);
      expect(result.referralMax).toBe(10);
      expect(result.theme).toBe('light-theme');
      expect(result.isDarkMode).toBe(false);
    });

    it('should correctly set admin user properties', () => {
      const result = service.reloadUser(mockAdminUser);

      expect(result.isAuthenticated).toBe(true);
      expect(result.isProfessional).toBe(false);
      expect(result.isCustomer).toBe(false);
      expect(result.isAdmin).toBe(true);
      expect(result.isManager).toBe(false);
      expect(result.isRoomAdmin).toBe(false);
      expect(result.hasAdminRole).toBe(true);
      expect(result.professionalId).toBeUndefined();
      expect(result.customerId).toBeUndefined();
      expect(result.userId).toBe('admin-123');
      expect(result.email).toBe('admin@example.com');
      expect(result.displayName).toBe('Admin User');
      expect(result.locale).toBe('en-GB');
      expect(result.showCash).toBe(false);
      expect(result.referralMax).toBe(3);
      expect(result.theme).toBe('dark-theme');
      expect(result.isDarkMode).toBe(true);
    });

    it('should correctly set customer user properties', () => {
      const result = service.reloadUser(mockCustomerUser);

      expect(result.isAuthenticated).toBe(true);
      expect(result.isProfessional).toBe(false);
      expect(result.isCustomer).toBe(true);
      expect(result.isAdmin).toBe(false);
      expect(result.isManager).toBe(false);
      expect(result.isRoomAdmin).toBe(false);
      expect(result.hasAdminRole).toBe(false); // Customer doesn't have admin role
      expect(result.professionalId).toBeUndefined();
      expect(result.customerId).toBe('customer-123');
      expect(result.userId).toBe('customer-123');
      expect(result.email).toBe('customer@example.com');
      expect(result.displayName).toBe('Customer User');
      expect(result.locale).toBe('de-DE');
      expect(result.showCash).toBe(false); // Default when not specified
      expect(result.referralMax).toBe(5); // Default when not specified
    });

    it('should handle user with multiple roles', () => {
      const multiRoleUser: IUserAll = {
        ...mockUser,
        authorities: [
          { authority: Role.professional },
          { authority: Role.manager },
        ],
      };

      const result = service.reloadUser(multiRoleUser);

      expect(result.isProfessional).toBe(true);
      expect(result.isManager).toBe(true);
      expect(result.hasAdminRole).toBe(true);
      expect(result.professionalId).toBe('user-123');
    });

    it('should handle user with room admin role', () => {
      const roomAdminUser: IUserAll = {
        ...mockUser,
        authorities: [
          { authority: Role.roomAdmin },
        ],
      };

      const result = service.reloadUser(roomAdminUser);

      expect(result.isRoomAdmin).toBe(true);
      expect(result.hasAdminRole).toBe(true);
    });

    it('should use default values when user properties are undefined', () => {
      const minimalUser: IUserAll = {
        id: 'minimal-123',
        displayName: 'Minimal User',
        email: 'minimal@example.com',
        locale: '',
        timeZone: 'UTC',
        authorities: [],
      };

      const result = service.reloadUser(minimalUser);

      expect(result.locale).toBe(navigator.language); // Uses default
      expect(result.referralMax).toBe(5); // Uses default
      expect(result.showCash).toBe(false); // Uses default
    });

    it('should emit updated auth user via BehaviorSubject', () => {
      const authUserSpy = spyOn(service.authUser, 'next');

      const result = service.reloadUser(mockUser);

      expect(authUserSpy).toHaveBeenCalledWith(result);
    });
  });

  describe('updateMode', () => {
    it('should update dark mode to true', () => {
      // First set up a user
      service.reloadUser(mockUser);

      const result = service.updateMode(true);

      expect(result.isDarkMode).toBe(true);
      expect(service.authUser.getValue().isDarkMode).toBe(true);
    });

    it('should update dark mode to false', () => {
      // First set up a user with dark mode
      service.reloadUser(mockAdminUser); // This has dark theme

      const result = service.updateMode(false);

      expect(result.isDarkMode).toBe(false);
      expect(service.authUser.getValue().isDarkMode).toBe(false);
    });

    it('should emit updated auth user via BehaviorSubject', () => {
      service.reloadUser(mockUser);
      const authUserSpy = spyOn(service.authUser, 'next');

      const result = service.updateMode(true);

      expect(authUserSpy).toHaveBeenCalledWith(result);
    });

    it('should preserve other user properties when updating mode', () => {
      service.reloadUser(mockUser);
      const originalAuthUser = service.authUser.getValue();

      service.updateMode(true);
      const updatedAuthUser = service.authUser.getValue();

      expect(updatedAuthUser.userId).toBe(originalAuthUser.userId);
      expect(updatedAuthUser.email).toBe(originalAuthUser.email);
      expect(updatedAuthUser.displayName).toBe(originalAuthUser.displayName);
      expect(updatedAuthUser.isProfessional).toBe(originalAuthUser.isProfessional);
      expect(updatedAuthUser.isDarkMode).toBe(true); // Only this should change
    });
  });

  describe('cookieConsent', () => {
    beforeEach(() => {
      translateService.instant.and.returnValue({
        HEADER: 'Cookie Header',
        MESSAGE: 'Cookie Message',
        DISMISS: 'Dismiss',
        ALLOW: 'Allow',
        DENY: 'Deny',
        LINK: 'Link',
        POLICY: 'Policy',
      });
    });

    it('should update cookie consent configuration with translated content', () => {
      service.cookieConsent(translateService);

      expect(translateService.instant).toHaveBeenCalledWith('COOKIE');
      expect(cookieConsentService.getConfig).toHaveBeenCalled();

      const config = cookieConsentService.getConfig();
      expect(config.content?.header).toBe('Cookie Header');
      expect(config.content?.message).toBe('Cookie Message');
      expect(config.content?.dismiss).toBe('Dismiss');
      expect(config.content?.allow).toBe('Allow');
      expect(config.content?.deny).toBe('Deny');
      expect(config.content?.link).toBe('Link');
      expect(config.content?.policy).toBe('Policy');
    });

    it('should destroy and reinitialize cookie consent service', () => {
      service.cookieConsent(translateService);

      expect(cookieConsentService.destroy).toHaveBeenCalled();
      expect(cookieConsentService.init).toHaveBeenCalledWith(cookieConsentService.getConfig());
    });

    it('should handle empty content object', () => {
      cookieConsentService.getConfig.and.returnValue({ content: undefined });

      expect(() => service.cookieConsent(translateService)).not.toThrow();
    });
  });

  describe('BehaviorSubject functionality', () => {
    it('should allow subscription to auth user changes', (done) => {
      let emissionCount = 0;
      const expectedEmissions = [
        // Initial value
        jasmine.objectContaining({ isAuthenticated: false }),
        // After reloadUser
        jasmine.objectContaining({ isAuthenticated: true, userId: 'user-123' }),
        // After updateMode
        jasmine.objectContaining({ isAuthenticated: true, isDarkMode: true }),
      ];

      service.authUser.subscribe((authUser) => {
        expect(authUser).toEqual(expectedEmissions[emissionCount]);
        emissionCount++;

        if (emissionCount === 3) {
          done();
        }
      });

      // Trigger emissions
      service.reloadUser(mockUser);
      service.updateMode(true);
    });

    it('should provide current value immediately to new subscribers', () => {
      service.reloadUser(mockUser);

      service.authUser.subscribe((authUser) => {
        expect(authUser.isAuthenticated).toBe(true);
        expect(authUser.userId).toBe('user-123');
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle user with empty authorities array', () => {
      const userWithNoAuthorities: IUserAll = {
        ...mockUser,
        authorities: [],
      };

      const result = service.reloadUser(userWithNoAuthorities);

      expect(result.isAdmin).toBe(false);
      expect(result.isManager).toBe(false);
      expect(result.isProfessional).toBe(false);
      expect(result.isCustomer).toBe(false);
      expect(result.isRoomAdmin).toBe(false);
      expect(result.hasAdminRole).toBe(false);
    });

    it('should handle user with undefined authorities', () => {
      const userWithUndefinedAuthorities: any = {
        ...mockUser,
        authorities: undefined,
      };

      expect(() => service.reloadUser(userWithUndefinedAuthorities)).toThrow();
    });

    it('should handle null user input', () => {
      const result = service.reloadUser(null as any);

      expect(result.isAuthenticated).toBe(false);
      expect(result.userId).toBeUndefined();
    });

    it('should handle undefined user input', () => {
      const result = service.reloadUser(undefined);

      expect(result.isAuthenticated).toBe(false);
      expect(result.userId).toBeUndefined();
    });
  });
});
