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
import { ForgotPasswordComponent } from './forgot-password.component';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@app/services/toast.service';
import { of, Subject } from 'rxjs';
import { FirebaseService } from '@app/services/firebase.service';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { signal } from '@angular/core';
import { AuthStore } from '@app/store/auth.store';
describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'language'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };

  let action$: Subject<void>;

  let authStoreSpy: {
    error: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    signupSuccess: Mock;
    clean: Mock;
  };
  let toastServiceSpy: {
    show: Mock;
  };
  let firebaseServiceSpy: {
    sendPasswordResetEmail: Mock;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    authStoreSpy = {
      error: signal(undefined),
      response: signal(undefined),
      signupSuccess: vi.fn().mockName('signupSuccess'),
      clean: vi.fn().mockName('clean'),
    };
    action$ = new Subject<void>();

    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };
    firebaseServiceSpy = {
      sendPasswordResetEmail: vi
        .fn()
        .mockName('FirebaseService.sendPasswordResetEmail'),
    };

    toastServiceSpy.show.mockReturnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    action$.complete();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeTruthy();
  });

  it('should call toast.error when errorMessage emits', () => {
    authStoreSpy.error.set({ message: 'My error!' });
    fixture.detectChanges();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('My error!', 'error');
  });

  it('should show toast and navigate when response emits', () => {
    authStoreSpy.response.set({ message: 'OK', toastType: 'success' });
    fixture.detectChanges();

    action$.next();

    expect(toastServiceSpy.show).toHaveBeenCalledWith('OK', 'success', 5000, {
      actionType: 'button',
    });
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['auth']);
  });

  it('should request a password reset and dispatch signupSuccess', async () => {
    firebaseServiceSpy.sendPasswordResetEmail.mockResolvedValue(undefined);
    component.getForm.email.setValue(' test@example.com ');

    component.forgotPassword();
    await fixture.whenStable();

    expect(firebaseServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(authStoreSpy.signupSuccess).toHaveBeenCalled();
  });
});
