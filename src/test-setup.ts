/* eslint-disable @angular-eslint/component-selector */
import { vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    name: '[DEFAULT]',
  })),
}));

vi.mock('firebase/auth', () => {
  const auth = {
    currentUser: null,
    authStateReady: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };

  class GoogleAuthProvider {
    addScope = vi.fn();
  }

  return {
    browserLocalPersistence: {},

    getAuth: vi.fn(() => auth),

    GoogleAuthProvider,

    signInWithPopup: vi.fn().mockResolvedValue({
      user: null,
    }),

    signInWithRedirect: vi.fn().mockResolvedValue(undefined),

    getRedirectResult: vi.fn().mockResolvedValue(null),

    setPersistence: vi.fn().mockResolvedValue(undefined),

    onIdTokenChanged: vi.fn(() => () => {}),

    connectAuthEmulator: vi.fn(),

    createUserWithEmailAndPassword: vi.fn(),

    signInWithEmailAndPassword: vi.fn(),

    sendEmailVerification: vi.fn(),

    updateProfile: vi.fn(),

    fetchSignInMethodsForEmail: vi.fn(),

    sendPasswordResetEmail: vi.fn(),
  };
});

vi.mock('firebase/database', () => {
  const database = {};

  return {
    getDatabase: vi.fn(() => database),
    connectDatabaseEmulator: vi.fn(),
    ref: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('firebase/messaging', () => {
  const messaging = {};

  return {
    getMessaging: vi.fn(() => messaging),
    onMessage: vi.fn(() => () => {}),
    getToken: vi.fn().mockResolvedValue('mock-messaging-token'),
    isSupported: vi.fn().mockResolvedValue(false),
  };
});

vi.mock('firebase/app-check', () => {
  const appCheck = {};

  class ReCaptchaV3Provider {
    constructor(public siteKey: string) {}
  }

  return {
    initializeAppCheck: vi.fn(() => appCheck),
    ReCaptchaV3Provider,
    getToken: vi.fn().mockResolvedValue('mock-app-check-token'),
  };
});

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(false),
  logEvent: vi.fn(),
}));

vi.mock('ngx-material-intl-tel-input', async () => {
  const { Component, Input } = await import('@angular/core');

  @Component({
    selector: 'ngx-material-intl-tel-input',
    standalone: true,
    template: '',
  })
  class MockNgxMaterialIntlTelInputComponent {
    @Input() fieldControl: unknown;
    @Input() fieldControlName: unknown;
    @Input() required: unknown;
    @Input() disabled: unknown;
    @Input() appearance: unknown;
    @Input() enablePlaceholder: unknown;
    @Input() autoIpLookup: unknown;
    @Input() autoSelectCountry: unknown;
    @Input() autoSelectedCountry: unknown;
    @Input() numberValidation: unknown;
    @Input() iconMakeCall: unknown;
    @Input() initialValue: unknown;
    @Input() enableSearch: unknown;
    @Input() includeDialCode: unknown;
    @Input() emojiFlags: unknown;
    @Input() hidePhoneIcon: unknown;
    @Input() localizeCountryNames: unknown;
    @Input() preferredCountries: unknown;
    @Input() visibleCountries: unknown;
    @Input() excludedCountries: unknown;
    @Input() textLabels: unknown;
    @Input() mainLabel: unknown;
    @Input() useMask: unknown;
    @Input() forceSelectedCountryCode: unknown;
    @Input() showMaskPlaceholder: unknown;
    @Input() outputNumberFormat: unknown;
    @Input() enableInputMaxLength: unknown;
    @Input() currentValue: unknown;
    @Input() currentCountryCode: unknown;
    @Input() currentCountryISO: unknown;
    @Input() isFocused: unknown;
    @Input() isLoading: unknown;
    @Input() resolvedMainLabel: unknown;
    @Input() isOutlineWithLabel: unknown;
  }

  return {
    NgxMaterialIntlTelInputComponent: MockNgxMaterialIntlTelInputComponent,
  };
});
