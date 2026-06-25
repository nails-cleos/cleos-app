import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { of, Subject } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import { NavigationService } from '../../services/navigation.service';
import { DEFAULT_LOCALE } from '../../util/dates';
import { signal } from '@angular/core';
import { AuthStore } from '../../store/auth.store';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let action$: Subject<void>;

  let authStoreSpy: {
    error: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    signupSuccess: jasmine.Spy;
    clean: jasmine.Spy;
  };
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back', 'navigate'],
      { language: DEFAULT_LOCALE },
    );
    authStoreSpy = {
      error: signal(undefined),
      response: signal(undefined),
      signupSuccess: jasmine.createSpy('signupSuccess'),
      clean: jasmine.createSpy('clean'),
    };
    action$ = new Subject<void>();

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['sendPasswordResetEmail']);

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, TranslateModule.forRoot()],
      providers: [
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

    expect(toastServiceSpy.show).toHaveBeenCalledWith('OK', 'success', 5000, { actionType: 'button' });
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['auth']);
  });

  it('should request a password reset and dispatch signupSuccess', async () => {
    firebaseServiceSpy.sendPasswordResetEmail.and.resolveTo();
    component.getForm.email.setValue(' test@example.com ');

    component.forgotPassword();
    await fixture.whenStable();

    expect(firebaseServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    expect(authStoreSpy.signupSuccess).toHaveBeenCalled();
  });
});
