import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { CookieService } from 'ngx-cookie-service';
import { VERIFICATION_EMAIL } from '../util/helper';
import { AuthStore } from '../store/auth.store';
import { NavigationService } from '../services/navigation.service';
import { DEFAULT_LOCALE } from '../util/dates';
import { provideTranslateService } from '@ngx-translate/core';
describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let authStoreSpy: {
    isAuthenticated: ReturnType<typeof signal>;
    redirect: ReturnType<typeof signal>;
    queryParams: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    authRedirect: Mock;
    login: Mock;
    signupSuccess: Mock;
    setCurrentCode: Mock;
    clearResponse: Mock;
    clean: Mock;
  };

  let action$: Subject<void>;

  let activatedRouteSpy: {
    snapshot: {
      queryParams: any;
    };
    queryParamMap: any;
  };
  let firebaseServiceSpy: {
    signUp: Mock;
    signIn: Mock;
    signInWithGoogle: Mock;
    updateProfile: Mock;
    sendVerificationEmail: Mock;
    fetchSignInMethods: Mock;
    getIdToken: Mock;
  };
  let toastServiceSpy: Pick<ToastService, 'show'> & {
    show: ReturnType<typeof vi.fn>;
  };
  let cookieService: CookieService;

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    authStoreSpy = {
      isAuthenticated: signal(false),
      redirect: signal(false),
      queryParams: signal(undefined),
      error: signal(undefined),
      response: signal(undefined),
      authRedirect: vi.fn().mockName('authRedirect'),
      login: vi.fn().mockName('login'),
      signupSuccess: vi.fn().mockName('signupSuccess'),
      setCurrentCode: vi.fn().mockName('setCurrentCode'),
      clearResponse: vi.fn().mockName('clearResponse'),
      clean: vi.fn().mockName('clean'),
    };
    action$ = new Subject<void>();

    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };
    activatedRouteSpy = {
      snapshot: {
        queryParams: {},
      },
      queryParamMap: of(convertToParamMap({})),
    };

    toastServiceSpy.show.mockReturnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    firebaseServiceSpy = {
      signUp: vi.fn().mockName('FirebaseService.signUp'),
      signIn: vi.fn().mockName('FirebaseService.signIn'),
      signInWithGoogle: vi.fn().mockName('FirebaseService.signInWithGoogle'),
      updateProfile: vi.fn().mockName('FirebaseService.updateProfile'),
      sendVerificationEmail: vi
        .fn()
        .mockName('FirebaseService.sendVerificationEmail'),
      fetchSignInMethods: vi
        .fn()
        .mockName('FirebaseService.fetchSignInMethods'),
      getIdToken: vi.fn().mockName('FirebaseService.getIdToken'),
    };

    (firebaseServiceSpy as any).user = signal(null);

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    cookieService = TestBed.inject(CookieService);
    cookieService.deleteAll('/');
    fixture.detectChanges();
  });

  afterEach(() => {
    action$.complete();
    cookieService.deleteAll('/');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call signUp on submit when displayName exists', async () => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue('Test User');

    firebaseServiceSpy.signUp.mockResolvedValue({} as any);

    component.onSubmit();

    expect(firebaseServiceSpy.signUp).toHaveBeenCalledWith(
      'test@example.com',
      '123456',
    );
  });

  it('should call signIn on submit when displayName is undefined', async () => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue(undefined);

    firebaseServiceSpy.signIn.mockResolvedValue({} as any);

    component.onSubmit();

    expect(firebaseServiceSpy.signIn).toHaveBeenCalledWith(
      'test@example.com',
      '123456',
    );
  });

  it('should call signInWithGoogle when loginWithGoogle is invoked', async () => {
    firebaseServiceSpy.signInWithGoogle.mockResolvedValue({} as any);

    component.loginWithGoogle();

    expect(firebaseServiceSpy.signInWithGoogle).toHaveBeenCalled();
  });

  it('should call fetchSignInMethods and update displayName validators when validateEmail is invoked', async () => {
    firebaseServiceSpy.fetchSignInMethods.mockResolvedValue([]);

    const displayNameControl = component.getForm.displayName;
    displayNameControl.setValidators([]);
    displayNameControl.setValue(undefined);

    await component.validateEmail();

    expect(firebaseServiceSpy.fetchSignInMethods).toHaveBeenCalledWith(
      component.getForm.email.value,
    );
    expect(displayNameControl.hasValidator(Validators.required)).toBe(true);
    expect(component.statusSignal()).toBe('');
  });

  it('should clear displayName validators if fetchSignInMethods returns non-empty', async () => {
    firebaseServiceSpy.fetchSignInMethods.mockResolvedValue(['password']);

    const displayNameControl = component.getForm.displayName;
    displayNameControl.setValidators([Validators.required]);
    displayNameControl.setValue('test');

    await component.validateEmail();

    expect(firebaseServiceSpy.fetchSignInMethods).toHaveBeenCalledWith(
      component.getForm.email.value,
    );
    expect(displayNameControl.hasValidator(Validators.required)).toBe(false);
    expect(displayNameControl.value).toBeUndefined();
    expect(component.statusSignal()).toBe('password');
  });

  it('should process user correctly', async () => {
    const mockUser = { uid: '123', emailVerified: false } as any;
    component.getForm.displayName.setValue('Test User');

    firebaseServiceSpy.updateProfile.mockResolvedValue(undefined);
    firebaseServiceSpy.sendVerificationEmail.mockResolvedValue(undefined);
    firebaseServiceSpy.getIdToken = vi.fn().mockResolvedValue('id-token');

    (component as any).processUser(mockUser);
    await Promise.resolve();

    expect(firebaseServiceSpy.updateProfile).toHaveBeenCalledWith({
      displayName: 'Test User',
    });
    expect(firebaseServiceSpy.sendVerificationEmail).toHaveBeenCalled();
    expect(authStoreSpy.signupSuccess).toHaveBeenCalled();
  });

  it('should dispatch login when processing a verified user', async () => {
    const mockUser = { uid: '123', emailVerified: true } as any;
    firebaseServiceSpy.getIdToken = vi.fn().mockResolvedValue('id-token');

    (component as any).processUser(mockUser);
    await Promise.resolve();

    expect(firebaseServiceSpy.sendVerificationEmail).not.toHaveBeenCalled();
    expect(authStoreSpy.login).toHaveBeenCalledWith(
      'id-token',
      undefined,
      '',
      {},
    );
  });

  it('should not dispatch login when verified user has no id token', async () => {
    const mockUser = { uid: '123', emailVerified: true } as any;
    firebaseServiceSpy.getIdToken = vi.fn().mockResolvedValue(null);

    (component as any).processUser(mockUser);
    await Promise.resolve();

    expect(authStoreSpy.login).not.toHaveBeenCalled();
  });

  it('should login instead of sending verification email when verification cookie exists', async () => {
    const mockUser = { uid: '123', emailVerified: false } as any;
    cookieService.set(VERIFICATION_EMAIL, 'sent');
    firebaseServiceSpy.getIdToken = vi.fn().mockResolvedValue('id-token');

    (component as any).processUser(mockUser);
    await Promise.resolve();

    expect(firebaseServiceSpy.sendVerificationEmail).not.toHaveBeenCalled();
    expect(authStoreSpy.login).toHaveBeenCalledWith(
      'id-token',
      undefined,
      '',
      {},
    );
  });

  it('should map sign up invalid-email errors to the email control', async () => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue('Test User');

    firebaseServiceSpy.signUp.mockRejectedValue({ code: 'auth/invalid-email' });

    component.onSubmit();
    await Promise.resolve();

    expect(component.getForm.email.hasError('email')).toBe(true);
  });

  it('should map sign in wrong-password errors to the password control', async () => {
    component.getForm.email.setValue('test@example.com');
    component.getForm.password.setValue('123456');
    component.getForm.displayName.setValue(undefined);

    firebaseServiceSpy.signIn.mockRejectedValue({
      code: 'auth/wrong-password',
    });

    component.onSubmit();
    await Promise.resolve();

    expect(component.getForm.password.hasError('wrong')).toBe(true);
  });

  it('should clear auth state when the response toast action is used', () => {
    authStoreSpy.response.set({ message: 'OK', toastType: 'success' });
    fixture.detectChanges();

    action$.next();

    expect(authStoreSpy.clearResponse).toHaveBeenCalled();
  });

  it('should dispatch setCurrentCode when codeSignal changes', () => {
    const testCode = 'ABC123';
    component.getForm.code.setValue(testCode);

    fixture.detectChanges();

    expect(authStoreSpy.setCurrentCode).toHaveBeenCalledWith(testCode);
  });

  it('should show toast when errorSignal has message', () => {
    const mockError = { message: 'Some error' };
    authStoreSpy.error.set(mockError);

    fixture.detectChanges();

    authStoreSpy.error.set(mockError);
    fixture.detectChanges();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('Some error', 'error');
  });
});
